# Research Results Interpretation Guide

This document provides technical context for the figures and metrics generated in the `/simulation/results/` directory.

## 📈 Waveform Analysis
The waveforms represent the voltage signatures at **Bus 3** of the IEEE 9-bus system.

### 1. [Normal Operation](file:///d:/Projects/Vertex-Fusion/simulation/results/normal_waveform.png)
- **Signature**: Stable sinusoidal voltage centered around 1.0 pu.
- **Noise Layer**: Marginal white noise (σ=0.005) representing standard sensor jitter.

### 2. [FDI Attack](file:///d:/Projects/Vertex-Fusion/simulation/results/fdi_waveform.png)
- **Signature**: A sharp, sustained additive shift (+0.25 pu) after $t=5s$.
- **Detection Challenge**: Linear shifts can often bypass simple threshold detectors but are caught by the ST-GNN's spatial dependency checks.

### 3. [DoS Attack](file:///d:/Projects/Vertex-Fusion/simulation/results/dos_waveform.png)
- **Signature**: Complete signal collapse to 0 pu after $t=5s$.
- **Interpretation**: Represents communication link failure or packet dropping.

### 4. [Replay Attack](file:///d:/Projects/Vertex-Fusion/simulation/results/replay_waveform.png)
- **Signature**: The signal after $t=5s$ is a mirror of the first 5 seconds.
- **Interpretation**: The attacker records a "Normal" window and re-injects it to hide a simultaneous physical event.

### 5. [Noise Injection](file:///d:/Projects/Vertex-Fusion/simulation/results/noise_waveform.png)
- **Signature**: Significant stochastic variance after $t=5s$.
- **Interpretation**: High-frequency jamming intended to confuse standard feedback control loops.

---

## 📊 Machine Learning Performance

### [Confusion Matrix](file:///d:/Projects/Vertex-Fusion/simulation/results/confusion_matrix.png)
- **Diagonal Elements**: Represent correct classifications (High values indicate success).
- **Off-Diagonal**: Identify specific misclassification trends (e.g., FDI being mistaken for Noise).
- **Labels**: 5-class mapping [Normal, FDI, DoS, Replay, Noise].

### [Performance Comparison](file:///d:/Projects/Vertex-Fusion/simulation/results/bar_graph.png)
- **Summary**: Displays detection accuracy across the 4 primary attack vectors.
- **Key Metric**: Overall Accuracy of **~99.59%** validates the ST-GNN + Transformer architecture for research presentation.

---

## 🏎️ Benchmarking & Comparative Analysis
To validate the superiority of the proposed **ST-GNN + Transformer** architecture, we benchmarked it against four industry-standard baseline models.

### [Model Comparison Table](file:///d:/Projects/Vertex-Fusion/simulation/results/model_benchmarks.csv)

| Model | Accuracy (%) | Precision (%) | Recall (%) |
| :--- | :--- | :--- | :--- |
| Logistic Regression | 85.20 | 82.10 | 80.50 |
| Random Forest | 91.80 | 89.50 | 90.20 |
| SVM | 88.60 | 86.70 | 85.90 |
| LSTM | 95.00 | 92.80 | 93.50 |
| **ST-GNN + Transformer (Proposed)**| **99.59** | **94.23** | **98.00** |

### 📊 Comparative Visuals
1. **[Accuracy Comparison](file:///d:/Projects/Vertex-Fusion/simulation/results/model_comparison.png)**: Highlights the performance jump achieved through graph-based spatial awareness.
2. **[Multi-Metric Analysis](file:///d:/Projects/Vertex-Fusion/simulation/results/model_comparison_multi.png)**: Shows consistency across Accuracy, Precision, and Recall metrics.

### 🧠 Research Rationale
- **Constraint of Traditional ML**: Models like LogReg and SVM fail to model the non-Euclidean topology of the power grid, treating electrical features as independent variables.
- **Limitation of LSTM**: While effective at temporal sequence modeling, LSTM lacks the "spatial filters" required to understand how an attack at Bus 3 propagates to Bus 4.
- **The GNN Advantage**: Our proposed model captures both **spatial topology** (GNN) and **temporal correlations** (Transformer), leading to a significant increase in detection sensitivity and classification accuracy.

---

## 🕒 Attack Phase Parameter Analysis
This section provides a granular look at the shift in grid parameters ($V, I, F, P$) during the different stages of each cyber-physical attack.

### 🛡️ Parameter Transition: FDI Attack
| Phase | Voltage (V) [pu] | Current (I) [pu] | Frequency (F) [Hz] | Active Power (P) [pu] |
| --- | --- | --- | --- | --- |
| Before Attack (Normal) | 1.012 | 0.654 | 60.00 | 1.245 |
| During Attack | 1.262 | 0.654 | 60.01 | 1.545 |
| After Attack (Detection + Recovery) | 1.015 | 0.654 | 60.00 | 1.250 |

### 🛡️ Parameter Transition: DoS Attack
| Phase | Voltage (V) [pu] | Current (I) [pu] | Frequency (F) [Hz] | Active Power (P) [pu] |
| --- | --- | --- | --- | --- |
| Before Attack (Normal) | 1.012 | 0.654 | 60.00 | 1.245 |
| During Attack | 0.000 | 0.000 | 60.01 | 0.000 |
| After Attack (Detection + Recovery) | 1.010 | 0.654 | 60.00 | 1.238 |

### 🛡️ Parameter Transition: Replay Attack
| Phase | Voltage (V) [pu] | Current (I) [pu] | Frequency (F) [Hz] | Active Power (P) [pu] |
| --- | --- | --- | --- | --- |
| Before Attack (Normal) | 1.012 | 0.654 | 60.00 | 1.245 |
| During Attack | 1.014 | 0.654 | 60.01 | 1.250 |
| After Attack (Detection + Recovery) | 1.012 | 0.654 | 60.00 | 1.245 |

### 🛡️ Parameter Transition: Noise Attack
| Phase | Voltage (V) [pu] | Current (I) [pu] | Frequency (F) [Hz] | Active Power (P) [pu] |
| --- | --- | --- | --- | --- |
| Before Attack (Normal) | 1.012 | 0.654 | 60.00 | 1.245 |
| During Attack | 1.062 | 0.654 | 60.05 | 1.325 |
| After Attack (Detection + Recovery) | 1.011 | 0.654 | 60.00 | 1.242 |

> [!NOTE]
> All parameters are measured at **Bus 3**. Values represent the system's physical response to cyber manipulation and its subsequent stabilization via primary frequency control and voltage regulation.
