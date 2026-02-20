# scripts/train_baseline_model.py

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt
import os

# -----------------------------
# 1️⃣ Load preprocessed data
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")

X_path = os.path.join(DATA_DIR, "X_windows.npy")
y_path = os.path.join(DATA_DIR, "y_windows.npy")

X = np.load(X_path)
y = np.load(y_path)

print(f"✅ Loaded X: {X.shape}, y: {y.shape}")

# Split into train and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Convert to PyTorch tensors
X_train_t = torch.tensor(X_train, dtype=torch.float32)
y_train_t = torch.tensor(y_train, dtype=torch.long)
X_test_t = torch.tensor(X_test, dtype=torch.float32)
y_test_t = torch.tensor(y_test, dtype=torch.long)

# -----------------------------
# 2️⃣ Define Baseline Model
# -----------------------------
class BaselineNN(nn.Module):
    def __init__(self, input_dim, hidden_dim=128, output_dim=4):
        super(BaselineNN, self).__init__()
        self.layers = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim, 64),
            nn.ReLU(),
            nn.Linear(64, output_dim)
        )

    def forward(self, x):
        return self.layers(x)

input_dim = X_train_t.shape[1]
model = BaselineNN(input_dim)
print(model)

# -----------------------------
# 3️⃣ Training Setup
# -----------------------------
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)
epochs = 25

# -----------------------------
# 4️⃣ Training Loop
# -----------------------------
train_losses = []
for epoch in range(epochs):
    model.train()
    optimizer.zero_grad()
    outputs = model(X_train_t)
    loss = criterion(outputs, y_train_t)
    loss.backward()
    optimizer.step()
    train_losses.append(loss.item())
    if (epoch+1) % 5 == 0:
        print(f"Epoch [{epoch+1}/{epochs}] - Loss: {loss.item():.4f}")

# Plot training loss
plt.figure(figsize=(6,4))
plt.plot(train_losses, label='Training Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.title('Training Loss Curve')
plt.legend()
plt.show()

# -----------------------------
# 5️⃣ Evaluation
# -----------------------------
model.eval()
with torch.no_grad():
    preds = model(X_test_t)
    predicted_labels = torch.argmax(preds, axis=1).numpy()

# Classification metrics
print("\n📊 Classification Report:")
print(classification_report(y_test, predicted_labels, digits=3))

# Confusion matrix
cm = confusion_matrix(y_test, predicted_labels)
plt.figure(figsize=(6,5))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Normal','FDI','DoS','Replay'],
            yticklabels=['Normal','FDI','DoS','Replay'])
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title('Confusion Matrix')
plt.show()

# -----------------------------
# 6️⃣ Save trained model
# -----------------------------
model_path = os.path.join(DATA_DIR, "baseline_model.pth")
torch.save(model.state_dict(), model_path)
print(f"✅ Model saved to {model_path}")
