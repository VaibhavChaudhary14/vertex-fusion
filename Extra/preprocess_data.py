# SmartGrid_CyberProtection/scripts/preprocess_data.py
import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")

csv_candidates = [
    "threebus_data_final.csv",
    "threebus_synthetic.csv",
    "smartgrid_synthetic.csv",
    "processed_smartgrid.csv"
]

csv_path = None
for candidate in csv_candidates:
    candidate_path = os.path.join(DATA_DIR, candidate)
    if os.path.exists(candidate_path):
        csv_path = candidate_path
        break

if not csv_path:
    raise FileNotFoundError("No valid dataset found in /data folder!")

print(f"Loading dataset from: {os.path.basename(csv_path)} ...")
df = pd.read_csv(csv_path)
print(f"Data loaded: {df.shape[0]} rows, {df.shape[1]} columns")

if df.isnull().values.any():
    print("Missing values found -- applying forward fill.")
    df = df.fillna(method="ffill")

if 'time' in df.columns:
    df = df.drop(columns=['time'])
if 'Time' in df.columns:
    df = df.drop(columns=['Time'])

# 1. Normalize Features (Exclude Label)
# Identify feature columns (exclude 'attack_label' if present)
feature_cols = [c for c in df.columns if c != 'attack_label']
print(f"Feature columns ({len(feature_cols)}): {feature_cols}")

scaler = MinMaxScaler()
# Fit scaler ONLY on features
df[feature_cols] = scaler.fit_transform(df[feature_cols])
print("Normalized feature columns.")

# Save scaler for live use
scaler_path = os.path.join(DATA_DIR, "scaler.joblib")
joblib.dump(scaler, scaler_path)
print(f"Saved scaler to {scaler_path}")

# 2. Synthetic labels (for demo: 0/1/2/3)
df_scaled = df # Alias for backward compatibility
num_samples = len(df_scaled)
labels = np.zeros(num_samples, dtype=int)
labels[int(num_samples*0.3):int(num_samples*0.5)] = 1  # FDI
labels[int(num_samples*0.5):int(num_samples*0.7)] = 2  # DoS
labels[int(num_samples*0.7):int(num_samples*0.9)] = 3  # Replay

# 3. Sliding windows
window_size = 10
X, y = [], []

# Use only feature columns for X
data_values = df[feature_cols].values

for i in range(len(data_values) - window_size):
    # Append (10, 21) window
    X.append(data_values[i:i+window_size])
    y.append(labels[i+window_size-1])

X = np.array(X)
y = np.array(y)
print(f"Created {len(X)} samples of shape {X.shape[1:]}")

processed_csv_path = os.path.join(DATA_DIR, "processed_smartgrid.csv")
X_path = os.path.join(DATA_DIR, "X_windows.npy")
y_path = os.path.join(DATA_DIR, "y_windows.npy")

# pd.DataFrame(X).to_csv(processed_csv_path, index=False) # Skip csv for 3D array
np.save(X_path, X)
np.save(y_path, y)

print("Preprocessing complete!")
# print(f"Saved: {processed_csv_path}")
print(f"Saved: X_windows.npy, y_windows.npy, scaler.joblib")
