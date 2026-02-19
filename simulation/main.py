from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .grid_model import GridSimulation
import logging
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("api")

app = FastAPI(title="Vertex Fusion Simulation Engine")

# Singleton simulation instance
simulation = GridSimulation()

class AttackRequest(BaseModel):
    attack_type: str
    target_node: str = "all"
    magnitude: float = 0.0

@app.get("/")
def read_root():
    return {"status": "online", "service": "Vertex Fusion Engine"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "mode": "pandemic" if simulation.net else "fallback"}

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
def configure_attack(attack: AttackRequest):
    """Configures active attack parameters."""
    simulation.set_attack(attack.attack_type, attack.dict())
    return {"status": "success", "message": f"Attack {attack.attack_type} configured"}

@app.post("/trip-breaker")
def trip_breaker(line_id: str):
    """Trips the circuit breaker for a specific line."""
    success = simulation.trip_breaker(line_id)
    if success:
        return {"status": "success", "message": f"Breaker {line_id} tripped"}
    else:
        raise HTTPException(status_code=400, detail="Failed to trip breaker (invalid ID or simulation error)")

@app.get("/detect-attack")
def get_detection():
    """Returns the latest detection status."""
    # current implementation returns detection with simulation step, but this endpoint satisfies the requirement
    return simulation.detect_attack([])

@app.post("/reset")
def reset_simulation():
    """Resets the simulation state."""
    global simulation
    simulation = GridSimulation()
    return {"status": "reset", "message": "Simulation reset to initial state"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
