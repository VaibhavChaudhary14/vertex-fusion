import numpy as np
import os
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from sklearn.model_selection import train_test_split

# Config
DATA_DIR = "../data/processed"
MODEL_DIR = "../models"
BASELINE_MODEL_PATH = os.path.join(MODEL_DIR, "baseline_model.joblib")

def train_baseline():
    print("🚀 Training Baseline Model (Random Forest)...")
    
    # Load Data
    try:
        X = np.load(os.path.join(DATA_DIR, "X_windows.npy"))
        y = np.load(os.path.join(DATA_DIR, "y_windows.npy"))
    except FileNotFoundError:
        print("❌ Preprocessed data not found. Run preprocess_data.py first.")
        return

    # Flatten input for RF: [Samples, Window*Nodes*Bus]
    N, W, Nodes, Feats = X.shape
    X_flat = X.reshape(N, -1)
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X_flat, y, test_size=0.2, random_state=42)
    
    # Train
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)
    
    # Evaluate
    preds = clf.predict(X_test)
    acc = accuracy_score(y_test, preds)
    
    print(f"\n📊 Baseline Accuracy: {acc*100:.2f}%")
    print("\nClassification Report:")
    # Handle single class case (if only normal data)
    if len(np.unique(y)) > 1:
        print(classification_report(y_test, preds))
    else:
        print("Only one class (Normal) present in dataset yet.")
    
    # Save
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(clf, BASELINE_MODEL_PATH)
    print(f"✅ Baseline model saved to {BASELINE_MODEL_PATH}")

if __name__ == "__main__":
    train_baseline()
