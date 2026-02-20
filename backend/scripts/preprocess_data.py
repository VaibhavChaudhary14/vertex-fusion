import pandas as pd
import numpy as np
import joblib
import os
from sklearn.preprocessing import StandardScaler

# Config
DATA_FILE = "../data/ieee9_dynamic_dataset.csv"
OUTPUT_DIR = "../data/processed"
SCALER_PATH = "../data/scaler_ieee9.joblib"
WINDOW_SIZE = 10
NUM_NODES = 9
NUM_FEATURES = 5 # V, I, P, Q, Freq

def preprocess():
    if not os.path.exists(DATA_FILE):
        print(f"❌ Error: Data file {DATA_FILE} not found.")
        print("Run the MATLAB simulation and ScadaBridge first to generate data.")
        return

    print(f"Loading data from {DATA_FILE}...")
    df = pd.read_csv(DATA_FILE)
    
    # Check if we have enough data
    if len(df) < WINDOW_SIZE + 1:
        print("❌ Not enough data points to create windows.")
        return

    # Extract Features
    # CSV Cols: time, freq, v1..v9, i1..i9, p1..p9, q1..q9
    # Target Features per Node: [V, I, P, Q, Freq]
    
    samples = []
    vals = df.values
    
    for row in vals:
        # row mapping based on scada_bridge.py
        # 0:time, 1:freq
        # 2-10: V
        # 11-19: I
        # 20-28: P
        # 29-37: Q
        
        f = row[1]
        v = row[2:11]
        i = row[11:20]
        p = row[20:29]
        q = row[29:38]
        
        node_feats = []
        for n in range(NUM_NODES):
            node_feats.append([v[n], i[n], p[n], q[n], f])
            
        samples.append(node_feats)
        
    X_spatial = np.array(samples) # [N, 9, 5]
    print(f"Spatial Data Shape: {X_spatial.shape}")

    # Normalize
    # Flatten -> Fit Scaler -> Reshape
    N, Nodes, Feats = X_spatial.shape
    X_flat = X_spatial.reshape(-1, Feats)
    
    scaler = StandardScaler()
    X_scaled_flat = scaler.fit_transform(X_flat)
    X_scaled = X_scaled_flat.reshape(N, Nodes, Feats)
    
    # Save Scaler
    os.makedirs(os.path.dirname(SCALER_PATH), exist_ok=True)
    joblib.dump(scaler, SCALER_PATH)
    print(f"✅ Scaler saved to {SCALER_PATH}")

    # Sliding Window
    X_windows = []
    y_windows = []
    
    # Synthesize Labels for now (since CSV has no labels yet)
    # If we had labels in CSV, we would read them.
    # For Viva demo, we often manually inject attacks in separate CSVs or
    # rely on the fact that we know when we ran the attack.
    # Here, we will default to 0 (Normal). 
    # TODO: Add logic to read 'label' col if added later.
    
    for i in range(len(X_scaled) - WINDOW_SIZE):
        window = X_scaled[i:i+WINDOW_SIZE]
        X_windows.append(window)
        y_windows.append(0) # Default Normal
        
    X_windows = np.array(X_windows)
    y_windows = np.array(y_windows)
    
    print(f"Generated Windows: {X_windows.shape}")
    
    # Save NPY
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    np.save(os.path.join(OUTPUT_DIR, "X_windows.npy"), X_windows)
    np.save(os.path.join(OUTPUT_DIR, "y_windows.npy"), y_windows)
    
    print(f"✅ Preprocessed data saved to {OUTPUT_DIR}")

if __name__ == "__main__":
    preprocess()
