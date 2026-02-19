# scripts/train_stgnn_model.py

import torch
import torch.nn as nn
import torch.optim as optim
from torch_geometric.data import Data
from torch_geometric.loader import DataLoader
from torch_geometric.nn import GATConv
import numpy as np
import os
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# -----------------------------
# 1️⃣ Load preprocessed data
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")

X = np.load(os.path.join(DATA_DIR, "X_windows.npy"))
y = np.load(os.path.join(DATA_DIR, "y_windows.npy"))

print(f"✅ Loaded: X {X.shape}, y {y.shape}")

# -----------------------------
# 2️⃣ Data Reshaping Setup
# -----------------------------
window_size = 10
features_per_timestep = X.shape[1] // window_size  # 220 / 10 = 22
num_nodes = 3
features_per_node = features_per_timestep

print(f"Window size: {window_size}, Features/timestep: {features_per_timestep}")

def reshape_to_graph(sample, label):
    """Convert flattened sample to pseudo-graph."""
    sample = sample.reshape(window_size, -1)
    last_t = sample[-1]
    node_feats = np.tile(last_t, (num_nodes, 1))  # same features across nodes
    edge_index = torch.tensor([
    [0, 1, 1, 2, 2, 0],
    [1, 0, 2, 1, 0, 2]
], dtype=torch.long)

    data = Data(x=torch.tensor(node_feats, dtype=torch.float),
                edge_index=edge_index,
                y=torch.tensor(int(label)))
    return data

graphs = [reshape_to_graph(X[i], y[i]) for i in range(len(X))]

# Split train/test
split_idx = int(0.8 * len(graphs))
train_graphs = graphs[:split_idx]
test_graphs = graphs[split_idx:]

train_loader = DataLoader(train_graphs, batch_size=32, shuffle=True)
test_loader = DataLoader(test_graphs, batch_size=32)

# -----------------------------
# 3️⃣ Define ST-GNN Model
# -----------------------------
class STGNN(nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super(STGNN, self).__init__()
        self.gat1 = GATConv(in_channels, hidden_channels, heads=2, dropout=0.2)
        self.gat2 = GATConv(hidden_channels * 2, hidden_channels, heads=1, dropout=0.2)
        self.temporal_conv = nn.Conv1d(in_channels=hidden_channels, out_channels=hidden_channels, kernel_size=3, padding=1)
        self.flatten = nn.Flatten()
        self.fc = nn.Sequential(
            nn.Linear(hidden_channels * num_nodes, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, out_channels)
        )

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = self.gat1(x, edge_index)
        x = torch.relu(x)
        x = self.gat2(x, edge_index)
        x = torch.relu(x)

        x_t = x.unsqueeze(0).permute(0, 2, 1)  # [1, feat, nodes]
        x_t = self.temporal_conv(x_t)
        x_t = torch.relu(x_t).view(1, -1)
        out = self.fc(x_t)
        return out.squeeze(0)  # shape [4]

model = STGNN(in_channels=features_per_node, hidden_channels=32, out_channels=4)
print(model)

# -----------------------------
# 4️⃣ Training Setup
# -----------------------------
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)
epochs = 10

# -----------------------------
# 5️⃣ Training Loop
# -----------------------------
for epoch in range(epochs):
    model.train()
    total_loss = 0
    for batch in train_loader:
        optimizer.zero_grad()
        batch_loss = 0
        for graph in batch.to_data_list():  # iterate over individual graphs
            out = model(graph)  # [4] logits
            loss = criterion(out.unsqueeze(0), graph.y.view(-1))  # ensure target is 1D
            batch_loss += loss

        batch_loss.backward()
        optimizer.step()
        total_loss += batch_loss.item()
    print(f"Epoch {epoch+1}/{epochs} - Loss: {total_loss/len(train_loader):.4f}")

# -----------------------------
# 6️⃣ Evaluation
# -----------------------------
model.eval()
y_true, y_pred = [], []
with torch.no_grad():
    for batch in test_loader:
        for graph in batch.to_data_list():
            outputs = model(graph)
            preds = torch.argmax(outputs)
            y_true.append(int(graph.y))
            y_pred.append(int(preds))

print("\n📊 Classification Report:")
print(classification_report(y_true, y_pred, digits=3))

cm = confusion_matrix(y_true, y_pred)
plt.figure(figsize=(6,5))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=['Normal','FDI','DoS','Replay'],
            yticklabels=['Normal','FDI','DoS','Replay'])
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title('ST-GNN Confusion Matrix')
plt.show()

# -----------------------------
# 7️⃣ Save model
# -----------------------------
model_path = os.path.join(DATA_DIR, "stgnn_model.pth")
torch.save(model.state_dict(), model_path)
print(f"✅ ST-GNN model saved to {model_path}")
