"""
retrain_model.py
================
Run this from the project ROOT directory:
    python retrain_model.py

Generates:
    - model.pth   (5-class STGNN_Transformer, compatible with realtime_server.py)
    - scaler.pkl  (StandardScaler for 54 features)
"""

import os
import sys
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import joblib
from sklearn.preprocessing import StandardScaler
from torch_geometric.nn import GCNConv
from torch.utils.data import TensorDataset, DataLoader
from sklearn.metrics import classification_report

# ─────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────
DATA_PATH   = os.path.join("data", "ieee9_dynamic_dataset.csv")
MODEL_OUT   = "model.pth"      # root-level, where realtime_server.py expects it
SCALER_OUT  = "scaler.pkl"     # root-level

NUM_NODES    = 9
NUM_FEATURES = 6                # per node  →  54 total columns
NUM_CLASSES  = 5                # 0:Normal 1:FDI 2:DoS 3:Replay 4:Noise
WINDOW_SIZE  = 20
EPOCHS       = 50
BATCH_SIZE   = 64
LR           = 5e-4

# IEEE 9-bus bidirectional topology
EDGE_INDEX = torch.tensor([
    [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8],
    [3, 8, 6, 7, 4, 5, 0, 4, 2, 3, 2, 6, 1, 5, 1, 8, 0, 7]
], dtype=torch.long)

# ─────────────────────────────────────────
# MODEL  (must match realtime_server.py)
# ─────────────────────────────────────────
class STGNN_Transformer(nn.Module):
    def __init__(self, in_features):
        super().__init__()
        self.gcn1 = GCNConv(in_features, 32)
        self.gcn2 = GCNConv(32, 16)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=16, nhead=4, dropout=0.1, batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=2)
        self.fc = nn.Linear(16, NUM_CLASSES)   # ← 5-class output

    def forward(self, x, edge_index):
        B, T, N, F = x.shape
        spatial_outputs = []
        for t in range(T):
            xt      = x[:, t, :, :]
            xt_flat = xt.reshape(B * N, F)
            offset  = torch.arange(0, B * N, N, device=x.device).view(-1, 1)
            bei     = edge_index.unsqueeze(0) + offset.unsqueeze(-1)
            bei     = bei.view(-1, 2).t().contiguous()
            xt_flat = self.gcn1(xt_flat, bei).relu()
            xt_flat = self.gcn2(xt_flat, bei).relu()
            xt_pool = xt_flat.view(B, N, -1).mean(dim=1)
            spatial_outputs.append(xt_pool)
        temporal_input = torch.stack(spatial_outputs, dim=1)
        trans_out      = self.transformer(temporal_input)
        return self.fc(trans_out[:, -1, :])

# ─────────────────────────────────────────
# LOAD & PREPROCESS DATA
# ─────────────────────────────────────────
print(f"\n[1/5] Loading dataset: {DATA_PATH}")
if not os.path.exists(DATA_PATH):
    sys.exit(f"❌ Dataset not found: {DATA_PATH}")

df   = pd.read_csv(DATA_PATH)
data = df.values.astype(np.float32)
print(f"      Raw shape: {data.shape}  (rows × cols)")

# Ensure exactly 54 columns
if data.shape[1] < 54:
    pad  = np.zeros((data.shape[0], 54 - data.shape[1]), dtype=np.float32)
    data = np.hstack([data, pad])
    print(f"      Padded to 54 columns")
elif data.shape[1] > 54:
    data = data[:, :54]
    print(f"      Trimmed to 54 columns")

print("\n[2/5] Fitting StandardScaler & saving scaler.pkl ...")
scaler      = StandardScaler()
data_scaled = scaler.fit_transform(data)
joblib.dump(scaler, SCALER_OUT)
print(f"      ✅ scaler.pkl saved  ({data.shape[1]} features)")

# ─────────────────────────────────────────
# ATTACK LABEL INJECTION  (rich, multi-bus)
# ─────────────────────────────────────────
print("\n[3/5] Injecting multi-class attack labels ...")
T   = data_scaled.shape[0]
x_t = torch.tensor(data_scaled.reshape(T, NUM_NODES, NUM_FEATURES), dtype=torch.float)
y   = np.zeros(T, dtype=np.int64)

rng = np.random.default_rng(42)

# ── Feature index reference ─────────────────────────────────────────────────
# Per node: [0]=Voltage  [1]=Current  [2]=Active-P  [3]=Reactive-Q
#           [4]=Frequency  [5]=Phase-Angle

