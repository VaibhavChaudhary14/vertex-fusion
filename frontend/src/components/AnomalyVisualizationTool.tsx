import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, AlertTriangle } from "lucide-react";

export function AnomalyVisualizationTool() {
  const activePowerData = [
    { time: "0s", benign: 248.5, attack: 248.5 },
    { time: "5s", benign: 249.2, attack: 249.1 },
    { time: "10s", benign: 248.8, attack: 248.9 },
    { time: "15s", benign: 249.5, attack: 185.3 },
    { time: "20s", benign: 249.1, attack: 142.7 },
  ];

  return (
    <Card className="border-warning/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-warning" />
          Real-Time Anomaly Visualization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Active Power (P) - Bus 6</p>
          <div className="space-y-1 text-xs">
            {activePowerData.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-muted-foreground w-10">{d.time}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-6 bg-gradient-to-r from-success to-cyan-500 rounded relative" style={{ width: `${(d.benign / 250) * 100}%` }}>
                    <span className="text-xs text-white px-1">{d.benign}</span>
                  </div>
                </div>
                {Math.abs(d.attack - d.benign) > 50 && (
                  <Badge variant="destructive" className="text-xs">
                    {Math.abs(d.attack - d.benign).toFixed(1)} dev
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-warning/10 border border-warning/20 rounded flex gap-2">
          <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-warning mb-1">Attack Detected at 15s</p>
            <p className="text-muted-foreground">Sharp deviation in active power indicates FDI attack on Bus 6</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
