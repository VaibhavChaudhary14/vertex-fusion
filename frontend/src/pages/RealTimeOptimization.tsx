import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Activity } from "lucide-react";

export default function RealTimeOptimization() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-primary/5 to-background p-4 space-y-4 overflow-auto">
      <div className="relative z-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-cyan-500 to-primary bg-clip-text text-transparent">
          Real-Time Deployment Optimization
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Optimize inference latency and throughput for production deployment
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-primary/20 hover-elevate fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Inference Optimization Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-2 bg-muted/50 rounded border border-primary/10">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">Data Ingestion</span>
                <Badge variant="outline">2,450 samples/sec</Badge>
              </div>
              <p className="text-muted-foreground">SCADA protocol ingestion rate</p>
            </div>

            <div className="p-2 bg-muted/50 rounded border border-primary/10">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">Normalization</span>
                <Badge variant="outline">15ms latency</Badge>
              </div>
              <p className="text-muted-foreground">Min-Max scaling + One-Hot encoding</p>
            </div>

            <div className="p-2 bg-muted/50 rounded border border-primary/10">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">GNN Inference</span>
                <Badge variant="outline">12.5ms</Badge>
              </div>
              <p className="text-muted-foreground">Chebyshev approximation with GPU</p>
            </div>

            <div className="p-2 bg-muted/50 rounded border border-primary/10">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">Total Pipeline</span>
                <Badge variant="outline">27.5ms</Badge>
              </div>
              <p className="text-muted-foreground">End-to-end latency for sub-second updates</p>
            </div>

            <div className="p-2 bg-success/10 rounded border border-success/20">
              <p className="font-semibold text-success text-xs mb-1">Target Achieved</p>
              <p className="text-muted-foreground text-xs">Enables real-time deployment in production grids</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover-elevate fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-500" />
              Throughput Scaling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {[
              { level: "Single CPU Core", throughput: "12 samples/sec" },
              { level: "Multi-core CPU (16x)", throughput: "140 samples/sec" },
              { level: "GPU (NVIDIA A100)", throughput: "300+ samples/sec" },
              { level: "GPU (NVIDIA H100)", throughput: "500+ samples/sec" },
              { level: "TPU v4", throughput: "720+ samples/sec" },
              { level: "Distributed (4 nodes)", throughput: "2000+ samples/sec" },
            ].map((row) => (
              <div key={row.level} className="p-2 bg-muted/50 rounded border border-primary/10 flex justify-between items-center">
                <span className="font-semibold">{row.level}</span>
                <Badge variant="outline" className="text-xs">{row.throughput}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 hover-elevate fade-in-up">
        <CardHeader>
          <CardTitle>Production Deployment Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "✓ Sub-30ms end-to-end latency",
              "✓ 80+ samples/sec throughput",
              "✓ GPU acceleration enabled",
              "✓ Distributed GNN for scaling",
              "✓ Real-time feature normalization",
              "✓ Online learning adaptive mode",
              "✓ Partial observability (35% nodes)",
              "✓ Hardware acceleration configured",
            ].map((item) => (
              <div key={item} className="p-2 bg-muted/50 rounded flex items-start gap-2">
                <span className="text-success font-bold">✓</span>
                <span className="text-muted-foreground">{item.substring(2)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
