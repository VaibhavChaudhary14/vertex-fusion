# simulation/export_results_to_mat.py
import scipy.io as sio
import os
import numpy as np

def export_to_matlab(y_true, y_pred, target_dir="../9 Bus Major", filename="results.mat"):
    """
    Exports prediction results to a MATLAB .mat file.
    
    Args:
        y_true (array-like): Ground truth labels.
        y_pred (array-like): Predicted labels.
        target_dir (str): Relative or absolute path to the MATLAB folder.
        filename (str): Name of the output file.
    """
    # Ensure directory exists
    target_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), target_dir)
    if not os.path.exists(target_path):
        os.makedirs(target_path)
    
    full_path = os.path.join(target_path, filename)
    
    # Label encoding check / safety
    # Explicitly convert to numpy if not already
    y_true_np = np.array(y_true).flatten()
    y_pred_np = np.array(y_pred).flatten()
    
    data_dict = {
        'y_true': y_true_np,
        'y_pred': y_pred_np
    }
    
    # Save the mat file
    try:
        sio.savemat(full_path, data_dict)
        print(f"✅ Successfully exported results to {full_path}")
        print(f"📊 Ready for MATLAB visualization using generate_performance_plots.m")
    except Exception as e:
        print(f"❌ Failed to export results: {e}")

if __name__ == "__main__":
    # Example usage / Mock data if run as script
    mock_true = [0, 1, 2, 3] * 250
    mock_pred = list(mock_true)
    # Inject some noise
    for i in range(0, 50, 5):
        mock_pred[i] = (mock_true[i] + 1) % 4
    
    export_to_matlab(mock_true, mock_pred)
