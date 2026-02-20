import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GATConv

class IEEE9_STGNN(nn.Module):
    """
    Phase 8: True Spatial-Temporal GNN for the IEEE 9-Bus System
    
    This architecture maps exactly to the physical 9-bus benchmark system.
    Instead of passing a flat array, it processes true [Nodes, Features] tensors
    per timestep, executing spatial message passing across the actual transmission lines.
    """
    def __init__(self, in_channels=6, spatial_hidden=32, temporal_hidden=128, out_channels=4, heads=2):
        super(IEEE9_STGNN, self).__init__()
        
        # 1. Spatial Layer (Graph Attention Network)
        # Input per node: [Voltage Mag, Voltage Ang, P, Q, Freq, Current Mag] = 6 features
        self.gat1 = GATConv(in_channels, spatial_hidden, heads=heads, concat=True)
        # Output: spatial_hidden * heads = 64 features per node
        
        self.gat2 = GATConv(spatial_hidden * heads, spatial_hidden, heads=1, concat=False)
        # Output: 32 features per node
        
        # 2. Temporal Layer (LSTM)
        # After GAT, we flatten the 9 nodes * 32 features = 288 spatial features 
        # and feed them into the temporal sequence model over `window_size` (e.g., 10)
        self.lstm = nn.LSTM(input_size=9 * spatial_hidden, hidden_size=temporal_hidden, num_layers=1, batch_first=True)
        
        # 3. Dense Classifier Layer
        self.fc1 = nn.Linear(temporal_hidden, 64)
        self.fc2 = nn.Linear(64, out_channels)
        self.dropout = nn.Dropout(0.3)
        
        # 4. IEEE 9-Bus Static Physical Adjacency Matrix (edge_index)
        # This defines what buses are physically connected by transmission lines.
        # Connections: 1-4, 4-5, 5-6, 3-6, 6-7, 7-8, 8-2, 8-9, 9-4
        # (Zero-indexed for PyTorch: 0-3, 3-4, 4-5, 2-5, 5-6, 6-7, 7-1, 7-8, 8-3)
        edges = [
            [0, 3], [3, 0],
            [3, 4], [4, 3],
            [4, 5], [5, 4],
            [2, 5], [5, 2],
            [5, 6], [6, 5],
            [6, 7], [7, 6],
            [7, 1], [1, 7],
            [7, 8], [8, 7],
            [8, 3], [3, 8]
        ]
        
        # Add self-loops (each bus talks to itself)
        for i in range(9):
            edges.append([i, i])
            
        edge_tensor = torch.tensor(edges, dtype=torch.long).t().contiguous()
        self.register_buffer("edge_index", edge_tensor)

    def forward(self, x):
        """
        Expected Input 'x': Tensor of shape [batch_size, window_size, num_nodes, num_features]
        For IEEE 9-Bus: [B, 10, 9, 6]
        """
        B, T, N, F = x.shape
        
        # Process Spatial Features per Timestep
        spatial_outputs = []
        for t in range(T):
            # Extract graph state at timestep 't'
            # Shape: [B, N, F]
            xt = x[:, t, :, :]
            
            # Note: GATConv in standard usage expects flat [B*N, F].
            # For simplicity in batching, we reshape to [B*N, F]
            xt_flat = xt.reshape(B * N, F)
            
            # Repeat edge_index for each graph in the batch
            # Standard approach is to use PyTorch Geometric DataLoaders, 
            # but this manual offset works for static topologies.
            offset = (torch.arange(0, B * N, N, device=x.device).view(-1, 1))
            batch_edge_index = self.edge_index.unsqueeze(0) + offset.unsqueeze(-1)
            batch_edge_index = batch_edge_index.view(-1, 2).t().contiguous()
            
            # Spatial Message Passing
            h = self.gat1(xt_flat, batch_edge_index)
            h = F.relu(h)
            h = self.dropout(h)
            h = self.gat2(h, batch_edge_index)
            h = F.relu(h)
            
            # Reshape back to [B, N, Out_Features] and flatten spatial dimension
            h = h.view(B, N * 32)
            spatial_outputs.append(h)
            
        # Stack temporal outputs
        # Shape: [B, T, N * 32] -> e.g., [B, 10, 288]
        temporal_input = torch.stack(spatial_outputs, dim=1)
        
        # Process Temporal Sequence
        lstm_out, _ = self.lstm(temporal_input)
        
        # Take the last hidden state of the sequence
        # Shape: [B, 128]
        last_hidden = lstm_out[:, -1, :]
        
        # Final Classification
        out = F.relu(self.fc1(last_hidden))
        out = self.dropout(out)
        logits = self.fc2(out)
        
        return logits
