import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Shield, AlertCircle } from "lucide-react";

interface GNNMetrics {
  detectionRate: number;
  falseAlarmRate: number;
  inferenceTime: number;
  scalability: number;
}

export function GNNMetricsPanel({ metrics }: { metrics: GNNMetrics }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-success/20 bg-gradient-to-br from-success/10 to-transparent animate-in fade-in">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">Detection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-success animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{metrics.detectionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">vs 26% improvement</p>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 bg-gradient-to-br from-destructive/10 to-transparent animate-in fade-in">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">False Alarm Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{metrics.falseAlarmRate.toFixed(2)}%</div>
          <p className="text-xs text-muted-foreground mt-1">Lower is better</p>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent animate-in fade-in">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">Inference Time</CardTitle>
            <Brain className="h-4 w-4 text-primary animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{metrics.inferenceTime.toFixed(1)}ms</div>
          <p className="text-xs text-muted-foreground mt-1">GNN processing</p>
        </CardContent>
      </Card>

      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-transparent animate-in fade-in">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">Scalability</CardTitle>
            <Shield className="h-4 w-4 text-cyan-500 animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-cyan-500">+{metrics.scalability.toFixed(0)}%</div>
          <p className="text-xs text-muted-foreground mt-1">Large topology improvement</p>
        </CardContent>
      </Card>
    </div>
  );
}
