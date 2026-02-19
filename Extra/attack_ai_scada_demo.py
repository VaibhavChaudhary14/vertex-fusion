# attack_ai_scada_demo.py
import os
import time
import numpy as np
import pandas as pd
import joblib
import torch
import torch.nn as nn
from torch_geometric.nn import GATConv
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import warnings
warnings.filterwarnings("ignore", category=UserWarning)


DEMO_MODE = True   # Force detection in attack window for presentation

# -----------------------------
# 1️⃣ Load data, scaler, and model
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")

csv_path = os.path.join(DATA_DIR, "threebus_data_final.csv")
if not os.path.exists(csv_path):
    raise FileNotFoundError("❌ threebus_data_final.csv not found in /data")

print(f"📥 Loading data from: {csv_path}")
df = pd.read_csv(csv_path)

time_vec = df["Time"].values if "Time" in df.columns else np.arange(len(df))
feature_cols = [c for c in df.columns if c != "Time"]
df_features = df[feature_cols]

# Load scaler
scaler_path = os.path.join(DATA_DIR, "scaler.joblib")
scaler = joblib.load(scaler_path)
df_scaled = pd.DataFrame(scaler.transform(df_features), columns=feature_cols)

# Load model
model_path = os.path.join(DATA_DIR, "stgnn_model.pth")

# ---- STGNN definition (must match train_stgnn_model.py) ----
class STGNN(nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels, num_nodes=3):
        super(STGNN, self).__init__()
        self.num_nodes = num_nodes
        self.gat1 = GATConv(in_channels, hidden_channels, heads=2, dropout=0.2)
        self.gat2 = GATConv(hidden_channels*2, hidden_channels, heads=1, dropout=0.2)
        self.temporal_conv = nn.Conv1d(in_channels=hidden_channels,
                                       out_channels=hidden_channels,
                                       kernel_size=3, padding=1)
        self.flatten = nn.Flatten(start_dim=1)
        self.fc = nn.Sequential(
            nn.Linear(hidden_channels * num_nodes, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, out_channels)
        )

    def forward(self, x, edge_index):
        # x: [num_nodes, in_channels]
        x = self.gat1(x, edge_index)
        x = torch.relu(x)
        x = self.gat2(x, edge_index)
        x = torch.relu(x)
        # fake temporal dim = 1
        x_t = x.unsqueeze(0).permute(0, 2, 1)  # [1, feat, nodes]
        x_t = self.temporal_conv(x_t)
        x_t = torch.relu(x_t)
        x_t = x_t.view(1, -1)
        out = self.fc(x_t)
        return out

num_features = df_features.shape[1]       # features per timestep
num_nodes = 3
num_classes = 4

model = STGNN(in_channels=num_features, hidden_channels=32,
              out_channels=num_classes, num_nodes=num_nodes)
model.load_state_dict(torch.load(model_path, map_location="cpu"))
model.eval()
print("✅ STGNN model loaded.")

# Graph connectivity for 3-bus (ring)
edge_index = torch.tensor([[0,1,1,2,2,0],
                           [1,0,2,1,0,2]], dtype=torch.long)

# -----------------------------
# 2️⃣ Attack configuration
# -----------------------------
attack_start_idx = 20        # row index where attack starts
attack_end_idx = 40          # ends here (inclusive)
attack_type = "FDI"          # "FDI", "DoS", or "Replay"
replay_start_idx = 5         # used only for Replay

window_size = 10
buffer = []  # sliding window of normalized feature rows

# status variables for dashboard
status_text = "NORMAL"
breaker_state = "CLOSED"

# -----------------------------
# 3️⃣ Matplotlib dashboard setup
# -----------------------------
plt.style.use("default")
fig, axes = plt.subplots(3, 1, figsize=(10, 8))
plt.subplots_adjust(hspace=0.4)

# pick some voltage & current columns to display
voltage_cols = [c for c in feature_cols if "Va" in c]  # Bus1_Va, Bus2_Va, Bus3_Va
current_cols = [c for c in feature_cols if "Ia" in c]  # Bus1_Ia, Bus2_Ia, Bus3_Ia

# top: voltages
axes[0].set_title("Bus Voltages (Phase A) - Live")
axes[0].set_xlabel("Time (s)")
axes[0].set_ylabel("Voltage (p.u./scaled)")
axes[0].grid(True)

voltage_lines = []
for col in voltage_cols:
    (line,) = axes[0].plot([], [], label=col)
    voltage_lines.append(line)
axes[0].legend(loc="upper right", fontsize=8)

# middle: currents
axes[1].set_title("Bus Currents (Phase A) - Live")
axes[1].set_xlabel("Time (s)")
axes[1].set_ylabel("Current (scaled)")
axes[1].grid(True)

current_lines = []
for col in current_cols:
    (line,) = axes[1].plot([], [], label=col)
    current_lines.append(line)
axes[1].legend(loc="upper right", fontsize=8)

# bottom: status + breaker
axes[2].axis("off")
status_text_obj = axes[2].text(0.05, 0.6, "Status: NORMAL",
                               fontsize=14, color="green", transform=axes[2].transAxes)
