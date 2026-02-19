# ⚡ Digital Twin Setup & Execution Guide

This guide details how to build the **IEEE 9-Bus Simscape Model**, integrate it with the Python AI, and run the full closed-loop Digital Twin.

---

## 🟢 Part 1: MATLAB/Simscape Setup (The Physical Twin)

### 1. Build the IEEE 9-Bus Model
1.  Open **MATLAB** and launch **Simulink**.
2.  Create a **New Model** and save it as `IEEE9_Bus_Twin.slx` inside the `matlab/` folder.
3.  Open the **Simscape Library Browser**.
4.  **Drag & Drop Components**:
    *   **Generators**: 3x `Synchronous Machine` (Simscape > Electrical > Electromechanical > Machines).
    *   **Buses**: 9x `Busbar` (Simscape > Electrical > Connectors).
    *   **Lines**: 9x `Pi Section Line` (Simscape > Electrical > Passive).
    *   **Loads**: 3x `Three-Phase Parallel RLC Load`.
    *   **Ground**: `Electrical Reference` connected to neutral points.
    *   **Solver**: `Solver Configuration` block (connect to the circuit).

### 2. Configure Simulation
*   **Solver Type**: `Continuous` (ODE3 (Bogacki-Shampine) or ODE45).
*   **Max Step Size**: `1e-3` (1ms) or `1e-2` (10ms) for stability.
*   **Phasor Mode**: Optional, but `Continuous` is better for transient attacks.

### 3. Add Measurements (The "Sensors")
At **EACH of the 9 Buses**:
1.  Add a **`Three-Phase V-I Measurement`** block.
2.  Add a **`PLL (3-Phase)`** block to measure Frequency from the Voltage signal.
3.  Add **`Calculate P & Q`** blocks to get Active/Reactive power.
4.  **Mux Signals**: Combine the outputs into single vectors:
    *   `V_all` (9x1)
    *   `I_all` (9x1)
    *   `P_all` (9x1)
    *   `Q_all` (9x1)
    *   `F_all` (9x1)

### 4. Add Breakers (The "Actuators")
1.  Insert **`Three-Phase Breaker`** blocks on critical lines (e.g., Line 5-7, Line 8-9).
2.  **Naming**: Name them clearly, e.g., `Breaker_Line_5`.
3.  **Control**: Set "Breaker control" to `External`. This creates a control port.

### 5. Integrate the TCP Bridge (The "SCADA Integration")
1.  Add a **`MATLAB Function`** block to your model.
2.  Double-click it and paste the code from **`matlab/send_data.m`**.
3.  **Connect Inputs**:
    *   Connect `V_all`, `I_all`, `P_all`, `Q_all`, `F_all` vectors to the function inputs.
    *   Connect Breaker Status signals (0/1) to `BreakerStatus`.
4.  **Connect functionality**:
    *   The code inside `send_data.m` uses `set_param` to open breakers. Ensure the **Block Paths** in `send_data.m` match your Simulink names (e.g., `IEEE9/Breaker_Line_5`).

---

## 🟢 Part 2: Data Generation & Training (Offline)

Before the AI can detect attacks, it must learn what "Normal" and "Attacked" grids look like.

### 1. Generate Dataset
1.  In Simulink, simulate the following scenarios manually or via script:
    *   **Normal**: 10 seconds of steady state.
    *   **FDI Attack**: Manually gain/offset a Measurement signal (use a Slider Gain block).
    *   **DoS Attack**: Disconnect a measurement line (Output 0).
    *   **Fault**: Create a short circuit (Three-Phase Fault block).
2.  Log the `V`, `I`, `P`, `Q`, `F` simulation data to the MATLAB Workspace.
3.  Export to CSV:
    ```matlab
    % In MATLAB Command Window
    data_matrix = [Time, V, I, P, Q, F, Label]; 
    writematrix(data_matrix, 'data/dataset_9bus_dynamic.csv');
    ```
    *   **Label Column**: 0=Normal, 1=FDI, 2=DoS, 3=Replay.
    *   Make sure columns match `train_9bus_model.py` expectations (Time first, then features, Label last).

### 2. Train the AI Model
1.  Open your terminal in **VS Code**.
2.  Run the training script:
    ```bash
    python train_9bus_model.py
    ```
3.  **Success**: This will create `data/stgnn_9bus.pth` and `data/scaler_9bus.joblib`.

---

## 🟢 Part 3: Running the Full Digital Twin (Real-Time)

Now that the model is trained and Simscape is built, run the full loop.

### Step 1: Start the Backend (Brain)
The backend hosts the AI Client and the Frontend API.
```bash
# Terminal 1
python -m simulation.main
```
*   You should see: `🚀 Digital Twin Client Thread Started`
*   It will keep retrying connection to MATLAB until Step 2 is active.

### Step 2: Start the Frontend (Visualization)
```bash
# Terminal 2
cd frontend
npm run dev
```
*   Open browser to `http://localhost:5173`.
*   Navigate to **Digital Twin** from the sidebar.
*   Status should be: **OFFLINE / SIMULATION**.

### Step 3: Start the MATLAB Simulation (Physical Twin)
1.  Go to Simulink.
2.  Click **Run**.
3.  **Observation**:
    *   MATLAB Console: `✅ TCP Server started on port 5000`.
    *   Python Terminal: `✅ Connected to MATLAB Server`.
    *   Frontend Dashboard: Status changes to **TWIN CONNECTED** (Green). Live data appears.

### Step 4: Test Closed-Loop Protection
1.  **Inject Attack (Simscape)**: Manually trigger a Fault or modify a Measurement gain in Simulink.
    *   *Alternative*: Use the "Attack Request" API if you wired Simscape parameters to be controlled by Python (Advanced).
2.  **Observe**:
    *   **Frontend**: Confidence graph spikes. Status turns **RED**.
    *   **Action**: If Confidence > 90%, Python sends `TRIP_LINE_5`.
    *   **Simscape**: The Breaker block opens physically. Power flow changes.
    *   **Recovery**: Grid stabilizes (or blacks out if unstable!).

---

## 🔧 Troubleshooting

*   **Connection Refused**: Ensure MATLAB is running and `send_data` block is executing (check step size).
*   **Shape Mismatch**: Ensure Simscape 9 buses * 5 features matches the Python expected 54 features.
*   **Simscape Slow**: Use `Accelerator` mode or increase step size to `1e-3`.
