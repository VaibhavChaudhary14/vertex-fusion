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
    print("[Simulation] Starting Simulation Engine...")
    start_scada_background()
    yield
    # Shutdown
    print("[Simulation] Stopping Simulation Engine...")
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
    target_bus: Optional[int] = 0

class ProtectionRequest(BaseModel):
    action: str # TRIP, CLOSE
    bus_id: Optional[int] = None
    line_id: Optional[str] = None

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

@app.get("/metrics/analytics")
def get_detailed_analytics():
    """
    Phase 5: Calculates research-grade metrics (Accuracy, ROC, MTTD) from telemetry.db.
    """
    import sqlite3
    import pandas as pd
    import numpy as np
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "telemetry.db")
    try:
        conn = sqlite3.connect(db_path)
        df = pd.read_sql_query("SELECT * FROM inference_logs", conn)
        conn.close()

        if df.empty:
            return {"error": "No telemetry data available for analytics."}

        # Calculate Accuracy
        accuracy = (df['true_label'] == df['pred_label']).mean() * 100.0

        # Calculate Mean Time To Detection (MTTD)
        # We assume simulation steps are roughly 200ms based on scada.py loop
        # We look for contiguous blocks of true_label != 0 and find the first pred_label != 0
        mttd_list = []
        is_attack_active = False
        attack_start_time = 0
        
        for idx, row in df.iterrows():
            if row['true_label'] != 0 and not is_attack_active:
                is_attack_active = True
                attack_start_time = row['timestamp']
            elif row['true_label'] == 0 and is_attack_active:
                is_attack_active = False
            
            if is_attack_active and row['pred_label'] != 0:
                detection_time = (row['timestamp'] - attack_start_time) * 1000.0
                mttd_list.append(detection_time)
                is_attack_active = False # Count only the first detection per trigger

        avg_mttd = np.mean(mttd_list) if mttd_list else 0.0

        # Attack specific breakdown
        attack_stats = {}
        for label_id, name in {1: "FDI", 2: "DoS", 3: "Replay"}.items():
            sub = df[df['true_label'] == label_id]
            if not sub.empty:
                dr = (sub['pred_label'] == label_id).mean() * 100.0
                attack_stats[name] = {"detection_rate": round(dr, 2), "count": len(sub)}

        return {
            "accuracy": round(accuracy, 2),
            "mttd_ms": round(avg_mttd, 2),
            "total_samples": len(df),
            "attack_stats": attack_stats,
            "status": "success"
        }
    except Exception as e:
        return {"error": str(e)}

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

    set_attack(request.attack_type, target_bus=request.target_bus)
    return {"status": "success", "attack_type": request.attack_type, "target_bus": request.target_bus}

@app.post("/protection")
def trigger_protection(request: ProtectionRequest):
    """Execute protection action (Trip/Close Breaker)"""
    if request.action not in ["TRIP", "CLOSE"]:
        raise HTTPException(status_code=400, detail="Invalid action. Use TRIP or CLOSE")
    
    status = "OPEN" if request.action == "TRIP" else "CLOSED"
    set_breaker(status, line_id=request.line_id, bus_id=request.bus_id)
    target = f"{request.line_id}_B{request.bus_id}" if request.line_id else "Global"
    return {"status": "success", "message": f"Breaker {target} set to {status}"}

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

@app.get("/shap")
def get_shap_explanation():
    """
    Phase 12: Real-time Explainable AI endpoints via Saliency Gradients.
    Fetches the latest 540-feature array from SCADA memory and runs a backward pass
    to determine exactly which bus and sensor triggered the anomaly.
    """
    state = get_latest_state()
    features = state.get("latest_features", [])
    
    if not features or len(features) == 0:
        return {"error": "No telemetry data explicitly buffered yet. Ensure SCADA is running."}

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
    # The explain() function computes gradients and importance mapping
    explanation = engine.explain(features)
    return explanation

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
            "in_channels": 54,
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
        "num_nodes": 9,
        "window_size": 10,
        "features_per_node": 6,
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
