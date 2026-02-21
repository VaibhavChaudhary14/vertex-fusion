# Vertex Fusion: Presentation Slide Content

### Slide 1: Title Slide
- **Main Title**: Vertex Fusion
- **Subtitle**: A Next-Generation Cyber-Physical Digital Twin for Smart Grid Resilience
- **Visuals**: Futuristic grid schematic + branding.

### Slide 2: The Modern Grid Vulnerability
- **Header**: Why are we here?
- **Points**:
  - Increasing complexity of Smart Grids.
  - Vulnerability of SCADA/Modbus protocols.
  - Stealthy attacks: FDI, DoS, and Replay.
- **Visual**: Alert symbols over a grid map.

### Slide 3: Vertex Fusion: The Solution
- **Header**: Conceptual Framework
- **Points**:
  - Digital Twin of the IEEE 9-bus system.
  - Real-time Cyber-Physical integration.
  - AI-driven detection + Automated protection.
- **Visual**: 3D Digital Twin icon connecting to a Physical sensor.

### Slide 4: System Architecture
- **Header**: High-Level Architecture
- **Components**:
  - **Simulation**: Pandapower / MATLAB Simulink.
  - **Communication**: Modbus TCP / TCP Sockets.
  - **AI Layer**: Spatio-Temporal Graph Neural Networks (ST-GNN).
  - **Interface**: React Dashboard.
- **Visual**: Block diagram showing data flow from Simulator -> AI -> UI.

### Slide 5: The AI Brain: ST-GNN
- **Header**: Spatio-Temporal Feature Learning
- **Points**:
  - **Spatial**: GAT (Graph Attention) models the bus connections.
  - **Temporal**: Conv1D models the time-series window (10 steps).
  - **Benefits**: Detects correlations that traditional AI misses.
- **Visual**: GNN diagram (Nodes and Edges) with temporal windows.

### Slide 6: Real-Time Attack Simulation
- **Header**: Defining the Threats
- **Definitions**:
  - **FDI**: Bias injection into sensor values.
  - **DoS**: Freezing or dropping telemetry packets.
  - **Replay**: Injecting previous "normal" windows during an actual event.
- **Visual**: Waves showing poisoned vs. original data.

### Slide 7: Explainable AI (XAI)
- **Header**: Peering into the Black Box
- **Points**:
  - Saliency Gradient Mapping.
  - Feature Importance Ranking.
  - Logic: "The AI flagged FDI because Voltage magnitude at Bus 7 deviated from the spatial norm."
- **Visual**: A bar chart of feature importance (e.g., Bus 5 voltage, Bus 2 current).

### Slide 8: Automated Logic & Mitigation
- **Header**: Closing the Loop
- **Points**:
  - Confidence-based decision making (>90% threshold).
  - Automated "TRIP" vs. "ALARM" actions.
  - Hardware-in-the-Loop (HIL) command feedback.
- **Visual**: A red "TRIP" signal on a circuit breaker.

### Slide 9: Performance Metrics
- **Header**: Validation and Results
- **Points**:
  - High AUC/ROC scores for attack detection.
  - Low Latency (<50ms) suitable for real-time grid protection.
  - Robustness against sensor noise.
- **Visual**: ROC Curve chart.

### Slide 10: Conclusion & Vision
- **Header**: The Future of Secure Energy
- **Points**:
  - Scaling to utility-grade grids (IEEE 118+).
  - Integration with Multi-Agent Systems.
  - "Securing the backbone of modern civilization."
- **Visual**: "Vertex Fusion" logo with a "Secure" badge.
