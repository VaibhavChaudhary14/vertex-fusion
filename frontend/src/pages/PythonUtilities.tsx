import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, FileText, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PythonUtilities() {
  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Python Utilities & Visualization Scripts</h1>
          <p className="text-lg text-muted-foreground">
            Support scripts for data visualization, model training, and system analysis
          </p>
        </div>

        {/* Overview */}
        <Card className="border border-primary/20 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Available Utilities
            </CardTitle>
            <CardDescription>Python scripts for smart grid analysis and visualization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-primary/20 rounded-lg p-4 bg-muted/50">
                <p className="font-semibold text-foreground text-sm">Data Visualization</p>
                <p className="text-xs text-muted-foreground">3-bus system voltage and current analysis</p>
                <Badge className="mt-2 bg-primary/20 text-primary">Matplotlib</Badge>
              </div>
              <div className="border border-primary/20 rounded-lg p-4 bg-muted/50">
                <p className="font-semibold text-foreground text-sm">Module Initialization</p>
                <p className="text-xs text-muted-foreground">Package structure and imports</p>
                <Badge className="mt-2 bg-primary/20 text-primary">Python Modules</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="visualization" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visualization">Visualization Script</TabsTrigger>
            <TabsTrigger value="modules">Module Structure</TabsTrigger>
          </TabsList>

          {/* Visualization Tab */}
          <TabsContent value="visualization" className="space-y-4">
            <Card className="border border-primary/20 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  3-Bus Data Visualization Script
                </CardTitle>
                <CardDescription>
                  visualize_threebus_data_1764530778520.py
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold text-foreground text-sm mb-2">Purpose</p>
                    <p className="text-xs text-muted-foreground">
                      Comprehensive visualization of 3-bus smart grid system data. Displays phase voltages and currents
                      across all buses with professional matplotlib plots for system analysis.
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold text-foreground text-sm mb-3">Script Workflow</p>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-semibold">1️⃣</span>
                        <span><strong>Load Dataset:</strong> Reads threebus_data_final.csv from data folder</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-semibold">2️⃣</span>
                        <span><strong>Extract Signals:</strong> Parses voltage (V) and current (I) columns by name pattern</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-semibold">3️⃣</span>
                        <span><strong>Plot Voltages:</strong> Visualizes all phase voltages (Vabc) across time</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-semibold">4️⃣</span>
                        <span><strong>Plot Currents:</strong> Visualizes all phase currents (Iabc) across time</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold text-foreground text-sm mb-3">Dependencies</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-secondary/10 text-secondary">pandas</Badge>
                      <Badge variant="outline" className="bg-secondary/10 text-secondary">matplotlib.pyplot</Badge>
                      <Badge variant="outline" className="bg-secondary/10 text-secondary">os</Badge>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold text-foreground text-sm mb-3">Usage</p>
                    <div className="bg-background rounded p-3 text-xs font-mono text-muted-foreground overflow-x-auto">
                      <div>$ python visualize_threebus_data.py</div>
                      <div className="text-primary mt-2">📥 Loading data from: ../data/threebus_data_final.csv</div>
                      <div className="text-primary">✅ Visualization complete!</div>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold text-foreground text-sm mb-2">Output</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Figure 1: Three-Bus System Phase Voltages (Vabc) plot</li>
                      <li>• Figure 2: Three-Bus System Phase Currents (Iabc) plot</li>
                      <li>• Grid overlay and legend for all buses</li>
                    </ul>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold text-foreground text-sm mb-2">Key Features</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>✓ Dynamic column detection (voltage/current identification)</li>
                      <li>✓ Automatic time extraction from DataFrame</li>
                      <li>✓ File existence validation with error messages</li>
                      <li>✓ Professional matplotlib formatting (legends, grid, labels)</li>
                      <li>✓ Support for arbitrary number of buses (3, 6, 9, etc.)</li>
                    </ul>
                  </div>

                  <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <strong>Note:</strong> Requires data file in the expected location. 
                      Run from the project root directory: <code className="bg-background px-2 py-1 rounded">scripts/visualize_threebus_data.py</code>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Code Reference
                </CardTitle>
                <CardDescription>Core visualization logic</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted p-4 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto space-y-2">
                  <div className="text-primary"># Extract voltage and current signals by column name</div>
                  <div>voltage_cols = [col for col in df.columns if "V" in col]</div>
                  <div>current_cols = [col for col in df.columns if "I" in col]</div>
                  <div className="mt-2 text-primary"># Plot all voltage signals</div>
                  <div>plt.figure(figsize=(10, 6))</div>
                  <div>for col in voltage_cols:</div>
                  <div className="ml-4">plt.plot(time, df[col], label=col)</div>
                  <div>plt.title("Three-Bus System: Phase Voltages (Vabc)")</div>
                  <div>plt.show()</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Module Structure Tab */}
          <TabsContent value="modules" className="space-y-4">
            <Card className="border border-primary/20 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📦</span>
                  Python Package Structure
                </CardTitle>
                <CardDescription>Module initialization and imports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold text-foreground text-sm mb-2">__init__.py Purpose</p>
                    <p className="text-xs text-muted-foreground">
                      Initializes Python package structure. Enables import statements and namespace organization
                      for the smartgrid ML backend modules.
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold text-foreground text-sm mb-3">Typical Module Organization</p>
                    <div className="bg-background rounded p-3 text-xs font-mono text-muted-foreground space-y-1">
                      <div>smartgrid_ml/</div>
                      <div className="ml-4">├── __init__.py</div>
                      <div className="ml-4">├── data_processing.py</div>
                      <div className="ml-4">├── models.py</div>
                      <div className="ml-4">├── visualization.py</div>
                      <div className="ml-4">└── utils.py</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="font-semibold text-foreground text-sm mb-2">Functions</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Package initialization</li>
                        <li>• Import consolidation</li>
                        <li>• Version management</li>
                        <li>• Public API definition</li>
                      </ul>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <p className="font-semibold text-foreground text-sm mb-2">Usage Pattern</p>
                      <div className="bg-background rounded p-2 text-xs font-mono text-muted-foreground">
                        <div>from smartgrid_ml import models</div>
                        <div>from smartgrid_ml.utils import *</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg">
                    <p className="font-semibold text-foreground text-sm mb-2">Common Patterns</p>
                    <ul className="text-xs text-muted-foreground space-y-2">
                      <li>
                        <strong>Selective Imports:</strong> <code className="bg-background px-1 rounded">__all__ = ['function1', 'function2']</code>
                      </li>
                      <li>
                        <strong>Version Info:</strong> <code className="bg-background px-1 rounded">__version__ = '1.0.0'</code>
                      </li>
                      <li>
                        <strong>Submodule Loading:</strong> Import commonly used modules at package level
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Integration with Backend
                </CardTitle>
                <CardDescription>How these utilities connect to the full pipeline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border border-primary/20 rounded-lg p-4 bg-muted/50">
                    <p className="text-sm font-semibold text-foreground mb-2">Development Workflow</p>
                    <div className="text-xs text-muted-foreground space-y-2">
                      <div>1. Data arrives → processed by data_processing.py</div>
                      <div>2. Features engineered → stored in datasets/</div>
                      <div>3. Models trained → serialized to models/</div>
                      <div>4. Results visualized → visualization.py generates plots</div>
                      <div>5. API exposed → Express backend calls Python services</div>
                    </div>
                  </div>

                  <div className="border border-primary/20 rounded-lg p-4 bg-muted/50">
                    <p className="text-sm font-semibold text-foreground mb-2">File Organization</p>
                    <div className="bg-background rounded p-3 text-xs font-mono text-muted-foreground space-y-1">
                      <div>smartgrid_ml/</div>
                      <div className="ml-4">├── __init__.py</div>
                      <div className="ml-4">├── visualize_threebus_data.py</div>
                      <div className="ml-4">├── train_baseline_model.py</div>
                      <div className="ml-4">├── train_stgnn_model.py</div>
                      <div className="ml-4">└── scripts/</div>
                      <div className="ml-8">└── (utility scripts)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Integration Summary */}
        <Card className="border border-primary/20 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🔗</span>
              Integration with Vertex Fusion
            </CardTitle>
            <CardDescription>How Python utilities connect to the web platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-foreground mb-1">🎨 Visualization Scripts</p>
                <p className="text-muted-foreground">
                  Generate analysis plots locally or via backend service. Results embedded in dashboard through
                  FastAPI/Express bridges.
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">📊 Data Pipeline</p>
                <p className="text-muted-foreground">
                  Scripts process raw smart grid data, extract features, and prepare datasets for model training.
                  Integrated via job queue or webhook triggers.
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">🤖 Model Training</p>
                <p className="text-muted-foreground">
                  train_baseline_model.py and train_stgnn_model.py execute on backend. Results stored and exposed
                  through API endpoints for dashboard analytics.
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">⚡ Real-time Inference</p>
                <p className="text-muted-foreground">
                  Loaded models serve predictions through Express API. Frontend polls results and updates live
                  threat detection dashboard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start */}
        <Card className="border border-primary/20 bg-card">
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
            <CardDescription>Running Python utilities locally</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="bg-muted p-4 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto">
                <div className="text-primary mb-2"># 1. Activate conda environment</div>
                <div>conda activate smartgrid</div>
                <div className="text-primary mt-4 mb-2"># 2. Navigate to project</div>
                <div>cd /path/to/vertex-fusion</div>
                <div className="text-primary mt-4 mb-2"># 3. Run visualization script</div>
                <div>python scripts/visualize_threebus_data.py</div>
                <div className="text-primary mt-4 mb-2"># 4. View generated plots</div>
                <div># Matplotlib windows will open with voltage and current analysis</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
