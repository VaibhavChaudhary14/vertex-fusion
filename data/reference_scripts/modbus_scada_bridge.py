import time
import numpy as np
import pandas as pd
import torch
from pymodbus.client import ModbusTcpClient

# --- Load trained model ---
from train_stgnn_model import STGNN
model = STGNN(num_features=22, num_classes=4)
model.load_state_dict(torch.load('../data/stgnn_model.pth'))
model.eval()

print("✅ Model loaded into Modbus-SCADA bridge")

# --- Virtual Modbus Server Setup ---
client = ModbusTcpClient('127.0.0.1', port=502)
if not client.connect():
    print("⚠️ Could not connect to Modbus server — ensure local server is running or simulated.")
else:
    print("🔌 Connected to Modbus server")

# --- Load feeder data from MATLAB simulation ---
data = pd.read_csv('../data/processed_smartgrid.csv')
print(f"📊 Loaded processed feeder data: {data.shape}")

# --- Simulate live protection ---
for i in range(0, len(data), 10):
    sample = torch.tensor(data.iloc[i].values, dtype=torch.float32).unsqueeze(0)
    with torch.no_grad():
        pred = model(sample)
        pred_label = torch.argmax(pred, dim=1).item()

    # Simulate Modbus communication: write prediction as control flag
    client.write_register(40001, pred_label)
    print(f"[Cycle {i//10}] Predicted state: {pred_label} -> written to Modbus Register 40001")

    time.sleep(0.5)  # Simulate SCADA polling interval

client.close()
print("✅ Modbus-SCADA simulation finished.")
