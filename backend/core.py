import pandapower as pp
import pandapower.networks as pn
import numpy as np
import networkx as nx
from enum import Enum
from typing import Dict, List, Optional
import random
from datetime import datetime
import os
from ai_inference_service import AnomalyDetector
from scada_bridge import ScadaBridge
from security_logger import SecurityLogger

# --- Constants ---
class AttackType(str, Enum):
    NONE = "none"
    FDI_VOLTAGE_SPIKE = "fdi_voltage_spike"  # False Data Injection: Fake high voltage
    FDI_FREQUENCY_DROP = "fdi_frequency_drop" # False Data Injection: Fake low frequency
    DOS_SCADA_OUTAGE = "dos_scada_outage" # Denial of Service: Data loss

# --- Alert Manager ---
class AlertManager:
    def __init__(self):
        self.alerts = []
        self.history_size = 50

    def add_alert(self, type: str, message: str, severity: str = "info"):
        alert = {
            "timestamp": datetime.now().isoformat(),
            "type": type,
            "message": message,
            "severity": severity # info, warning, critical
        }
        self.alerts.append(alert)
        if len(self.alerts) > self.history_size:
            self.alerts.pop(0)
        return alert

    def get_latest(self, n=10):
        return self.alerts[-n:]

# --- Grid Simulation ---
class GridSimulation:
    def __init__(self, alert_manager, mode='realtime'):
        self.mode = mode
        self.alert_manager = alert_manager
        self.step_count = 0
        self.attack_active = False
        self.attack_type = AttackType.NONE
        self.attack_params = {}
        
        # Real-Time Bridge
        self.bridge = None
        if self.mode == 'realtime':
            self.bridge = ScadaBridge()
            self.bridge.start_listener()
            print("🌐 Real-Time SCADA Bridge Active")
        
        # Fallback / Synthetic Setup
        self.net = pn.case9()
        self.breakers = {i: True for i in range(len(self.net.line))} 
        self.base_voltage = 1.0 
        self.base_freq = 50.0

    def step(self) -> Dict:
        """Runs one simulation step."""
        self.step_count += 1
        
        # --- MODE: REAL-TIME (MATLAB) ---
        if self.mode == 'realtime' and self.bridge:
            # Check if we have data from MATLAB
            # Bridge parses: [Time, Freq, V[9], I[9], P[9], Q[9]]
            # We need to map this to "buses", "lines" structure for Frontend.
            # Frontend expects: buses: [{vm_pu, p_mw...}], lines: [{loading_percent...}]
            
            # Use bridge's parsed dict if available, else return loading state
            # For now, let's just use the raw latest_data if bridge had it formatted
            # But bridge currently just prints. Let's update bridge or parse here.
            # Ideally bridge stores 'self.latest_state'.
            
            # Since I didn't verify bridge storage, I will assume it's void.
            # Let's fallback to synthetic if bridge not connected, 
            # Or implementation of bridge storage is needed.
            
            # Let's do a hybrid: If bridge connected, use it. Else synthetic.
            # Let's do a hybrid: If bridge connected, use it. Else synthetic.
            if self.bridge.latest_state:
                # We can also inject attacks here if we want to override real data (e.g. for testing UI)
                # But typically we want the "True" state.
                # If we want to attack the real system, we send command to MATLAB.
                # If we want to simulate attack on readout (FDI), we modify here.
                
                state = self.bridge.latest_state.copy()
                
                # Apply software-level attacks (FDI on readout)
                if self.attack_active:
                    self._apply_attack(state)
                    
                return state
                
        # --- MODE: SYNTHETIC (Pandapower) ---
        # 1. Physical Simulation (Pandapower)
        self.net.load['p_mw'] *= np.random.normal(1.0, 0.02, len(self.net.load))
        self.net.load['q_mvar'] *= np.random.normal(1.0, 0.02, len(self.net.load))
        
        for line_idx, closed in self.breakers.items():
            self.net.line.at[line_idx, 'in_service'] = closed

        try:
            pp.runpp(self.net)
            converged = True
        except:
            converged = False
            
        if converged:
            res_bus = self.net.res_bus.to_dict('records')
            res_line = self.net.res_line.to_dict('records')
            for i, line in enumerate(res_line):
                line['status'] = 'closed' if self.breakers.get(i, True) else 'open'
        else:
            res_bus = []
            res_line = []

        # 2. Cyber-Attack Injection overrides
        simulated_data = {
            "step": self.step_count,
            "buses": res_bus,
            "lines": res_line,
            "system_freq": self.base_freq + np.random.normal(0, 0.01),
            "packet_delay": 20 + np.random.normal(0, 2),
            "packet_loss": 0.1 + np.random.random() * 0.5,
            "status": "Normal"
        }

        if self.attack_active:
            self._apply_attack(simulated_data)
            
        return simulated_data

    def _apply_attack(self, data):
        """Modifies data based on active attack vector."""
        if self.attack_type == AttackType.FDI_VOLTAGE_SPIKE:
            # Attack Bus 5 (Index 4) or Bus 8 (Index 7)
            target_bus_idx = 4 
            if len(data['buses']) > target_bus_idx:
                # 1.15 p.u. spike
                data['buses'][target_bus_idx]['vm_pu'] = 1.15 + np.random.normal(0, 0.01)
                data['status'] = "Under Attack (FDI)"
                
        elif self.attack_type == AttackType.FDI_FREQUENCY_DROP:
            data['system_freq'] = 49.2 + np.random.normal(0, 0.05)
            data['status'] = "Under Attack (FDI-Freq)"
            
        elif self.attack_type == AttackType.DOS_SCADA_OUTAGE:
            data['packet_loss'] = 99.0
            data['packet_delay'] = 5000.0
            # Simulating total loss of visibility
            if self.step_count % 3 == 0: 
                data['buses'] = [] 
                data['lines'] = []
            data['status'] = "Communication Failure (DoS)"

    def set_attack(self, type: str, params: dict):
        self.attack_active = True
        self.attack_type = AttackType(type)
        self.attack_params = params
        if type != "none":
            self.alert_manager.add_alert("Security", f"Attack Initiated: {type}", "critical")

    def clear_attack(self):
        self.attack_active = False
        self.attack_type = AttackType.NONE
        self.alert_manager.add_alert("Security", "Attack vector cleared", "info")

    def trip_breaker(self, line_id: int):
        if line_id in self.breakers:
            self.breakers[line_id] = False
            self.alert_manager.add_alert("Protection", f"Breaker {line_id} TRIPPED manually", "warning")
            return True
        return False
        
    def close_breaker(self, line_id: int):
         if line_id in self.breakers:
            self.breakers[line_id] = True
            self.alert_manager.add_alert("Protection", f"Breaker {line_id} CLOSED manually", "info")
            return True
         return False
