import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, RotateCw } from "lucide-react";
import { useState } from "react";

export function OnlineLearningModule() {
  const [learningActive, setLearningActive] = useState(true);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Adaptive Online Learning Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-gradient-to-br from-yellow-500/10 to-transparent rounded border border-yellow-500/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">Learning Status</p>
            <Badge variant={learningActive ? "default" : "secondary"}>
              {learningActive ? "Active" : "Paused"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Continuously adapting to emerging attack patterns without full retraining
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Model Adaptation Metrics</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-background rounded border border-primary/10">
              <p className="text-muted-foreground mb-1">Samples Processed</p>
              <p className="font-semibold text-cyan-500">124,568</p>
            </div>
            <div className="p-2 bg-background rounded border border-primary/10">
              <p className="text-muted-foreground mb-1">Model Updates</p>
              <p className="font-semibold text-cyan-500">487</p>
            </div>
            <div className="p-2 bg-background rounded border border-primary/10">
              <p className="text-muted-foreground mb-1">DR Improvement</p>
              <p className="font-semibold text-success">+2.3%</p>
            </div>
            <div className="p-2 bg-background rounded border border-primary/10">
              <p className="text-muted-foreground mb-1">FA Reduction</p>
              <p className="font-semibold text-warning">-0.8%</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Emerging Patterns Detected</p>
          <div className="space-y-1 text-xs">
            {[
              { pattern: "Temporal correlation in FDI attacks", confidence: 89 },
              { pattern: "Multi-vector ransomware signatures", confidence: 76 },
              { pattern: "Stealthy frequency deviations", confidence: 92 },
            ].map((item, i) => (
              <div key={i} className="p-2 bg-muted/50 rounded flex items-center justify-between">
                <span className="text-muted-foreground">{item.pattern}</span>
                <Badge variant="outline" className="text-xs">{item.confidence}%</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={learningActive ? "destructive" : "default"}
            onClick={() => setLearningActive(!learningActive)}
            data-testid="button-toggle-learning"
          >
            {learningActive ? "Pause Learning" : "Resume Learning"}
          </Button>
          <Button size="sm" variant="outline" data-testid="button-export-model">
            <RotateCw className="h-3 w-3 mr-1" />
            Export Checkpoint
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
