# scripts/generate_balanced_dataset.py

import numpy as np
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")

np.random.seed(42)

n_samples = 2000
timesteps = 10
features = 22

def generate_attack(type_id):
    data = np.random.normal(0, 1, (n_samples, features * timesteps))
    if type_id == 1:  # FDI
        data[:, :5] += np.random.normal(2, 0.5, (n_samples, 5))
    elif type_id == 2:  # DoS
        data[:, 10:15] = 0
    elif type_id == 3:  # Replay
        data[:, -5:] = data[:, :5]
    return data, np.full(n_samples, type_id)

X0, y0 = np.random.normal(0,1,(n_samples,features*timesteps)), np.zeros(n_samples)
X1, y1 = generate_attack(1)
X2, y2 = generate_attack(2)
X3, y3 = generate_attack(3)

X = np.vstack([X0,X1,X2,X3])
y = np.hstack([y0,y1,y2,y3])

np.save(os.path.join(DATA_DIR, "X_windows.npy"), X)
np.save(os.path.join(DATA_DIR, "y_windows.npy"), y)
print(f"✅ New balanced dataset saved: {X.shape}, {y.shape}")

