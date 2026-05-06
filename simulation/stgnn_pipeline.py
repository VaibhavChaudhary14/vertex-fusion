import pandas as pd
import torch
import torch.nn as nn
import numpy as np
import os
import joblib
from sklearn.preprocessing import StandardScaler
from torch_geometric.nn import GCNConv
from torch.utils.data import TensorDataset, DataLoader

# =====================
# LOAD & NORMALIZE DATA
# =====================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "ieee9_dynamic_dataset.csv")

print(f"Loading data from: {DATA_PATH}")
df = pd.read_csv(DATA_PATH)
data = df.values

# FIX 2: Normalize data so network doesn't get confused by different scales
scaler = StandardScaler()
data_scaled = scaler.fit_transform(data)

num_nodes = 9
features_per_node = 6

# Convert to tensor and reshape
num_timesteps = data_scaled.shape[0]
data_seq = data_scaled.reshape(num_timesteps, num_nodes, features_per_node)
x = torch.tensor(data_seq, dtype=torch.float)

print(f"Dataset shape after normalization: {x.shape} (Timesteps, Nodes, Features)")

print("Saving StandardScaler for real-time SCADA integration...")
joblib.dump(scaler, 'scaler.pkl')
print("Scaler saved to scaler.pkl")

# =====================
# GRAPH (IEEE 9 BUS)
# =====================
edge_index = torch.tensor([
    [0,0,1,2,2,3,4,5,6],
    [1,3,2,3,4,5,6,7,8]
], dtype=torch.long)

edge_index = torch.cat([edge_index, edge_index.flip(0)], dim=1)

# =====================
# SEQUENTIAL ATTACK INJECTION
# =====================
# Multi-Class Attack Injection
# 0: Normal, 1: FDI, 2: DoS, 3: Replay, 4: Noise
y = np.zeros(len(x))
attack_types = [1, 2, 3, 4] # FDI, DoS, Replay, Noise

# Inject multiple instances of each attack
for atype in attack_types:
    attack_indices = np.random.choice(range(100, len(x)-100), size=3, replace=False)
    print(f"Injecting type {atype} attacks...")
    for idx in attack_indices:
        duration = 15
        for t in range(idx, idx+duration):
            y[t] = atype
            # Apply specific distorted physics
            if atype == 1: # FDI
                x[t, 2, 0] += 0.4
            elif atype == 2: # DoS
                x[t, 2, 0] = 0.0
            elif atype == 3: # Replay
                x[t, 2, 0] = x[t-10, 2, 0]
            elif atype == 4: # Noise
                x[t, 2, 0] += np.random.normal(0, 0.1)

y = torch.tensor(y, dtype=torch.long)

# =====================
# SLIDING WINDOW PREPARATION
# =====================
# FIX 3: Window-based Training
window_size = 20

X_seq = []
Y_seq = []

for i in range(len(x) - window_size):
    X_seq.append(x[i:i+window_size])
    Y_seq.append(y[i+window_size-1]) # label is the status at end of the window

X_seq = torch.stack(X_seq)
Y_seq = torch.tensor(Y_seq, dtype=torch.long)

print(f"Windowed dataset shape: X: {X_seq.shape}, Y: {Y_seq.shape}")

# Batching for stability
dataset = TensorDataset(X_seq, Y_seq)
train_loader = DataLoader(dataset, batch_size=64, shuffle=True)
eval_loader = DataLoader(dataset, batch_size=64, shuffle=False)

