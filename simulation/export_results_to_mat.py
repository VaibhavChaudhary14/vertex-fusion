# simulation/export_results_to_mat.py
import scipy.io as sio
import os
import numpy as np
import sqlite3

def export_to_matlab(y_true, y_pred, target_dir="../9 Bus Major", filename="results.mat"):
    """
    Exports provided prediction results to a MATLAB .mat file.
    """
    target_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), target_dir)
    if not os.path.exists(target_path):
        os.makedirs(target_path)
    
    full_path = os.path.join(target_path, filename)
    
    y_true_np = np.array(y_true).flatten()
    y_pred_np = np.array(y_pred).flatten()
    
    data_dict = {
        'y_true': y_true_np,
        'y_pred': y_pred_np
    }
    
    try:
        sio.savemat(full_path, data_dict)
        return True, full_path
    except Exception as e:
        return False, str(e)

def export_live_db_to_mat(db_name="telemetry.db", target_dir="../9 Bus Major"):
    """
    Reads all prediction logs from the SQLite telemetry database 
    and exports them to a MATLAB-compatible .mat file.
    """
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), db_name)
    
    if not os.path.exists(db_path):
        return False, f"Database not found at {db_path}"

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Fetch actual (true) and predicted labels
        # Note: id > 0 ensures we skip any empty initializations
        cursor.execute("SELECT true_label, pred_label FROM inference_logs WHERE id > 0")
        rows = cursor.fetchall()
        conn.close()
        
        if not rows:
            return False, "No data found in telemetry.db. Ensure simulation has run."
            
        y_true = [r[0] for r in rows]
        y_pred = [r[1] for r in rows]
        
        success, path = export_to_matlab(y_true, y_pred, target_dir=target_dir)
        return success, path
        
    except Exception as e:
        return False, f"Database error: {e}"

if __name__ == "__main__":
    # Test manual export from DB
    success, result = export_live_db_to_mat()
    if success:
        print(f"✅ Exported live results to {result}")
    else:
        print(f"❌ Export failed: {result}")
