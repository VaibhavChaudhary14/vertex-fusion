import numpy as np
import joblib
import os
import torch

try:
    # Check X
    X = np.load("../data/X_windows.npy")
    print(f"X shape: {X.shape}")
    
    # Check Scaler
    scaler = joblib.load("../data/scaler.joblib")
    print(f"Scaler n_features_in_: {getattr(scaler, 'n_features_in_', 'Unknown')}")
    if hasattr(scaler, 'feature_names_in_'):
        print(f"Scaler feature names: {scaler.feature_names_in_}")
    else:
        print("Scaler has no feature names stored.")

    # Check Model weights to predict input size
    model = torch.load("../models/stgnn_model.pth", map_location='cpu')
    # keys: gat1.att_l, gat1.lin_l.weight ...
    # GATConv weight shape: (out_channels, in_channels) usually involved
    # But checking the saved file might be just state_dict.
    print("Model keys:", model.keys())
    
    # Check specific weight for 'gat1' or 'temporal_conv'
    # temporal_conv is Conv1d(hidden, hidden). Not useful for input size.
    # gat1 is GATConv(in_channels, hidden).
    # PyTorch Geometric GATConv has `lin_src` (or lin_l) weight [heads * out_channels, in_channels]
    
    if 'gat1.lin_src.weight' in model:
        w = model['gat1.lin_src.weight']
        print(f"GAT1 lin_src weight shape: {w.shape}")
    elif 'gat1.lin.weight' in model: # older pyg
        w = model['gat1.lin.weight']
        print(f"GAT1 lin weight shape: {w.shape}")
        
except Exception as e:
    print(f"Error: {e}")
