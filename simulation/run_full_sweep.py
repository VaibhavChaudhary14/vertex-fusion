import requests
import time
import sys

BASE_URL = "http://localhost:8000"

def trigger_attack(attack_type, target_bus):
    print(f"[SWEEP] Testing Attack: {attack_type} on Bus {target_bus}...")
    try:
        resp = requests.post(f"{BASE_URL}/attack", json={
            "attack_type": attack_type,
            "target_bus": target_bus
        })
        time.sleep(1.0) # Propagation buffer
        return resp.json()
    except Exception as e:
        print(f"[ERROR] Failed to trigger attack: {e}")
        return None

def export_results():
    print("[SWEEP] Finalizing session and exporting to .mat...")
    try:
        resp = requests.post(f"{BASE_URL}/metrics/export")
        print(f"[SUCCESS] {resp.json().get('message')}")
    except Exception as e:
        print(f"[ERROR] Export failed: {e}")

def run_sweep():
    print("🚀 Starting Full Performance Sweep (Approx 2 Minutes)")
    print("--------------------------------------------------")
    
    # 1. Normal State
    print("[SWEEP] Starting NORMAL Baseline (45s)...")
    trigger_attack("None", 0)
    time.sleep(45)
    
    # 2. FDI Attack
    trigger_attack("FDI", 4)
    time.sleep(45)
    
    # 3. DoS Attack
    trigger_attack("DoS", 7)
    time.sleep(45)
    
    # 4. Replay Attack
    trigger_attack("Replay", 9)
    time.sleep(45)
    
    # 5. Clear and Export
    print("[SWEEP] Sweep complete. Clearing attacks...")
    trigger_attack("None", 0)
    time.sleep(5)
    
    export_results()
    print("--------------------------------------------------")
    print("✅ Full Matrix Data Collected!")
    print("Now run 'generate_performance_plots' in MATLAB.")

if __name__ == "__main__":
    run_sweep()
