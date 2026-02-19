import time
import random
import sys

def demo_attack():
    print("🔥 CYBER-ATTACK DEMO SIMULATION 🔥")
    print("-----------------------------------")
    print("Target: IEEE 9-Bus System")
    print("Protocol: TCP/IP SCADA Bridge")
    print("Defense: ST-GNN AI Model")
    print("-----------------------------------\n")
    
    time.sleep(1)
    print("✅ Normal Operation... Voltage: 1.00 p.u. | Freq: 50.00 Hz")
    time.sleep(1)
    print("✅ Normal Operation... Voltage: 0.99 p.u. | Freq: 50.01 Hz")
    time.sleep(1)
    
    print("\n⚠️  INJECTING ATTACK VECTOR: FDI_VOLTAGE_SPIKE [Bus 5]...")
    time.sleep(1)
    
    for i in range(5):
        v = 1.15 + random.uniform(-0.01, 0.01)
        conf = 0.85 + (i * 0.03)
        print(f"📍 Bus 5 Voltage: {v:.2f} p.u. | AI Confidence: {conf*100:.1f}%")
        time.sleep(0.5)
        
    print("\n🚨 CRITICAL THRESHOLD BREACHED (>90%)")
    print("⚡ AI COMMAND SENT: TRIP_LINE_5")
    time.sleep(0.5)
    print("🛠️  MATLAB RESPONSE: Breaker 5 OPEN")
    time.sleep(0.5)
    
    print("\n✅ Fault Cleared. System Stabilizing...")
    print("   Bus 5 Voltage: 0.00 p.u. (Disconnected)")
    print("   System Frequency: 50.02 Hz")

if __name__ == "__main__":
    demo_attack()
