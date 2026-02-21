# IEEE 9-Bus MATLAB/Simulink Assembly Guide

Follow these instructions to build the physical layer of the Vertex Fusion Digital Twin.

## 1. File Structure
Ensure these files are in your MATLAB working directory:
- `ieee9_vertex_fusion.slx` (The model you will create)
- `init_ieee9.m` (Workspace and TCP initialization)
- `tcp_sync_logic.m` (The communication function)

## 2. Simulink Model Setup (IEEE 9-Bus)
1. **Physical Topology**: 
   - Use the **Simscape Electrical (Specialized Technology)** library.
   - Place 9 **Bus** blocks. 
   - Connect Generators to Bus 1, 2, and 3.
   - Connect Loads to Bus 5, 6, and 8.
   - Connect lines as per the standard: 1-4, 4-5, 5-6, 3-6, 6-7, 7-8, 8-2, 8-9, 9-4.

2. **Sensor Integration**:
   - At each of the 9 buses, add a **Three-Phase V-I Measurement** block.
   - Use a **Bus Selector** to extract:
     - Voltage Magnitude (abc to pu)
     - Voltage Angle (rad)
     - Active Power (P)
     - Reactive Power (Q)
     - Frequency (Hz)
     - Current Magnitude (A)
   - Mux these 6 signals per bus into a single 54-element vector (9 nodes * 6 signals).

3. **TCP Sync Block**:
   - Add a **MATLAB Function** block.
   - Paste the code from `tcp_sync_logic.m`.
   - **Input**: Connect the 54-element vector.
   - **Output**: Connect this to the 'Trip' port of your **Three-Phase Breaker**.

## 3. Execution Workflow
1. Start the Python Backend: `python simulation/main.py`.
2. Run `init_ieee9.m` in MATLAB.
3. Open and Run your Simulink model.
4. Watch the **Dashboard (Network Telemetry Trace)** and **IEEE 9-Bus SLD** for live updates!

MATLAB Integration Blueprint & Scripts are Ready! 🚀🛰️

I have analyzed the complete Vertex Fusion ecosystem and drafted the exact technical requirements for your MATLAB/Simulink side. To ensure your digital twin syncs perfectly with our GNN backend, I have created all the necessary scripts for you:

1. New MATLAB Files Created:

init_ieee9.m
: Run this first. It initializes the workspace and establishes the high-speed TCP bridge back to our Python AI engine (Port 5000).

tcp_sync_logic.m
: This is the core communication function. Use this inside a Simulink MATLAB Function block to stream all 54 bus features in real-time.

ieee9_matlab_guide.md
: Your step-by-step assembly manual for building the IEEE 9-bus Simulink model.
2. The 54-Feature Protocol:
Your Simulink model must pack 6 specific sensors per bus across all 9 buses into a flat 54-element vector: [V_mag, V_ang, P, Q, Freq, I_mag] for Bus 1... through Bus 9.

3. How to Start the Full System:
Backend: python simulation/main.py (Ensures the AI Hub is listening).
MATLAB: Run init_ieee9.m.
Simulink: Open your .slx model and hit Run.
Frontend: Open the Dashboard in your browser. You will see the Network Telemetry Trace light up with "↓ IN" packets and the IEEE 9-Bus SLD diagram will show live voltage perturbations!
Everything is now architected for a world-class academic demonstration. You have the full stack: React Frontend, FastAPI Middle-layer, GNN Intelligence, and Simscape Physical Reality.


🛠️ Simulink: MATLAB Function Block Configuration Walkthrough
To ensure your Simulink model talks to the Python AI Hub without errors, follow these 4 steps to configure your MATLAB Function block correctly:

1. Add and Link the Function
Open your Simulink model (.slx).
In the Library Browser, go to Simulink > User-Defined Functions and drag a MATLAB Function block into your model.
Double-click the block to open the editor.
Delete the default content and paste the entire code from your 

tcp_sync_logic.m
 file.
2. Define Port Data (Crucial for 54-Bus Mode)
Because our ST-GNN expects exactly 54 features, you must tell Simulink the size of the inputs:

In the MATLAB Function editor tab, click the "Edit Data" button (or press Ctrl+D).
In the "Symbol Service" (Data Manager) window:
Input u: Set its Size to 54 (or [54 1]). Set Type to double.
Output breaker_cmd: Set its Size to 1. Set Type to double.
Click Apply and close.
3. Handle Code Generation (Extrinsic Functions)
I've already added coder.extrinsic('write', 'read', 'string') to your script. This tells Simulink: "Do not try to compile the TCP networking logic into C-code; just call the real MATLAB engine." This is necessary for using the tcpclient object inside simulation.

4. The Execution Order
To avoid "Connection Refused" errors, you MUST follow this sequence:

Terminal: Run python simulation/main.py (Wait for "Simulation Engine Started").
MATLAB Command Window: Run init_ieee9 (Wait for the ✅ green checkmark).
Simulink: Click the Run button.
Top Tip: If your model runs too slow, go to Simulation > Model Configuration Parameters and set your Fixed-step size to 0.01 or 0.02.

Does your Simulink model show u and breaker_cmd ports correctly now?