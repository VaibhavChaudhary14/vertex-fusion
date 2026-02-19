import socket
import struct
import numpy as np
import threading
import time
import requests
import csv
import os
from datetime import datetime
from typing import Optional, List, Dict

# Configuration
MATLAB_HOST = "127.0.0.1"
MATLAB_PORT = 5000
DATA_DIR = "data"
RECORDER_FILE = os.path.join(DATA_DIR, "ieee9_dynamic_dataset.csv")

class ScadaBridge:
    def __init__(self):
        self.sock: Optional[socket.socket] = None
        self.connected = False
        self.running = False
        self.latest_state: Optional[Dict] = None
        self.recording = True # Auto-record for now to build dataset
        
        # Ensure data dir exists
        os.makedirs(DATA_DIR, exist_ok=True)
        
        # Initialize CSV if not exists
        if not os.path.exists(RECORDER_FILE):
            with open(RECORDER_FILE, 'w', newline='') as f:
                writer = csv.writer(f)
                # Header: Time, Freq, V1..V9, I1..I9, P1..P9, Q1..Q9 (38 cols)
                cols = ['time', 'freq'] + [f'v{i}' for i in range(1,10)] + \
                       [f'i{i}' for i in range(1,10)] + [f'p{i}' for i in range(1,10)] + \
                       [f'q{i}' for i in range(1,10)]
                writer.writerow(cols)

    def connect(self):
        """Attempts to connect to MATLAB TCP Server."""
        try:
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.sock.settimeout(2.0)
            self.sock.connect((MATLAB_HOST, MATLAB_PORT))
            self.connected = True
            print(f"✅ Connected to MATLAB SCADA at {MATLAB_HOST}:{MATLAB_PORT}")
        except Exception as e:
            # print(f"⚠️ Connection Failed: {e}") # Reduce spam
            self.connected = False

    def start_listener(self):
        """Starts the background listener thread."""
        self.running = True
        t = threading.Thread(target=self._listen_loop, daemon=True)
        t.start()
        print("🎧 SCADA Listener Bridge Started...")

    def _listen_loop(self):
        """Continuous loop to receive data from MATLAB."""
        while self.running:
            if not self.connected:
                self.connect()
                time.sleep(2)
                continue

            try:
                # Expected Data Size: 38 doubles * 8 bytes = 304 bytes
                PACKET_SIZE = 304 
                data_bytes = self.sock.recv(PACKET_SIZE)
                
                if not data_bytes:
                    print("⚠️ Connection closed by MATLAB.")
                    self.connected = False
                    continue

                if len(data_bytes) == PACKET_SIZE:
                    data = list(struct.unpack(f'{38}d', data_bytes))
                    self._process_packet(data)
                
            except Exception as e:
                # print(f"❌ Receive Error: {e}")
                self.connected = False
                time.sleep(1)

    def _process_packet(self, data: List[float]):
        """Parses raw float array into structured grid state."""
        # Index Mapping: 0: Time, 1: Freq, 2-10: V, 11-19: I, 20-28: P, 29-37: Q
        
        timestamp = data[0]
        freq = data[1]
        volts = data[2:11]
        currs = data[11:20]
        powers = data[20:29]
        qs = data[29:38]
        
        # Record Data
        if self.recording:
            try:
                with open(RECORDER_FILE, 'a', newline='') as f:
                    writer = csv.writer(f)
                    writer.writerow(data)
            except Exception as e:
                print(f"❌ Recorder Error: {e}")
        
        # Structure for Frontend/AI
        buses = []
        for i in range(9):
            buses.append({
                "id": i+1,
                "vm_pu": volts[i],
                "p_mw": powers[i],
                "q_mvar": qs[i]
            })
            
        lines = []
        for i in range(9):
            # Approx loading from current (I)
            lines.append({
                 "id": i+1,
                 "loading_percent": currs[i] * 100, # arbitrary scale if unknown base
                 "status": "closed" 
            })

        self.latest_state = {
            "step": int(timestamp),
            "buses": buses,
            "lines": lines,
            "system_freq": freq,
            "packet_delay": 20.0, # Mock
            "packet_loss": 0.0,
            "status": "Normal"
        }
        
    def send_command(self, command: str):
        if self.connected and self.sock:
            try:
                self.sock.sendall(command.encode('utf-8'))
                print(f"📤 Sent Command: {command}")
            except Exception as e:
                print(f"❌ Send Error: {e}")

if __name__ == "__main__":
    bridge = ScadaBridge()
    bridge.start_listener()
    while True: time.sleep(1)
