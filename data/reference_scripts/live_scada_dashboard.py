# live_scada_dashboard.py
import os
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.animation as animation

# -----------------------------
# 1️⃣ Load dataset
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")
csv_path = os.path.join(DATA_DIR, "threebus_data_final.csv")

if not os.path.exists(csv_path):
    raise FileNotFoundError("❌ 'threebus_data_final.csv' not found in data folder!")

print(f"📥 Loading data from: {csv_path}")
df = pd.read_csv(csv_path)

time = df["Time"] if "Time" in df.columns else range(len(df))
voltage_cols = [col for col in df.columns if "V" in col]
current_cols = [col for col in df.columns if "I" in col]

# -----------------------------
# 2️⃣ Setup figure layout
# -----------------------------
fig, axes = plt.subplots(2, 1, figsize=(10, 7))
plt.subplots_adjust(hspace=0.35)

# Voltage plot
axes[0].set_title("Real-Time Voltage Monitoring (3-Bus System)")
axes[0].set_xlabel("Time (s)")
axes[0].set_ylabel("Voltage (V)")
axes[0].grid(True)

# Current plot
axes[1].set_title("Real-Time Current Monitoring (3-Bus System)")
axes[1].set_xlabel("Time (s)")
axes[1].set_ylabel("Current (A)")
axes[1].grid(True)

# Initialize lines
voltage_lines = []
current_lines = []

for col in voltage_cols:
    (line,) = axes[0].plot([], [], label=col)
    voltage_lines.append(line)

for col in current_cols:
    (line,) = axes[1].plot([], [], label=col)
    current_lines.append(line)

axes[0].legend(loc="upper right", fontsize=8)
axes[1].legend(loc="upper right", fontsize=8)

# -----------------------------
# 3️⃣ Animation update function
# -----------------------------
# -----------------------------
# 3️⃣ Animation update function (fixed for end-of-data)
# -----------------------------
window = 20  # how many samples to show at once

def update(frame):
    start = max(0, frame - window)
    end = min(frame, len(df) - 1)  # ensure we never go out of range

    for i, col in enumerate(voltage_cols):
        voltage_lines[i].set_data(time[start:end], df[col][start:end])
    axes[0].set_xlim(time.iloc[start], time.iloc[end])
    axes[0].set_ylim(df[voltage_cols].min().min(), df[voltage_cols].max().max())

    for i, col in enumerate(current_cols):
        current_lines[i].set_data(time[start:end], df[col][start:end])
    axes[1].set_xlim(time.iloc[start], time.iloc[end])
    axes[1].set_ylim(df[current_cols].min().min(), df[current_cols].max().max())

    return voltage_lines + current_lines


# -----------------------------
# 4️⃣ Run live animation
# -----------------------------
ani = animation.FuncAnimation(fig, update, frames=len(df), interval=150, blit=True)
plt.show()
