import torch
import torch.nn as nn
import torch.nn.functional as F
try:
    from torch_geometric.nn import GATConv
except ImportError:
    # Shim for environment without torch_geometric
    # We define a basic GATConv mock that behaves like a linear layer with proper shapes
    class GATConv(nn.Module):
        def __init__(self, in_channels, out_channels, heads=1, concat=True):
            super().__init__()
            self.heads = heads
            self.concat = concat
            self.out_channels = out_channels
            # Simple linear transformation to mimic GAT output shape
            self.lin = nn.Linear(in_channels, out_channels * heads)
        
        def forward(self, x, edge_index):
            # x: [Nodes, In_Channels]
            # Output: [Nodes, Out_Channels * Heads]
            return self.lin(x)

class STGNN_9Bus(nn.Module):
    def __init__(self, num_nodes=9, in_channels=6, hidden_channels=32, out_channels=4):
        super(STGNN_9Bus, self).__init__()
        self.num_nodes = num_nodes
        
        # Spatial Graph Attention Layers
        # Input: [Nodes, Features]
        self.gat1 = GATConv(in_channels, hidden_channels, heads=2, concat=True) 
        # Output: [Nodes, hidden*2] -> [9, 64]
        
        self.gat2 = GATConv(hidden_channels * 2, hidden_channels, heads=1, concat=True)
        # Output: [Nodes, hidden] -> [9, 32]
        
        # Temporal Processing (LSTM)
        # We flatten the graph features for the sequence model
        # Input to LSTM: [Batch, Time, Nodes * Hidden]
        self.lstm_input_size = num_nodes * hidden_channels
        self.lstm = nn.LSTM(input_size=self.lstm_input_size, 
                            hidden_size=128, 
                            num_layers=1, 
                            batch_first=True)
        
        # Classifier
        self.fc1 = nn.Linear(128, 64)
        self.dropout = nn.Dropout(0.3)
        self.fc2 = nn.Linear(64, out_channels)
        
        # Define IEEE 9-Bus Adjacency Matrix (Static)
        # Edges based on standard topology:
        # 1-4, 4-5, 5-6, 3-6, 6-7, 7-8, 8-2, 8-9, 9-4 (Approximate ring)
        # We define it here or pass it in forward.
        # For simplicity, we assume fully connected or fixed connectivity.
        self.edge_index = torch.tensor([
            [0, 3, 3, 4, 4, 5, 2, 5, 5, 6, 6, 7, 7, 1, 7, 8, 8, 3], # Source
            [3, 0, 4, 3, 5, 4, 5, 2, 6, 5, 7, 6, 1, 7, 8, 7, 3, 8]  # Target
        ], dtype=torch.long)

    def forward(self, x):
        """
        x shape: [Batch, Time, Nodes, Features]
        Example: [1, 10, 9, 6]
        """
        batch_size, time_steps, nodes, features = x.shape
        
        # Process each time step through GAT
        # We iterate over time (or fold it into batch dimension)
        
        # Reshape to [Batch * Time, Nodes, Features] for structural processing
        x_flat = x.view(batch_size * time_steps, nodes, features)
        
        spatial_feats = []
        for t in range(batch_size * time_steps):
            # Extract single graph snapshot: [Nodes, Feats]
            snapshot = x_flat[t]
            
            # GAT Layer 1
            out1 = F.relu(self.gat1(snapshot, self.edge_index))
            # GAT Layer 2
            out2 = F.relu(self.gat2(out1, self.edge_index))
            
            spatial_feats.append(out2) # [Nodes, Hidden]
            
        # Stack back: [Batch * Time, Nodes, Hidden]
        spatial_feats = torch.stack(spatial_feats)
        
        # Flatten nodes: [Batch * Time, Nodes * Hidden]
        # This creates a single feature vector representing the whole grid state
        spatial_feats = spatial_feats.view(batch_size, time_steps, -1) 
        
        # Temporal Processing
        lstm_out, (hn, cn) = self.lstm(spatial_feats)
        
        # Use last hidden state
        last_hidden = hn[-1] # [Batch, Hidden_LSTM]
        
        # Classification
        out = F.relu(self.fc1(last_hidden))
        out = self.dropout(out)
        logits = self.fc2(out)
        
        return logits