# ── Helper: non-overlapping start positions ──────────────────────────────────
def pick_starts(n, lo, hi, min_gap, rng):
    """Pick n non-overlapping start indices within [lo, hi]."""
    chosen = []
    attempts = 0
    while len(chosen) < n and attempts < 10000:
        s = int(rng.integers(lo, hi))
        if all(abs(s - c) >= min_gap for c in chosen):
            chosen.append(s)
        attempts += 1
    return chosen

# ── Attack 1: FDI (False Data Injection) ────────────────────────────────────
# Injects a large bias offset into voltage / active-power readings.
# Targets: all 9 buses, features 0 (V) and 2 (P), varied magnitudes.
FDI_CONFIGS = [
    # (bus_idx, feat_idx, magnitude, duration)
    (0, 0, +0.50, 30), (1, 2, +0.60, 25), (2, 0, -0.45, 28),
    (3, 2, +0.70, 32), (4, 0, +0.55, 27), (5, 2, -0.65, 30),
    (6, 0, +0.48, 25), (7, 2, +0.72, 35), (8, 0, -0.52, 28),
    (2, 5, +0.60, 22), (5, 5, -0.58, 26), (0, 3, +0.45, 30),
    (4, 3, -0.50, 25), (7, 0, +0.80, 30), (1, 4, +0.40, 20),
    (3, 5, -0.55, 28), (6, 2, +0.65, 25), (8, 3, -0.60, 30),
    (0, 2, +0.75, 35), (5, 0, -0.45, 22),
]
fdi_starts = pick_starts(len(FDI_CONFIGS), 100, T - 120, 40, rng)
for (bus, feat, mag, dur), s in zip(FDI_CONFIGS, fdi_starts):
    for t in range(s, min(s + dur, T)):
        y[t] = 1
        x_t[t, bus, feat] = x_t[t, bus, feat] + mag

# ── Attack 2: DoS (Denial of Service) ───────────────────────────────────────
# Zeroes out / flatlines multiple features on targeted buses.
DoS_CONFIGS = [
    (0, [0, 1], 30), (1, [2, 3], 28), (2, [0, 4], 32),
    (3, [1, 5], 25), (4, [0, 2], 35), (5, [3, 4], 27),
    (6, [1, 2], 30), (7, [0, 5], 28), (8, [2, 4], 32),
    (2, [0, 1, 2], 25), (5, [0, 1, 2], 28),
    (0, [3, 4, 5], 20), (7, [3, 4, 5], 22),
    (4, [0, 1, 2, 3], 30), (8, [0, 1], 25),
    (1, [4, 5], 35), (3, [0, 2, 4], 28),
    (6, [1, 3, 5], 25), (5, [0, 2], 30), (2, [3, 5], 22),
]
dos_starts = pick_starts(len(DoS_CONFIGS), 100, T - 120, 40, rng)
for (bus, feats, dur), s in zip(DoS_CONFIGS, dos_starts):
    for t in range(s, min(s + dur, T)):
        y[t] = 2
        for f in feats:
            x_t[t, bus, f] = 0.0

# ── Attack 3: Replay ─────────────────────────────────────────────────────────
# Replays stale measurements from 15-25 timesteps ago.
REPLAY_CONFIGS = [
    (0, 0, 15, 30), (1, 2, 18, 28), (2, 0, 20, 32),
    (3, 3, 15, 25), (4, 1, 22, 35), (5, 4, 18, 27),
    (6, 5, 16, 30), (7, 0, 20, 28), (8, 2, 15, 32),
    (0, 3, 25, 20), (3, 5, 18, 25), (6, 1, 22, 28),
    (1, 4, 20, 30), (4, 5, 16, 25), (7, 3, 18, 22),
    (2, 4, 22, 28), (5, 1, 15, 32), (8, 0, 20, 25),
    (0, 5, 18, 30), (4, 2, 25, 28),
]
replay_starts = pick_starts(len(REPLAY_CONFIGS), 120, T - 120, 40, rng)
for (bus, feat, lag, dur), s in zip(REPLAY_CONFIGS, replay_starts):
    for t in range(s, min(s + dur, T)):
        y[t] = 3
        if t - lag >= 0:
            x_t[t, bus, feat] = x_t[t - lag, bus, feat]

