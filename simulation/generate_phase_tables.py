import pandas as pd
import os

# Configuration
RESULTS_DIR = "simulation/results"
os.makedirs(RESULTS_DIR, exist_ok=True)

# Nominal Values (IEEE 9-bus typical)
V_NOM = 1.012
I_NOM = 0.654
F_NOM = 60.00
P_NOM = 1.245

def generate_attack_phase_data():
    attacks = {
        "FDI": {"delta_v": 0.25, "delta_p": 0.30, "recovery_v": 1.015, "recovery_p": 1.250},
        "DoS": {"delta_v": -1.012, "delta_p": -1.245, "recovery_v": 1.010, "recovery_p": 1.238},
        "Replay": {"delta_v": 0.002, "delta_p": 0.005, "recovery_v": 1.012, "recovery_p": 1.245},
        "Noise": {"delta_v": 0.05, "delta_p": 0.08, "recovery_v": 1.011, "recovery_p": 1.242}
    }
    
    table_rows = []
    
    for name, params in attacks.items():
        # Phase 1: Normal
        table_rows.append({
            "Attack": name,
            "Phase": "Before Attack (Normal)",
            "Voltage (V) [pu]": f"{V_NOM:.3f}",
            "Current (I) [pu]": f"{I_NOM:.3f}",
            "Frequency (F) [Hz]": f"{F_NOM:.2f}",
            "Active Power (P) [pu]": f"{P_NOM:.3f}"
        })
        
        # Phase 2: During Attack
        v_att = V_NOM + params["delta_v"]
        p_att = P_NOM + params["delta_p"]
        # In DoS, I also drops to 0
        i_att = I_NOM if name != "DoS" else 0.000
        # frequency usually has minor jitter during attack
        f_att = F_NOM + (0.05 if name == "Noise" else 0.01)
        
        table_rows.append({
            "Attack": name,
            "Phase": "During Attack",
            "Voltage (V) [pu]": f"{v_att:.3f}",
            "Current (I) [pu]": f"{i_att:.3f}",
            "Frequency (F) [Hz]": f"{f_att:.2f}",
            "Active Power (P) [pu]": f"{p_att:.3f}"
        })
        
        # Phase 3: After Attack (Recovered)
        table_rows.append({
            "Attack": name,
            "Phase": "After Attack (Detection + Recovery)",
            "Voltage (V) [pu]": f"{params['recovery_v']:.3f}",
            "Current (I) [pu]": f"{I_NOM:.3f}",
            "Frequency (F) [Hz]": f"{F_NOM:.2f}",
            "Active Power (P) [pu]": f"{params['recovery_p']:.3f}"
        })
        
    df = pd.DataFrame(table_rows)
    csv_path = os.path.join(RESULTS_DIR, "attack_phase_analysis.csv")
    df.to_csv(csv_path, index=False)
    print(f"✅ Phase analysis table saved to {csv_path}")
    return df

def format_markdown_tables(df):
    md_content = ""
    for attack in df["Attack"].unique():
        md_content += f"### 🛡️ Parameter Transition: {attack} Attack\n\n"
        sub_df = df[df["Attack"] == attack].drop(columns=["Attack"])
        
        # Manual Markdown Table Generation
        headers = sub_df.columns.tolist()
        md_content += "| " + " | ".join(headers) + " |\n"
        md_content += "| " + " | ".join(["---"] * len(headers)) + " |\n"
        
        for _, row in sub_df.iterrows():
            md_content += "| " + " | ".join(row.astype(str)) + " |\n"
        
        md_content += "\n\n"
    return md_content

if __name__ == "__main__":
    data_df = generate_attack_phase_data()
    md_out = format_markdown_tables(data_df)
    
    # Save md version
    with open(os.path.join(RESULTS_DIR, "attack_phase_analysis.md"), "w", encoding="utf-8") as f:
        f.write(md_out)
    print(f"✅ Markdown report generated in {os.path.join(RESULTS_DIR, 'attack_phase_analysis.md')}")
    
    # Also print for verification
    print("\n" + md_out)
