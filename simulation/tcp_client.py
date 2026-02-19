import socket
import struct
import numpy as np
import logging
import time
import os
from collections import deque
from simulation.digital_twin_agent import DigitalTwinAgent
import os

# Configuration
# ...
# Data Dir
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")
MODEL_PATH = os.path.join(DATA_DIR, "stgnn_9bus.pth")
SCALER_PATH = os.path.join(DATA_DIR, "scaler_9bus.joblib")

import threading

class DigitalTwinClient:
    def __init__(self):
        self.sock = None
        self.connected = False
        self.buffer = deque(maxlen=WINDOW_SIZE)
        
        # Initialize Digital Twin Brain
        self.agent = DigitalTwinAgent(MODEL_PATH, SCALER_PATH)
        
        # Shared State for Frontend
        self.latest_state = {
            "connected": False,
            "last_update": 0,
            "grid_data": [], # Last received feature vector
            "detection": {
                "action": "NONE",
                "confidence": 0.0,
                "type": "Waiting...",
                "line_id": None
            }
        }
        
        self.running = False
        self.thread = None

    def connect(self):
        try:
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.sock.settimeout(5.0) # Non-blocking connection attempt
            self.sock.connect((TCP_IP, TCP_PORT))
            self.connected = True
            logger.info(f"✅ Connected to MATLAB Server at {TCP_IP}:{TCP_PORT}")
        except Exception as e:
            # logger.warning(f"⚠️ Connection failed: {e}")
            self.connected = False

    def start(self):
        """Starts the listener in a background thread."""
        if self.running: return
        self.running = True
        self.thread = threading.Thread(target=self._listen_loop, daemon=True)
        self.thread.start()
        logger.info("🚀 Digital Twin Client Thread Started")

    def _listen_loop(self):
        logger.info("🎧 Listening for real-time SCADA data (IEEE 9-Bus)...")
        
        while self.running:
            if not self.connected:
                self.connect()
                if not self.connected:
                    self.latest_state["connected"] = False
                    time.sleep(2)
                    continue

            try:
                # Update State
                self.latest_state["connected"] = True
                
                # Receive
                data = self.sock.recv(BUFFER_SIZE)
                if not data:
                    self.connected = False
                    continue
                    
                # Unpack
                num_doubles = len(data) // 8
                floats = struct.unpack(f'{num_doubles}d', data[:num_doubles*8])
                
                if len(floats) >= 54: 
                    # Extract Features
                    feature_vector = floats[1:55] # 55 is exclusive, so 1..54
                    timestamp = floats[0]
                    
                    self.buffer.append(feature_vector)
                    self.latest_state["grid_data"] = list(feature_vector[:9]) # Store partial for visualization
                    self.latest_state["last_update"] = timestamp
                    
                    # Run Inference
                    if len(self.buffer) == WINDOW_SIZE:
                        result = self.agent.detect(self.buffer)
                        
                        # Update Shared State
                        self.latest_state["detection"] = result
                        
                        action = result.get("action")
                        conf = result.get("confidence", 0.0)
                        
                        if action == "TRIP":
                             logger.error(f"⚡ DETECTED & TRIPPING: {result['type']} ({conf:.2f})")
                             self.send_trip_command(result['line_id'])
                             
            except Exception as e:
                logger.error(f"Processing error: {e}")
                self.connected = False
                time.sleep(1)

    def stop(self):
        self.running = False
        if self.sock: self.sock.close()

    def send_trip_command(self, line_id):
        if self.connected:
            cmd = f"TRIP_LINE_{line_id}".encode('utf-8')
            try:
                self.sock.send(cmd)
                logger.info(f"📤 Sent: {cmd}")
            except Exception as e:
                logger.error(f"Failed to send command: {e}")

if __name__ == "__main__":
    client = DigitalTwinClient()
    client.start()
    
    # Keep main thread alive
    try:
        while True: time.sleep(1)
    except KeyboardInterrupt:
        client.stop()
