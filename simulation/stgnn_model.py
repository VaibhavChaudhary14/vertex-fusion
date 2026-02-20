import torch
import torch.nn as nn
from torch_geometric.nn import GATConv

class STGNN(nn.Module):
    """
    Phase 8: True Spatial-Temporal GNN for the IEEE 9-Bus System
    
    This architecture maps exactly to the physical 9-bus benchmark system.
    Processes [Nodes=9, Features=6] tensors per timestep, executing 
    spatial message passing across the actual physical transmission lines.
    """
    def __init__(self, in_channels=6, hidden_channels=32, out_channels=4):
        super(STGNN, self).__init__()
        self.num_nodes = 9
        
        # 1. Spatial Layer (Graph Attention Network)
        # Input per node: [V_mag, V_ang, P, Q, Freq, I_mag] = 6 features
        self.gat1 = GATConv(in_channels, hidden_channels, heads=2, concat=True, dropout=0.2)
        # Output: hidden_channels * 2 = 64 features per node
        
        self.gat2 = GATConv(hidden_channels * 2, hidden_channels, heads=1, concat=False, dropout=0.2)
        # Output: 32 features per node
        
        # 2. Temporal Layer (LSTM over the flattened spatial features)
        # 9 nodes * 32 features = 288 spatial features per timestep
        self.lstm = nn.LSTM(input_size=self.num_nodes * hidden_channels, hidden_size=128, num_layers=1, batch_first=True)
        
        # 3. Dense Classification Block
        self.fc = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, out_channels)
        )
        
        # 4. IEEE 9-Bus Physical Adjacency Matrix
        # Connections: 1-4, 4-5, 5-6, 3-6, 6-7, 7-8, 8-2, 8-9, 9-4
        # (Zero-indexed array mapping)
        edges = [
            [0, 3], [3, 0], [3, 4], [4, 3], [4, 5], [5, 4],
            [2, 5], [5, 2], [5, 6], [6, 5], [6, 7], [7, 6],
            [7, 1], [1, 7], [7, 8], [8, 7], [8, 3], [3, 8]
        ]
        
        # Self-loops
        for i in range(self.num_nodes):
            edges.append([i, i])
            
        edge_tensor = torch.tensor(edges, dtype=torch.long).t().contiguous()
        self.register_buffer("edge_index", edge_tensor)

    def forward(self, x):
        """
        Expected Input 'x': Tensor of shape [batch_size, window_size, num_nodes, num_features]
        For IEEE 9-Bus: [B, 10, 9, 6]
        """
        if len(x.shape) == 3:
            # Fallback if unbatched [time, nodes, features]
            x = x.unsqueeze(0)
            
        B, T, N, F = x.shape
        
        spatial_outputs = []
        for t in range(T):
            xt = x[:, t, :, :] # Shape: [B, N, F]
            xt_flat = xt.reshape(B * N, F)
            
            # Map edge_index across the batch
            offset = (torch.arange(0, B * N, N, device=x.device).view(-1, 1))
            batch_edge_index = self.edge_index.unsqueeze(0) + offset.unsqueeze(-1)
            batch_edge_index = batch_edge_index.view(-1, 2).t().contiguous()
            
            # Spatial Message Passing
            h = self.gat1(xt_flat, batch_edge_index)
            h = torch.relu(h)
            h = self.gat2(h, batch_edge_index)
            h = torch.relu(h)
            
            # Reshape back to [B, N * Out_Features]
            h = h.view(B, N * 32)
            spatial_outputs.append(h)
            
        # Temporal Processing
        temporal_input = torch.stack(spatial_outputs, dim=1) # [B, T, 288]
        lstm_out, _ = self.lstm(temporal_input)
        
        # Standard: Take last temporal output for classification
        last_hidden = lstm_out[:, -1, :] # [B, 128]
        
        return self.fc(last_hidden).squeeze(0)