# =====================
# MODEL (BATCH COMPATIBLE)
# =====================
class STGNN_Transformer(nn.Module):
    def __init__(self, in_features):
        super().__init__()
        
        # Spatial layers
        self.gcn1 = GCNConv(in_features, 32)
        self.gcn2 = GCNConv(32, 16)
        
        # Temporal layer (Transformer)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=16,
            nhead=4,
            dropout=0.1,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=2)
        
        # Classifier (5 Classes: Normal + 4 Attacks)
        self.fc = nn.Linear(16, 5)

    def forward(self, x, edge_index):
        # x is [Batch, Window, Nodes, Features]
        B, T, N, F = x.shape
        spatial_outputs = []

        for t in range(T):
            xt = x[:, t, :, :] # [B, N, F]
            xt_flat = xt.reshape(B * N, F)
            
            # Map edge_index across the batch
            offset = (torch.arange(0, B * N, N, device=x.device).view(-1, 1))
            batch_edge_index = edge_index.unsqueeze(0) + offset.unsqueeze(-1)
            batch_edge_index = batch_edge_index.view(-1, 2).t().contiguous()

            xt_flat = self.gcn1(xt_flat, batch_edge_index).relu()
            xt_flat = self.gcn2(xt_flat, batch_edge_index).relu()

            # Reshape back and pool
            xt_res = xt_flat.view(B, N, -1)
            xt_pool = xt_res.mean(dim=1) # [B, Features_out]
            
            spatial_outputs.append(xt_pool)

        # Shape: [Batch, Time, Features]
        temporal_input = torch.stack(spatial_outputs, dim=1)

        # Step 3: Transformer
        trans_out = self.transformer(temporal_input)

        # Step 4: Classification using last timestep output
        out = self.fc(trans_out[:, -1, :])

        return out

# =====================
# TRAIN
# =====================
print("\nStarting Training (100 epochs)...")
model = STGNN_Transformer(features_per_node)

optimizer = torch.optim.Adam(model.parameters(), lr=0.0005)

print(f"Applying Class Weights: {weights}")
loss_fn = nn.CrossEntropyLoss(weight=weights)

for epoch in range(100):
    model.train()
    total_loss = 0
    for batch_x, batch_y in train_loader:
        optimizer.zero_grad()

        out = model(batch_x, edge_index)
        loss = loss_fn(out, batch_y)

        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch + 1}, Loss: {total_loss / len(train_loader):.6f}")

print("\nSaving trained model for real-time SCADA integration...")
torch.save(model.state_dict(), "model.pth")
print("Model saved to model.pth")

# Multi-class Evaluation
from sklearn.metrics import classification_report, confusion_matrix

model.eval()
all_preds = []
all_true = []

with torch.no_grad():
    for batch_x, batch_y in eval_loader:
        out = model(batch_x, edge_index)
        preds = torch.argmax(out, dim=1)
        all_preds.extend(preds.numpy())
        all_true.extend(batch_y.numpy())

print("\n--- MULTI-CLASS CLASSIFICATION REPORT ---")
print(classification_report(all_true, all_preds, target_names=["Normal", "FDI", "DoS", "Replay", "Noise"]))

print("\n--- CONFUSION MATRIX ---")
print(confusion_matrix(all_true, all_preds))

# =====================
# EXPLAINABLE AI (XAI) - Gradient Saliency
# =====================
print("\n--- EXPLAINABLE AI (Feature Saliency) ---")
# Enable gradients on the input window sequences
x_input = X_seq.clone().detach().requires_grad_(True)

# Aggregate saliency for the "Predicted Class"
# Find the predicted class for each samples
pred_classes = torch.argmax(out, dim=1)
# Create a mask for classes that are NOT normal (0)
attack_mask = (pred_classes > 0)
attack_score = out[attack_mask, pred_classes[attack_mask]].sum()

# Compute gradients
attack_score.backward()
importance = x_input.grad.abs()

# Aggregate: Average over time window -> [batch, nodes, features]
importance = importance.mean(dim=1)
# Aggregate: Average over batch -> [nodes, features]
importance_global = importance.mean(dim=0)

# Identify Top 5 Contributors
flat_importance = importance_global.view(-1).numpy()
top_indices = np.argsort(flat_importance)[-5:]

print("\n[XAI Attribution Analysis - Top 5 Contributors]")
for idx in top_indices[::-1]:
    node = idx // features_per_node
    feat = idx % features_per_node
    print(f"Bus {node}, Feature {feat}, Score: {flat_importance[idx]:.6f}")

print("\n[Full Importance Matrix]")
print(importance_global.numpy())

