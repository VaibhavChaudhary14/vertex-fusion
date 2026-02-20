import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Filter } from "lucide-react";
import { useState } from "react";

export function CriticalNodeSelector() {
  const [selectedThreshold, setSelectedThreshold] = useState(35);

  const nodes = [
    { id: "14", type: "Load", importance: 98, factors: ["High load", "Central", "Critical zone"] },
    { id: "5", type: "Generator", importance: 95, factors: ["Generation hub", "High voltage"] },
    { id: "11", type: "Load", importance: 92, factors: ["Regional distributor"] },
    { id: "13", type: "Substation", importance: 88, factors: ["Transmission point"] },
    { id: "6", type: "Generator", importance: 85, factors: ["Backup generation"] },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Critical Node Selector (Partial Observability)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-gradient-to-br from-amber-500/10 to-transparent rounded border border-amber-500/20 space-y-2">
          <p className="text-sm font-semibold">AHP-Based Criticality Scoring</p>
          <p className="text-xs text-muted-foreground">
            Selects top {selectedThreshold}% critical nodes using: effective graph resistance, load shedding impact, connectivity, geodesic vulnerability
          </p>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="10"
              max="100"
              value={selectedThreshold}
              onChange={(e) => setSelectedThreshold(Number(e.target.value))}
              className="flex-1 h-2 bg-muted rounded"
            />
            <span className="text-xs font-semibold w-8 text-right">{selectedThreshold}%</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Selected Critical Nodes</p>
          <div className="space-y-1 text-xs">
            {nodes.map((node) => (
              <div key={node.id} className="p-2 bg-background rounded border border-amber-500/20 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{node.id}</Badge>
                    <span className="text-muted-foreground">{node.type}</span>
                  </div>
                  <Badge className="text-xs">{node.importance}</Badge>
                </div>
                <div className="text-muted-foreground text-xs">
                  {node.factors.join(" • ")}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button size="sm" variant="outline" className="w-full" data-testid="button-export-critical-nodes">
          <Filter className="h-3.5 w-3.5 mr-2" />
          Export Configuration
        </Button>
      </CardContent>
    </Card>
  );
}
