import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Network, Settings, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function GraphModelingTool() {
  const [observability, setObservability] = useState<"full" | "partial">("full");
  
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-cyan-500" />
          CP Graph Definition & Observability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-2 bg-gradient-to-br from-primary/10 to-transparent rounded border border-primary/20">
            <p className="text-muted-foreground mb-1">Nodes (Physical)</p>
            <p className="font-semibold text-base">14</p>
            <p className="text-xs text-muted-foreground mt-1">Buses, Generators, Loads</p>
          </div>
          <div className="p-2 bg-gradient-to-br from-cyan-500/10 to-transparent rounded border border-cyan-500/20">
            <p className="text-muted-foreground mb-1">Nodes (Cyber)</p>
            <p className="font-semibold text-base">6</p>
            <p className="text-xs text-muted-foreground mt-1">PLCs, Routers, HMIs</p>
          </div>
          <div className="p-2 bg-gradient-to-br from-primary/10 to-transparent rounded border border-primary/20">
            <p className="text-muted-foreground mb-1">Edges (Coupling)</p>
            <p className="font-semibold text-base">20</p>
            <p className="text-xs text-muted-foreground mt-1">Weighted connections</p>
          </div>
        </div>

        <div className="space-y-2 p-3 bg-muted/50 rounded border border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {observability === "full" ? <Eye className="h-4 w-4 text-success" /> : <EyeOff className="h-4 w-4 text-warning" />}
              <span className="text-sm font-medium">Observability Mode</span>
            </div>
            <Badge variant={observability === "full" ? "default" : "secondary"}>
              {observability === "full" ? "Full" : "Partial"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {observability === "full"
              ? "All critical nodes monitored via cyber layer"
              : "Subset of critical nodes monitored (realistic SCADA)"}
          </p>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant={observability === "full" ? "default" : "outline"}
              onClick={() => setObservability("full")}
              className="text-xs"
              data-testid="button-full-observability"
            >
              Full Observability
            </Button>
            <Button
              size="sm"
              variant={observability === "partial" ? "default" : "outline"}
              onClick={() => setObservability("partial")}
              className="text-xs"
              data-testid="button-partial-observability"
            >
              Partial Mode
            </Button>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full" data-testid="button-edit-topology">
          <Settings className="h-4 w-4 mr-2" />
          Edit Graph & Node Criticality
        </Button>
      </CardContent>
    </Card>
  );
}
