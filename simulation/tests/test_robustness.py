import sys
import os
import unittest
import numpy as np

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai_agent import AIAgent

class TestAIAgentRobustness(unittest.TestCase):
    def setUp(self):
        self.agent = AIAgent()
        
    def test_mock_detection_no_attack(self):
        """Test with normal grid state"""
        result = self.agent.detect_attack(grid_state=[], attack_active=False)
        self.assertFalse(result['detected'])
        self.assertEqual(result['type'], "Normal")
        
    def test_mock_detection_attack(self):
        """Test with attack active"""
        result = self.agent.detect_attack(grid_state=[], attack_active=True, attack_type="FDI")
        self.assertTrue(result['detected'])
        self.assertEqual(result['type'], "FDI")
        self.assertGreater(result['confidence'], 0.9)
        self.assertTrue(len(result['contributing_features']) > 0)
        
    def test_noise_handling(self):
        """Test with noisy input (though currently mock ignores input, this verifies interface robustness)"""
        noisy_state = np.random.normal(1.0, 0.1, 100).tolist()
        result = self.agent.detect_attack(grid_state=noisy_state, attack_active=False)
        self.assertFalse(result['detected'])

if __name__ == '__main__':
    unittest.main()
