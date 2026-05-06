import socket
import torch
import torch.nn as nn
from torch_geometric.nn import GCNConv
import numpy as np
import joblib
import json
import os
import csv
import time
from datetime import datetime

# =============================
# CONFIGURATION & CONSTANTS
# =============================
HOST = "127.0.0.1"
PORT = 5000
WINDOW_SIZE = 20
OPTIMAL_THRESHOLD = 0.9944
RETRAIN_BATCH_SIZE = 200
LOG_FILE = "results_log.csv"
FEATURE_NAMES = ["Voltage", "Current", "Active Power (P)", "Reactive Power (Q)", "Frequency", "Phase Angle"]

# =============================
# MODEL ARCHITECTURE
# =============================
class STGNN_Transformer(nn.Module):
    def __init__(self, in_features):
        super().__init__()
        # Spatial layers
        self.gcn1 = GCNConv(in_features, 32)
        self.gcn2 = GCNConv(32, 16)
        
        # Temporal layer (Transformer)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=16,
            nhead=4,
            dropout=0.1,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=2)
        
# Classifier (5 Classes: Normal + 4 Attacks)
        self.fc = nn.Linear(16, 5)

    def forward(self, x, edge_index):
        B, T, N, F = x.shape
        spatial_outputs = []

        for t in range(T):
            xt = x[:, t, :, :]
            xt_flat = xt.reshape(B * N, F)
            offset = (torch.arange(0, B * N, N, device=x.device).view(-1, 1))
            batch_edge_index = edge_index.unsqueeze(0) + offset.unsqueeze(-1)
            batch_edge_index = batch_edge_index.view(-1, 2).t().contiguous()

            xt_flat = self.gcn1(xt_flat, batch_edge_index).relu()
            xt_flat = self.gcn2(xt_flat, batch_edge_index).relu()

            xt_res = xt_flat.view(B, N, -1)
            xt_pool = xt_res.mean(dim=1)
            spatial_outputs.append(xt_pool)

        temporal_input = torch.stack(spatial_outputs, dim=1)
        trans_out = self.transformer(temporal_input)
        out = self.fc(trans_out[:, -1, :])
        return out

# Define Topography
edge_index = torch.tensor([
    [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8],
    [3, 8, 6, 7, 4, 5, 0, 4, 2, 3, 2, 6, 1, 5, 1, 8, 0, 7]
], dtype=torch.long)

# Load scaler
print("Loading StandardScaler...")
try:
    scaler = joblib.load("scaler.pkl")
except FileNotFoundError:
    print("Error: scaler.pkl not found! Please run stgnn_pipeline.py to generate it.")
    exit(1)

# Load Model
print("Loading STGNN_Transformer...")
model = STGNN_Transformer(in_features=6)
try:
    model.load_state_dict(torch.load("model.pth"))
    model.eval()
except FileNotFoundError:
    print("Error: model.pth not found! Please run stgnn_pipeline.py to generate it.")
    exit(1)

# TCP Setup
HOST = "127.0.0.1"
PORT = 5000

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

try:
    server.bind((HOST, PORT))
except OSError as e:
    print(f"Error binding to {HOST}:{PORT}: {e}")
    exit(1)

# Live Retraining Buffer
training_buffer_x = []
training_buffer_y = []
RETRAIN_BATCH_SIZE = 200

