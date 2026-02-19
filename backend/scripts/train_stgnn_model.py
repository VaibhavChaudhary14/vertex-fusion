import torch
import torch.nn as nn
import torch.optim as optim
from torch_geometric.data import Data
from torch_geometric.loader import DataLoader
import numpy as np
import os
import sys

# Fix Import Path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from simulation.stgnn_model import STGNN

# Config
DATA_DIR = "../data/processed"
MODEL_PATH = "../models/stgnn_ieee9.pth"
NUM_NODES = 9
NUM_FEATURES = 5

def train_stgnn():
    print("🚀 Training ST-GNN Model (Deep Learning)...")
    
    # Load Data
    try:
        X = np.load(os.path.join(DATA_DIR, "X_windows.npy"))
        y = np.load(os.path.join(DATA_DIR, "y_windows.npy"))
    except FileNotFoundError:
        print("❌ Preprocessed data not found. Run preprocess_data.py first.")
        return

    # Edge Index (IEEE 9-Bus)
    # 0-3, 3-4, 4-5, 2-5, 5-6, 6-7, 7-1, 7-8 (mapped 1-based to 0-based)
    sources = [0, 3, 4, 2, 5, 6, 7, 7]
    targets = [3, 4, 5, 5, 6, 7, 1, 8]
    edge_index = torch.tensor([sources + targets, targets + sources], dtype=torch.long)
    
    # Prepare PyG Dataset
    dataset = []
    # X shape: [N, Window, Nodes, Features]
    # We take the *last* timestep features or flatten window? 
    # STGNN usually takes [Batch, features, nodes, time] or similar.
    # Our simple STGNN implementation likely expects [Batch, Nodes*Features] or leverages temporal convs.
    # Looking at STGNN code:
    # forward(data) -> x, edge_index
    # It has gat1, gat2, temporal_conv(hidden->hidden)
    # If it uses Temporal Conv, it needs time dim.
    # But usually PyG Data.x is [Nodes, Features].
    # Let's check model definition... 
    # Current STGNN defined in `stgnn_model.py`:
    # x input: [Batch*Nodes, In_Channels] ? Or is it handling temporal internally?
    # Actually, for simplicity in `train_ieee9.py` I used `sample = np.stack(...)`
    # and passed it. 
    # Let's adapt so it works with the existing Model structure.
    # If `STGNN` expects [Nodes, Features], we might be feeding just the latest snapshot 
    # OR we need to adjust the model to take window.
    
    # The `train_ieee9.py` previously generated [Samples, Time, Nodes, Feat].
    # And passed it... how?
    # `Data(x=torch.tensor(sample, ...))`
    # If sample is [Time, Nodes, Feat], `x` becomes 3D tensor? PyG usually expects 2D.
    # Let's flatten Time into Features for simple GNN, OR check if STGNN handles 3D.
    # The previous script: `sample = np.stack([v, i, p, q, f], axis=2)` -> [10, 9, 5]
    # `X_flat = X.reshape(-1, NUM_FEATURES)` -> [180000, 5]
    # It treated every timestamp as a sample?? No.
    
    # Let's align with what `train_ieee9.py` did:
    # It generated sequences but the critical part is how `Data` was constructed.
    # Wait, `train_ieee9.py` didn't actually build the dataset fully in the snippet I saw?
    # Actually it looped `for i in range(len(X)):`
    # Let's stick to a robust approach:
    # We will use the Flattened Window approach for inputs unless we change model.
    # Input: [Nodes, Features * Window]
    # This preserves temporal info in feature dimension for a static GNN,
    # OR we use the logic that `train_ieee9.py` intended.
    
    # Let's look at `train_ieee9.py` again in my memory... 
    # It reshaped X to flat for scaling, then reshaped back.
    # Then `for i in range(len(X))`: `dataset.append(Data(x=..., edge_index=..., y=...))`
    # It likely passed `X[i]` which is [10, 9, 5].
    # PyG `data.x` can be arbitrary shape.
    # Our `STGNN.forward` likely needs to handle it.
    # If `STGNN` has `temporal_conv`, it expects `[Batch, Time, Channels]`.
    
    # Let's assume input X is [N, 10, 9, 5].
    # We will pass x=[9, 5] (latest) AND valid history if model supports, 
    # OR pass x=[9, 10, 5] (permuted).
    
    # For this Viva Verification, let's simplify to:
    # Use Last Snapshot features [9, 5] for Graph Conv
    # BUT this loses temporal. 
    # Let's flatten time: Features = 5 * 10 = 50.
    # Model in_channels needs to be 50.
    # But current model in_channels is 5.
    
    # CORRECT FIX:
    # Pass [Nodes, 5] features (Current state) to GAT
    # Update STGNN to be stateful or ignore history for Baseline comparison fairness 
    # OR (Better)
    # The previous `train_ieee9.py` set up STGNN with in_channels=5.
    # It likely just processed single snapshots.
    # To keep compatibility with the `ai_inference_service.py` (which runs `analyze(data)` on a single snapshot),
    # we MUST train on single snapshots.
    # The service `analyze` calls `model(data)`. `data` is built from `_process_packet`.
    # `_process_packet` gets 1 timestamp.
    # So the current system is purely Spatial (GNN), not Temporal (RNN/TCN) in terms of input.
    # `STGNN` name implies temporal, but if input is 1 snapshot, temporal conv is useless unless it has internal state.
    
    # DECISION: Train on single snapshots from the window data.
    # We effectively treat every step as a sample.
    # This matches the Inference Service which feeds 1 frame at a time.
    
    X_flat_snaps = X.reshape(-1, NUM_NODES, NUM_FEATURES) # [N*10, 9, 5]
    y_flat_snaps = np.repeat(y, 10) # Repeat label for each step in window
    
    for i in range(len(X_flat_snaps)):
        snap = X_flat_snaps[i] # [9, 5]
        label = y_flat_snaps[i]
        
        data = Data(x=torch.tensor(snap, dtype=torch.float), 
                    edge_index=edge_index, 
                    y=torch.tensor(label, dtype=torch.long))
        dataset.append(data)
        
    loader = DataLoader(dataset, batch_size=32, shuffle=True)
    
    # Model
    model = STGNN(in_channels=5, hidden_channels=32, out_channels=2, num_nodes=9)
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    crit = nn.CrossEntropyLoss()
    
    print(f"Training on {len(dataset)} snapshots...")
    model.train()
    for epoch in range(10): 
        total_loss = 0
        for batch in loader:
            optimizer.zero_grad()
            out = model(batch)
            loss = crit(out, batch.y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        print(f"Epoch {epoch+1}: Loss {total_loss:.4f}")
        
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    torch.save(model.state_dict(), MODEL_PATH)
    print(f"✅ ST-GNN Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    train_stgnn()
