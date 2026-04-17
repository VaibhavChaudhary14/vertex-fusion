# Vertex Fusion: Smart Grid Cyber-Physical Simulator

A next-generation simulation platform integrating Python-based power flow analysis (Pandapower) and AI detection with a modern React/Node.js web interface.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- PostgreSQL (optional, for persistent user data)

### 1. Install Dependencies

**Frontend & Backend:**
```bash
npm install
```

**Simulation Engine:**
```bash
pip install -r simulation/requirements.txt
```

### 2. Run the Application

You need to run the Python Simulation Engine and the Node.js Web App in parallel.

**Terminal 1: Python Simulation Service**
```bash
python simulation/main.py
# Runs on http://127.0.0.1:8000
```

**Terminal 2: Web Application**
```bash
npm run dev
# Runs on http://localhost:5000 (Backend) + http://localhost:5173 (Frontend proxy)
```

## 🏗️ Project Structure

- **`9 Bus Major/`**: Main MATLAB/Simulink directory for IEEE 9-bus dynamic simulation.
- **`frontend/`**: React 18 dashboard for real-time SCADA visualization.
- **`backend/`**: Node.js Express server handling API proxying, auth, and data persistence.
- **`simulation/`**: Python FastAPI service running Pandapower power flow simulation and ST-GNN AI detection models.
- **`shared/`**: Shared TypeScript types and Zod schemas.

## ⚡ Key Features

- **Real-Time Data**: 6-bus power flow simulation updating every 200ms.
- **Attack Injection**: Inject FDI, DoS, and Replay attacks via the UI.
- **AI Detection**: ST-GNN model detects anomalies in real-time.
- **Automated Protection**: SCADA logic automatically trips breakers when attacks are confirmed.
