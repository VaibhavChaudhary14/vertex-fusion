# Vertex Fusion: Presentation Path for Panel

This guide provides a logical flow for explaining the Vertex Fusion project to an expert panel, ensuring technical depth and clear impact.

---

## 1. The "Hook": The Problem Space (2 mins)
- **Problem**: Modern power grids are transitioning to "Smart Grids", making them vulnerable to sophisticated cyber-attacks (FDI, DoS, Replay) which traditional threshold-based SCADA systems miss.
- **Consequence**: Grid instability, cascaded blackouts, and equipment damage.
- **The Gap**: Existing AI solutions are often "black-boxes" or ignore the spatial topology of the grid.

## 2. Introducing Vertex Fusion (2 mins)
- **Concept**: A **Cyber-Physical Digital Twin** for Smart Grid security.
- **Key Proposition**: It doesn't just watch data; it understands the grid's topology and physical laws using Graph Neural Networks (GNNs).

## 3. Technical Core: The Simulation Engine (3 mins)
- **Grid Topology**: IEEE 9-bus system (9 nodes, 6 features per node).
- **Simulator**: Powered by **Pandapower** and CSV/MATLAB data streams.
- **Interoperability**: Supports **Modbus TCP** (standard industrial protocol) and **MATLAB Simulink** for Hardware-in-the-Loop (HIL) testing.

## 4. The Brain: ST-GNN Architecture (4 mins)
- **Spatio-Temporal GNN**: Uses Graph Attention Networks (GAT) to capture spatial dependencies (how Bus A affects Bus B) and Temporal Convolutions to capture time-series patterns.
- **Inference**: High-speed real-time detection of stealthy False Data Injection (FDI), Denial of Service (DoS), and Replay attacks.
- **Model Training**: Trained on high-fidelity telemetry with a focus on precision to avoid false trips.

## 5. Transparency: Explainable AI (XAI) (3 mins)
- **The "Why"**: Panels love XAI. Show how **Saliency Gradients** map AI predictions back to physical sensors.
- **Visualization**: When an attack is detected, the system pinpoints exactly which bus and feature (e.g., Voltage Ang at Bus 5) is anomalous.

## 6. Automated Mitigation & Protection (2 mins)
- **Resilience**: The system isn't just an observer.
- **Logic**: Automated breaker tripping based on high-confidence predictions (>90%).
- **HIL Integration**: Demo how mitigation commands are sent back to the simulator (or MATLAB) to isolate faults.

## 7. UI/UX: The Digital Twin Dashboard (2 mins)
- **Modern Stack**: React 18, Tailwind CSS, Recharts.
- **Functionality**: Live SCADA telemetry, attack injection controls, and ROC/AUC performance tracking.

## 8. Conclusion & Future Work (2 mins)
- **Impact**: Enhancing grid resilience against Nation-State level cyber threats.
- **Scalability**: Capable of scaling to larger IEEE 14, 30, or 118-bus systems.
- **Closing**: "Vertex Fusion isn't just a simulator; it's a blueprint for the next generation of resilient energy infrastructure."

---

## 9. Technical Specs: Networking & Ports
*For technical questions regarding inter-service communication:*
- **Digital Twin Dashboard (Express)**: Port `5050`
- **Simulation Engine (FastAPI)**: Port `8000`
- **MATLAB TCP Bridge**: Port `5000`
- **Modbus PLC Nodes**: Ports `5020`, `5021`, `5022`
- **Frontend (Vite Dev Server)**: Port `5173`

---

## Q&A Strategy (Panel Defense)
- **"How does it handle noise?"**: Explain the normalization (StandardScaler) and the robust temporal smoothing in the ST-GNN.
- **"Why GNN over Random Forest?"**: GNNs explicitly model the physical connections between buses, which is the "ground truth" of the grid.
- **"Can it run on edge hardware?"**: Mention the lightweight PyTorch inference engine designed for low-latency PLC/IED integration.
