import pandas as pd
import numpy as np
import os

def preprocess():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(BASE_DIR, "datasets")
    
    csv_path = os.path.join(DATA_DIR, "ieee9_telemetry.csv")
    if not os.path.exists(csv_path):
        print("[ERROR] Source CSV not found: " + csv_path)
        return

    df = pd.read_csv(csv_path)
    print("[SUCCESS] Loading " + str(len(df)) + " rows from " + csv_path)

    # Features: Everything except attack_label
    # For IEEE 9-bus: 9 nodes * 6 features = 54 columns
    features = df.drop(columns=["attack_label"]).values
    labels = df["attack_label"].values

    window_size = 10
    X_windows = []
    y_windows = []

    print(f"Creating sliding windows (size={window_size})...")
    for i in range(len(features) - window_size):
        # Extract window of 54 features
        window = features[i : i + window_size] # [10, 54]
        # Flatten for the trainer (which currently expects [Batch, 540])
        X_windows.append(window.flatten())
        # Label is the last state in the window
        y_windows.append(labels[i + window_size - 1])

    X_windows = np.array(X_windows)
    y_windows = np.array(y_windows)

    # Save to npy
    np.save(os.path.join(DATA_DIR, "X_windows.npy"), X_windows)
    np.save(os.path.join(DATA_DIR, "y_windows.npy"), y_windows)
    
    # Also save to CSV for scada.py (which uses pandas)
    # We include the label as the last column
    combined = np.column_stack((X_windows, y_windows))
    cols = [f"f{i}" for i in range(X_windows.shape[1])] + ["attack_label"]
    df_windows = pd.DataFrame(combined, columns=cols)
    df_windows.to_csv(os.path.join(DATA_DIR, "ieee9_telemetry_windows.csv"), index=False)

    print("[SUCCESS] Preprocessing complete (Saved .npy and .csv).")
    print(f"X shape: {X_windows.shape}, y shape: {y_windows.shape}")

if __name__ == "__main__":
    preprocess()
