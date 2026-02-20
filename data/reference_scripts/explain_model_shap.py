# scripts/explain_model_shap.py

import shap
import numpy as np
import pandas as pd
import torch
import os
import matplotlib.pyplot as plt
from train_baseline_model import BaselineNN  # using your baseline NN for clear SHAP demo

# -----------------------------
# 1️⃣ Load dataset and model
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")

X = np.load(os.path.join(DATA_DIR, "X_windows.npy"))
y = np.load(os.path.join(DATA_DIR, "y_windows.npy"))

# Take a subset for interpretability
X_small = X[:500]
y_small = y[:500]

X_torch = torch.tensor(X_small, dtype=torch.float32)

input_dim = X_torch.shape[1]
model_path = os.path.join(DATA_DIR, "baseline_model.pth")

# Load trained baseline model (simpler structure for SHAP)
model = BaselineNN(input_dim=input_dim, hidden_dim=128, output_dim=4)
model.load_state_dict(torch.load(model_path, map_location=torch.device("cpu")))
model.eval()

print("✅ Loaded trained baseline model for SHAP explainability.")

# -----------------------------
# 2️⃣ Prepare SHAP Explainer
# -----------------------------
explainer = shap.DeepExplainer(model, X_torch[:100])  # background samples
shap_values = explainer.shap_values(X_torch[100:200])

print("✅ SHAP values computed successfully.")

# -----------------------------
# 3️⃣ Global Feature Importance
# -----------------------------
# Compute mean absolute SHAP values
mean_abs_shap = np.mean(np.abs(shap_values[0]), axis=0)
feature_ranking = np.argsort(mean_abs_shap)[::-1]

# Save feature importance to CSV
features = [f"Feature_{i}" for i in range(X_torch.shape[1])]
importance_df = pd.DataFrame({
    "Feature": np.array(features)[feature_ranking],
    "Mean |SHAP|": mean_abs_shap[feature_ranking]
})

importance_path = os.path.join(DATA_DIR, "shap_feature_importance.csv")
importance_df.to_csv(importance_path, index=False)
print(f"✅ Feature importance saved to: {importance_path}")

# -----------------------------
# 4️⃣ Visualization
# -----------------------------
shap.summary_plot(shap_values, X_torch[100:200], feature_names=features, show=False)
plt.title("SHAP Feature Impact Summary")
plt.show()

# Individual explanation (force plot)
sample_idx = 10
shap.initjs()
shap.force_plot(explainer.expected_value[0], shap_values[0][sample_idx], X_torch[sample_idx], feature_names=features)
