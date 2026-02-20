import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export function BenchmarkComparison() {
  const benchmarks = [
    { model: "GNN (CP Fusion)", dr: 97.8, fa: 1.2, f1: 0.978, advantage: "26%", color: "from-primary" },
    { model: "SVM (Baseline)", dr: 87.5, fa: 3.2, f1: 0.875, advantage: "-", color: "from-gray-400" },
    { model: "ARIMA", dr: 75.2, fa: 8.5, f1: 0.721, advantage: "-", color: "from-gray-500" },
    { model: "FNN (Deep)", dr: 81.3, fa: 6.1, f1: 0.802, advantage: "-", color: "from-gray-400" },
    { model: "LSTM-RNN", dr: 85.6, fa: 4.3, f1: 0.845, advantage: "-", color: "from-gray-500" },
    { model: "AEA (Unsupervised)", dr: 72.4, fa: 12.1, f1: 0.682, advantage: "-", color: "from-gray-400" },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-cyan-500" />
          Benchmark Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-primary/20">
                <th className="text-left p-2 font-semibold">Model</th>
                <th className="text-right p-2 font-semibold">DR%</th>
                <th className="text-right p-2 font-semibold">FA%</th>
                <th className="text-right p-2 font-semibold">F1</th>
                <th className="text-right p-2 font-semibold">Advantage</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((b) => (
                <tr key={b.model} className="border-b border-primary/10 hover:bg-muted/50">
                  <td className="p-2 font-semibold text-foreground">{b.model}</td>
                  <td className="text-right p-2">
                    <span className="font-semibold text-success">{b.dr}%</span>
                  </td>
                  <td className="text-right p-2">
                    <span className="font-semibold text-destructive">{b.fa}%</span>
                  </td>
                  <td className="text-right p-2">
                    <span className="font-semibold text-primary">{b.f1.toFixed(3)}</span>
                  </td>
                  <td className="text-right p-2">
                    {b.advantage === "-" ? (
                      <Badge variant="outline" className="text-xs">Baseline</Badge>
                    ) : (
                      <Badge className="text-xs bg-success">{b.advantage} better</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-success/10 rounded border border-success/20 text-xs">
          <p className="font-semibold text-success mb-1">Key Finding</p>
          <p>GNN achieves 26% higher detection rate while maintaining lowest false alarm rate. Statistical significance validated across 5 independent test runs.</p>
        </div>
      </CardContent>
    </Card>
  );
}
