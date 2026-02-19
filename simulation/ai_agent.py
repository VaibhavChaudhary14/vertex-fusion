import logging
import numpy as np
import os
import pandas as pd
import json

logger = logging.getLogger(__name__)

class AIAgent:
    def __init__(self):
        self.model = None
        self.shap_values = []
        self.feature_names = ["Voltage Magnitude", "Active Power", "Reactive Power", "Frequency"]
        
        # Load SHAP values if available, otherwise use defaults
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            shap_path = os.path.join(base_dir, "..", "data", "shap_feature_importance_1764530645675.csv")
            
            if os.path.exists(shap_path):
                df = pd.read_csv(shap_path)
                # Normalize feature names if they are generic
                # Assuming the CSV has 'Feature' and 'Mean |SHAP|'
                self.shap_values = []
                for idx, row in df.iterrows():
                    feat_name = row['Feature']
                    # Map generic names to meaningful ones for the demo
                    if "Feature_0" in feat_name: alias = "Voltage Magnitude (Pu)"
                    elif "Feature_1" in feat_name: alias = "Active Power (MW)"
                    elif "Feature_2" in feat_name: alias = "Reactive Power (MVar)"
                    else: alias = feat_name
                    
                    self.shap_values.append({
                        "feature": alias,
                        "importance": float(row['Mean |SHAP|'])
                    })
                # Sort by importance
                self.shap_values.sort(key=lambda x: x['importance'], reverse=True)
                logger.info(f"Loaded {len(self.shap_values)} SHAP features")
            else:
                logger.warning("SHAP file not found, using defaults")
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
        Simulates AI detection. 
        In a real scenario, this would preprocess 'grid_state' and pass it to the ST-GNN model.
        Here we use a robust mock based on ground truth 'attack_active'.
        """
        
        # Add some stochasticity to the detection confidence
        base_confidence = 0.96
        noise = np.random.normal(0, 0.02)
        confidence = min(1.0, max(0.0, base_confidence + noise))
        
        # If no attack, confidence in "Safe" is high
        if not attack_active:
            return {
                "detected": False,
                "type": "Normal",
                "confidence": confidence,
                "contributing_features": [] 
            }
        
        # If attack is active
        return {
            "detected": True,
            "type": attack_type,
            "confidence": confidence,
            "contributing_features": self.shap_values[:3] # Return top 3 features
        }