# ── Attack 4: Noise (Stochastic Perturbation) ────────────────────────────────
# Adds Gaussian noise with varied std to sensor readings.
NOISE_CONFIGS = [
    (0, 0, 0.25, 30), (1, 1, 0.30, 28), (2, 2, 0.20, 32),
    (3, 3, 0.35, 25), (4, 4, 0.28, 35), (5, 5, 0.22, 27),
    (6, 0, 0.32, 30), (7, 2, 0.18, 28), (8, 4, 0.40, 32),
    (1, 3, 0.25, 20), (3, 0, 0.30, 25), (5, 2, 0.35, 28),
    (2, 5, 0.20, 30), (6, 3, 0.28, 25), (8, 1, 0.22, 22),
    (0, 4, 0.30, 28), (4, 1, 0.25, 32), (7, 5, 0.35, 25),
    (3, 2, 0.18, 30), (6, 4, 0.32, 28),
]
noise_starts = pick_starts(len(NOISE_CONFIGS), 100, T - 120, 40, rng)
for (bus, feat, std, dur), s in zip(NOISE_CONFIGS, noise_starts):
    for t in range(s, min(s + dur, T)):
        y[t] = 4
        x_t[t, bus, feat] = x_t[t, bus, feat] + float(rng.normal(0, std))

dist = {i: int((y==i).sum()) for i in range(5)}
print(f"      Label distribution: {dist}")
total_attacks = sum(v for k,v in dist.items() if k > 0)
print(f"      Total attack timesteps : {total_attacks}  /  {T}  ({100*total_attacks/T:.1f}%)")

# ─────────────────────────────────────────
# SLIDING WINDOW DATASET
# ─────────────────────────────────────────
X_seq, Y_seq = [], []
for i in range(T - WINDOW_SIZE):
    X_seq.append(x_t[i : i + WINDOW_SIZE])
    Y_seq.append(y[i + WINDOW_SIZE - 1])

X_seq = torch.stack(X_seq)                          # [N, 20, 9, 6]
Y_seq = torch.tensor(Y_seq, dtype=torch.long)       # [N]

# Class weights to handle imbalance
counts  = torch.bincount(Y_seq, minlength=NUM_CLASSES).float()
weights = (1.0 / (counts + 1e-6))
weights = weights / weights.sum() * NUM_CLASSES
print(f"      Class weights: {weights.numpy().round(3).tolist()}")

split     = int(0.85 * len(X_seq))
tr_ds     = TensorDataset(X_seq[:split],  Y_seq[:split])
val_ds    = TensorDataset(X_seq[split:],  Y_seq[split:])
tr_loader = DataLoader(tr_ds,  batch_size=BATCH_SIZE, shuffle=True)
va_loader = DataLoader(val_ds, batch_size=BATCH_SIZE)

# ─────────────────────────────────────────
# TRAIN
# ─────────────────────────────────────────
print(f"\n[4/5] Training STGNN_Transformer ({EPOCHS} epochs) ...")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"      Device: {device}")

model     = STGNN_Transformer(in_features=NUM_FEATURES).to(device)
optimizer = torch.optim.Adam(model.parameters(), lr=LR)
loss_fn   = nn.CrossEntropyLoss(weight=weights.to(device))
edge_idx  = EDGE_INDEX.to(device)

for epoch in range(1, EPOCHS + 1):
    model.train()
    total_loss = 0
    for bx, by in tr_loader:
        bx, by = bx.to(device), by.to(device)
        optimizer.zero_grad()
        out  = model(bx, edge_idx)
        loss = loss_fn(out, by)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    if epoch % 5 == 0 or epoch == 1:
        avg = total_loss / len(tr_loader)
        print(f"      Epoch {epoch:3d}/{EPOCHS}  |  loss: {avg:.4f}")

# ─────────────────────────────────────────
# EVALUATE
# ─────────────────────────────────────────
print("\n[5/5] Evaluating on validation set ...")
model.eval()
all_preds, all_true = [], []
with torch.no_grad():
    for bx, by in va_loader:
        bx = bx.to(device)
        out   = model(bx, edge_idx)
        preds = torch.argmax(out, dim=1).cpu().numpy()
        all_preds.extend(preds)
        all_true.extend(by.numpy())

print(classification_report(
    all_true, all_preds,
    labels=list(range(NUM_CLASSES)),
    target_names=["Normal", "FDI", "DoS", "Replay", "Noise"],
    zero_division=0
))

# ─────────────────────────────────────────
# SAVE
# ─────────────────────────────────────────
model.cpu()
torch.save(model.state_dict(), MODEL_OUT)
print(f"✅ model.pth saved  →  {os.path.abspath(MODEL_OUT)}")
print(f"✅ scaler.pkl saved →  {os.path.abspath(SCALER_OUT)}")
print("\n🚀 Now run:  python simulation/realtime_server.py")
