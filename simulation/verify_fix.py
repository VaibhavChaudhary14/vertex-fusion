import torch
import numpy as np
from ai_inference_service import AIInferenceEngine

def test_inference():
    print("Testing 9-bus AI Inference Engine...")
    engine = AIInferenceEngine(model_path="models/stgnn_model.pth")
    
    # 9 nodes * 6 features * 10 timesteps = 540 elements
    dummy_input = np.random.randn(540).astype(np.float32)
    
    print("\n1. Testing Predict...")
    result = engine.predict(dummy_input)
    print(f"Prediction: {result['attack_label']} (Confidence: {result['confidence']:.4f})")
    print(f"Latency: {result['latency_ms']}ms")
    
    if result['status'] == 'success':
        print("[SUCCESS] Predict works!")
    else:
        print(f"[ERROR] Predict failed: {result.get('message', 'Unknown Error')}")

    print("\n2. Testing Explain (SHAP)...")
    explain_result = engine.explain(dummy_input)
    if "error" not in explain_result:
        print("[SUCCESS] Explain works!")
        print(f"Top 3 Features: {explain_result['top_features'][:3]}")
    else:
        print(f"[ERROR] Explain failed: {explain_result['error']}")

if __name__ == "__main__":
    test_inference()
