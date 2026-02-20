# scripts/modbus_scada_layer.py
from pymodbus.server import StartTcpServer
from pymodbus.datastore import ModbusSequentialDataBlock, ModbusSlaveContext, ModbusServerContext
from pymodbus.device import ModbusDeviceIdentification
from pymodbus.transaction import ModbusRtuFramer
import threading
import time
import pandas as pd
import os

# ---------------------------
# 1️⃣ Load simulated feeder data
# ---------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")

# If you don’t yet have processed_smartgrid.csv, use a dummy dataset
csv_path = os.path.join(DATA_DIR, "processed_smartgrid.csv")
if not os.path.exists(csv_path):
    print("⚠️ Using dummy voltage data for Modbus simulation...")
    data = pd.DataFrame({
        'Bus1_V': [230 + i for i in range(100)],
        'Bus2_V': [229 + i*0.5 for i in range(100)],
        'Bus3_V': [228 + i*0.2 for i in range(100)],
        'Bus4_V': [227 + i*0.3 for i in range(100)],
        'Bus5_V': [226 + i*0.4 for i in range(100)],
        'Bus6_V': [225 + i*0.6 for i in range(100)]
    })
else:
    data = pd.read_csv(csv_path)

voltages = data.values

# ---------------------------
# 2️⃣ Setup Modbus Server Context
# ---------------------------
store = ModbusSlaveContext(hr=ModbusSequentialDataBlock(0, [0]*100))
context = ModbusServerContext(slaves=store, single=True)

# ---------------------------
# 3️⃣ Data update function
# ---------------------------
def feeder_to_modbus():
    i = 0
    while True:
        values = list((voltages[i % len(voltages)] * 10).astype(int))
        context[0].setValues(3, 0, values)  # 3 = Holding Register
        i += 1
        time.sleep(0.5)

thread = threading.Thread(target=feeder_to_modbus)
thread.daemon = True
thread.start()

# ---------------------------
# 4️⃣ Start Modbus TCP Server
# ---------------------------
print("🚀 Modbus-PLC-Server running on port 5020")
StartTcpServer(context, identity=ModbusDeviceIdentification(), address=("localhost", 5020))
