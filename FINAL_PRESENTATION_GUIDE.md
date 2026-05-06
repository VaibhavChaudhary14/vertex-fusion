# 🎯 Vertex-Fusion: Final Presentation Run Guide

Follow these exact steps to demonstrate the full system (MATLAB + AI Engine + Dashboard) simultaneously.

## 🟢 Step 1: Master Services (Active Now)
The correct services are now running to ensure the Dashboard and MATLAB are synchronized.
- **Simulation Master (Port 8000 & 5000):** This handles the Dashboard data AND the MATLAB connection.
- **Web Dashboard (Port 5050):** The UI is ready.

## 🟢 Step 2: Open the Dashboard
Open your browser to:
👉 **[http://localhost:5050](http://localhost:5050)**
*You should now see "System Status: Normal" and live waveforms (even if MATLAB isn't running yet, it uses a background feeder).*

## 🔵 Step 3: Launch MATLAB Simulation
This will take over the data stream from the background feeder.
1. Open **MATLAB**.
2. Go to folder: `D:\Projects\Vertex-Fusion\9 Bus Major`.
3. Open the Simulink model file.
4. **Action:** Click the green **Run** button in Simulink.
   - *Verification:* The Dashboard will show "MATLAB CONNECTED" or waveforms will update with higher precision.

## 🔴 Step 4: Demonstrate Attacks (Simultaneously)
1. Go to the **Dashboard** (localhost:5050).
2. Open the **Attack Injection Panel**.
3. Select **FDI** and click **Inject**.
4. **Watch the Result:**
   - The **Waveforms** will spike or flatline immediately.
   - The **AI Prediction** will change to "🚨 FDI DETECTED".
   - The **Heatmap** will light up the targeted Bus.

---

### 🛠 Troubleshooting (The "One-Click" Restart)
If the dashboard says "Offline":
1. Open a terminal and run: `python simulation/main.py`
2. Open another and run: `npm run dev`

*The system is now fully synchronized and ready for the presentation.*
