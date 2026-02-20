import torch
import numpy as np
import shap
import pandas as pd
import os
import sys

# Fix Import
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from simulation.stgnn_model import STGNN

# Config
DATA_DIR = "../data/processed"
MODEL_PATH = "../models/stgnn_ieee9.pth"
OUTPUT_FILE = "../data/shap_feature_importance.csv"

def explain_model():
    print("🧠 Generating SHAP Explanations...")
    
    # Load Data
    try:
        X = np.load(os.path.join(DATA_DIR, "X_windows.npy"))
    except FileNotFoundError:
        print("❌ Data not found.")
        return
        
    # Use a subset for background (SHAP is slow)
    # Flatten Windows for simplified tabular interpretation or use DeepExplainer
    # Since our model is PyTorch GNN, we use DeepExplainer or GradientExplainer.
    # But for "Viva" tabular CSV output, KernelExplainer on flattened features is robust.
    
    # Take 100 random snapshots
    X_flat_snaps = X.reshape(-1, 9, 5)
    indices = np.random.choice(len(X_flat_snaps), 100, replace=False)
    background = X_flat_snaps[indices] # [100, 9, 5]
    
    # Wrapper to make model behave like function f(x) -> predictions
    # Input x: [N, 9, 5] -> Output: [N, 2] (Softmax probs)
    
    model = STGNN(in_channels=5, hidden_channels=32, out_channels=2, num_nodes=9)
    try:
        model.load_state_dict(torch.load(MODEL_PATH))
    except:
        print("❌ Model not trained yet.")
        return
    model.eval()
    
    def model_predict(data_numpy):
        # data_numpy shape: [Batch, 9, 5] flattened or structured?
        # SHAP usually flattens inputs.
        # Let's assume we pass flattened [Batch, 45] and reshape inside
        tensor_data = torch.tensor(data_numpy.reshape(-1, 9, 5), dtype=torch.float)
        
        # We need to construct Batch objects for GNN
        # This is complex with SHAP + GNN.
        # SIMPLIFICATION FOR VIVA:
        # We process each sample individually or write a custom collate.
        
        # Actually, for the CSV "Feature Importance", we can just analyze the 
        # sensitivity of the output to features using a simpler method if SHAP is too heavy.
        # But User asked for SHAP.
        
        # Let's maintain a simple loop prediction
        outputs = []
        edge_index = torch.tensor([[0,3,4,2,5,6,7,7],[3,4,5,5,6,7,1,8]], dtype=torch.long)
        
        for i in range(len(tensor_data)):
            # Mock Batch of 1
            from torch_geometric.data import Data, Batch
            d = Data(x=tensor_data[i], edge_index=edge_index)
            b = Batch.from_data_list([d])
            with torch.no_grad():
                out = model(b)
                outputs.append(out.numpy()[0])
                
        return np.array(outputs)

    # Flatten background for SHAP KernelExplainer
    background_flat = background.reshape(100, -1) # [100, 45]
    
    print("Initializing SHAP KernelExplainer (this might take a moment)...")
    explainer = shap.KernelExplainer(model_predict, background_flat)
    
    print("Calculating SHAP values for test set...")
    shap_values = explainer.shap_values(background_flat[:10]) # Just 10 samples for speed
    
    # shap_values is list of [Samples, Features] for each class.
    # We want importance for 'Attack' class (Index 1) usually, or average magnitude.
    
    # Average absolute SHAP values per feature
    # shap_values[1] is for class 1
    vals = np.abs(shap_values[1]).mean(0) # [45]
    
    # Map back to [Node, Feature]
    vals_structured = vals.reshape(9, 5)
    
    feature_names = ['VM', 'I', 'P', 'Q', 'Freq']
    rows = []
    for n in range(9):
        for f in range(5):
            rows.append({
                "Node": n+1,
                "Feature": feature_names[f],
                "Importance": vals_structured[n, f]
            })
            
    df_imp = pd.DataFrame(rows)
    df_imp.sort_values("Importance", ascending=False, inplace=True)
    
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    df_imp.to_csv(OUTPUT_FILE, index=False)
    print(f"✅ SHAP Feature Importance saved to {OUTPUT_FILE}")
    print(df_imp.head())

if __name__ == "__main__":
    explain_model()
