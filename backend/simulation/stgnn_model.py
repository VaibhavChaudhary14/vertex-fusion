import torch
import torch.nn as nn
from torch_geometric.nn import GATConv

class STGNN(nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels, num_nodes=9):
        super(STGNN, self).__init__()
        self.num_nodes = num_nodes
        self.gat1 = GATConv(in_channels, hidden_channels, heads=2, dropout=0.2)
        self.gat2 = GATConv(hidden_channels * 2, hidden_channels, heads=1, dropout=0.2)
        self.temporal_conv = nn.Conv1d(in_channels=hidden_channels, out_channels=hidden_channels, kernel_size=3, padding=1)
        self.flatten = nn.Flatten()
        self.fc = nn.Sequential(
            nn.Linear(hidden_channels * num_nodes, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, out_channels)
        )

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = self.gat1(x, edge_index)
        x = torch.relu(x)
        x = self.gat2(x, edge_index)
        x = torch.relu(x)

        x_t = x.unsqueeze(0).permute(0, 2, 1)  # [1, feat, nodes]
        x_t = self.temporal_conv(x_t)
        x_t = torch.relu(x_t).view(1, -1)
        out = self.fc(x_t)
        return out.squeeze(0)  # shape [4]
