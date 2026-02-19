import torch
import torch.nn as nn
import torch.nn.functional as F

class STGNN(nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super(STGNN, self).__init__()
        self.num_nodes = 3  # Fixed for this 3-bus demo
        
        # Mocking GATConv with Linear layers to avoid torch_geometric dependency
        # GATConv typically does Linear transformation + attention
        # We'll just do Linear for the structural compatibility in this demo env
        self.gat1_lin = nn.Linear(in_channels, hidden_channels * 2) # heads=2
        self.gat2_lin = nn.Linear(hidden_channels * 2, hidden_channels) # heads=1

        self.temporal_conv = nn.Conv1d(in_channels=hidden_channels, out_channels=hidden_channels, kernel_size=3, padding=1)
        self.flatten = nn.Flatten()
        
        # This matches the original FC structure
        self.fc = nn.Sequential(
            nn.Linear(hidden_channels * self.num_nodes, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, out_channels)
        )

    def forward(self, data):
        # Expecting data object or just x tensor
        if hasattr(data, 'x'):
            x = data.x
        else:
            x = data

        # Mock GAT1: (Nodes, In) -> (Nodes, Hidden*2)
        x = self.gat1_lin(x)
        x = F.relu(x)
        
        # Mock GAT2: (Nodes, Hidden*2) -> (Nodes, Hidden)
        x = self.gat2_lin(x)
        x = F.relu(x)

        # Temporal Conv expects (Batch, Channels, Length)
        # Here we treat Nodes as Length for temporal convolution over the graph signal?
        # Or more likely the original code permuted (1, Nodes, Feat)?
        # Original: x_t = x.unsqueeze(0).permute(0, 2, 1)  -> [1, Hidden, Nodes]
        
        x_t = x.unsqueeze(0).permute(0, 2, 1)  # [1, Hidden, Nodes]
        x_t = self.temporal_conv(x_t)
        x_t = F.relu(x_t).view(1, -1)
        
        out = self.fc(x_t)
        return out.squeeze(0)
