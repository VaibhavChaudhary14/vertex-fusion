import pandas as pd
import matplotlib.pyplot as plt
import os

LOG_FILE = "results_log.csv"

if not os.path.exists(LOG_FILE):
    print(f"Error: {LOG_FILE} not found. Run the realtime_server.py first to generate telemetry logs.")
    exit(1)

df = pd.read_csv(LOG_FILE)

# Create a clean IEEE style plot
plt.figure(figsize=(10, 5))
plt.plot(df["Score"], label='ST-GNN Attack Probability Score', color='blue', linewidth=1.5)
plt.axhline(y=0.9944, color='red', linestyle='--', linewidth=2, label='Detection Threshold (0.9944)')

# Aesthetic touch-ups
plt.title("Cyber-Physical Attack Detection Timeline", fontsize=14, fontweight='bold')
plt.xlabel("Time Step (Polling Interations)", fontsize=12)
plt.ylabel("Anomaly Probability Score", fontsize=12)
plt.ylim([-0.05, 1.05])
plt.grid(True, linestyle=':', alpha=0.7)
plt.legend(loc='lower right')
plt.tight_layout()

# Save for thesis/paper export
plt.savefig("thesis_attack_detection_graph.png", dpi=300)
print("Graph highly-resolution export saved as thesis_attack_detection_graph.png")

# Display
plt.show()
