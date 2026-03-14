# Vertex Fusion: Enhanced Future Development Roadmap

Based on the refined project assessment, the following tasks are organized into specialized development phases to transition Vertex Fusion toward a high-fidelity, production-ready Research Platform.

## 🚀 Phase 1: Distributed Infrastructure & Orchestration
- **Service Containerization**: Package frontend, backend, and simulation as Docker services.
- **Orchestration**: Deploy using `docker-compose` or a local Kubernetes cluster to demonstrate a scalable, production-style architecture.
- **Realistic Networking**: Extend SCADA emulation to include multi-device PLC nodes and simulate network artifacts such as communication delays and packet drops.

## 🧠 Phase 2: High-Fidelity Physics & Data Modeling
- **Advanced Telemetry Export**: Integrate deeper with Simulink to export bus-level physical measurements including phase angles, power flows, and frequency deviations.
- **Probabilistic Attack Modeling**: Shift from deterministic injections to stochastic attack patterns to improve model robustness.
- **Evidence-Based Labeling**: Transition from programmatic labeling to incorporating real-world labeled grid-cyber datasets (e.g., IEEE Dataport or PNNL).

## 🛡️ Phase 3: Spatial-Temporal AI & Continuous Learning
- **Topology-Aware GNN**: Construct bus-specific feature vectors so the ST-GNN learns authentic spatial dependencies inherent in the grid topology.
- **Automated Retraining Operations (MLOps)**:
    - Add validation scoring and automated model promotion logic (e.g., blue-green deployment of model weights).
    - Implement centralized metrics logging for all training runs.

## 🔍 Phase 4: Explainability & Decision Support
- **Operator-Centric Diagnostics**: Expand SHAP visualizations to include bus-level anomaly indicators.
- **Temporal Attribution**: Implement visualizations showing which specific time-intervals in the sliding window contributed most to an alert.
- **Staged Mitigation**: Move beyond binary "Tripping" to confidence-weighted protection decisions and staged response strategies.

## 📈 Phase 5: Analytics, Evaluation & Reporting
- **Post-Mortem Analytics**: Build a "Performance Analytics" panel featuring historical event playback and detection timelines.
- **Research Benchmarking**: Automate the generation of ROC curves, Precision/Recall plots, and Confusion Matrices to support academic reporting and thesis documentation.
- **Detection Latency Benchmarking**: Quantify the "Mean Time To Detection" across different attack intensities.
