import requests
import time
import sys

SIM_URL = "http://127.0.0.1:8000"

def test_protection_loop():
    print("🚀 Starting End-to-End Protection Logic Verification...")
    
    # 1. Ensure system is in NORMAL state
    print("Checking initial system state...")
    try:
        resp = requests.get(f"{SIM_URL}/metrics")
        state = resp.json()
        print(f"Initial Breaker Status: {state.get('breaker_status')}")
        
        if state.get('breaker_status') != "CLOSED":
            print("Resetting breaker to CLOSED...")
            requests.post(f"{SIM_URL}/protection", json={"action": "CLOSE", "target_bus": 1})
            time.sleep(1)
    except Exception as e:
        print(f"❌ Error connecting to simulation: {e}")
        sys.exit(1)

    # 2. Inject FDI Attack
    print("\n💉 Injecting FDI Attack...")
    try:
        requests.post(f"{SIM_URL}/attack", json={"attack_type": "FDI"})
    except Exception as e:
        print(f"❌ Error injecting attack: {e}")
        sys.exit(1)

    # 3. Poll for Breaker Trip
    print("⏳ Waiting for AI detection and automated protection (max 10s)...")
    for i in range(20):
        time.sleep(0.5)
        try:
            resp = requests.get(f"{SIM_URL}/metrics")
            state = resp.json()
            status = state.get('status', 'NORMAL')
            breaker = state.get('breaker_status', 'CLOSED')
            conf = state.get('confidence', 0.0)
            
            print(f"[{i+1}] Status: {status} | Breaker: {breaker} | Conf: {conf:.2f}")
            
            if breaker == "OPEN":
                print("\n✅ SUCCESS: Breaker TRIP detected upon FDI attack!")
                # Reset for safety
                requests.post(f"{SIM_URL}/attack", json={"attack_type": "None"})
                return True
        except Exception as e:
            print(f"Error polling: {e}")
            
    print("\n❌ FAILURE: Breaker did not trip within timeout.")
    return False

if __name__ == "__main__":
    if test_protection_loop():
        sys.exit(0)
    else:
        sys.exit(1)
