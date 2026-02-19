import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const hpoResults = [
  { iteration: 1, lr: 0.001, cheb: 3, layers: 3, f1: 0.883 },
  { iteration: 2, lr: 0.0015, cheb: 4, layers: 4, f1: 0.906 },
  { iteration: 3, lr: 0.002, cheb: 5, layers: 3, f1: 0.921 },
  { iteration: 4, lr: 0.0012, cheb: 3, layers: 5, f1: 0.938 },
  { iteration: 5, lr: 0.0018, cheb: 4, layers: 4, f1: 0.964, best: true },
];

export function AutomatedHPO() {
  const [isOptimizing, setIsOptimizing] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Automated Hyper-Parameter Optimization</h2>
        <p className="text-muted-foreground">Sequential grid search for topology-specific configurations</p>
      </div>

      {/* Optimization Control */}
      <Card>
        <CardHeader>
          <CardTitle>HPO Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Target Topology</label>
              <select className="w-full px-3 py-2 border rounded-md bg-background">
                <option>IEEE 14-bus</option>
                <option>IEEE 30-bus</option>
                <option>IEEE 118-bus</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Optimization Metric</label>
              <select className="w-full px-3 py-2 border rounded-md bg-background">
                <option>F1-Score (Default)</option>
                <option>Detection Rate</option>
                <option>False Alarm Rate</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Learning Rate Range</label>
              <div className="flex gap-2">
                <input type="text" placeholder="0.0001" className="flex-1 px-2 py-1 border rounded text-sm bg-background" />
                <input type="text" placeholder="0.01" className="flex-1 px-2 py-1 border rounded text-sm bg-background" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Chebyshev Order (μ_l)</label>
              <div className="flex gap-2">
                <input type="text" placeholder="2" className="flex-1 px-2 py-1 border rounded text-sm bg-background" />
                <input type="text" placeholder="6" className="flex-1 px-2 py-1 border rounded text-sm bg-background" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Layer Count Range</label>
              <div className="flex gap-2">
                <input type="text" placeholder="2" className="flex-1 px-2 py-1 border rounded text-sm bg-background" />
                <input type="text" placeholder="6" className="flex-1 px-2 py-1 border rounded text-sm bg-background" />
              </div>
            </div>
          </div>

          <Button 
            onClick={() => setIsOptimizing(!isOptimizing)}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isOptimizing}
          >
            {isOptimizing ? "Optimizing... (Est. 2h)" : "Start Grid Search"}
          </Button>
        </CardContent>
      </Card>

      {/* Optimization Progress */}
      {isOptimizing && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Optimization in Progress</span>
              <Badge className="bg-amber-600 animate-pulse">RUNNING</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Iteration 3 of 25</p>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 animate-pulse" style={{ width: "12%" }} />
                </div>
              </div>
              <p className="text-sm">Current best F1-Score: <span className="font-bold text-green-600">0.938</span></p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Iter</th>
                  <th className="text-left p-2">LR</th>
                  <th className="text-left p-2">Cheby Order</th>
                  <th className="text-left p-2">Layers</th>
                  <th className="text-left p-2">F1-Score</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {hpoResults.map((row) => (
                  <tr key={row.iteration} className={`border-b ${row.best ? 'bg-green-500/10' : ''}`}>
                    <td className="p-2">{row.iteration}</td>
                    <td className="p-2">{row.lr}</td>
                    <td className="p-2">{row.cheb}</td>
                    <td className="p-2">{row.layers}</td>
                    <td className="p-2 font-bold">{row.f1.toFixed(3)}</td>
                    <td className="p-2">
                      {row.best ? <Badge className="bg-green-600">BEST</Badge> : <span className="text-muted-foreground">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Best Configuration */}
      <Card className="border-green-500/50 bg-green-500/5">
        <CardHeader>
          <CardTitle>Optimal Configuration Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-3 bg-background border border-green-500/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Learning Rate</p>
              <p className="font-bold text-lg">0.0018</p>
            </div>
            <div className="p-3 bg-background border border-green-500/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Chebyshev Order</p>
              <p className="font-bold text-lg">4</p>
            </div>
            <div className="p-3 bg-background border border-green-500/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Layer Count</p>
              <p className="font-bold text-lg">4</p>
            </div>
            <div className="p-3 bg-background border border-green-600/50 rounded-lg bg-green-500/5">
              <p className="text-sm text-green-600">F1-Score</p>
              <p className="font-bold text-lg text-green-600">0.964</p>
            </div>
          </div>
          <Button className="w-full bg-green-600 hover:bg-green-700">Deploy Configuration</Button>
        </CardContent>
      </Card>
    </div>
  );
}
