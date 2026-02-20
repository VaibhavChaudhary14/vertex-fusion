import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sliders, Play } from "lucide-react";
import { useState } from "react";

export function HyperparameterTuning() {
  const [tuningActive, setTuningActive] = useState(false);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-blue-500" />
          Hyper-Parameter Tuning (Grid Search)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-gradient-to-br from-blue-500/10 to-transparent rounded border border-blue-500/20">
          <p className="text-sm font-semibold mb-2">Sequential Grid Search Optimization</p>
          <p className="text-xs text-muted-foreground">
            Automatically determines optimal hyper-parameters for your specific grid topology
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-2 bg-muted/50 rounded border border-primary/10 space-y-1">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">GNN Layers</span>
              <Badge variant="outline">2, 3, 4, 5</Badge>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: "60%" }} />
            </div>
            <p className="text-muted-foreground">Optimal: 3 layers (DR: 97.8%)</p>
          </div>

          <div className="p-2 bg-muted/50 rounded border border-primary/10 space-y-1">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">Learning Rate</span>
              <Badge variant="outline">0.001 - 0.1</Badge>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: "45%" }} />
            </div>
            <p className="text-muted-foreground">Optimal: 0.015 (convergence: 287 epochs)</p>
          </div>

          <div className="p-2 bg-muted/50 rounded border border-primary/10 space-y-1">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">Batch Size</span>
              <Badge variant="outline">16, 32, 64, 128</Badge>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: "75%" }} />
            </div>
            <p className="text-muted-foreground">Optimal: 64 (memory efficient, stable)</p>
          </div>

          <div className="p-2 bg-muted/50 rounded border border-primary/10 space-y-1">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">Dropout Rate</span>
              <Badge variant="outline">0.1 - 0.5</Badge>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: "55%" }} />
            </div>
            <p className="text-muted-foreground">Optimal: 0.3 (regularization balance)</p>
          </div>
        </div>

        <div className="p-2 bg-background rounded border border-primary/10 text-xs">
          <p className="text-muted-foreground mb-1">Search Space</p>
          <p className="font-semibold">4 × 8 × 4 × 5 = 640 configurations</p>
          <p className="text-muted-foreground mt-1">Est. time: 18 hours (IEEE 14-bus)</p>
        </div>

        <Button 
          size="sm" 
          className="w-full" 
          onClick={() => setTuningActive(!tuningActive)}
          data-testid="button-start-tuning"
        >
          <Play className="h-3.5 w-3.5 mr-2" />
          {tuningActive ? "Tuning In Progress..." : "Start Grid Search"}
        </Button>
      </CardContent>
    </Card>
  );
}
