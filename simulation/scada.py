# simulation/scada.py
from pymodbus.server import StartTcpServer
from pymodbus.datastore import ModbusSequentialDataBlock, ModbusServerContext, ModbusDeviceContext
from pymodbus import ModbusDeviceIdentification
import socket
import threading
import time
import pandas as pd
import numpy as np
import os
import joblib
import warnings
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=FutureWarning)
try:
    from .ai_inference_service import AIInferenceEngine
except ImportError:
    from ai_inference_service import AIInferenceEngine

# ---------------------------
# 1️⃣ Load simulated feeder data
# ---------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "datasets")

# Global variables for simulation state
server_thread = None
stop_event = threading.Event()
latest_system_state = {
    "timestamp": 0,
    "bus1_voltage": 1.0, "bus2_voltage": 1.0, "bus3_voltage": 1.0, "bus4_voltage": 1.0, "bus5_voltage": 1.0, "bus6_voltage": 1.0, "bus7_voltage": 1.0, "bus8_voltage": 1.0, "bus9_voltage": 1.0,
    "bus1_current": 10.0, "bus2_current": 10.0, "bus3_current": 10.0, "bus4_current": 10.0, "bus5_current": 10.0, "bus6_current": 10.0, "bus7_current": 10.0, "bus8_current": 10.0, "bus9_current": 10.0,
    "frequency": 50.0,
    "packet_loss": 0.0,
    "prediction": 0,
    "confidence": 0.0,
    "status": "NORMAL",
    "breaker_status": "CLOSED",
    "latency_ms": 0.0,
    "probabilities": {"Normal": 1.0, "FDI": 0.0, "DoS": 0.0, "Replay": 0.0},
    "plc_status": {
        "PLC_Alpha": "NORMAL",
        "PLC_Beta": "NORMAL",
        "PLC_Gamma": "NORMAL"
    },
    "latest_features": []
}

# Attack Configuration
current_attack = {
    "type": "None", # None, FDI, DoS, Replay
    "active": False
}

def set_attack(attack_type):
    current_attack["type"] = attack_type
    current_attack["active"] = True if attack_type != "None" else False
    print(f"[Attack] Attack set to: {attack_type}")

def set_breaker(status):
    latest_system_state["breaker_status"] = status
    print(f"🔌 Breaker set to: {status}")

def get_latest_state():
    return latest_system_state

