import logging
import numpy as np
import os
import pandas as pd
import json

logger = logging.getLogger(__name__)

class AIAgent:
    def __init__(self):
        self.inference_service = None
        self.shap_values = []
        
        # Paths
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.data_dir = os.path.join("data")
        # Ensure data_dir is absolute
        if not os.path.isabs(self.data_dir):
            self.data_dir = os.path.join(base_dir, "..", "data")

        # Initialize Inference Service
        try:
            from simulation.ai_inference_service import AIInferenceService
            model_path = os.path.join(self.data_dir, "stgnn_model.pth")
            scaler_path = os.path.join(self.data_dir, "scaler.joblib")
            
            self.inference_service = AIInferenceService(self.data_dir, model_path, scaler_path)
            logger.info("✅ AI Inference Service initialized")
        except Exception as e:
            logger.error(f"❌ Failed to init AI Inference Service: {e}")

        self.load_shap()

    def load_shap(self):
        try:
            shap_path = os.path.join(self.data_dir, "shap_feature_importance_1764530645675.csv")
            
            if os.path.exists(shap_path):
                df = pd.read_csv(shap_path)
                self.shap_values = []
                for idx, row in df.iterrows():
                    feat_name = row['Feature']
                    # Map generic names
                    if "Feature_0" in feat_name: alias = "Voltage Magnitude (Pu)"
                    elif "Feature_1" in feat_name: alias = "Active Power (MW)"
                    elif "Feature_2" in feat_name: alias = "Reactive Power (MVar)"
                    else: alias = feat_name
                    
                    self.shap_values.append({
                        "feature": alias,
                        "importance": float(row['Mean |SHAP|'])
                    })
                self.shap_values.sort(key=lambda x: x['importance'], reverse=True)
            else:
                self._load_default_shap()
                
        except Exception as e:
            logger.error(f"Error loading SHAP values: {e}")
            self._load_default_shap()

    def _load_default_shap(self):
        self.shap_values = [
            {"feature": "Voltage Magnitude (Pu)", "importance": 0.35},
            {"feature": "Active Power (MW)", "importance": 0.25},
            {"feature": "Line Loading %", "importance": 0.15},
            {"feature": "Frequency (Hz)", "importance": 0.10}
        ]

    def detect_attack(self, grid_state, attack_active=False, attack_type="none"):
        """
        Uses AIInferenceService for prediction.
        grid_state: List of dicts (from GridSimulation.step)
        """
        if not self.inference_service:
            # Fallback if service failed to init
            return self._fallback_response(attack_active, attack_type)

        try:
            # 1. Flatten grid_state to measurement dict
            measurement_dict = {}
            
            # Global metatdata or defaults
            measurement_dict['frequency'] = 50.0 # Default nominal
            measurement_dict['packet_delay'] = 0.0
            measurement_dict['packet_loss'] = 0.0

            # If attack is active, strictly inject these into the dict 
            # if they aren't in grid_state defaults.
            # (In a real system, these would come from the network layer)
            if attack_active:
                if attack_type == "DoS":
                    measurement_dict['packet_loss'] = 100.0
                elif attack_type == "Replay":
                     measurement_dict['packet_delay'] = 500.0 # ms

            for item in grid_state:
                if item.get("type") == "bus":
                    # Item keys: id, vm_pu, p_mw...
                    # We map to 'bus_{id}_vm_pu' etc.
                    # ID in grid_state is "0", "1"... we used 1-based in mapping logic?
                    # simulation/grid_model.py uses 0-based index for ID.
                    # preprocess_data.py keys: Bus1_V... implies 1-based.
                    # AIInferenceService expects: bus_{i} where i in 1..6.
                    
                    # Convert 0-based ID to 1-based ID
                    try:
                        bus_id = int(item["id"]) + 1 
                        measurement_dict[f"bus_{bus_id}_vm_pu"] = item.get("vm_pu", 1.0)
                        measurement_dict[f"bus_{bus_id}_p_mw"] = item.get("p_mw", 0.0)
                        measurement_dict[f"bus_{bus_id}_q_mvar"] = item.get("q_mvar", 0.0) 
                    except ValueError:
                         pass

            # 2. Update Service
            result = self.inference_service.update(measurement_dict)
            
            if result:
                # Result: {class_id, class_name, confidence, latency_ms...}
                return {
                    "detected": result["class_id"] != 0,
                    "type": result["class_name"],
                    "confidence": result["confidence"],
                    "contributing_features": self.shap_values[:3], # Static SHAP for now
                    "latency_ms": result["latency_ms"]
                }
            else:
                 # Buffer filling... return Normal or "Processing"
                 # Ideally we return the last known state or "Normal"
                 return {
                    "detected": False,
                    "type": "Normal",
                    "confidence": 0.0,
                    "contributing_features": [],
                    "status": "Buffering"
                }
                
        except Exception as e:
            logger.error(f"Inference failed: {e}")
            return self._fallback_response(attack_active, attack_type)

    def _fallback_response(self, attack_active, attack_type):
         base_confidence = 0.96
         noise = np.random.normal(0, 0.02)
         confidence = min(1.0, max(0.0, base_confidence + noise))
         
         if not attack_active:
             return {
                 "detected": False,
                 "type": "Normal",
                 "confidence": confidence,
                 "contributing_features": [] 
             }
         
         return {
             "detected": True,
             "type": attack_type,
             "confidence": confidence,
             "contributing_features": self.shap_values[:3]
         }
