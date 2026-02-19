from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import logging
from grid_model import GridSimulation

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
simulation = GridSimulation()

class AttackRequest(BaseModel):
    attack_type: str
    params: dict = {}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "simulation-engine"}

@app.post("/simulate")
def run_simulation_step():
    """Advances the simulation by one time step and returns the grid state."""
    try:
        results = simulation.step()
        # Run detection on the current state
        detection = simulation.detect_attack(results)
        return {"step": simulation.step_count, "grid_state": results, "detection": detection}
    except Exception as e:
        logger.error(f"Simulation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/attack")
def configure_attack(request: AttackRequest):
    """Configures an attack simulation."""
    try:
        simulation.set_attack(request.attack_type, request.params)
        return {"status": "attack_configured", "type": request.attack_type}
    except Exception as e:
        logger.error(f"Attack config error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/trip-breaker")
def trip_breaker(line_id: str):
    """Trips a circuit breaker."""
    try:
        success = simulation.trip_breaker(line_id)
        if success:
             return {"status": "success", "message": f"Breaker {line_id} tripped"}
        else:
             raise HTTPException(status_code=400, detail="Failed to trip breaker or line not found")
    except Exception as e:
        logger.error(f"Trip breaker error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/detect-attack")
def detect_attack_endpoint():
    """Returns the current attack detection status."""
    # This might be redundant if /simulate returns detection, 
    # but useful for async polling or separate dashboard components
    try:
        # We need a way to get the *last* detection result without advancing simulation
        # For now, we'll just return the simulation state's last known result if possible,
        # or just run detection on the last known results.
        # But simulation.step() returns the results. 
        # Ideally, simulation stores state.
        
        # NOTE: In our current GridSimulation, we don't store the last full result in `self`.
        # So we might just return the mock detection logic based on attack_active flag.
        return simulation.detect_attack(None)
    except Exception as e:
        logger.error(f"Detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/explain-attack")
def explain_attack():
    """Returns SHAP feature importance values."""
    # Mock logic based on attack state
    if simulation.attack_active:
        return {
            "features": [
                {"feature": "V_Bus2", "impact": 0.35, "contribution": 35},
                {"feature": "P_Line2-3", "impact": 0.25, "contribution": 25},
                {"feature": "Q_Gen3", "impact": 0.15, "contribution": 15},
                {"feature": "F_Bus1", "impact": 0.10, "contribution": 10},
                {"feature": "I_Line4", "impact": 0.05, "contribution": 5},
            ]
        }
    else:
         return {
            "features": [
                {"feature": "V_Bus2", "impact": 0.02, "contribution": 2},
                {"feature": "P_Line2-3", "impact": 0.01, "contribution": 1},
                {"feature": "Q_Gen3", "impact": 0.01, "contribution": 1},
                 {"feature": "Normal_Noise", "impact": 0.05, "contribution": 5},
            ]
        }