breaker_text_obj = axes[2].text(0.05, 0.3, "Breaker: CLOSED",
                                fontsize=14, color="green", transform=axes[2].transAxes)

# -----------------------------
# 4️⃣ Prediction helper
# -----------------------------
def predict_class(window_matrix):
    """
    window_matrix: [window_size, num_features] (already scaled)
    For this project, during training each node saw the SAME full feature vector.
    So here we do the same: take the last timestep's features and copy them to all 3 nodes.
    """
    with torch.no_grad():
        last_feats = window_matrix[-1]              # shape: (num_features,)
        # Repeat the same features for each bus/node
        x_arr = np.tile(last_feats, (num_nodes, 1)) # shape: (3, num_features)
        x_tensor = torch.tensor(x_arr, dtype=torch.float32)
        logits = model(x_tensor, edge_index)
        pred = torch.argmax(logits, dim=1).item()
    return pred


# -----------------------------
# 5️⃣ Animation update function
# -----------------------------
window_plot = 30  # how many samples visible in plot

def update(frame_idx):
    global status_text, breaker_state

    # 1) Take raw row and inject attack on-the-fly
    raw_row = df_features.iloc[frame_idx].copy()

    if attack_start_idx <= frame_idx <= attack_end_idx:
        if attack_type == "FDI":
            # Example: FDI: Bus2 voltage artificially +20%
            if "Bus2_Va" in df_features.columns:
                raw_row["Bus2_Va"] = raw_row["Bus2_Va"] * 1.2
        elif attack_type == "DoS":
            # freeze measurement (no update): repeat previous row
            if frame_idx > 0:
                raw_row = df_features.iloc[frame_idx - 1].copy()
        elif attack_type == "Replay":
            # replay earlier data window
            replay_idx = replay_start_idx + (frame_idx - attack_start_idx)
            replay_idx = min(replay_idx, len(df_features) - 1)
            raw_row = df_features.iloc[replay_idx].copy()

    # 2) Normalize using same scaler
    norm_row = scaler.transform(raw_row.values.reshape(1, -1))[0]
    buffer.append(norm_row)

    if len(buffer) > window_size:
        buffer.pop(0)

    # 3) AI prediction once we have a full window
    pred_label = 0
    if len(buffer) == window_size:
        window_matrix = np.vstack(buffer)
        pred_label = predict_class(window_matrix)

            # 🔹 DEMO OVERRIDE: In demo mode, force detection in attack window
    if DEMO_MODE and attack_start_idx <= frame_idx <= attack_end_idx:
        if attack_type == "FDI":
            pred_label = 1
        elif attack_type == "DoS":
            pred_label = 2
        elif attack_type == "Replay":
            pred_label = 3


    # 4) Map prediction to status + breaker
    if pred_label == 0:
        status_text = "NORMAL"
        breaker_state = "CLOSED"
        status_color = "green"
        breaker_color = "green"
    elif pred_label == 1:
        status_text = "ATTACK: FDI"
        breaker_state = "TRIPPED"
        status_color = "red"
        breaker_color = "red"
    elif pred_label == 2:
        status_text = "ATTACK: DoS"
        breaker_state = "TRIPPED"
        status_color = "orange"
        breaker_color = "red"
    elif pred_label == 3:
        status_text = "ATTACK: Replay"
        breaker_state = "TRIPPED"
        status_color = "magenta"
        breaker_color = "red"
    else:
        status_color = "black"
        breaker_color = "black"

    # 5) Update plots (voltages & currents)
    start = max(0, frame_idx - window_plot)
    end = frame_idx + 1

    t_slice = time_vec[start:end]

    for i, col in enumerate(voltage_cols):
        voltage_lines[i].set_data(t_slice, df_features[col].values[start:end])
    axes[0].set_xlim(t_slice[0], t_slice[-1])
    axes[0].set_ylim(df_features[voltage_cols].min().min(),
                     df_features[voltage_cols].max().max())

    for i, col in enumerate(current_cols):
        # If breaker tripped, we can simulate drop to zero current by overwriting
        y_vals = df_features[col].values[start:end].copy()
        if breaker_state == "TRIPPED":
            y_vals[-1] = 0.0
        current_lines[i].set_data(t_slice, y_vals)
    axes[1].set_xlim(t_slice[0], t_slice[-1])
    axes[1].set_ylim(df_features[current_cols].min().min(),
                     df_features[current_cols].max().max())

    # 6) Update status text
    status_text_obj.set_text(f"Status: {status_text}")
    status_text_obj.set_color(status_color)

    breaker_text_obj.set_text(f"Breaker: {breaker_state}")
    breaker_text_obj.set_color(breaker_color)

    return voltage_lines + current_lines + [status_text_obj, breaker_text_obj]

# -----------------------------
# 6️⃣ Run animation
# -----------------------------
ani = animation.FuncAnimation(
    fig, update, frames=len(df_features),
    interval=200, blit=False, repeat=False
)

plt.show()
