import torch
import joblib
import numpy as np
import os
from torch_geometric.data import Data
from simulation.stgnn_model import STGNN
from datetime import datetime

class AnomalyDetector:
    def __init__(self, alert_manager):
        self.alert_manager = alert_manager
        self.model = None
        self.scaler = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Buffer for sliding window (need 10 steps)
        self.window_buffer = []
        self.window_size = 10
        
        # Load Model & Scaler
        self._load_resources()
        
        # Edge Index for IEEE 9-Bus Topology (Exact Match)
        # 0-3, 3-4, 4-5, 2-5, 5-6, 6-7, 7-1, 7-8
        sources = [0, 3, 4, 2, 5, 6, 7, 7]
        targets = [3, 4, 5, 5, 6, 7, 1, 8]
        self.edge_index = torch.tensor([sources + targets, targets + sources], dtype=torch.long).to(self.device)

    def _load_resources(self):
        try:
            # Paths relative to backend root
            scaler_path = "data/scaler_ieee9.joblib"
            model_path = "models/stgnn_ieee9.pth"
            
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
            else:
                print(f"⚠️ Scaler not found at {scaler_path}")

            if os.path.exists(model_path):
                # 9 Nodes, 5 Features (V, I, P, Q, Freq)
                self.model = STGNN(in_channels=5, hidden_channels=32, out_channels=2, num_nodes=9).to(self.device)
                self.model.load_state_dict(torch.load(model_path, map_location=self.device))
                self.model.eval()
                print("✅ ST-GNN AI Service Ready (IEEE 9-Bus, Device: " + str(self.device) + ")")
            else:
                print(f"⚠️ Model not found at {model_path}")
                
        except Exception as e:
            print(f"❌ AI Service Init Failure: {e}")

    def analyze(self, grid_state: np.ndarray) -> dict:
        """
        Analyzes grid state (from SCADA Bridge) using ST-GNN.
        Expects grid_state as [9, 5] numpy array: [V, I, P, Q, Freq] per node.
        """
        # 2. Update buffer
        self.window_buffer.append(grid_state)
        if len(self.window_buffer) > self.window_size:
            self.window_buffer.pop(0)
            
        # 3. Inference
        if len(self.window_buffer) == self.window_size and self.model and self.scaler:
            try:
                # Prepare input: [10, 9, 5]
                full_window = np.array(self.window_buffer) 
                
                # Reshape for Scaler: [10*9, 5]
                N, Nodes, Feats = full_window.shape
                flat_window = full_window.reshape(-1, Feats)
                
                scaled_flat = self.scaler.transform(flat_window)
                full_window_scaled = scaled_flat.reshape(N, Nodes, Feats)
                
                # Extract last timestep for spatial GNN: [9, 5]
                snapshot = full_window_scaled[-1]
                
                # To Torch
                data = Data(x=torch.tensor(snapshot, dtype=torch.float).to(self.device),
                            edge_index=self.edge_index)
                
                # Predict
                with torch.no_grad():
                    logits = self.model(data) # [2]
                    probs = torch.softmax(logits, dim=0)
                    pred_label_idx = torch.argmax(probs).item()
                    confidence = probs[pred_label_idx].item()
                
                # Labels: 0=Normal, 1=Attack
                labels = ["Normal", "Attack"]
                label_str = labels[pred_label_idx]
                
                result = {
                    "is_anomaly": False,
                    "confidence": confidence,
                    "label": label_str,
                    "action": "NONE"
                }

                if label_str == "Attack":
                    result["is_anomaly"] = True
                    # Threshold Logic
                    if confidence > 0.90:
                        result["action"] = "TRIP"
                        self._trigger_alert("Critical Attack Detected", confidence, severity="critical")
                    else:
                        result["action"] = "ALARM"
                        self._trigger_alert("Potential Anomaly Detected", confidence, severity="warning")

                return result

            except Exception as e:
                print(f"Inference Error: {e}")
                return self._default_result("Error", 0.0)
                
        return self._default_result("Buffering...", 0.0)

    def _trigger_alert(self, msg, confidence, severity):
        latest = self.alert_manager.get_latest(1)
        # Avoid spam
        if not latest or latest[0]['message'] != f"{msg} ({int(confidence*100)}%)":
            self.alert_manager.add_alert("AI Protection", f"{msg} ({int(confidence*100)}%)", severity)


    def _default_result(self, label, conf):
        return {
            "is_anomaly": False,
            "confidence": conf,
            "label": label,
            "shap_values": []
        }
