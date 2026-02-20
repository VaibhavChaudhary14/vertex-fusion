import sys
import os

# Append backend directory to sys.path to allow imports from simulation
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import torch
import torch.nn as nn
import torch.optim as optim
from torch_geometric.data import Data
from torch_geometric.loader import DataLoader
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from simulation.stgnn_model import STGNN

# Configuration
DATA_DIR = "../data/"
MODEL_PATH = "../models/stgnn_ieee9.pth"
SCALER_PATH = "../data/scaler_ieee9.joblib"
EPOCHS = 50
BATCH_SIZE = 32
WINDOW_SIZE = 10
NUM_NODES = 9
NUM_FEATURES = 5 # V, angle, P, Q, Freq per node? checking bridge...

def generate_synthetic_9bus_data(samples=1000):
    """Generates synthetic training data for IEEE 9-bus structure."""
    
    X = []
    y = []
    
    for _ in range(samples):
        # 1. Normal State
        v = np.random.normal(1.0, 0.05, (WINDOW_SIZE, NUM_NODES))
        i = np.random.normal(0.5, 0.1, (WINDOW_SIZE, NUM_NODES))
        p = np.random.normal(1.0, 0.1, (WINDOW_SIZE, NUM_NODES))
        q = np.random.normal(0.2, 0.05, (WINDOW_SIZE, NUM_NODES))
        f = np.random.normal(60.0, 0.02, (WINDOW_SIZE, NUM_NODES)) # Freq same for all usually
        
        # Stack features: [Time, Node, Feat] -> [10, 9, 5]
        sample = np.stack([v, i, p, q, f], axis=2)
        X.append(sample)
        y.append(0) # Normal

        # 2. Attack State (FDI Spike)
        v_att = v.copy()
        v_att[:, 4] = 1.2 # Spike on Node 5
        sample_att = np.stack([v_att, i, p, q, f], axis=2)
        X.append(sample_att)
        y.append(1) # FDI
        
    return np.array(X), np.array(y)

def train():
    print("Generating Synthetic IEEE 9-Bus Data...")
    X, y = generate_synthetic_9bus_data(2000)
    
    # Flatten for Scaler: [Samples*Time*Nodes, Features]
    X_flat = X.reshape(-1, NUM_FEATURES)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_flat).reshape(X.shape)
    
    joblib.dump(scaler, SCALER_PATH)
    print(f"Scaler saved to {SCALER_PATH}")
    
    # Edge Index for IEEE 9-Bus Topology
    # Mapped 0-based: 
    # 1-4 -> 0-3
    # 4-5 -> 3-4
    # 5-6 -> 4-5
    # 3-6 -> 2-5
    # 6-7 -> 5-6
    # 7-8 -> 6-7
    # 8-2 -> 7-1
    # 8-9 -> 7-8
    sources = [0, 3, 4, 2, 5, 6, 7, 7]
    targets = [3, 4, 5, 5, 6, 7, 1, 8]
    # Bidirectional
    edge_index = torch.tensor([sources + targets, targets + sources], dtype=torch.long)
    
    dataset = []
    for i in range(len(X)):
        # x shape: [Nodes, Features] (taking last timestep or sequence?)
        # STGNN expects temporal convolution, usually input is [Nodes, Features, Time] or handle internally
        # Our STGNN logic:
        # gat1(x, edge) -> x shape [Nodes, Hidden] 
        # Temporal conv expects [Batch, Hidden, Nodes]? 
        # The current STGNN implementation extracts last timestep in 'reshape_to_graph'?
        # Let's look at `stgnn_model.py`:
        # x = self.gat1(x, edge_index) -> Expects x as [Nodes, In_Channels]
        # Then x_t = x.unsqueeze(0)... temporal_conv(x_t)
        # Wait, if GAT is first, it processes spatial snapshot. 
        # Where is time dimension?
        # Only existing STGNN processes a single snapshot (spatial)?
        # Ah, "temporal_conv" is applied AFTER GAT. 
        # But if input 'data.x' is just [Nodes, Features], it's a static snapshot.
        # The "temporal" convolution in the code: `x_t = x.unsqueeze(0).permute(0, 2, 1)` -> [1, Hidden, Nodes]
        # Then `temporal_conv(x_t)` where kernel=3...
        # If input size to conv1d is 'Nodes', the kernel slides across NODES?
        # That's "Spatial" convolution disguised as temporal if the dimension is nodes.
        # To strictly do ST-GNN, we need [Time, Nodes, Feat].
        # BUT for the current codebase, it seems to treat "Nodes" as the sequence for 1D conv?
        # Actually `temporal_conv` kernel=3 on dimension 2 (Nodes) mixes neighbor node features in 1D serialization.
        # It's a "1D Graph Conv" effectively.
        # We will stick to the existing architecture: Input is one snapshot [9, 5].
        
        # Take last timestep of window
        x_snapshot = torch.tensor(X_scaled[i, -1, :, :], dtype=torch.float) # [9, 5]
        y_label = torch.tensor(y[i], dtype=torch.long)
        
        data = Data(x=x_snapshot, edge_index=edge_index, y=y_label)
        dataset.append(data)

    loader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)
    
    model = STGNN(in_channels=NUM_FEATURES, hidden_channels=32, out_channels=2, num_nodes=NUM_NODES)
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.CrossEntropyLoss()
    
    model.train()
    print("Starting Training...")
    for epoch in range(EPOCHS):
        total_loss = 0
        for batch in loader:
            optimizer.zero_grad()
            out = model(batch)
            loss = criterion(out, batch.y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
            
        if epoch % 10 == 0:
            print(f"Epoch {epoch}: Loss {total_loss/len(loader):.4f}")
            
    torch.save(model.state_dict(), MODEL_PATH)
    print(f"✅ Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    train()