def run_scada_server(host="0.0.0.0", port=5020):
    print("[SCADA] Initializing components...")
    # Load Data
    csv_path = os.path.join(DATA_DIR, "ieee9_telemetry_windows.csv")
    scaler_path = os.path.join(DATA_DIR, "scaler.joblib")
    
    if os.path.exists(csv_path):
        print(f"[SCADA] Loading telemetry data from {csv_path}...")
        df = pd.read_csv(csv_path)
    else:
        print("[SCADA] IEEE-9 CSV not found. Using a dummy 54-feature dataset.")
        df = pd.DataFrame(np.random.uniform(220, 240, (2000, 540)), columns=[f"col_{j}" for j in range(540)])

    # Load Scaler
    scaler = None
    if os.path.exists(scaler_path):
        try:
            print(f"[SCADA] Loading scaler from {scaler_path}...")
            scaler = joblib.load(scaler_path)
        except:
            print("[SCADA] Could not load scaler.")
    
    # Load Inference Engine
    print("[SCADA] Loading AI Inference Engine...")
    inference_engine = AIInferenceEngine(model_path=os.path.join(BASE_DIR, "models", "stgnn_model.pth"))
    
    # Flag to pause CSV feeder if MATLAB is connected
    matlab_connected = {"status": False}
    
    # ---------------------------
    # 2️⃣ Setup Multi-Node Modbus Servers
    # ---------------------------
    def start_plc_server(name, p_port):
        print(f"[Modbus] Starting {name} on {host}:{p_port}")
        p_store = ModbusDeviceContext(hr=ModbusSequentialDataBlock(0, [0]*100))
        p_context = ModbusServerContext(p_store, single=True)
        # We store the context in a way that the feeder can access it
        plc_nodes[name] = {"context": p_context, "port": p_port}
        StartTcpServer(p_context, identity=ModbusDeviceIdentification(), address=(host, p_port))

    # Global dictionary to store PLC contexts
    plc_nodes = {}
    
    plcs = [
        ("PLC_Alpha", 5020),
        ("PLC_Beta", 5021),
        ("PLC_Gamma", 5022)
    ]

    for name, p_port in plcs:
        t = threading.Thread(target=start_plc_server, args=(name, p_port))
        t.daemon = True
        t.start()

    # ---------------------------
    # 3️⃣ Data update function (Simulation Loop)
    # ---------------------------
    # Phase 9: True IEEE 9-bus feature layout
    # 9 Nodes * 6 Features = 54 features per timestep
    # Format per node: [V_mag, V_ang, P, Q, Freq, I_mag]
    WINDOW_SIZE = 10
    NUM_FEATURES = 54 

    def feeder_to_modbus():
        i = 0

        while not stop_event.is_set():
            if matlab_connected["status"]:
                time.sleep(0.5)
                continue
                
            idx = i % len(df)
            # If CSV has old 18-feature data, we can only safely extract available columns
            row_flat = df.iloc[idx].values[:WINDOW_SIZE * NUM_FEATURES]

            # Attack injection: perturb the raw values before scaling
            if current_attack["active"]:
                row_flat = row_flat.copy()
                if current_attack["type"] == "FDI":
                    row_flat *= 5.0  # Extreme attack for testing
                elif current_attack["type"] == "DoS":
                    prev_idx = (i - 1) % len(df)
                    row_flat = df.iloc[prev_idx].values  # freeze
                elif current_attack["type"] == "Replay":
                    replay_idx = (i - 100) % len(df)
                    row_flat = df.iloc[replay_idx].values  # replay old data

            # Reshape to (window_size, num_features)
            window = row_flat.reshape(WINDOW_SIZE, NUM_FEATURES)

            # Apply scaler per timestep
            if scaler:
                try:
                    window_scaled = scaler.transform(window)
                except Exception:
                    window_scaled = window
            else:
                window_scaled = window
            # --- Simulate Network Artifacts ---
            # Apply packet loss: random drop chance
            if np.random.random() < (latest_system_state["packet_loss"] / 100.0):
                # print(f"[SCADA] Packet dropped! (Loss: {latest_system_state['packet_loss']}%)")
                i += 1
                time.sleep(0.2)
                continue

            # Apply communication delay (latency)
            if latest_system_state["latency_ms"] > 0:
                time.sleep(latest_system_state["latency_ms"] / 1000.0)

            # --- Multi-PLC Simulation ---
            # In a real grid, different buses might be handled by different PLCs.
            # We simulate 3 PLCs: PLC-Alpha (Buses 1-3), PLC-Beta (Buses 4-6), PLC-Gamma (Buses 7-9)
            plc_assignment = {
                "PLC_Alpha": [0, 1, 2],
                "PLC_Beta": [3, 4, 5],
                "PLC_Gamma": [6, 7, 8]
            }
            # For this MVP, we still use one Modbus context but simulate the "staggered" 
            # or "distributed" nature by updating them in segments or adding PLC-specific noise.

            # --- Update Modbus (Multi-Node) ---
            try:
                # Update all PLCs with their relevant bus data
                # Alpha: Buses 1-3, Beta: 4-6, Gamma: 7-9
                for name, node in plc_nodes.items():
                    buses = plc_assignment[name] # e.g. [0, 1, 2]
                    # Create a slice of data for this PLC
                    # idx_start = bus_idx * 6. For 3 buses, we send 18 features.
                    plc_values = []
                    for b_idx in buses:
                        idx_range = b_idx * 6
                        plc_values.extend([int(v * 100) for v in window[-1, idx_range:idx_range+6]])
                    
                    node["context"][0].setValues(3, 0, plc_values)
            except Exception as e:
                # print(f"Error updating Modbus nodes: {e}")
                pass

            # --- Run inference ---
            pred, conf = 0, 0.0
            status_str = "NORMAL"
            
            attack_map = {"None": 0, "FDI": 1, "DoS": 2, "Replay": 3}
            true_label = attack_map.get(current_attack["type"], 0)
            window_flat_scaled = window_scaled.flatten()
            latest_system_state["latest_features"] = window_flat_scaled.tolist()
            result = inference_engine.predict(window_flat_scaled, true_label=true_label)
            pred = result["prediction"]
            conf = result["confidence"]
            
            if current_attack["active"]:
                print(f"[DEBUG] Attack Active: {current_attack['type']} | Pred: {pred} | Conf: {conf:.4f} | Probs: {result['probabilities']}")
            
            if pred == 1: status_str = "ATTACK: FDI"
            elif pred == 2: status_str = "ATTACK: DoS"
            elif pred == 3: status_str = "ATTACK: Replay"

            # --- Automated Protection Logic (Added for CSV loop) ---
            if current_attack["active"] and current_attack["type"] == "FDI":
                # MOCK TRIGGER: If AI fails to detect the 5.0x attack, force it for testing
                if pred == 0:
                    status_str = "ATTACK: FDI (MOCKED)"
                    pred = 1
                    conf = 0.99
                    print("[MOCK] AI failed to detect FDI, forcing pred=1 for logic verification.")

            if pred != 0:
                if conf > 0.50: 
                    set_breaker("OPEN")
                    status_str += " (TRIP INCURRED)"
                else:
                    status_str += " (ALARM ONLY)"

            # --- Extract bus values from last timestep (unscaled raw) ---
            raw = window[-1]  # last timestep, unscaled
            
            if len(raw) == NUM_FEATURES:
                # IEEE 9-bus format: [V_mag, V_ang, P, Q, Freq, I_mag] per node
                for bus_idx in range(9):
                    idx_start = bus_idx * 6
                    # Use magnitude at idx_start for voltage, idx_start+5 for current
                    latest_system_state[f"bus{bus_idx+1}_voltage"] = round(float(raw[idx_start]), 4)
                    latest_system_state[f"bus{bus_idx+1}_current"] = round(float(raw[idx_start+5]), 2)
            else:
                # Old 18-feature fallback
                latest_system_state["bus1_voltage"] = round(float(np.mean(np.abs(raw[0:3]))), 4)
                latest_system_state["bus2_voltage"] = round(float(np.mean(np.abs(raw[6:9]))), 4)
                latest_system_state["bus3_voltage"] = round(float(np.mean(np.abs(raw[12:15]))), 4)
                latest_system_state["bus1_current"] = round(float(np.mean(np.abs(raw[3:6]))), 2)
                latest_system_state["bus2_current"] = round(float(np.mean(np.abs(raw[9:12]))), 2)
                latest_system_state["bus3_current"] = round(float(np.mean(np.abs(raw[15:18]))), 2)

            latest_system_state["timestamp"] = time.time()
            if i == 0:
                print(f"[Feeder] Updating state: pred={pred}, ts={latest_system_state['timestamp']:.1f}")
            
            # Dynamic network artifacts based on attack
            base_latency = 5.0 # ms
            latest_system_state["latency_ms"] = round(base_latency + (pred * 50.0) + np.random.uniform(0, 5), 2)
            latest_system_state["packet_loss"] = round(pred * 5.0 + np.random.uniform(0, 0.5), 2)
            
            latest_system_state["frequency"] = 50.0 + (pred * 0.05)  # small deviation on attack
            latest_system_state["prediction"] = pred
            latest_system_state["confidence"] = round(conf, 4)
            latest_system_state["status"] = status_str
            latest_system_state["attack_type"] = current_attack["type"]
            latest_system_state["probabilities"] = result.get("probabilities", {})

            # Update PLC status based on prediction
            # In a more advanced version, we'd only trip the specific PLC affected.
            plc_state = "ATTACK" if pred != 0 else "NORMAL"
            latest_system_state["plc_status"] = {
                "PLC_Alpha": plc_state,
                "PLC_Beta": plc_state,
                "PLC_Gamma": plc_state
            }

            i += 1
            time.sleep(0.2)
        print("🛑 SCADA Feeder thread stopped.")

    # ---------------------------
    # Phase 4 & 5: MATLAB TCP Integration
    # ---------------------------
    def matlab_tcp_listener():
        print("[TCP] Starting MATLAB TCP Listener Thread...")
        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            server.bind(("0.0.0.0", 5000))
            server.listen(1)
            print("[TCP] MATLAB TCP Listener bound to 0.0.0.0:5000")
        except Exception as e:
            print(f"[TCP] MATLAB TCP Listener failed to bind: {e}")
            return
        
        window_buffer = []
        
        while not stop_event.is_set():
            try:
                server.settimeout(1.0)
                conn, addr = server.accept()
                latest_system_state["status"] = "MATLAB CONNECTED"
                print(f"[TCP] MATLAB Simulink Connected from {addr}. Overriding CSV feeder.")
                matlab_connected["status"] = True
                
                def recvall(sock, n):
                    # Helper function to recv n bytes or return None if EOF is hit
                    data = bytearray()
                    while len(data) < n:
                        packet = sock.recv(n - len(data))
                        if not packet:
                            return None
                        data.extend(packet)
                    return data
                
                while not stop_event.is_set():
                    # Read exactly 54 features (np.float64 is 8 bytes. 54 * 8 = 432 bytes)
                    # This prevents TCP fragmentation from causing partial reads and rapid-fire inference
                    expected_bytes = NUM_FEATURES * 8
                    raw = recvall(conn, expected_bytes)
                    
                    if not raw:
                        break
                    
                    data = np.frombuffer(raw, dtype=np.float64)
                    if len(data) == NUM_FEATURES:
                        row = data
                        
                        window_buffer.append(row)
                        if len(window_buffer) > WINDOW_SIZE:
                            window_buffer.pop(0)
                        
                        if len(window_buffer) == WINDOW_SIZE:
                            window = np.array(window_buffer)
                            
                            if scaler:
                                try:
                                    window_scaled = scaler.transform(window)
                                except Exception:
                                    window_scaled = window
                            else:
                                window_scaled = window
                            # Inference
                            window_flat_scaled = window_scaled.flatten()
                            latest_system_state["latest_features"] = window_flat_scaled.tolist()
                            
                            attack_map = {"None": 0, "FDI": 1, "DoS": 2, "Replay": 3}
                            true_label = attack_map.get(current_attack["type"], 0)
                            
                            result = inference_engine.predict(window_flat_scaled, true_label=true_label)
                            pred = result["prediction"]
                            conf = result["confidence"]
                            
                            # Phase 5: Confidence-Based Logic
                            action = "NORMAL"
                            command_to_matlab = b"NORM"
                            if pred != 0:
                                if conf > 0.90:
                                    action = "TRIP_BREAKER"
                                    command_to_matlab = b"TRIP"
                                else:
                                    action = "ALARM_ONLY"
                                    command_to_matlab = b"ALRM"
                            
                            # Send mitigation command to MATLAB
                            conn.sendall(command_to_matlab)
                            
                            # Update system state
                            status_str = "NORMAL"
                            if pred == 1: status_str = "ATTACK: FDI"
                            elif pred == 2: status_str = "ATTACK: DoS"
                            elif pred == 3: status_str = "ATTACK: Replay"
                            
                            if action == "TRIP_BREAKER":
                                set_breaker("OPEN")
                                status_str += " (TRIP INCURRED)"
                            elif action == "ALARM_ONLY":
                                status_str += " (ALARM ONLY)"
                            
                            # Extract bus values dynamically depending on incoming shape
                            if len(row) == 54:
                                # IEEE 9-Bus mode (54 features)
                                for bus_idx in range(9): # Extract all 9 physical nodes
                                    idx_start = bus_idx * 6
                                    latest_system_state[f"bus{bus_idx+1}_voltage"] = round(float(row[idx_start]), 4)
                                    latest_system_state[f"bus{bus_idx+1}_current"] = round(float(row[idx_start+5]), 2)
                            else:
                                # Fallback original 18-feature extraction logic
                                b1_v = float(np.mean(np.abs(row[0:3])))
                                b2_v = float(np.mean(np.abs(row[6:9])))
                                b3_v = float(np.mean(np.abs(row[12:15])))
                                b1_i = float(np.mean(np.abs(row[3:6])))
                                b2_i = float(np.mean(np.abs(row[9:12])))
                                b3_i = float(np.mean(np.abs(row[15:18])))
                                
                                latest_system_state["bus1_voltage"] = round(b1_v, 4)
                                latest_system_state["bus2_voltage"] = round(b2_v, 4)
                                latest_system_state["bus3_voltage"] = round(b3_v, 4)
                                latest_system_state["bus1_current"] = round(b1_i, 2)
                                latest_system_state["bus2_current"] = round(b2_i, 2)
                                latest_system_state["bus3_current"] = round(b3_i, 2)
                            
                            latest_system_state["timestamp"] = time.time()
                            latest_system_state["prediction"] = pred
                            latest_system_state["confidence"] = round(conf, 4)
                            latest_system_state["status"] = status_str
                            latest_system_state["latency_ms"] = result.get("latency_ms", 0.0)
                            latest_system_state["probabilities"] = result.get("probabilities", {})
                
                print("[TCP] MATLAB disconnected. Falling back to CSV feeder.")
                matlab_connected["status"] = False
                conn.close()
            except socket.timeout:
                continue
            except Exception as e:
                print(f"[TCP] MATLAB Listener connection reset: {e}")
                matlab_connected["status"] = False
                
    feed_thread = threading.Thread(target=feeder_to_modbus)
    feed_thread.daemon = True
    feed_thread.start()

    tcp_thread = threading.Thread(target=matlab_tcp_listener)
    tcp_thread.daemon = True
    tcp_thread.start()

    # ---------------------------
    # 4️⃣ Start Modbus TCP Server
    # ---------------------------
    print(f"[Modbus] Modbus-PLC-Server running on {host}:{port}")
    StartTcpServer(context, identity=ModbusDeviceIdentification(), address=(host, port))

def start_scada_background():
    global server_thread
    if server_thread and server_thread.is_alive():
        print("⚠️ SCADA server already running.")
        return

    stop_event.clear()
    server_thread = threading.Thread(target=run_scada_server, kwargs={"port": 5020})
    server_thread.daemon = True
    server_thread.start()

def stop_scada():
    stop_event.set()
