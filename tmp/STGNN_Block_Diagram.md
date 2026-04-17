# Vertex Fusion: ST-GNN & SCADA Framework Block Diagram

## Cyber-Physical Architecture

This diagram illustrates the flow from data acquisition in the physical power grid to high-level AI detection and real-time SCADA visualization.

```mermaid
graph TB
    subgraph "Physical & Simulation Layer"
        MATLAB["MATLAB/Simulink (Dynamic)"]
        Panda["Pandapower (Steady-State)"]
        Grid["IEEE 9-Bus Topology"]
        PLCs["Modbus TCP PLCs (Alpha, Beta, Gamma)"]
    end

    subgraph "Data Acquisition & Processing"
        Features["Feature Extraction: [V, I, P, Q, f, θ]"]
        Windowing["Sliding Window (T=10)"]
    end

    subgraph "AI/ML Module: ST-GNN Framework"
        STGNN{{"ST-GNN Model"}}
        
        subgraph "Spatial Component (GAT)"
            GAT1["GAT Layer 1 (Multi-head Attention)"]
            GAT2["GAT Layer 2 (Spatial Compression)"]
            Topo["Physical Adjacency Matrix Mapping"]
        end
        
        subgraph "Temporal Component (LSTM)"
            LSTM["LSTM Layer (Sequence Modeling)"]
            Hidden["Hidden State Fusion (128-dim)"]
        end
        
        Classifier["FC Dense Layers / Softmax"]
    end

    subgraph "SCADA & Orchestration"
        Control["Python SCADA Engine (scada.py)"]
        Inference["Deep Inference Engine"]
        Logic["Confidence-Based Mitigation Logic"]
    end

    subgraph "Interface & Visualization"
        UI["React SCADA Dashboard"]
        D3["D3.js Interactive Bus Diagram"]
        Alerts["Real-Time Threat Feed"]
    end

    %% Data Flow
    Grid --> MATLAB & Panda
    MATLAB & Panda --> PLCs
    PLCs -- "Modbus TCP" --> Features
    Features --> Windowing
    Windowing --> GAT1
    GAT1 --> GAT2
    Topo -.-> GAT1 & GAT2
    GAT2 --> LSTM
    LSTM --> Hidden
    Hidden --> Classifier
    Classifier -- "Prediction & Confidence" --> Inference
    Inference --> Logic
    Logic -- "Breaker Commands" --> MATLAB
    Inference --> Control
    Control --> UI
    UI --> D3
    Logic --> Alerts
```

## Component Descriptions

### 1. Physical & Simulation Layer
*   **Grid Topology**: The system operates on the standard IEEE 9-bus benchmark for transmission network analysis.
*   **Dual-Engine Co-Simulation**: 
    *   **MATLAB/Simulink**: Handles transient stability and dynamic response.
    *   **Pandapower**: Provides steady-state power flow verification.
*   **Modbus TCP PLCs**: Three virtual PLC nodes (`Alpha`, `Beta`, `Gamma`) simulate distributed network controllers.

### 2. AI/ML Module (ST-GNN Framework)
*   **Spatio-Temporal Fusion**: Unlike standard ML, this framework processes **spatial** (topology-aware) and **temporal** (sequence-aware) data simultaneously.
*   **Graph Attention (GAT)**: Focuses on the most topologically significant neighbors during a disturbance.
*   **LSTM Backbone**: Analyzes a sliding window of the last 10 grid states to identify subtle attack ramps.

### 3. SCADA & Mitigation
*   **Inference Engine**: Evaluates grid health in <15ms.
*   **Autonomous Logic**: Decides whether to issue an alarm or isolate specific buses (Selective Trip) based on AI confidence.

### 4. Interface & Visualization
*   **D3.js Bus Diagram**: A dynamic, real-time representation where cyber-physical state changes are reflected instantly for human operators.
