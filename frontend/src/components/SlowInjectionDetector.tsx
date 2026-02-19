import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown } from "lucide-react";

export function SlowInjectionDetector() {
  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-orange-500" />
          Slow Injection Attack Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-gradient-to-br from-orange-500/10 to-transparent rounded border border-orange-500/20">
          <p className="text-sm font-semibold mb-2">Temporal Anomaly Monitoring</p>
          <p className="text-xs text-muted-foreground">
            Detects gradual measurement alterations that mimic stealthy behavior over extended periods
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-xs">Active Slow Injection Monitors</p>
          {[
            { metric: "Bus Voltage Drift", threshold: 0.05, current: 0.032, window: "24h" },
            { metric: "Frequency Creep", threshold: 0.08, current: 0.041, window: "72h" },
            { metric: "Load Pattern Shift", threshold: 0.12, current: 0.087, window: "7d" },
          ].map((item) => (
            <div key={item.metric} className="p-2 bg-muted/50 rounded border border-orange-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{item.metric}</span>
                <Badge variant="outline" className="text-xs">{item.window}</Badge>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
                  style={{ width: `${(item.current / item.threshold) * 100}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>Current: {item.current.toFixed(3)}</span>
                <span>Threshold: {item.threshold}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-2 bg-background rounded border border-primary/10 text-xs space-y-1">
          <p className="text-muted-foreground">Detection Strategy</p>
          <p className="font-semibold">Multi-window temporal analysis with exponential decay monitoring</p>
        </div>
      </CardContent>
    </Card>
  );
}
