import torch
import numpy as np
import logging
import os
import joblib
from simulation.stgnn_9bus import STGNN_9Bus

logger = logging.getLogger("DigitalTwinAgent")

class DigitalTwinAgent:
    def __init__(self, model_path, scaler_path):
        self.model = None
        self.scaler = None
        self.num_nodes = 9
        self.num_features = 6 # V, I, P, Q, F, Status?
        
        # Load Artifacts
        self.load_artifacts(model_path, scaler_path)
        
    def load_artifacts(self, model_path, scaler_path):
        try:
            if os.path.exists(model_path):
                self.model = STGNN_9Bus(in_channels=self.num_features, out_channels=4)
                self.model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
                self.model.eval()
                logger.info("✅ ST-GNN 9-Bus Model Loaded")
            else:
                logger.warning(f"⚠️ Model not found at {model_path}")
                
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
                logger.info("✅ Scaler Loaded")
            else:
                logger.warning(f"⚠️ Scaler not found at {scaler_path}")
                
        except Exception as e:
            logger.error(f"❌ Initialization Failed: {e}")

    def detect(self, window_buffer):
        """
        Main Digital Twin Inference Logic.
        window_buffer: List or Deque of 10 raw measurement vectors (each ~54 floats)
        Returns: {action: 'TRIP'|'ALARM'|'NONE', confidence: float, type: str, line_id: str}
        """
        if not self.model or not self.scaler:
            return {"action": "NONE", "confidence": 0.0, "type": "Simulation (No AI)"}
            
        try:
            # 1. Prepare Data
            # Convert buffer to numpy array [10, 54]
            raw_data = np.array(window_buffer)
            
            # 2. Scale
            # transform expects [N_samples, n_features]
            scaled_data = self.scaler.transform(raw_data)
            
            # 3. Reshape for Graph Model
            # Input: [Batch=1, Time=10, Nodes=9, Features=6]
            # scaled_data is [10, 54]
            # reshape -> [1, 10, 9, 6]
            # CAUTION: This assumes the 54 features are plain concatenation of 9 nodes * 6 feats.
            # TCP Client must ensure this ordering!
            input_tensor = torch.tensor(scaled_data, dtype=torch.float32).view(1, 10, self.num_nodes, self.num_features)
            
            # 4. Inference
            with torch.no_grad():
                logits = self.model(input_tensor) # [1, 4]
                probs = torch.softmax(logits, dim=1)
                
                conf, pred_idx = torch.max(probs, dim=1)
                
                pred_class = pred_idx.item()
                confidence = conf.item()
                
            # 5. Protection Logic (Digital Twin Brain)
            # Classes: 0=Normal, 1=FDI, 2=DoS, 3=Replay (Example)
            class_names = ["Normal", "FDI", "DoS", "Replay"]
            detected_type = class_names[pred_class]
            
            action = "NONE"
            line_target = None
            
            if pred_class != 0:
                # Attack Detected
                if confidence > 0.90:
                    action = "TRIP"
                    # Determine target line? 
                    # Complex localization logic needed. 
                    # For demo, default to Line 5-7 (ID "5")
                    line_target = "5"
                else:
                    action = "ALARM"
            
            return {
                "action": action,
                "confidence": confidence,
                "type": detected_type,
                "line_id": line_target,
                "probs": probs.tolist()
            }
            
        except Exception as e:
            logger.error(f"Inference Error: {e}")
            return {"action": "ERROR"}
