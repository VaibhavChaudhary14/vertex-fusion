import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap } from "lucide-react";
import { useState } from "react";

export function DetectionModelSelector() {
  const [selectedModel, setSelectedModel] = useState<"generalized" | "specific">("generalized");

  const models = [
    {
      id: "generalized",
      name: "Generalized GNN Model",
      description: "Multi-attack CP data trained model",
      accuracy: "96.8%",
      attacks: "RW, FDI, RS, BF, BD",
      best: "Strong generalization across diverse threats",
    },
    {
      id: "specific",
      name: "Attack-Specific Detectors",
      description: "Specialized models per attack type",
      accuracy: "98.2%",
      attacks: "Choose per detection",
      best: "Higher accuracy for known threats",
    },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-cyan-500" />
          GNN Detection Model Deployment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {models.map((model) => (
          <div
            key={model.id}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
              selectedModel === model.id
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-primary/50"
            }`}
            onClick={() => setSelectedModel(model.id as "generalized" | "specific")}
            data-testid={`button-select-model-${model.id}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-sm">{model.name}</p>
                <p className="text-xs text-muted-foreground">{model.description}</p>
              </div>
              {selectedModel === model.id && <Badge variant="default">Active</Badge>}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
              <div className="p-2 bg-muted rounded">
                <p className="text-muted-foreground">Accuracy</p>
                <p className="font-semibold text-success">{model.accuracy}</p>
              </div>
              <div className="p-2 bg-muted rounded">
                <p className="text-muted-foreground">Threats</p>
                <p className="font-semibold">{model.attacks}</p>
              </div>
              <div className="p-2 bg-muted rounded">
                <p className="text-muted-foreground">Benefit</p>
                <p className="font-semibold text-primary text-xs">{model.best}</p>
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full" data-testid="button-deploy-model">
          <Zap className="h-4 w-4 mr-2" />
          Deploy Selected Model
        </Button>
      </CardContent>
    </Card>
  );
}
