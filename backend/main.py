from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import json
from core import GridSimulation, AnomalyDetector, AttackType, AlertManager

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

alerts = AlertManager()
simulation = GridSimulation(alerts)
detector = AnomalyDetector(alerts)

class AttackRequest(BaseModel):
    type: str

class BreakerRequest(BaseModel):
    line_id: int

@app.get("/")
def read_root():
    return {"status": "Vertex Fusion Backend Active"}

@app.post("/control/attack")
def trigger_attack(req: AttackRequest):
    if req.type == "none":
        simulation.clear_attack()
    else:
        simulation.set_attack(req.type, {})
    return {"status": "Updated", "current_attack": simulation.attack_type}

@app.post("/control/trip-breaker")
def trip_breaker(req: BreakerRequest):
    success = simulation.trip_breaker(req.line_id)
    return {"status": "Success" if success else "Failed", "line_id": req.line_id}

@app.post("/control/close-breaker")
def close_breaker(req: BreakerRequest):
    success = simulation.close_breaker(req.line_id)
    return {"status": "Success" if success else "Failed", "line_id": req.line_id}

@app.get("/alerts")
def get_alerts():
    return {"alerts": alerts.get_latest(20)}

@app.post("/control/retrain")
def retrain_model():
    # Trigger retraining in background
    # Ideally use Celery/BackgroundTasks. For demo, subprocess is fine.
    import subprocess
    try:
        subprocess.Popen(["python", "scripts/retrain_model.py"])
        return {"status": "Retraining Started"}
    except Exception as e:
        return {"status": "Failed", "error": str(e)}

@app.get("/metrics")
def get_metrics():
    # Load Real Metrics if available
    metrics_path = "data/model_metrics.json" # retrain script should save this
    if os.path.exists(metrics_path):
        with open(metrics_path, 'r') as f:
            return json.load(f)
            
    # Fallback / Initial Mock
    return {
        "roc": [
             {"fpr": 0.00, "tpr": 0.00},
             {"fpr": 0.05, "tpr": 0.85},
             {"fpr": 0.10, "tpr": 0.95},
             {"fpr": 1.00, "tpr": 1.00},
        ],
        "confusion_matrix": [
            [95, 5], 
            [2, 98]
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
            # 20 Hz loop = 0.05s delay
            await asyncio.sleep(0.05)
            
            # 1. Step Simulation
            grid_state = simulation.step()
            
            # 2. Run AI Detection
            ai_result = detector.analyze(grid_state)
            
            # 3. Package Data
            payload = {
                "timestamp": grid_state["step"],
                "grid": grid_state,
                "ai": ai_result
            }
            
            await websocket.send_text(json.dumps(payload))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
