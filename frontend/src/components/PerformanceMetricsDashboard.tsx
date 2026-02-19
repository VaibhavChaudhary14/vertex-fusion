import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, AlertTriangle, Zap } from "lucide-react";

export function PerformanceMetricsDashboard() {
  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-500" />
            Real-Time IDS Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gradient-to-br from-success/10 to-transparent rounded border border-success/20">
              <p className="text-xs text-muted-foreground mb-2">Detection Rate (DR)</p>
              <p className="text-3xl font-bold text-success">97.8%</p>
              <p className="text-xs text-muted-foreground mt-2">Correctly identified malicious samples</p>
              <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-success" style={{ width: "97.8%" }} />
              </div>
            </div>

            <div className="p-3 bg-gradient-to-br from-destructive/10 to-transparent rounded border border-destructive/20">
              <p className="text-xs text-muted-foreground mb-2">False Alarm Rate (FA)</p>
              <p className="text-3xl font-bold text-destructive">1.2%</p>
              <p className="text-xs text-muted-foreground mt-2">Benign misclassified as malicious</p>
              <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-destructive" style={{ width: "1.2%" }} />
              </div>
            </div>

            <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent rounded border border-primary/20">
              <p className="text-xs text-muted-foreground mb-2">F1-Score</p>
              <p className="text-3xl font-bold text-primary">0.978</p>
              <p className="text-xs text-muted-foreground mt-2">Precision-Recall balance</p>
              <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: "97.8%" }} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded border border-primary/10 space-y-3">
            <p className="text-sm font-semibold">Inference Performance</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between p-2 bg-background rounded">
                <span className="text-muted-foreground">Inference Time</span>
                <span className="font-semibold text-cyan-500">12.5ms</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-background rounded">
                <span className="text-muted-foreground">Samples/sec</span>
                <span className="font-semibold text-cyan-500">80+</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-background rounded">
                <span className="text-muted-foreground">Model Size</span>
                <span className="font-semibold text-cyan-500">2.4MB</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-background rounded">
                <span className="text-muted-foreground">Memory Usage</span>
                <span className="font-semibold text-cyan-500">145MB</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-500" />
            Performance Trend (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { day: "Mon", dr: 96.5, fa: 1.4 },
              { day: "Tue", dr: 96.8, fa: 1.3 },
              { day: "Wed", dr: 97.1, fa: 1.2 },
              { day: "Thu", dr: 97.3, fa: 1.1 },
              { day: "Fri", dr: 97.6, fa: 1.2 },
              { day: "Sat", dr: 97.7, fa: 1.2 },
              { day: "Sun", dr: 97.8, fa: 1.2 },
            ].map((d) => (
              <div key={d.day} className="flex items-center justify-between text-xs">
                <span className="w-10 text-muted-foreground">{d.day}</span>
                <div className="flex-1 mx-3">
                  <div className="flex gap-1 h-4">
                    <div className="flex-1 bg-gradient-to-r from-success to-cyan-500 rounded flex items-center justify-center text-white text-xs font-semibold" style={{ width: `${d.dr}%` }}>
                      {d.dr}%
                    </div>
                  </div>
                </div>
                <span className="w-12 text-right font-semibold text-destructive">FA: {d.fa}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
