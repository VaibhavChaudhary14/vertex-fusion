import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Database, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MLDatasetsAndModels() {
  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">ML Datasets & Pre-trained Models</h1>
          <p className="text-lg text-muted-foreground">
            Smart Grid cyberattack detection datasets and trained model artifacts
          </p>
        </div>

        {/* Overview */}
        <Card className="border border-primary/20 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Dataset Overview
            </CardTitle>
            <CardDescription>Complete ML pipeline data and models</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-primary/20 rounded-lg p-4 bg-muted/50">
                <p className="font-semibold text-foreground text-sm">Synthetic Dataset</p>
                <p className="text-xs text-muted-foreground">2,000 samples</p>
                <Badge className="mt-2 bg-primary/20 text-primary">2002 rows</Badge>
              </div>
              <div className="border border-primary/20 rounded-lg p-4 bg-muted/50">
                <p className="font-semibold text-foreground text-sm">Processed Features</p>
                <p className="text-xs text-muted-foreground">43 samples, 149 features</p>
                <Badge className="mt-2 bg-primary/20 text-primary">Normalized</Badge>
              </div>
              <div className="border border-primary/20 rounded-lg p-4 bg-muted/50">
                <p className="font-semibold text-foreground text-sm">3-Bus System</p>
                <p className="text-xs text-muted-foreground">53 timestamps</p>
                <Badge className="mt-2 bg-primary/20 text-primary">MATLAB Data</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="datasets" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="datasets">Datasets</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* Datasets Tab */}
          <TabsContent value="datasets" className="space-y-4">
            <Card className="border border-primary/20 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📊</span>
                  Smartgrid Synthetic Dataset
                </CardTitle>
                <CardDescription>
                  smartgrid_synthetic_1764530645677.csv
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Size</p>
                      <p className="text-sm text-muted-foreground">2,002 rows × 23 columns</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Time Range</p>
                      <p className="text-sm text-muted-foreground">0-1,969 timestamps</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Attack Labels</p>
                      <p className="text-sm text-muted-foreground">4 classes (0, 1, 2, 3)</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Format</p>
                      <p className="text-sm text-muted-foreground">CSV (normalized values)</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 bg-muted p-3 rounded-lg">
                    <p className="text-sm font-semibold text-foreground">Features:</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>• time: Timestamp</div>
                      <div>• frequency: Grid frequency (50Hz nominal)</div>
                      <div>• packet_delay: Network latency (ms)</div>
                      <div>• packet_loss: Network packet loss (%)</div>
                      <div>• attack_label: 0=Normal, 1-3=Attack types</div>
                      <div>• Bus1-6: Voltage (V), Current (I), Power (P)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🔄</span>
                  Processed Features Dataset
                </CardTitle>
                <CardDescription>
                  processed_smartgrid_1764530645674.csv
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Size</p>
                      <p className="text-sm text-muted-foreground">43 rows × 149 columns</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Normalization</p>
                      <p className="text-sm text-muted-foreground">0-1 normalized</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Purpose</p>
                      <p className="text-sm text-muted-foreground">ML model training</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Preprocessing</p>
                      <p className="text-sm text-muted-foreground">Feature extraction</p>
                    </div>
                  </div>

                  <div className="mt-4 bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Enhanced feature set with 149 engineered features for improved model performance.
                      Includes time-domain, frequency-domain, and statistical features derived from raw bus measurements.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>⚡</span>
                  3-Bus System Data
                </CardTitle>
                <CardDescription>
                  threebus_data_final_1764530645681.csv
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Size</p>
                      <p className="text-sm text-muted-foreground">53 rows × 19 columns</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Topology</p>
                      <p className="text-sm text-muted-foreground">3-bus system</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Time Step</p>
                      <p className="text-sm text-muted-foreground">0.1s intervals</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Duration</p>
                      <p className="text-sm text-muted-foreground">5.2 seconds total</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 bg-muted p-3 rounded-lg">
                    <p className="text-sm font-semibold text-foreground">Measurements per Bus:</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>• Va, Vb, Vc: 3-phase voltages</div>
                      <div>• Ia, Ib, Ic: 3-phase currents</div>
                      <div>Total: 18 measurements + 1 time column</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-4">
            <Card className="border border-primary/20 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🧠</span>
                  Pre-trained Models
                </CardTitle>
                <CardDescription>
                  Serialized PyTorch and scikit-learn models
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border border-primary/20 rounded-lg p-4 bg-muted/50">
                    <p className="font-semibold text-foreground text-sm">Baseline Model (SVM)</p>
                    <p className="text-xs text-muted-foreground">baseline_model_1764530645673.pth</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Scikit-learn SVM classifier trained on processed features. Baseline for GNN comparison.
                    </p>
                    <Badge className="mt-2 bg-accent/20 text-accent">PyTorch Format</Badge>
                  </div>

                  <div className="border border-primary/20 rounded-lg p-4 bg-muted/50">
                    <p className="font-semibold text-foreground text-sm">STGNN Model</p>
                    <p className="text-xs text-muted-foreground">stgnn_model_1764530645679.pth</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Spatio-Temporal Graph Neural Network. Main detection model for real-time inference.
                    </p>
                    <Badge className="mt-2 bg-primary/20 text-primary">PyTorch Format</Badge>
                  </div>

                  <div className="border border-primary/20 rounded-lg p-4 bg-muted/50">
                    <p className="font-semibold text-foreground text-sm">Feature Scaler</p>
                    <p className="text-xs text-muted-foreground">scaler_1764530645674.joblib</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Scikit-learn StandardScaler for feature normalization in preprocessing pipeline.
                    </p>
                    <Badge className="mt-2 bg-secondary/20 text-secondary">Joblib Format</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📦</span>
                  Data Arrays
                </CardTitle>
                <CardDescription>
                  NumPy serialized windows for model training
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border border-primary/20 rounded-lg p-4 bg-muted/50">
                    <p className="font-semibold text-foreground text-sm">X Windows</p>
                    <p className="text-xs text-muted-foreground">X_windows_1764530645682.npy</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Input feature windows for temporal sequence modeling
                    </p>
                    <Badge className="mt-2 bg-primary/20 text-primary">NumPy Array</Badge>
                  </div>

                  <div className="border border-primary/20 rounded-lg p-4 bg-muted/50">
                    <p className="font-semibold text-foreground text-sm">Y Windows</p>
                    <p className="text-xs text-muted-foreground">y_windows_1764530645683.npy</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Target labels for supervised learning
                    </p>
                    <Badge className="mt-2 bg-primary/20 text-primary">NumPy Array</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4">
            <Card className="border border-primary/20 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  SHAP Feature Importance
                </CardTitle>
                <CardDescription>
                  Model explainability analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-semibold text-foreground mb-3">Top Features by |SHAP| Impact:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Feature_0</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-primary/20 rounded">
                            <div className="w-20 h-2 bg-primary rounded"></div>
                          </div>
                          <span className="text-muted-foreground">0.0245</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Feature_3</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-primary/20 rounded">
                            <div className="w-12 h-2 bg-primary rounded"></div>
                          </div>
                          <span className="text-muted-foreground">0.0123</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Feature_1</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-primary/20 rounded">
                            <div className="w-10 h-2 bg-primary rounded"></div>
                          </div>
                          <span className="text-muted-foreground">0.0100</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Feature_2</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-primary/20 rounded">
                            <div className="w-5 h-2 bg-primary rounded"></div>
                          </div>
                          <span className="text-muted-foreground">0.0053</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 border border-primary/20 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground">
                      SHAP values indicate that Feature_0 is the most influential for model predictions,
                      accounting for ~0.0245 average absolute impact on model output.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🔍</span>
                  Attack Label Distribution
                </CardTitle>
                <CardDescription>
                  Dataset composition from visualization notebook
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Normal (0)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-40 h-2 bg-primary/20 rounded">
                          <div className="w-36 h-2 bg-primary rounded"></div>
                        </div>
                        <span className="text-muted-foreground">1,450 (72.5%)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Attack Type 1</span>
                      <div className="flex items-center gap-2">
                        <div className="w-40 h-2 bg-accent/20 rounded">
                          <div className="w-10 h-2 bg-accent rounded"></div>
                        </div>
                        <span className="text-muted-foreground">200 (10%)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Attack Type 2</span>
                      <div className="flex items-center gap-2">
                        <div className="w-40 h-2 bg-accent/20 rounded">
                          <div className="w-10 h-2 bg-accent rounded"></div>
                        </div>
                        <span className="text-muted-foreground">200 (10%)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Attack Type 3</span>
                      <div className="flex items-center gap-2">
                        <div className="w-40 h-2 bg-accent/20 rounded">
                          <div className="w-7 h-2 bg-accent rounded"></div>
                        </div>
                        <span className="text-muted-foreground">150 (7.5%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Integration Info */}
        <Card className="border border-primary/20 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🔗</span>
              Integration Guide
            </CardTitle>
            <CardDescription>
              Using these datasets and models in your ML pipeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-foreground mb-1">1. Data Loading</p>
                <p className="text-muted-foreground">
                  Use pandas for CSV files: <code className="bg-muted px-2 py-1 rounded text-xs">pd.read_csv()</code>
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">2. Feature Scaling</p>
                <p className="text-muted-foreground">
                  Apply scaler.joblib preprocessing before inference: <code className="bg-muted px-2 py-1 rounded text-xs">joblib.load()</code>
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">3. Model Inference</p>
                <p className="text-muted-foreground">
                  Load STGNN and baseline models with PyTorch: <code className="bg-muted px-2 py-1 rounded text-xs">torch.load()</code>
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">4. Evaluation</p>
                <p className="text-muted-foreground">
                  Use windowed data (X_windows, y_windows) for cross-validation and benchmarking
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
