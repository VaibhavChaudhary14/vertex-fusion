import torch
import numpy as np
import os
import time
import sqlite3
try:
    from .stgnn_model import STGNN
except ImportError:
    from stgnn_model import STGNN

class AIInferenceEngine:
    """
    Production-grade inference wrapper for real-time SCADA integration.
    Provides latency tracking, full softmax distribution, and graceful error handling.
    """
    def __init__(self, model_path="models/stgnn_model.pth"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        
        # Note: Static edge_index is now handled natively inside STGNN's __init__ for IEEE 9-bus
        
        self.attack_labels = ["Normal", "FDI", "DoS", "Replay", "Noise"]
        
        # Phase 6: Initialize SQLite Telemetry Database
        self.db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "telemetry.db")
        self._init_db()
        
        self._load_model(model_path)

    def _init_db(self):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS inference_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp REAL,
                    true_label INTEGER,
                    pred_label INTEGER,
                    confidence REAL,
                    latency_ms REAL,
                    features_json TEXT
                )
            ''')
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[AI Inference] [ERROR] Failed to initialize telemetry DB: {e}")

    def _log_to_db(self, true_label, pred_label, confidence, latency_ms, features):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            import json
            features_json = json.dumps(features.tolist()) if hasattr(features, 'tolist') else json.dumps(list(features))
            cursor.execute('''
                INSERT INTO inference_logs (timestamp, true_label, pred_label, confidence, latency_ms, features_json)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (time.time(), true_label, pred_label, confidence, latency_ms, features_json))
            conn.commit()
            conn.close()
        except Exception as e:
            # Silent fail for logging to not interrupt SCADA
            pass

    def _load_model(self, path):
        if not os.path.exists(path):
            print(f"[AI Inference] [ERROR] Model file not found: {path}")
            return
        
        try:
            num_classes = 5
            self.model = STGNN(in_channels=6, hidden_channels=32, out_channels=num_classes)
            checkpoint = torch.load(path, map_location=self.device)
            self.model.load_state_dict(checkpoint, strict=False)
            self.model.to(self.device)
            self.model.eval()
            print(f"[AI Inference] [SUCCESS] Model loaded (9-Bus, 6 Channels) from {path}")
        except Exception as e:
            print(f"[AI Inference] [ERROR] Error loading model: {e}")

    def predict(self, features, true_label=None):
        """
        Executes inference with strict latency tracking and exhaustive probability metrics.
        """
        start_time = time.perf_counter()
        
        if self.model is None:
            return {
                "prediction": 0, 
                "attack_label": "Unknown",
                "confidence": 0.0, 
                "probabilities": {},
                "latency_ms": 0.0, 
                "status": "error_model_not_loaded"
            }
        
        try:
            features = np.array(features)
            
            # Phase 8: IEEE 9-Bus Shape Requirement -> [Batch(1), Time(10), Nodes(9), Features(6)]
            window_size = 20
            num_nodes = 9
            num_features = 6
            
            # Expected flat array from SCADA feeder is 540 elements (10 * 9 * 6)
            if features.size == 1080:
                features_4d = features.reshape(1, window_size, num_nodes, num_features)
            else:
                # Direct error instead of padding to avoid shape mismatch in GNN layers
                raise ValueError(f"Expected 1080 features (20x9x6), but received {features.size}")
            
            x_tensor = torch.tensor(features_4d, dtype=torch.float32, requires_grad=True).to(self.device)
            
            # Forward pass
            logits = self.model(x_tensor)
            probs = torch.softmax(logits, dim=0)
            pred = torch.argmax(probs).item()
            conf = probs[pred].item()
            
            target_bus = 0
            # If an attack is detected with > 80% confidence, perform localization
            if pred != 0 and conf > 0.80:
                self.model.zero_grad()
                target_logit = logits[pred]
                target_logit.backward(retain_graph=True)
                
                # Saliency: [Batch(1), Time(10), Nodes(9), Features(6)]
                grads = x_tensor.grad.detach().cpu().numpy()[0] # [10, 9, 6]
                bus_importance = np.mean(np.abs(grads), axis=(0, 2)) # Shape (9,)
                target_bus = int(np.argmax(bus_importance) + 1)
            
            # Full probability distribution for academic review / telemetry
            prob_dict = {
                self.attack_labels[i]: round(probs[i].item(), 4) for i in range(len(self.attack_labels))
            }
                
            latency_ms = (time.perf_counter() - start_time) * 1000.0
            
            # Use true_label if provided by SCADA, else fallback to pred
            actual_label = pred if true_label is None else true_label
            self._log_to_db(true_label=actual_label, pred_label=pred, confidence=conf, latency_ms=latency_ms, features=features)
            
            return {
                "prediction": pred,
                "attack_label": self.attack_labels[pred],
                "confidence": conf,
                "target_bus": target_bus,
                "probabilities": prob_dict,
                "latency_ms": round(latency_ms, 2),
                "status": "success"
            }
            
        except Exception as e:
            print(f"[AI Inference] [ERROR] Inference error: {e}")
            return {
                "prediction": 0, 
                "attack_label": "Unknown",
                "confidence": 0.0, 
                "probabilities": {}, 
                "latency_ms": 0.0, 
                "status": "error", 
                "message": str(e)
            }

    def explain(self, features):
        """
        Phase 12: Explainable AI (SHAP equivalent via Saliency Gradients)
        Runs a backward pass from the predicted logit to extract the exact physical 
        features (Nodes x Sensors) that triggered the ST-GNN anomaly detection.
        Returns a (9x6) importance matrix and the top contributing factors.
        """
        if self.model is None:
            return {"error": "Model not loaded"}
            
        try:
            features = np.array(features)
            window_size, num_nodes, num_features = 20, 9, 6
            
            if features.size == 1080:
                features_4d = features.reshape(1, window_size, num_nodes, num_features)
            else:
                raise ValueError(f"Explainability requires 1080 features, got {features.size}")
                
            x_tensor = torch.tensor(features_4d, dtype=torch.float32, requires_grad=True).to(self.device)
            
            self.model.eval()
            self.model.zero_grad()
            
            logits = self.model(x_tensor)
            probs = torch.softmax(logits, dim=0)
            pred = torch.argmax(probs).item()
            
            # If normal (0), we still can explain why it thought it was normal, 
            # but usually we emphasize why it triggered an attack.
            target_logit = logits[pred]
            target_logit.backward()
            
            # Saliency map: Absolute gradients across the temporal window
            # x_tensor.grad shape: [1, 10, 9, 6]
            gradients = x_tensor.grad.detach().cpu().numpy()[0] # [10, 9, 6]
            
            # Aggregate importance over time (mean absolute gradient along time axis)
            feature_importance = np.mean(np.abs(gradients), axis=0) # [9, 6]
            
            # Normalize to sum = 100%
            total_grad = np.sum(feature_importance)
            if total_grad > 0:
                feature_importance = (feature_importance / total_grad) * 100.0
            
            # Extract top 5 contributing logical features
            feature_names = ["Voltage Mag", "Voltage Ang", "P", "Q", "Frequency", "Current Mag"]
            importances = []
            
            for bus_idx in range(9):
                for feat_idx in range(6):
                    imp = float(feature_importance[bus_idx, feat_idx])
                    if imp > 0:
                        importances.append({
                            "bus": bus_idx + 1,
                            "feature": feature_names[feat_idx],
                            "importance": round(imp, 2)
                        })
            
            # Sort descending
            importances.sort(key=lambda x: x["importance"], reverse=True)
            
            return {
                "prediction": self.attack_labels[pred],
                "confidence": round(probs[pred].item(), 4),
                "top_features": importances[:10],
                "raw_matrix": feature_importance.tolist()
            }
            
        except Exception as e:
            return {"error": str(e)}
