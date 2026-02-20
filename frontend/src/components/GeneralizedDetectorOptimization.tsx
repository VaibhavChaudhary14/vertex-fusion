import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Play, RotateCw } from "lucide-react";
import { useState } from "react";

export function GeneralizedDetectorOptimization() {
  const [optimizing, setOptimizing] = useState(false);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-cyan-500" />
          Generalized Detector Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-gradient-to-br from-blue-500/10 to-transparent rounded border border-blue-500/20">
          <p className="text-sm font-semibold mb-2">Multi-Attack Model Optimization</p>
          <p className="text-xs text-muted-foreground">
            Improves generalized IDS trained on multi-attack CP data to handle unseen attack types without retraining
          </p>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2 bg-muted/50 rounded border border-primary/10">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">Unseen Attack Generalization</span>
              <Badge variant="outline">94.3%</Badge>
            </div>
            <p className="text-muted-foreground">Performance on novel attack patterns not in training set</p>
          </div>

          <div className="p-2 bg-muted/50 rounded border border-primary/10">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">Retraining Reduction</span>
              <Badge variant="outline">87%</Badge>
            </div>
            <p className="text-muted-foreground">Decrease in frequency of required model updates</p>
          </div>

          <div className="p-2 bg-muted/50 rounded border border-primary/10">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">Knowledge Transfer</span>
              <Badge variant="outline">91%</Badge>
            </div>
            <p className="text-muted-foreground">Effectiveness of learned features on new attack types</p>
          </div>
        </div>

        <div className="p-2 bg-background rounded border border-primary/10 space-y-1 text-xs">
          <p className="text-muted-foreground mb-1">Optimization Strategy</p>
          <p className="font-semibold">Advanced feature extraction learning + Contrastive loss training</p>
          <p className="text-muted-foreground mt-1">Learns invariant representations across attack space for maximum transferability</p>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={() => setOptimizing(!optimizing)}
            data-testid="button-optimize-detector"
          >
            <Play className="h-3.5 w-3.5 mr-2" />
            {optimizing ? "Optimizing..." : "Start Optimization"}
          </Button>
          <Button size="sm" variant="outline" data-testid="button-export-generalized">
            <RotateCw className="h-3.5 w-3.5 mr-2" />
            Export Model
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
