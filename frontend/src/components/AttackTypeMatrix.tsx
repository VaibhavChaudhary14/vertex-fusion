import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AttackType } from "@shared/schema";
import { attackTypeLabels } from "@shared/schema";

interface AttackMetrics {
  type: AttackType;
  detectionRate: number;
  commonNodes: string[];
  severity: "critical" | "high" | "medium" | "low";
}

const attackData: AttackMetrics[] = [
  { type: "RW", detectionRate: 94.2, commonNodes: ["plc1", "plc2", "router1"], severity: "critical" },
  { type: "FDI", detectionRate: 96.8, commonNodes: ["bus1", "bus6", "load2"], severity: "critical" },
  { type: "RS", detectionRate: 92.5, commonNodes: ["plc3", "hmi1"], severity: "high" },
  { type: "BF", detectionRate: 87.3, commonNodes: ["router1", "pmu1"], severity: "high" },
  { type: "BD", detectionRate: 85.1, commonNodes: ["pmu1", "hmi1"], severity: "medium" },
];

export function AttackTypeMatrix() {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Attack Type Detection Matrix</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {attackData.map((attack) => (
          <div key={attack.type} className="space-y-2 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-semibold">
                  {attack.type}
                </Badge>
                <span className="text-xs text-muted-foreground">{attackTypeLabels[attack.type]}</span>
              </div>
              <Badge
                variant="secondary"
                className={
                  attack.severity === "critical"
                    ? "bg-destructive/20 text-destructive"
                    : attack.severity === "high"
                      ? "bg-warning/20 text-warning"
                      : "bg-primary/20 text-primary"
                }
              >
                {attack.severity}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Detection Rate</span>
                <span className="font-semibold text-success">{attack.detectionRate.toFixed(1)}%</span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-success to-cyan-500 transition-all duration-500"
                  style={{ width: `${attack.detectionRate}%` }}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {attack.commonNodes.map((node) => (
                <Badge key={node} variant="ghost" className="text-xs">
                  {node}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
