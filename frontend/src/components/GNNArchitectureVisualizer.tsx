import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";

export function GNNArchitectureVisualizer() {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-cyan-500" />
          GNN Architecture (Chebyshev Graph Convolution)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded border border-primary/20 p-4 space-y-4">
          {/* Input Layer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Input Layer</span>
              <Badge variant="outline" className="text-xs">CP Fused Features</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded border border-cyan-500/30">
                <p className="text-muted-foreground">Cyber (X_c)</p>
                <p className="font-semibold">IP, Port, Protocol</p>
              </div>
              <div className="p-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded border border-amber-500/30">
                <p className="text-muted-foreground">Physical (X_p)</p>
                <p className="font-semibold">P, Q, V, Freq</p>
              </div>
              <div className="p-2 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded border border-primary/30">
                <p className="text-muted-foreground">Fused ([X_c, X_p])</p>
                <p className="font-semibold">Multi-modal</p>
              </div>
            </div>
          </div>

          {/* Graph Convolution Layers */}
          <div className="space-y-2">
            <span className="text-sm font-semibold">Stacked Chebyshev Convolution Layers</span>
            {[1, 2, 3].map((layer) => (
              <div key={layer} className="p-2 bg-background rounded border border-primary/10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Layer {layer}</p>
                  <p className="text-xs text-muted-foreground">Spatial feature extraction with ReLU</p>
                </div>
                <Badge variant="secondary" className="text-xs">64 filters</Badge>
              </div>
            ))}
          </div>

          {/* Graph Structure */}
          <div className="space-y-2">
            <span className="text-sm font-semibold">Graph Structure G=(V,E,W)</span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-background rounded border border-primary/10">
                <p className="text-muted-foreground mb-1">Nodes (V)</p>
                <p className="font-semibold">20</p>
                <p className="text-xs text-muted-foreground">14 phys + 6 cyber</p>
              </div>
              <div className="p-2 bg-background rounded border border-primary/10">
                <p className="text-muted-foreground mb-1">Edges (E)</p>
                <p className="font-semibold">34</p>
                <p className="text-xs text-muted-foreground">Weighted connections</p>
              </div>
              <div className="p-2 bg-background rounded border border-primary/10">
                <p className="text-muted-foreground mb-1">Weights (W)</p>
                <p className="font-semibold">3 types</p>
                <p className="text-xs text-muted-foreground">W_p, W_c, W_cp</p>
              </div>
            </div>
          </div>

          {/* Output Layer */}
          <div className="space-y-2">
            <span className="text-sm font-semibold">Output Layer (Sigmoid)</span>
            <div className="p-2 bg-gradient-to-r from-success/10 to-destructive/10 rounded border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Binary Classification</p>
              <p className="font-semibold">P(Attack) = σ(output)</p>
              <p className="text-xs text-muted-foreground mt-1">Threshold: 0.5</p>
            </div>
          </div>

          {/* Training Info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-background rounded border border-primary/10">
              <p className="text-muted-foreground">Loss Function</p>
              <p className="font-semibold text-primary">Cross-Entropy</p>
            </div>
            <div className="p-2 bg-background rounded border border-primary/10">
              <p className="text-muted-foreground">Activation</p>
              <p className="font-semibold text-primary">ReLU + Sigmoid</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
