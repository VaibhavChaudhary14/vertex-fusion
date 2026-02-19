import torch
import torch.nn as nn
from simulation.stgnn_model import STGNN
import os

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

# Model parameters matching input data
# Input features: 23 columns. Window size 10.
# The previous script said features_per_timestep = 22 (dropped Time?)
# preprocess_data.py drops 'Time'. 
# If columns=23, minus Time=22.
# 3 nodes. features_per_node = 22.
# CORRECTED: 21 features (3 cyber + 18 physical). dropping time/label.
in_channels = 21 
hidden_channels = 32
out_channels = 4

print(f"Creating dummy model with in_channels={in_channels}...")

model = STGNN(in_channels, hidden_channels, out_channels)

# Save the initialized weights (random)
# This allows the inference code to load a valid state_dict
model_path = os.path.join(DATA_DIR, "stgnn_model.pth")
torch.save(model.state_dict(), model_path)

print(f"Dummy model saved to {model_path}")
print("Note: This model has random weights. Predictions will be garbage until real training is run.")
