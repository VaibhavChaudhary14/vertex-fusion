import pandapower as pp
import pandapower.networks as pn
import pandas as pd
import numpy as np

def create_3bus_grid():
    # Create an empty network
    net = pp.create_empty_network()

    # Create buses
    b1 = pp.create_bus(net, vn_kv=110, name="Bus 1")
    b2 = pp.create_bus(net, vn_kv=110, name="Bus 2")
    b3 = pp.create_bus(net, vn_kv=110, name="Bus 3")

    # Create external grid connection at Bus 1
    pp.create_ext_grid(net, bus=b1, vm_pu=1.02, name="Grid Connection")

    # Create loads
    pp.create_load(net, bus=b2, p_mw=10, q_mvar=2, name="Load Bus 2")
    pp.create_load(net, bus=b3, p_mw=10, q_mvar=2, name="Load Bus 3")

    # Create lines (Ring topology)
    pp.create_line(net, from_bus=b1, to_bus=b2, length_km=10, std_type="NA2XS2Y 1x240 RM/25 12/20 kV", name="Line 1-2")
    pp.create_line(net, from_bus=b2, to_bus=b3, length_km=10, std_type="NA2XS2Y 1x240 RM/25 12/20 kV", name="Line 2-3")
    pp.create_line(net, from_bus=b3, to_bus=b1, length_km=10, std_type="NA2XS2Y 1x240 RM/25 12/20 kV", name="Line 3-1")

    return net

def run_power_flow(net=None):
    if net is None:
        net = create_3bus_grid()
    
    try:
        pp.runpp(net)
        
        # Extract results
        results = {
            "buses": net.res_bus.to_dict(orient="records"),
            "lines": net.res_line.to_dict(orient="records"),
            "loads": net.res_load.to_dict(orient="records")
        }
        return results
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    net = create_3bus_grid()
    print(run_power_flow(net))
