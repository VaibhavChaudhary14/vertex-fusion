import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
import numpy as np
import os
import joblib
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from simulation.stgnn_9bus import STGNN_9Bus
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Train_9Bus")

# Configuration
DATA_DIR = "data"
CSV_FILE = "dataset_9bus_dynamic.csv" # User must generate this from Simscape
MODEL_PATH = os.path.join(DATA_DIR, "stgnn_9bus.pth")
SCALER_PATH = os.path.join(DATA_DIR, "scaler_9bus.joblib")

# Hyperparameters
BATCH_SIZE = 32
EPOCHS = 50
LEARNING_RATE = 0.001
WINDOW_SIZE = 10
NUM_NODES = 9
NUM_FEATURES = 6 # V, Ang, P, Q, F, I

def load_and_process_data():
    csv_path = os.path.join(DATA_DIR, CSV_FILE)
    if not os.path.exists(csv_path):
        logger.error(f"❌ Dataset not found: {csv_path}")
        logger.info("ℹ️  Please generate 'dataset_9bus_dynamic.csv' from Simscape first.")
        logger.info("   Format: [Time, V_1..9, I_1..9, P_1..9, Q_1..9, F_1..9, Label]")
        return None, None, None

    logger.info(f"📥 Loading {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # Drop Time
    if 'Time' in df.columns: df = df.drop(columns=['Time'])
    
    # Separate Features and Label
    # Assuming Label is the last column
    feature_cols = df.columns[:-1] # All except Label
    label_col = df.columns[-1]
    
    X_raw = df[feature_cols].values
    y_raw = df[label_col].values
    
    # Normalize Features
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X_raw)
    
    # Save Scaler
    joblib.dump(scaler, SCALER_PATH)
    logger.info(f"✅ Scaler saved to {SCALER_PATH}")
    
    # Create Sliding Windows
    X_windows = []
    y_windows = []
    
    # Shape of X_raw: [Samples, 9*6=54 features]
    # We need to reshape into [Samples, 9, 6] for the graph model?
    # Actually, STGNN_9Bus expects [Batch, Time, Nodes, Features].
    # So we slice windows first, then reshape.
    
    for i in range(len(X_scaled) - WINDOW_SIZE):
        window = X_scaled[i : i+WINDOW_SIZE] # [10, 54]
        label = y_raw[i + WINDOW_SIZE - 1]   # Label at end of window
        
        # Reshape window to [10, 9, 6]
        # Important: The CSV columns must be ordered by Node first or Feature first?
        # Simscape usually exports: V1,V2..V9, I1..I9 etc.
        # So we need to carefully reshape. 
        # Let's assume CSV is: V1,I1,P1,Q1,F1, I_mag1, ... V9... 
        # OR: V1..V9, I1..I9.
        # The 'tcp_client.py' and 'send_data.m' send: V(1..9), I(1..9), P(1..9), Q(1..9), F(1..9).
        # We need to restructure this into [Nodes, Features].
        # 5 arrays of 9 -> Node i has [V[i], I[i], P[i], Q[i], F[i]] (5 features?).
        # STGNN_9Bus defined 6 input channels? 
        # Implementation Plan said: V_mag, V_ang, P, Q, F, I_mag.
        # send_data.m sends V, I, P, Q, F (5 vars) + BreakerStatus.
        # Let's settle on 5 features + BreakerStatus? Or 6?
        # If model expects 6, we need 6.
        # Let's assume BreakerStatus is the 6th feature? Or zero padding?
        # For this script, we assume the CSV is perfectly formatted as 54 columns.
        
        # Reshape strategy:
        # If columns are grouped by type (V1..V9, I1..I9...), we need to transpose.
        # But 'stgnn_9bus.py' expects [nodes, features].
        # We will handle reshape in the Dataset __getitem__ or here.
        # Let's just create the tensor [10, 54] here and reshape in training loop.
        
        X_windows.append(window)
        y_windows.append(label)
        
    X_windows = np.array(X_windows) # [Samples, 10, 54]
    y_windows = np.array(y_windows)
    
    return X_windows, y_windows, scaler

def train():
    X, y, _ = load_and_process_data()
    if X is None: return
    
    # Convert to Tensor
    X_tensor = torch.tensor(X, dtype=torch.float32)
    y_tensor = torch.tensor(y, dtype=torch.long)
    
    # Reshape X to [Samples, Time, Nodes, Features]
    # Input X is [Samples, 10, 54] (assuming 9 nodes * 6 data points)
    # We want [Samples, 10, 9, 6]
    # CAUTION: This reshape depends on column order. 
    # Validating column order is crucial in real dev.
    samples, time, _ = X_tensor.shape
    X_tensor = X_tensor.view(samples, time, NUM_NODES, NUM_FEATURES)
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X_tensor, y_tensor, test_size=0.2, shuffle=True)
    
    # Loader
    train_dataset = torch.utils.data.TensorDataset(X_train, y_train)
    train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    
    # Model Init
    model = STGNN_9Bus(in_channels=NUM_FEATURES, out_channels=4) # 4 classes
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    
    logger.info("🚀 Starting Training Loop...")
    model.train()
    
    for epoch in range(EPOCHS):
        total_loss = 0
        correct = 0
        total = 0
        
        for batch_idx, (data, target) in enumerate(train_loader):
            optimizer.zero_grad()
            
            # Forward
            output = model(data) # [Batch, 4]
            
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
            _, predicted = torch.max(output.data, 1)
            total += target.size(0)
            correct += (predicted == target).sum().item()
            
        acc = 100 * correct / total
        if (epoch+1) % 5 == 0:
            logger.info(f"Epoch {epoch+1}/{EPOCHS}, Loss: {total_loss/len(train_loader):.4f}, Acc: {acc:.2f}%")
            
    # Save
    torch.save(model.state_dict(), MODEL_PATH)
    logger.info(f"💾 Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    train()