# Setup Persistent Logging
if not os.path.exists(LOG_FILE):
    with open(LOG_FILE, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Timestamp", "Score", "Status", "Attack_Type", "Attributed_Node", "Attributed_Feature"])

# Global Confusion Matrix (5x5)
confusion_matrix_live = np.zeros((5, 5), dtype=int)
LABEL_MAP = {0: "Normal", 1: "FDI", 2: "DoS", 3: "Replay", 4: "Noise"}
REVERSE_LABEL_MAP = {v: k for k, v in LABEL_MAP.items()}

server.listen(5)
print(f"🚀 AI Engine ONLINE. Listening on {HOST}:{PORT}...")

while True:
    print(f"Waiting for MATLAB connection on {HOST}:{PORT}...")
    conn, addr = server.accept()
    print(f"Connected: {addr}")

    window = []
    WINDOW_SIZE = 20
    OPTIMAL_THRESHOLD = 0.9944

    # Provide visual separation for live logging
    print("\n" + "="*50)
    print("             STARTING REAL-TIME LOGGING")
    print("="*50 + "\n")

    try:
        while True:
            data = conn.recv(8192).decode()
            if not data:
                print("Client disconnected.")
                break
                
            # Packet Validation
            parts = data.split(',')
            if len(parts) < 54:
                # MATLAB may send partial packets
                continue
                
            try:
                raw_values = np.array(list(map(float, parts[:54])))
                scaled_values = scaler.transform(raw_values.reshape(1, -1))
                values = scaled_values.reshape(9, 6)
            except Exception as parse_err:
                print(f"⚠️ Skipping malformed packet: {parse_err}")
                continue
            
            window.append(values)
            if len(window) > WINDOW_SIZE:
                window.pop(0)
                
            if len(window) == WINDOW_SIZE:
                x_input = torch.tensor(window, dtype=torch.float).unsqueeze(0)
                
                # Forward pass
                model.zero_grad()
                out = model(x_input, edge_index)
                probs = torch.softmax(out, dim=1)
                
                # Multi-class prediction
                pred_class_idx = torch.argmax(probs, dim=1).item()
                confidence = probs[0, pred_class_idx].item()
                
                status = f"🚨 {LABEL_MAP[pred_class_idx]} DETECTED" if pred_class_idx > 0 else "Normal Operation"
                print(f"{status} | Confidence: {confidence:.3f}")

                attack_status = status
                prob = confidence
                
                # --- XAI: Saliency Map ---
                # Calculate saliency for the predicted class
                input_gradients = torch.autograd.grad(probs[0, pred_class_idx], x_input)[0]
                saliency = torch.abs(input_gradients).squeeze(0)[-1] # [Nodes, Features]
                
                # Per-Node Heatmap Score (sum of feature saliencies)
                node_saliency = torch.sum(saliency, dim=1).numpy().tolist()
                
                # Identify high-impact bus and feature for text label
                top_bus_idx = np.argmax(node_saliency)
                top_feat_idx = torch.argmax(saliency[top_bus_idx]).item()
                top_score = saliency[top_bus_idx, top_feat_idx].item()
                
                attributed_bus = top_bus_idx + 1
                attributed_feature = FEATURE_NAMES[top_feat_idx]
                
                # Check for active attack label from backend side-channel
                ground_truth = 0 # Default: Normal
                try:
                    if os.path.exists("simulation/active_attack.json"):
                        with open("simulation/active_attack.json", "r") as f:
                            cmd_data = json.load(f)
                            active_attack = cmd_data.get("attack_type", "NONE").upper()
                            
                            # Map ground truth based on uppercase string from backend
                            if active_attack == "FDI": ground_truth = 1
                            elif active_attack == "DOS": ground_truth = 2
                            elif active_attack == "REPLAY": ground_truth = 3
                            elif active_attack == "NOISE": ground_truth = 4
                except:
                    pass
                
                # Update Live Confusion Matrix
                confusion_matrix_live[ground_truth][pred_class_idx] += 1

                if pred_class_idx > 0:
                    print(f"   [!] DETECTED: {attack_status} at BUS {attributed_bus}")
                    with open(LOG_FILE, "a", newline="") as f:
                        writer = csv.writer(f)
                        writer.writerow([datetime.now(), prob, attack_status, LABEL_MAP[pred_class_idx], attributed_bus, attributed_feature])

                # Save state for dashboard
                state = {
                    "timestamp": time.time(),
                    "prediction": int(pred_class_idx > 0),
                    "score": prob,
                    "status": attack_status,
                    "attack_type": LABEL_MAP[pred_class_idx],
                    "fault_node": attributed_bus,
                    "top_feature": attributed_feature,
                    "top_feat_val": top_score,
                    "heatmap": node_saliency,
                    "confusion_matrix": confusion_matrix_live.tolist(),
                    "packet_loss": 0.0,
                    "frequency": float(values[0, 4]),
                    "confidence": prob
                }
                for b in range(9):
                    state[f"bus{b+1}_voltage"] = float(values[b, 0])
                    state[f"bus{b+1}_current"] = float(values[b, 1])

                if not os.path.exists("simulation"): os.makedirs("simulation")
                with open("simulation/state.json", "w") as f:
                    json.dump(state, f)
                    
                # --- Live Retraining Buffer ---
                training_buffer_x.append(x_input.detach().squeeze(0).numpy())
                training_buffer_y.append(1 if prob > OPTIMAL_THRESHOLD else 0)
                
                if len(training_buffer_x) >= RETRAIN_BATCH_SIZE:
                    print(f"\n🔄 [MLOps] Model Continuous Learning Triggered...")
                    optimizer = torch.optim.Adam(model.parameters(), lr=0.0001)
                    loss_fn = nn.CrossEntropyLoss()
                    
                    batch_x = torch.tensor(np.array(training_buffer_x), dtype=torch.float)
                    batch_y = torch.tensor(np.array(training_buffer_y), dtype=torch.long)
                    
                    model.train()
                    optimizer.zero_grad()
                    out_train = model(batch_x, edge_index)
                    loss = loss_fn(out_train, batch_y)
                    loss.backward()
                    optimizer.step()
                    model.eval()
                    
                    print(f"✅ Retraining complete. Loss: {loss.item():.4f}")
                    torch.save(model.state_dict(), "model.pth")
                    training_buffer_x.clear()
                    training_buffer_y.clear()

    except Exception as e:
        print(f"Socket Error: {e}")
    finally:
        conn.close()
        print("Connection closed. Waiting for new connection...")

