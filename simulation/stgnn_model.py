import torch
import torch.nn as nn
from torch_geometric.nn import GCNConv

class STGNN(nn.Module):
    """
    Premium STGNN Transformer Architecture
    Synchronized with retrain_model.py for seamless inference.
    """
    def __init__(self, in_channels=6, hidden_channels=32, out_channels=5):
        super().__init__()
        self.gcn1 = GCNConv(in_channels, 32)
        self.gcn2 = GCNConv(32, 16)
        
        # Temporal Layer (Transformer)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=16, nhead=4, dropout=0.1, batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=2)
        
        # Classifier
        self.fc = nn.Linear(16, out_channels)

        # Adjacency for IEEE 9-bus
        edges = [
            [0, 3], [3, 0], [3, 4], [4, 3], [4, 5], [5, 4],
            [2, 5], [5, 2], [5, 6], [6, 5], [6, 7], [7, 6],
            [7, 1], [1, 7], [7, 8], [8, 7], [8, 3], [3, 8]
        ]
        edge_tensor = torch.tensor(edges, dtype=torch.long).t().contiguous()
        self.register_buffer("edge_index", edge_tensor)

    def forward(self, x):
        """
        Input: [Batch, Time(20), Nodes(9), Features(6)]
        """
        if len(x.shape) == 3:
            x = x.unsqueeze(0)
            
        B, T, N, F = x.shape
        spatial_outputs = []
        
        for t in range(T):
            xt = x[:, t, :, :]
            xt_flat = xt.reshape(B * N, F)
            
            # Map edges
            offset = (torch.arange(0, B * N, N, device=x.device).view(-1, 1))
            bei = self.edge_index.unsqueeze(0) + offset.unsqueeze(-1)
            bei = bei.view(-1, 2).t().contiguous()
            
            # Spatial
            h = self.gcn1(xt_flat, bei).relu()
            h = self.gcn2(h, bei).relu()
            
            # Global Average Pooling per Graph
            h_pool = h.view(B, N, -1).mean(dim=1)
            spatial_outputs.append(h_pool)
            
        # Temporal
        temporal_input = torch.stack(spatial_outputs, dim=1)
        trans_out = self.transformer(temporal_input)
        
        # Final output
        return self.fc(trans_out[:, -1, :]).squeeze(0)
