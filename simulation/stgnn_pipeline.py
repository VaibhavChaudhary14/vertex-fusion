import pandas as pd
import torch
import torch.nn as nn
import numpy as np
import os
from torch_geometric.nn import GCNConv
from sklearn.preprocessing import StandardScaler
from torch.utils.data import TensorDataset, DataLoader

# =====================
# LOAD & NORMALIZE DATA
# =====================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "ieee9_dynamic_dataset.csv")

print(f"Loading data from: {DATA_PATH}")
df = pd.read_csv(DATA_PATH)
data = df.values

num_nodes = 9
features_per_node = 6

# FIT FIX 2: Normalization
scaler = StandardScaler()
data = scaler.fit_transform(data)

# Convert to tensor and reshape
x = torch.tensor(data, dtype=torch.float)
x = x.view(-1, num_nodes, features_per_node)
y = np.zeros(len(x))

print(f"Raw Dataset shape: {x.shape} (Timesteps, Nodes, Features)")

# =====================
# SYNTHETIC SEQUENTIAL ATTACK (FDI-style)
# =====================
np.random.seed(42) # For reproducibility relative to debugging
attack_indices = np.random.choice(range(100, len(x)-100), size=5, replace=False)

for idx in attack_indices:
    duration = 10   # attack lasts 10 timesteps
    for t in range(idx, idx+duration):
        x[t, 2, 0] += 0.3
        y[t] = 1

# =====================
# WINDOW-BASED TRAINING
# =====================
window_size = 20

X_seq = []
Y_seq = []

for i in range(len(x) - window_size):
    X_seq.append(x[i:i+window_size])
    Y_seq.append(y[i+window_size-1])

x = torch.stack(X_seq)
y = torch.tensor(Y_seq, dtype=torch.long)

print(f"Windowed shape: X={x.shape}, Y={y.shape}")

# Optional shuffle
perm = torch.randperm(len(x))
x_shuffled = x[perm]
y_shuffled = y[perm]

# =====================
# GRAPH (IEEE 9 BUS)
# =====================
edge_index = torch.tensor([
    [0,0,1,2,2,3,4,5,6],
    [1,3,2,3,4,5,6,7,8]
], dtype=torch.long)
edge_index = torch.cat([edge_index, edge_index.flip(0)], dim=1)

# =====================
# LOSS FUNCTION & MODEL
# =====================
class FocalLoss(nn.Module):
    def __init__(self, alpha=0.75, gamma=2):
        super().__init__()
        self.alpha = alpha
        self.gamma = gamma
        self.ce = nn.CrossEntropyLoss(reduction='none')

    def forward(self, inputs, targets):
        ce_loss = self.ce(inputs, targets)
        pt = torch.exp(-ce_loss)
        focal_loss = self.alpha * (1 - pt) ** self.gamma * ce_loss
        return focal_loss.mean()

class STGNN_LSTM(nn.Module):
    def __init__(self, in_features):
        super().__init__()
        # Spatial layers
        self.gcn1 = GCNConv(in_features, 32)
        self.gcn2 = GCNConv(32, 16)
        
        # Temporal layer
        self.lstm = nn.LSTM(input_size=16, hidden_size=32, batch_first=True)
        
        # Classifier
        self.fc = nn.Linear(32, 2)

    def forward(self, x, edge_index):
        # x shape: [batch_size, time_window, nodes, features]
        B, T, N, F = x.shape
        spatial_outputs = []

        for t in range(T):
            xt = x[:, t, :, :] # [B, N, F]
            xt_flat = xt.reshape(B * N, F)
            
            # Map edge_index across the batch
            offset = (torch.arange(0, B * N, N, device=x.device).view(-1, 1))
            batch_edge_index = edge_index.unsqueeze(0) + offset.unsqueeze(-1)
            batch_edge_index = batch_edge_index.view(-1, 2).t().contiguous()

            # Spatial message passing
            h = self.gcn1(xt_flat, batch_edge_index).relu()
            h = self.gcn2(h, batch_edge_index).relu()

            # Pool nodes -> single vector [B, 16]
            h = h.view(B, N, 16).mean(dim=1)
            spatial_outputs.append(h)

        # Shape: [B, T, 16]
        spatial_outputs = torch.stack(spatial_outputs, dim=1)

        # Step 3: LSTM
        lstm_out, _ = self.lstm(spatial_outputs)

        # Step 4: Classification per window
        out = self.fc(lstm_out[:, -1, :]) # Use the last temporal step

        return out

# =====================
# TRAIN
# =====================
print("\nStarting Training (50 epochs)...")
model = STGNN_LSTM(features_per_node)
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
loss_fn = FocalLoss()

# Use DataLoader for batching to prevent graph tensor memory bloat
dataset = TensorDataset(x_shuffled, y_shuffled)
dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

for epoch in range(50):
    model.train()
    total_loss = 0
    for batch_x, batch_y in dataloader:
        optimizer.zero_grad()
        out = model(batch_x, edge_index)
        loss = loss_fn(out, batch_y)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch + 1}, Avg Loss: {total_loss / len(dataloader):.6f}")

# =====================
# PREDICTION
# =====================
model.eval()
with torch.no_grad():
    eval_dataset = TensorDataset(x, y) 
    eval_loader = DataLoader(eval_dataset, batch_size=32, shuffle=False)
    
    preds = []
    for batch_x, _ in eval_loader:
        pred_batch = torch.argmax(model(batch_x, edge_index), dim=1)
        preds.append(pred_batch)
    pred = torch.cat(preds)

print("\n--- RESULTS ---")
total_attacks = (y == 1).sum().item()
true_positives = ((pred == 1) & (y == 1)).sum().item()
false_positives = ((pred == 1) & (y == 0)).sum().item()

print(f"Total attacks injected (timesteps): {total_attacks}")
print(f"Attacks correctly detected (True Positives): {true_positives}")
print(f"False Positives (Normal flagged as attack): {false_positives}")
print("Detection Status:", "SUCCESS" if true_positives > 0 else "FAILED")

recall = 100 * true_positives / total_attacks if total_attacks > 0 else 0
print(f"Recall (Detection Rate): {recall:.2f}%")

correct = (pred == y).sum().item()
accuracy = 100 * correct / len(y)
print(f"Overall Dataset Accuracy: {accuracy:.2f}%")
