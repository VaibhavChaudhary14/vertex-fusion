import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Crosshair } from "lucide-react";

export function AttackLocalizationTool() {
  const attacks = [
    {
      id: "ATK-001",
      type: "FDI",
      location: "Bus 14 (Load Center)",
      confidence: 96,
      nodes: ["14", "11", "12"],
      classification: "False Data Injection"
    },
    {
      id: "ATK-002",
      type: "RW",
      location: "Router R-3 (Network Edge)",
      confidence: 87,
      nodes: ["N-3", "N-5"],
      classification: "Ransomware"
    },
    {
      id: "ATK-003",
      type: "RS",
      location: "PLC-B (Generator Control)",
      confidence: 92,
      nodes: ["G2", "N-2", "N-4"],
      classification: "Reverse Shell"
    },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crosshair className="h-5 w-5 text-cyan-500" />
          Attack Localization & Classification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Multi-task GNN learning identifies attack location on graph and attack type classification
        </p>

        <div className="space-y-2">
          {attacks.map((attack) => (
            <div key={attack.id} className="p-2.5 bg-muted/50 rounded border border-primary/10 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{attack.id}</Badge>
                    <Badge className="text-xs">{attack.type}</Badge>
                  </div>
                  <p className="text-sm font-semibold">{attack.classification}</p>
                </div>
                <Badge variant={attack.confidence > 90 ? "default" : "secondary"} className="text-xs">
                  {attack.confidence}%
                </Badge>
              </div>

              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                  <span className="text-muted-foreground">{attack.location}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {attack.nodes.map((node) => (
                    <Badge key={node} variant="secondary" className="text-xs px-1.5 py-0">
                      {node}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
