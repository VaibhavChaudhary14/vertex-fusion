from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
import uvicorn
from contextlib import asynccontextmanager
try:
    from .scada import start_scada_background, stop_scada, set_attack, get_latest_state, set_breaker
except ImportError:
    from scada import start_scada_background, stop_scada, set_attack, get_latest_state, set_breaker

# Lifecycle manager to start SCADA on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🔄 Starting Simulation Engine...")
    start_scada_background()
    yield
    # Shutdown
    print("🛑 Stopping Simulation Engine...")
    stop_scada()

app = FastAPI(title="Vertex Fusion Simulation Engine", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AttackRequest(BaseModel):
    attack_type: str # None, FDI, DoS, Replay

class ProtectionRequest(BaseModel):
    action: str # TRIP, CLOSE
    target_bus: int

@app.get("/")
def read_root():
    return {"status": "online", "service": "Vertex Fusion Simulation Engine"}

@app.get("/health")
def health_check():
    state = get_latest_state()
    return {"status": "healthy", "scada_status": state["status"]}

@app.get("/metrics")
def get_metrics():
    """Get real-time simulation state (voltages, prediction)"""
    return get_latest_state()

@app.get("/metrics/roc")
def get_roc_metrics():
    """
    Phase 6: Exposes telemetry records for live ROC and Latency graphs on frontend.
    """
    import sqlite3
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "telemetry.db")
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        # Fetch last 100 records
        cursor.execute('''
            SELECT timestamp, true_label, pred_label, confidence, latency_ms 
            FROM inference_logs 
            ORDER BY timestamp DESC LIMIT 100
        ''')
        rows = cursor.fetchall()
        conn.close()
        
        records = [{
            "timestamp": r[0],
            "true_label": r[1],
            "pred_label": r[2],
            "confidence": r[3],
            "latency_ms": r[4]
        } for r in rows]
        
        return {"records": records}
    except Exception as e:
        return {"error": f"Failed to fetch telemetry: {e}"}

@app.post("/attack")
def trigger_attack(request: AttackRequest):
    """
    Phase 1: Set attack state for SCADA thread.
    """
    try:
        from scada import set_attack
    except ImportError:
        try:
            from .scada import set_attack
        except ImportError:
            return {"error": "Could not import set_attack"}

    set_attack(request.attack_type)
    return {"status": "success", "attack_type": request.attack_type}

@app.post("/protection")
def trigger_protection(request: ProtectionRequest):
    """Execute protection action (Trip/Close Breaker)"""
    if request.action not in ["TRIP", "CLOSE"]:
        raise HTTPException(status_code=400, detail="Invalid action. Use TRIP or CLOSE")
    
    status = "OPEN" if request.action == "TRIP" else "CLOSED"
    set_breaker(status)
    return {"status": "success", "message": f"Breaker {request.target_bus} set to {status}"}

@app.post("/simulate")
def restart_simulation():
    """Restart the simulation thread"""
    stop_scada()
    start_scada_background()
    return {"status": "success", "message": "Simulation restarted"}

class PredictRequest(BaseModel):
    features: list  # flat list of scaled feature values (window_size * num_features)

@app.post("/predict")
def predict(request: PredictRequest):
    """
    Phase 2: Direct inference endpoint.
    Accepts pre-scaled feature window and returns ST-GNN prediction.
    """
    import numpy as np
    try:
        from ai_inference_service import AIInferenceEngine
    except ImportError:
        try:
            from .ai_inference_service import AIInferenceEngine
        except ImportError:
            return {"error": "Could not import AIInferenceEngine"}

    import os
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(BASE_DIR, "models", "stgnn_model.pth")

    engine = AIInferenceEngine(model_path=model_path)
    features = np.array(request.features)
    result = engine.predict(features)

    return result

@app.get("/status")
def system_status():
    """Full system status including model info"""
    import os
    state = get_latest_state()
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(BASE_DIR, "models", "stgnn_model.pth")
    scaler_path = os.path.join(BASE_DIR, "datasets", "scaler.joblib")
    return {
        "simulation": state,
        "model": {
            "path": model_path,
            "loaded": os.path.exists(model_path),
            "architecture": "ST-GNN (GAT + Temporal Conv)",
            "classes": ["Normal", "FDI", "DoS", "Replay"],
            "in_channels": 22,
            "hidden_channels": 32,
            "out_channels": 4,
        },
        "scaler": {
            "path": scaler_path,
            "loaded": os.path.exists(scaler_path),
        }
    }

@app.get("/model/info")
def model_info():
    """Return model architecture and asset info"""
    import os
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    return {
        "model_file": "stgnn_model.pth",
        "model_exists": os.path.exists(os.path.join(BASE_DIR, "models", "stgnn_model.pth")),
        "scaler_file": "scaler.joblib",
        "scaler_exists": os.path.exists(os.path.join(BASE_DIR, "datasets", "scaler.joblib")),
        "architecture": "ST-GNN (2x GAT + Temporal Conv1D + FC)",
        "num_nodes": 3,
        "window_size": 10,
        "features_per_node": 22,
        "num_classes": 4,
        "attack_classes": {
            "0": "Normal",
            "1": "FDI (False Data Injection)",
            "2": "DoS (Denial of Service)",
            "3": "Replay Attack"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
