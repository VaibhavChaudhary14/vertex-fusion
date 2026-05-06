from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import json
import os
import socket
import pandas as pd
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths to Research AI Engine state
STATE_FILE = "simulation/state.json"
HISTORY_FILE = "simulation/results_log.csv"
MATLAB_CMD_PORT = 6000

@app.get("/")
def read_root():
    engine_alive = os.path.exists(STATE_FILE)
    return {
        "status": "Vertex Fusion Research Hub Active",
        "engine_state": "Online" if engine_alive else "Offline",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/metrics")
def get_metrics():
    """Returns the latest state from the ST-GNN Research AI Engine."""
    if not os.path.exists(STATE_FILE):
        return JSONResponse(
            status_code=503, 
            content={"error": "AI Engine Offline", "detail": "Start realtime_server.py to begin streaming."}
        )
    
    try:
        with open(STATE_FILE, 'r') as f:
            data = json.load(f)
        return data
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Telemetry Parse Error", "detail": str(e)})

@app.get("/metrics/history")
def get_history():
    """Returns alert history from the results log."""
    if os.path.exists(HISTORY_FILE):
        try:
            df = pd.read_csv(HISTORY_FILE)
            # Return last 50 alerts
            return df.tail(50).to_dict(orient='records')
        except Exception as e:
            return {"error": str(e)}
    return []

@app.post("/attack")
def trigger_attack(req: dict):
    """
    Relays attack commands to MATLAB simulation on Port 6000.
    Expects: {"attack_type": "FDI", "target_bus": 5, "feature_idx": 0, "magnitude": 0.5}
    """
    try:
        attack_type = req.get("attack_type", "NONE").upper()
        if attack_type == "NONE":
            cmd = "ATTACK,NONE,-1,0,0"
        else:
            bus = req.get("target_bus", 1)
            feat = req.get("feature_idx", 0)
            mag = req.get("magnitude", 0.1)
            cmd = f"ATTACK,{attack_type},{bus},{feat},{mag}"

        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(2)
            s.connect(("127.0.0.1", MATLAB_CMD_PORT))
            s.sendall(cmd.encode())
            
        # Side-channel to inform AI Engine of the attack type for labeling
        if not os.path.exists("simulation"): os.makedirs("simulation")
        with open("simulation/active_attack.json", "w") as f:
            json.dump({"attack_type": attack_type, "timestamp": datetime.now().isoformat()}, f)

        return {"status": "Injected", "command": cmd}
    except Exception as e:
        return JSONResponse(status_code=503, content={"error": f"MATLAB Offline: {str(e)}"})

@app.post("/protection")
def control_protection(req: dict):
    print(f"Protection Command: {req}")
    return {"status": "Received"}

@app.post("/control/retrain")
def retrain_model():
    """Manually triggers the ST-GNN pipeline for full retraining."""
    import subprocess
    try:
        subprocess.Popen(["python", "simulation/stgnn_pipeline.py"])
        return {"status": "Retraining Process Started (Full Pipeline)"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/metrics/roc")
def get_roc():
    return {
        "records": [
            {"true_label": 0, "pred_label": 0, "confidence": 0.99},
            {"true_label": 1, "pred_label": 1, "confidence": 0.98}
        ]
    }

# --- WebSocket Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Broadcast the real research engine state via WebSocket if file exists
            if os.path.exists(STATE_FILE):
                try:
                    with open(STATE_FILE, 'r') as f:
                        data = json.load(f)
                    await websocket.send_text(json.dumps(data))
                except:
                    pass
            await asyncio.sleep(0.1) # 10 Hz refresh
    except WebSocketDisconnect:
        manager.disconnect(websocket)
