import numpy as np
import pandas as pd
import os

def generate_dataset():
    # Adjust this path for the new structure
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(BASE_DIR, "datasets")
    os.makedirs(DATA_DIR, exist_ok=True)

    csv_path = os.path.join(DATA_DIR, "ieee9_telemetry.csv")

    # Simulation parameters for IEEE 9-Bus
    num_buses = 9                 # Physical IEEE 9-Bus
    num_samples = 3000            # More samples for better training
    time = np.arange(num_samples) # time index

    print("Generating IEEE 9-Bus synthetic data (54 features)...")
    print(f"Samples: {num_samples}, Buses: {num_buses}")

    # ----------- PHYSICAL LAYER (9 Buses) -----------
    # 6 features per bus: [V_mag, V_ang, P, Q, Freq, I_mag]
    
    # Voltage (p.u.): nominal 1.0 ± 0.02
    v_mag = 1 + 0.02 * np.random.randn(num_samples, num_buses)
    v_ang = np.random.uniform(-0.1, 0.1, size=(num_samples, num_buses))
    
    # Power (MW): nominal 50 ± 10
    active_p = 50 + 10 * np.random.randn(num_samples, num_buses)
    reactive_q = 20 + 5 * np.random.randn(num_samples, num_buses)
    
    # Frequency (Hz): 50 ± small oscillation
    frequency = 50 + 0.05 * np.sin(0.01 * time).reshape(-1, 1) + 0.02 * np.random.randn(num_samples, num_buses)
    
    # Current (A): around 100 ± 20
    i_mag = 100 + 20 * np.random.randn(num_samples, num_buses)

    # Attack labels (0 = Normal, 1 = FDI, 2 = DoS, 3 = Replay)
    attack_label = np.zeros(num_samples, dtype=int)

    # Inject FDI attacks (Buses 1, 5, 9)
    fdi_start, fdi_end = 400, 700
    v_mag[fdi_start:fdi_end, [0, 4, 8]] += np.random.uniform(0.1, 0.2)
    attack_label[fdi_start:fdi_end] = 1

    # Inject DoS (All buses show unstable frequency & voltage)
    dos_start, dos_end = 1200, 1500
    frequency[dos_start:dos_end, :] += np.random.uniform(0.5, 1.0)
    v_mag[dos_start:dos_end, :] -= 0.1
    attack_label[dos_start:dos_end] = 2

    # Inject Replay (Buses 4, 5, 6)
    replay_start, replay_end = 2200, 2500
    v_mag[replay_start:replay_end, 3:6] = v_mag[100:400, 3:6]
    attack_label[replay_start:replay_end] = 3

    # ----------- COMBINE ALL FEATURES -----------
    # Columns will be: Bus1_V, Bus1_Phi, Bus1_P, Bus1_Q, Bus1_F, Bus1_I ... Bus9_I, attack_label
    data_dict = {}
    for i in range(num_buses):
        b = i + 1
        data_dict[f"Bus{b}_V"] = v_mag[:, i]
        data_dict[f"Bus{b}_Phi"] = v_ang[:, i]
        data_dict[f"Bus{b}_P"] = active_p[:, i]
        data_dict[f"Bus{b}_Q"] = reactive_q[:, i]
        data_dict[f"Bus{b}_F"] = frequency[:, i]
        data_dict[f"Bus{b}_I"] = i_mag[:, i]

    data_dict["attack_label"] = attack_label
    df = pd.DataFrame(data_dict)

    # ----------- SAVE TO CSV -----------
    df.to_csv(csv_path, index=False)
    print("[SUCCESS] IEEE 9-Bus dataset created: " + csv_path)
    print(f"Total features: {len(df.columns) - 1} (+ label)")

if __name__ == "__main__":
    generate_dataset()
