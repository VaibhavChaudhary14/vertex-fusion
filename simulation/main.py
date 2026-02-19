from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .grid_model import GridSimulation
# Import the Digital Twin Client
from .tcp_client import DigitalTwinClient
import logging
import uvicorn
import contextlib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("api")

# Global Variables
simulation = GridSimulation()
dt_client = DigitalTwinClient()

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting Vertex Fusion Engine...")
    dt_client.start()
    yield
    # Shutdown
    logger.info("🛑 Shutting down...")
    dt_client.stop()

app = FastAPI(title="Vertex Fusion Simulation Engine", lifespan=lifespan)

class AttackRequest(BaseModel):
    attack_type: str
    target_node: str = "all"
    magnitude: float = 0.0

@app.get("/")
def read_root():
    return {"status": "online", "service": "Vertex Fusion Engine", "twin_connected": dt_client.connected}

@app.get("/health")
def health_check():
    return {"status": "healthy", "mode": "pandemic" if simulation.net else "fallback"}

@app.post("/simulate")
def run_simulation_step():
    """Allows manual stepping of the Pandapower simulation (Legacy mode)."""
    try:
        results = simulation.step()
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
    """Trips the circuit breaker via Digital Twin TCP link."""
    # Priority: Send to Real Twin first
    if dt_client.connected:
        dt_client.send_trip_command(line_id)
        return {"status": "success", "message": f"Sent TRIP command for Line {line_id} to MATLAB"}
    
    # Fallback to local simulation
    success = simulation.trip_breaker(line_id)
    if success:
        return {"status": "success", "message": f"Breaker {line_id} tripped (Local Sim)"}
    else:
        raise HTTPException(status_code=400, detail="Failed to trip breaker")

@app.get("/detect-attack")
def get_detection():
    """Returns the latest status from the Digital Twin."""
    if dt_client.connected:
        # Return real twin state
        state = dt_client.latest_state
        return {
            "source": "DigitalTwin",
            "connected": state["connected"],
            "detection": state["detection"],
            "grid_summary": state["grid_data"][:5] if state["grid_data"] else []
        }
    else:
        # Return legacy simulation state
        return {
            "source": "LocalSim",
            "connected": False,
            "detection": simulation.detect_attack([])
        }

@app.post("/reset")
def reset_simulation():
    """Resets the simulation state."""
    global simulation
    simulation = GridSimulation()
    return {"status": "reset", "message": "Simulation reset to initial state"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
