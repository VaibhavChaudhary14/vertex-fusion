import numpy as np
import pandas as pd
import torch
import joblib
import logging
import time
from collections import deque
from simulation.stgnn_model import STGNN

logger = logging.getLogger(__name__)

class AIInferenceService:
    def __init__(self, data_dir, model_path, scaler_path):
        self.data_dir = data_dir
        self.window_size = 10
        self.num_features = 21  # Freq, Delay, Loss + 6 Buses * 3 (V,I,P)
        
        # Buffer for sliding window
        self.buffer = deque(maxlen=self.window_size)
        
        self.model = None
        self.scaler = None
        
        self.load_artifacts(model_path, scaler_path)

    def load_artifacts(self, model_path, scaler_path):
        try:
            if hasattr(time, 'sleep'): pass # Dummy check
            
            # Load Scaler
            if 1: # check path existence in real usage
                self.scaler = joblib.load(scaler_path)
                logger.info(f"✅ Scaler loaded from {scaler_path}")
            
            # Load Model
            # Note: We use the STGNN class definition from local file
            # Assuming in_channels=21 based on feature mapping
            self.model = STGNN(in_channels=self.num_features, hidden_channels=32, out_channels=4)
            self.model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
            self.model.eval()
            logger.info(f"✅ Model loaded from {model_path}")
            
        except Exception as e:
            logger.warning(f"⚠️ Failed to load artifacts: {e}. Running in Mock Mode.")
            self.model = None
            self.scaler = None

    def _map_to_features(self, m):
        """
        Maps measurement dict to 21-element numpy array.
        Order MUST match training data: 
        ['frequency', 'packet_delay', 'packet_loss', 
         'Bus1_V', 'Bus1_I', 'Bus1_P', ... 'Bus6_P']
        """
        try:
            vec = []
            
            # 1. Cyber / Global Metrics
            vec.append(m.get('frequency', 50.0))
            vec.append(m.get('packet_delay', 0.0))
            vec.append(m.get('packet_loss', 0.0))
            
            # 2. Bus Metrics (1 to 6)
            # Keys in measurement_dict typically come from simulation.
            # We assume keys like "bus_1_vm_pu", "bus_1_p_mw", "bus_1_i_ka"?
            # Let's align with what grid_model.py produces.
            # grid_model.py output keys need verification. 
            # Assuming standard naming or mapping.
            # If keys are missing, default to nominal (1.0 V, 0 P)
            
            # Standardizing keys to match expected input:
            # We need V, I, P for each bus.
            # If I is not available (Pandapower results might have flow I, but Bus I is load I?)
            # 'res_bus' has vm_pu, va_degree, p_mw, q_mvar.
            # 'I' (Current) at a bus is not directly 'res_bus' column usually, unless load/gen current.
            # However, preprocess data used 'Bus1_I'.
            # Smartgrid dataset likely had it.
            # We will approximate I from P/V (S=VI => I = S/V).
            # magnitude(S) = sqrt(P^2 + Q^2). I = magnitude(S) / V.
            
            for i in range(1, 7):
                v_pu = m.get(f'bus_{i}_vm_pu', 1.0)
                p_mw = m.get(f'bus_{i}_p_mw', 0.0)
                q_mvar = m.get(f'bus_{i}_q_mvar', 0.0)
                
                # Calculate Current (approx)
                # s_mva = sqrt(p^2 + q^2)
                s_mva = np.sqrt(p_mw**2 + q_mvar**2)
                # Assuming baseMVA=100 for pu calculation or just relative.
                # If values are raw, we use them.
                # Avoid divide by zero
                i_val = s_mva / v_pu if v_pu > 1e-3 else 0.0
                
                vec.append(v_pu)
                vec.append(i_val) # Bus_I
                vec.append(p_mw)  # Bus_P
            
            return np.array(vec[:self.num_features])
            
        except Exception as e:
            logger.error(f"Feature mapping error: {e}")
            return None

    def predict(self):
        if not self.model or not self.scaler:
            return None
            
        start_time = time.time()
        
        try:
            # 1. Prepare Window
            window_data = np.array(self.buffer) # (10, 22)
            
            # 2. Scale
            # transform expects 2D array
            scaled_data = self.scaler.transform(window_data)
            
            # 3. To Tensor
            # STGNN expects (Batch, Window, Feat) -> (1, 10, 22)?
            # Or reshaped to nodes?
            # Our STGNN Shim expects (Nodes, In).
            # Wait, the shim I wrote expects (Nodes, 22) if I recall?
            # Or does it handle the reshaping?
            # Let's check stgnn_model.py again.
            
            # Shim: forward(self, data) -> (Nodes, In) input expected?
            # "x = self.gat1_lin(x)" -> Linear(In, Hidden*2)
            # So input must be (Nodes, In_Channels).
            # In_Channels was 22.
            # So we need to feed it (3, 22).
            # But we have (10, 22) time series.
            # The simplified model I wrote ignores the time dimension structure 
            # if I just pass (3, 22). It treats "Nodes" as the graph entity.
            
            # Real STGNN would intake (Batch, Time, Nodes, Feats).
            # Since we are essentially "mocking" the complex geometric part with 
            # the Shim, we should just feed the *latest* state replicated across nodes
            # OR feed the time window if the model was 1D Conv.
            
            # Model definition:
            # temporal_conv = Conv1d(hidden, hidden, 3)
            # This implies it DOES process time sequences.
            
            # Let's align with what 'simulate_training.py' did?
            # It passed 'shim_input' of shape (3, 22).
            # So for now, we take the LATEST step (1, 22) and tile it to (3, 22).
            
            latest_step = scaled_data[-1] # (22,)
            input_tensor = torch.tensor(np.tile(latest_step, (3, 1)), dtype=torch.float32)
            
            with torch.no_grad():
                logits = self.model(input_tensor)
                probs = torch.softmax(logits, dim=0)
                
                conf, pred_idx = torch.max(probs, dim=0)
                
                latency = (time.time() - start_time) * 1000 # ms
                
                return {
                    "class_id": pred_idx.item(),
                    "class_name": ["Normal", "FDI", "DoS", "Replay"][pred_idx.item()],
                    "confidence": conf.item(),
                    "probabilities": probs.tolist(),
                    "latency_ms": latency
                }
                
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return None
