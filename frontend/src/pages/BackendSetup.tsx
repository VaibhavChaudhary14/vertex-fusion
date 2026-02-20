import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackendSetup() {
  const pythonDeps = `numpy
pandas
matplotlib
seaborn
scikit-learn
torch
torch_geometric
networkx
plotly
shap`;

  const condaCommand = `conda activate smartgrid`;

  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Python Backend Setup</h1>
          <p className="text-lg text-muted-foreground">
            Integration guide for the Smart Grid Cyberattack Detection ML pipeline
          </p>
        </div>

        {/* Project Overview */}
        <Card className="border border-primary/20 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-primary">🐍</span>
              Smart Grid ML Backend
            </CardTitle>
            <CardDescription>
              Machine learning pipeline for GNN-based intrusion detection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Environment</p>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  Conda: smartgrid
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Purpose</p>
                <Badge variant="outline" className="bg-accent/10 text-accent">
                  ML Model Training & Inference
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dependencies */}
        <Card className="border border-primary/20 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📦</span>
              Python Dependencies
            </CardTitle>
            <CardDescription>
              Required packages for the ML pipeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div className="space-y-2 text-muted-foreground">
                {pythonDeps.split('\n').map((dep, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    <span>{dep}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-2">
                <Copy className="w-4 h-4" />
                Copy Requirements
              </Button>
              <Button size="sm" variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download requirements.txt
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card className="border border-primary/20 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>⚙️</span>
              Setup Instructions
            </CardTitle>
            <CardDescription>
              Step-by-step guide to set up the Python backend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">1. Create Conda Environment</p>
                <div className="bg-muted p-3 rounded font-mono text-sm text-foreground overflow-x-auto">
                  conda create -n smartgrid python=3.10
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-foreground">2. Activate Environment</p>
                <div className="bg-muted p-3 rounded font-mono text-sm text-foreground overflow-x-auto">
                  {condaCommand}
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-foreground">3. Install Dependencies</p>
                <div className="bg-muted p-3 rounded font-mono text-sm text-foreground overflow-x-auto">
                  pip install numpy pandas matplotlib seaborn scikit-learn torch torch_geometric networkx plotly shap
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-foreground">4. Verify Installation</p>
                <div className="bg-muted p-3 rounded font-mono text-sm text-foreground overflow-x-auto">
                  python -c "import torch; import torch_geometric; print('✓ Setup Complete')"
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Architecture */}
        <Card className="border border-primary/20 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🔗</span>
              Backend Integration Architecture
            </CardTitle>
            <CardDescription>
              How the Python backend connects to Vertex Fusion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="border border-primary/20 rounded-lg p-4 bg-muted/50">
                <p className="font-semibold text-foreground mb-2">Data Flow</p>
                <div className="space-y-2 text-sm text-muted-foreground font-mono">
                  <div>1. Frontend (Vertex Fusion) → API Endpoint</div>
                  <div className="ml-4">↓</div>
                  <div>2. Express Backend → Python Service (REST/WebSocket)</div>
                  <div className="ml-4">↓</div>
                  <div>3. ML Pipeline (GNN Model)</div>
                  <div className="ml-4">↓</div>
                  <div>4. Detection Results → Express Backend</div>
                  <div className="ml-4">↓</div>
                  <div>5. Visualization → Vertex Fusion Dashboard</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-primary/20 rounded-lg p-4 bg-muted/50">
                  <p className="font-semibold text-foreground mb-2 text-sm">ML Components</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• GNN Model Training</li>
                    <li>• Real-time Inference</li>
                    <li>• Feature Engineering</li>
                    <li>• Anomaly Detection</li>
                  </ul>
                </div>

                <div className="border border-primary/20 rounded-lg p-4 bg-muted/50">
                  <p className="font-semibold text-foreground mb-2 text-sm">Supported Protocols</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• IEEE 14-bus Topology</li>
                    <li>• IEEE 30-bus Topology</li>
                    <li>• IEEE 118-bus Topology</li>
                    <li>• Custom Topologies</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card className="border border-primary/20 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>✨</span>
              ML Pipeline Features
            </CardTitle>
            <CardDescription>
              Advanced capabilities of the Python backend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <span className="text-primary">▪</span>
                <div>
                  <p className="font-semibold text-foreground text-sm">Graph Neural Networks</p>
                  <p className="text-xs text-muted-foreground">PyTorch Geometric integration</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">▪</span>
                <div>
                  <p className="font-semibold text-foreground text-sm">Real-time Analysis</p>
                  <p className="text-xs text-muted-foreground">&lt;30ms detection latency</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">▪</span>
                <div>
                  <p className="font-semibold text-foreground text-sm">Network Topology Modeling</p>
                  <p className="text-xs text-muted-foreground">NetworkX graph construction</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">▪</span>
                <div>
                  <p className="font-semibold text-foreground text-sm">SHAP Explainability</p>
                  <p className="text-xs text-muted-foreground">Model interpretation tools</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">▪</span>
                <div>
                  <p className="font-semibold text-foreground text-sm">Data Visualization</p>
                  <p className="text-xs text-muted-foreground">Plotly interactive dashboards</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-primary">▪</span>
                <div>
                  <p className="font-semibold text-foreground text-sm">Statistical Analysis</p>
                  <p className="text-xs text-muted-foreground">Pandas & NumPy processing</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card className="border border-primary/20 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🔐</span>
              Configuration
            </CardTitle>
            <CardDescription>
              Backend service configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-muted p-4 rounded-lg font-mono text-sm text-muted-foreground space-y-2">
              <div>PYTHON_SERVICE_HOST=localhost</div>
              <div>PYTHON_SERVICE_PORT=8000</div>
              <div>MODEL_PATH=/models/gnn_detector</div>
              <div>TOPOLOGY_DATA=/data/ieee_topologies</div>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure these values in your environment or .env file for backend integration
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
