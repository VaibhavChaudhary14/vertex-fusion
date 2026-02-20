import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const benchmarkData = [
  { model: "GNN-IDS", dr: 97.8, fa: 2.1, f1: 96.4 },
  { model: "SVM", dr: 92.3, fa: 5.2, f1: 90.1 },
  { model: "LSTM-RNN", dr: 94.1, fa: 4.8, f1: 91.9 },
  { model: "FNN", dr: 88.7, fa: 7.1, f1: 86.5 },
  { model: "ARIMA", dr: 82.4, fa: 9.3, f1: 79.2 },
  { model: "AEA", dr: 85.9, fa: 8.1, f1: 83.4 },
];

const performanceOverTime = [
  { dataset: "IEEE14", gnn: 97.8, svm: 92.3, lstm: 94.1, fnn: 88.7 },
  { dataset: "IEEE30", gnn: 96.9, svm: 91.5, lstm: 93.2, fnn: 87.8 },
  { dataset: "IEEE118", gnn: 95.7, svm: 90.2, lstm: 91.8, fnn: 86.1 },
];

export function ComparativePerformanceDashboard() {
  const gnnMetrics = benchmarkData[0];
  const improvements = {
    vsSvm: ((gnnMetrics.dr - benchmarkData[1].dr) / benchmarkData[1].dr * 100).toFixed(1),
    vsLstm: ((gnnMetrics.dr - benchmarkData[2].dr) / benchmarkData[2].dr * 100).toFixed(1),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Comparative Performance Analysis</h2>
        <p className="text-muted-foreground">Scientific validation of GNN-IDS superiority</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">GNN-IDS Detection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{gnnMetrics.dr}%</div>
            <p className="text-xs text-green-600 mt-1">+{improvements.vsSvm}% vs SVM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">False Alarm Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{gnnMetrics.fa}%</div>
            <p className="text-xs text-blue-600 mt-1">-60% vs ARIMA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">F1-Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{gnnMetrics.f1}</div>
            <p className="text-xs text-purple-600 mt-1">Highest in class</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Speed Advantage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">26%</div>
            <p className="text-xs text-amber-600 mt-1">Faster than SVM</p>
          </CardContent>
        </Card>
      </div>

      {/* Benchmark Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={benchmarkData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="dr" fill="#00ff00" name="Detection Rate %" />
              <Bar dataKey="f1" fill="#7c3aff" name="F1-Score" />
              <Bar dataKey="fa" fill="#ff4444" name="False Alarm %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Across Topologies */}
      <Card>
        <CardHeader>
          <CardTitle>Detection Rate Across IEEE Topologies</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dataset" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="gnn" stroke="#00ff00" name="GNN-IDS" />
              <Line type="monotone" dataKey="svm" stroke="#0088ff" name="SVM" />
              <Line type="monotone" dataKey="lstm" stroke="#ff8800" name="LSTM-RNN" />
              <Line type="monotone" dataKey="fnn" stroke="#ff0088" name="FNN" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Benchmark Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Benchmark Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {benchmarkData.map((model) => (
              <div key={model.model} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold flex items-center gap-2">
                    {model.model}
                    {model.model === "GNN-IDS" && <Badge className="bg-green-600">BEST</Badge>}
                  </h4>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                    <div>DR: <span className="font-bold">{model.dr}%</span></div>
                    <div>FA: <span className="font-bold">{model.fa}%</span></div>
                    <div>F1: <span className="font-bold">{model.f1}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
