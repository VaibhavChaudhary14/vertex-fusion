import numpy as np
import json
import logging

try:
    import pandapower as pp
    import pandapower.networks as pn
    HAS_PANDAPOWER = True
except ImportError:
    HAS_PANDAPOWER = False

try:
    import torch
    import torch.nn as nn
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False

from .ai_agent import AIAgent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GridSimulation:
    def __init__(self):
        self.net = None
        self.step_count = 0
        self.attack_active = False
        self.attack_type = "none"
        self.attack_params = {}
        
        # Initialize AI Agent
        self.ai_agent = AIAgent()
        
        if HAS_PANDAPOWER:
            self.net = self._create_9_bus_network()
            logger.info("Initialized with pandapower network")
        else:
            logger.warning("Pandapower not found, running in fallback simulation mode")

    def _create_9_bus_network(self):
        if not HAS_PANDAPOWER:
            return None
        try:
            # Use standard IEEE 9-Bus case
            net = pn.case9()
            logger.info("✅ Loaded IEEE 9-Bus System (Vertex Fusion Standard)")
            return net
        except Exception as e:
            logger.error(f"Failed to load case9: {e}")
            return None

    def set_attack(self, attack_type: str, params: dict):
        self.attack_active = (attack_type != "none")
        self.attack_type = attack_type
        self.attack_params = params
        logger.info(f"Attack set: {attack_type} with params {params}")

    def trip_breaker(self, line_id: str):
        """Simulates tripping a circuit breaker on a line."""
        if HAS_PANDAPOWER and self.net:
            try:
                # Find the line index by name or ID (assuming simple ID here for now)
                # In pandapower, lines are indexed by integer.
                # If line_id is "1-2", we map to index 0, "2-3" -> 1, "1-3" -> 2 based on creation order
                line_map = {"1-2": 0, "2-3": 1, "1-3": 2}
                idx = line_map.get(line_id)
                
                if idx is not None:
                     self.net.line.at[idx, 'in_service'] = False
                     logger.info(f"Breaker tripped on line {line_id}")
                     return True
            except Exception as e:
                logger.error(f"Failed to trip breaker: {e}")
        return False

    def detect_attack(self, measurements):
        """
        Uses AI Agent to detect attacks.
        """
        return self.ai_agent.detect_attack(measurements, self.attack_active, self.attack_type)

    def step(self):
        self.step_count += 1
        
        # Add some random load fluctuation
        load_factor = np.random.normal(1.0, 0.05)

        # Check for MATLAB mode
        # You can toggle this via env var or config in practice
        import os
        if os.environ.get("USE_MATLAB_BACKEND") == "true":
            return self.run_matlab_step(load_factor)

        results = []

        if HAS_PANDAPOWER and self.net:
            # Update loads with random fluctuation
            self.net.load.p_mw = self.net.load.p_mw * load_factor
            
            try:
                pp.runpp(self.net)
            except Exception as e:
                logger.error(f"Pandapower calculation failed: {e}")
                return self._fallback_simulation(load_factor)

            # Extract Bus Results
            if not self.net.res_bus.empty:
                for idx, row in self.net.res_bus.iterrows():
                    vm_pu = float(row['vm_pu'])
                    
                    # Apply FDI Attack logic if active
                    if self.attack_active and self.attack_type == "FDI":
                         if idx == 0: vm_pu += 0.15 
                         if idx == 1: vm_pu -= 0.10

                    results.append({
                        "time": self.step_count,
                        "type": "bus",
                        "id": str(idx),
                        "vm_pu": vm_pu,
                        "p_mw": float(row['p_mw']),
                        "attack_injected": self.attack_active
                    })
            
            # Extract Line Results (to show open breakers)
            if not self.net.res_line.empty:
                for idx, row in self.net.res_line.iterrows():
                    loading = float(row['loading_percent'])
                    in_service = self.net.line.at[idx, 'in_service']
                    results.append({
                        "type": "line",
                        "id": str(idx), # This needs better mapping to UI IDs
                        "loading": loading,
                        "status": "closed" if in_service else "tripped"
                    })
        else:
            return self._fallback_simulation(load_factor)
            
        return results

    def run_matlab_step(self, load_factor):
        """
        Executes the simulation step using MATLAB via file exchange.
        """
        import subprocess
        import os
        import json

        # 1. Prepare Inputs
        inputs = {
            "load_factor": load_factor,
            "trip_line": "" 
        }
        
        # Check if any line is tripped (naive check for now, needs state tracking match)
        # For this demo, we just pass an empty string or specific line if we stored it
        
        matlab_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "matlab")
        input_path = os.path.join(matlab_dir, "input_params.json")
        output_path = os.path.join(matlab_dir, "output_results.json")
        
        try:
            with open(input_path, 'w') as f:
                json.dump(inputs, f)
        except Exception as e:
            logger.error(f"Failed to write MATLAB inputs: {e}")
            return self._fallback_simulation(load_factor)

        # 2. Call MATLAB
        # We assume 'matlab' is in PATH. If not, set MATLAB_EXEC env var.
        matlab_exec = os.environ.get("MATLAB_EXEC", "matlab")
        
        # Command: matlab -batch "cd('full/path/to/matlab'); run_wrapper;"
        # Note: 'cd' in MATLAB takes a string. 
        # We replace backslashes with forward slashes for MATLAB string compatibility if needed, 
        # though MATLAB on Windows usually handles both. usage of single quotes is key.
        
        escaped_dir = matlab_dir.replace("\\", "/")
        cmd = f"cd('{escaped_dir}'); run_wrapper;"
        
        try:
            # shell=True might be needed on Windows for some path resolutions
            subprocess.run([matlab_exec, "-batch", cmd], check=True, capture_output=True)
        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            logger.error(f"MATLAB execution failed: {e}. Check if 'matlab' is in PATH or set MATLAB_EXEC.")
            return self._fallback_simulation(load_factor)

        # 3. Read Outputs
        if not os.path.exists(output_path):
             logger.error("MATLAB output file not found.")
             return self._fallback_simulation(load_factor)
             
        try:
            with open(output_path, 'r') as f:
                data = json.load(f)
                
            if "error" in data:
                logger.error(f"MATLAB script reported error: {data['error']}")
                return self._fallback_simulation(load_factor)
                
            # 4. Map to Results format
            results = []
            
            # Buses
            # MATLAB returns lists/arrays. 
            vm = data["buses"]["Vm"]
            pd = data["buses"]["Pd"]
            
            for i in range(len(vm)):
                # idx 1-based in MATLAB, we can keep it 0-based or 1-based in ID
                val_vm = float(vm[i])
                val_p = float(pd[i])
                
                # Apply Attack (Simulated on top of physical results for the demo)
                if self.attack_active and self.attack_type == "FDI":
                     if i == 0: val_vm += 0.15 
                     if i == 1: val_vm -= 0.10

                results.append({
                    "time": self.step_count,
                    "type": "bus",
                    "id": str(i), 
                    "vm_pu": val_vm,
                    "p_mw": val_p,
                     "attack_injected": self.attack_active
                })
                
            return results

        except Exception as e:
             logger.error(f"Failed to parse MATLAB results: {e}")
             return self._fallback_simulation(load_factor)

    def _fallback_simulation(self, load_factor):
        # Fallback logic for Vertex Fusion (9-Bus)
        results = []
        for i in range(1, 10): # Buses 1 to 9
            # Random nominal values
            vm = 1.0 + np.random.normal(0, 0.01)
            p = 0.0
            
            # Simple profile
            if i in [1, 2, 3]: vm = 1.02 # Gen buses
            if i in [5, 6, 8]: p = -90.0 * load_factor # Load buses
            
            # Attack Injection (FDI on Bus 5)
            if self.attack_active and self.attack_type == "FDI" and i == 5:
                 vm += 0.15 

            results.append({
                "time": self.step_count, 
                "type": "bus", 
                "id": str(i-1), # Pandapower uses 0-based idx usually
                "vm_pu": vm, 
                "p_mw": p,
                "attack_injected": self.attack_active
            })
            
        return results
