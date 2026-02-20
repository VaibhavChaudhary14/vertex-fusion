import socket
import numpy as np
import time

def mock_matlab_client():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    print("Connecting to Python TCP Server (127.0.0.1:5000)...")
    try:
        sock.connect(("127.0.0.1", 5000))
        print("Connected.")
        
        # Send 11 arrays of 18 features (double/float64) to fill the 10-window buffer + trigger inference
        for i in range(11):
            # Phase 9: IEEE 9-bus transmits 54 features (9 nodes * 6 features per node)
            data = np.random.uniform(220, 240, 54).astype(np.float64)
            print(f"Sending 54-feature packet {i+1}...")
            sock.sendall(data.tobytes())
            
            if i >= 9:
                 # Real MATLAB will only read 4 bytes for commands (e.g. "TRIP", "ALRM", "NORM")
                 response = sock.recv(4)
                 print(f"MATLAB Received Command: {response.decode('utf-8')}")
                 
            time.sleep(0.5)
            
    except ConnectionRefusedError:
        print("Connection refused. Make sure simulation is running.")
    finally:
        sock.close()
        print("Mock MATLAB disconnected.")

if __name__ == "__main__":
    mock_matlab_client()
