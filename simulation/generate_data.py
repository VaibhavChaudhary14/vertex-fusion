import numpy as np
import pandas as pd
import os

def generate_dataset():
    # Adjust this path for the new structure
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(BASE_DIR, "datasets")
    os.makedirs(DATA_DIR, exist_ok=True)

    csv_path = os.path.join(DATA_DIR, "smartgrid_synthetic.csv")

    # Simulation parameters
    num_buses = 6                 # 6-bus system
    num_samples = 2000            # time steps
    time = np.arange(num_samples) # time index

    print("Generating synthetic smart grid data...")
    print(f"Samples: {num_samples}, Buses: {num_buses}")
    print(f"Data will be saved to: {csv_path}")

    # ----------- PHYSICAL LAYER -----------
    # Voltage (p.u.): nominal 1.0 ± 0.02
    voltages = 1 + 0.02 * np.random.randn(num_samples, num_buses)

    # Current (A): around 10 ± 2
    currents = 10 + 2 * np.random.randn(num_samples, num_buses)

    # Power (MW): load fluctuation profile
    base_load = np.linspace(50, 70, num_samples).reshape(-1, 1)
    power = base_load + np.random.randn(num_samples, num_buses) * 2

    # Frequency (Hz): 50 ± small oscillation
    frequency = 50 + 0.05 * np.sin(0.01 * time) + 0.02 * np.random.randn(num_samples)

    # ----------- CYBER LAYER -----------
    packet_delay = np.random.uniform(20, 40, size=num_samples)
    packet_loss = np.random.uniform(0, 2, size=num_samples)

    # Attack labels (0 = Normal, 1 = FDI, 2 = DoS, 3 = Replay)
    attack_label = np.zeros(num_samples, dtype=int)

    # Attack windows
    fdi_start, fdi_end = 400, 600
    dos_start, dos_end = 1000, 1200
    replay_start, replay_end = 1600, 1750

    # Inject attacks
    # FDI: False Data Injection – change voltage readings
    voltages[fdi_start:fdi_end] += np.random.uniform(0.05, 0.1)
    attack_label[fdi_start:fdi_end] = 1

    # DoS: Denial of Service – increase packet delay and loss
    packet_delay[dos_start:dos_end] += np.random.uniform(100, 200)
    packet_loss[dos_start:dos_end] += np.random.uniform(10, 20)
    attack_label[dos_start:dos_end] = 2

    # Replay: reusing old voltage data
    voltages[replay_start:replay_end] = voltages[200:350]
    attack_label[replay_start:replay_end] = 3

    # ----------- COMBINE ALL FEATURES -----------
    data = {
        "time": time,
        "frequency": frequency,
        "packet_delay": packet_delay,
        "packet_loss": packet_loss,
        "attack_label": attack_label
    }

    # Add voltage, current, and power per bus
    for i in range(num_buses):
        data[f"Bus{i+1}_V"] = voltages[:, i]
        data[f"Bus{i+1}_I"] = currents[:, i]
        data[f"Bus{i+1}_P"] = power[:, i]

    df = pd.DataFrame(data)

    # ----------- SAVE TO CSV -----------
    df.to_csv(csv_path, index=False)
    print("✅ Synthetic Smart Grid dataset successfully created!")
    print(f"File saved at: {csv_path}")
    print(f"Total rows: {len(df)} | Columns: {len(df.columns)}")

if __name__ == "__main__":
    generate_dataset()
