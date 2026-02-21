import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import numpy as np
import os
import sys
from sklearn.metrics import classification_report, confusion_matrix

# -----------------------------
# 1. Load preprocessed data
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "datasets")

def load_data():
    X_path = os.path.join(DATA_DIR, "X_windows.npy")
    y_path = os.path.join(DATA_DIR, "y_windows.npy")
    
    if not os.path.exists(X_path) or not os.path.exists(y_path):
        print(f"[ERROR] Data files not found in {DATA_DIR}")
        return None, None

    X = np.load(X_path)
    y = np.load(y_path)
    print(f"[SUCCESS] Loaded: X {X.shape}, y {y.shape}")
    return X, y

# -----------------------------
# 2. Training Loop
# -----------------------------
def train_model():
    X, y = load_data()
    if X is None: return

    # Parameters
    window_size = 10
    num_nodes = 9
    num_features = 6
    num_classes = 4
    
    # Create TensorDataset
    dataset = TensorDataset(torch.tensor(X, dtype=torch.float32), torch.tensor(y, dtype=torch.long))

    # Split train/test
    train_size = int(0.8 * len(dataset))
    test_size = len(dataset) - train_size
    train_dataset, test_dataset = torch.utils.data.random_split(dataset, [train_size, test_size])

    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=32)

    # Import STGNN from neighboring file
    try:
        from stgnn_model import STGNN
    except ImportError:
        from .stgnn_model import STGNN

    model = STGNN(in_channels=6, hidden_channels=32, out_channels=num_classes)
    print(f"[SUCCESS] ST-GNN Initialized for 9 Nodes. Training on {device_str := 'GPU' if torch.cuda.is_available() else 'CPU'}")
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    epochs = 5 # Sufficient for synthetic verification

    print(f"Starting Training ({epochs} epochs)...", flush=True)

    for epoch in range(epochs):
        model.train()
        total_loss = 0
        for i, (x_batch, y_batch) in enumerate(train_loader):
            x_batch, y_batch = x_batch.to(device), y_batch.to(device)
            
            optimizer.zero_grad()
            
            # Reshape [B, 540] -> [B, 10, 9, 6]
            x_batch = x_batch.reshape(-1, window_size, num_nodes, num_features)
            
            logits = model(x_batch)
            loss = criterion(logits, y_batch)
            
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
            
            if (i+1) % 20 == 0:
                print(f"  Epoch {epoch+1} | Batch {i+1}/{len(train_loader)} | Loss: {loss.item():.4f}", flush=True)

        avg_loss = total_loss / len(train_loader)
        print(f"Epoch {epoch+1}/{epochs} Complete. Avg Loss: {avg_loss:.4f}", flush=True)

    # Quick Eval
    model.eval()
    correct = 0
    total = 0
    with torch.no_grad():
        for x_batch, y_batch in test_loader:
            x_batch, y_batch = x_batch.to(device), y_batch.to(device)
            x_batch = x_batch.reshape(-1, window_size, num_nodes, num_features)
            logits = model(x_batch)
            preds = torch.argmax(logits, dim=1)
            correct += (preds == y_batch).sum().item()
            total += y_batch.size(0)
    
    print(f"[SUCCESS] Test Accuracy: {100 * correct / total:.2f}%")

    # Save model
    model_path = os.path.join(BASE_DIR, "models", "stgnn_model.pth")
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    torch.save(model.state_dict(), model_path)
    print(f"[SUCCESS] ST-GNN model saved to: {model_path}")

if __name__ == "__main__":
    train_model()
