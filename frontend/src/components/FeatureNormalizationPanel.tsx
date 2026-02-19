import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings2 } from "lucide-react";

export function FeatureNormalizationPanel() {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-cyan-500" />
          Feature Normalization & Encoding
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold mb-2">Numerical Features (Min-Max Normalization)</p>
            <div className="space-y-2 text-xs">
              {[
                { name: "Active Power (P)", range: "[0, 3000] MW", normalized: "[0, 1]" },
                { name: "Reactive Power (Q)", range: "[0, 500] MVar", normalized: "[0, 1]" },
                { name: "Voltage", range: "[69, 765] kV", normalized: "[0, 1]" },
                { name: "Current", range: "[0, 5000] A", normalized: "[0, 1]" },
                { name: "Frequency", range: "[59.5, 60.5] Hz", normalized: "[0, 1]" },
              ].map((f) => (
                <div key={f.name} className="p-2 bg-muted/50 rounded flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{f.name}</p>
                    <p className="text-muted-foreground text-xs">{f.range} → {f.normalized}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Numeric</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-primary/10 pt-3">
            <p className="text-sm font-semibold mb-2">Categorical Features (One-Hot Encoding)</p>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-muted/50 rounded">
                <p className="font-semibold mb-2">Protocol Type (Network Packets)</p>
                <div className="grid grid-cols-4 gap-1">
                  {["TCP", "UDP", "ICMP", "Other"].map((p) => (
                    <Badge key={p} variant="secondary" className="text-xs justify-center">
                      {p}
                    </Badge>
                  ))}
                </div>
                <p className="text-muted-foreground mt-2">Binary encoding: [1,0,0,0] → TCP, [0,1,0,0] → UDP, etc.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-primary/10 pt-3">
            <p className="text-sm font-semibold mb-2">CP Fusion Data Imputation</p>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-background rounded border border-primary/20">
                <p className="text-muted-foreground mb-1">Synchronization Strategy</p>
                <p className="font-semibold">Temporal Alignment via Interpolation</p>
                <p className="text-muted-foreground mt-1">Matches cyber data (PCAP) with physical data (SCADA) at common timestamps</p>
              </div>
              <div className="p-2 bg-background rounded border border-primary/20">
                <p className="text-muted-foreground mb-1">Final Feature Vector</p>
                <p className="font-semibold">X = [X_c, X_p]</p>
                <p className="text-muted-foreground mt-1">Concatenated 4 cyber features + 5 physical features = 9-dim vector per node</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
