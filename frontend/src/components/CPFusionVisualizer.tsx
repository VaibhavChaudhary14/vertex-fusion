import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, GitBranch } from "lucide-react";

interface CPFusionData {
  cyberFeatures: {
    label: string;
    value: number;
    anomaly: number;
  }[];
  physicalFeatures: {
    label: string;
    value: number;
    anomaly: number;
  }[];
  fusedScore: number;
}

export function CPFusionVisualizer({ data }: { data: CPFusionData }) {
  const [activeTab, setActiveTab] = useState<"cyber" | "physical" | "fused">("fused");

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-background via-primary/5 to-background overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="animate-pulse">
              <GitBranch className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium">CP Fusion Analysis</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">Multi-Modal</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 border-b">
          {(["cyber", "physical", "fused"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs font-medium transition-all ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`tab-cp-${tab}`}
            >
              {tab === "cyber" && <Activity className="h-3 w-3 inline mr-1" />}
              {tab === "physical" && <Zap className="h-3 w-3 inline mr-1" />}
              {tab === "fused" && <GitBranch className="h-3 w-3 inline mr-1" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {activeTab === "cyber" &&
            data.cyberFeatures.map((feat, i) => (
              <div key={i} className="space-y-1 animate-in fade-in duration-300">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{feat.label}</span>
                  <span className="font-semibold">{feat.value.toFixed(2)}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(feat.value * 100, 100)}%` }}
                  />
                </div>
                {feat.anomaly > 0.3 && (
                  <div className="text-xs text-warning">Anomaly: {(feat.anomaly * 100).toFixed(1)}%</div>
                )}
              </div>
            ))}

          {activeTab === "physical" &&
            data.physicalFeatures.map((feat, i) => (
              <div key={i} className="space-y-1 animate-in fade-in duration-300">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{feat.label}</span>
                  <span className="font-semibold">{feat.value.toFixed(2)}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${Math.min(feat.value * 100, 100)}%` }}
                  />
                </div>
                {feat.anomaly > 0.3 && (
                  <div className="text-xs text-warning">Anomaly: {(feat.anomaly * 100).toFixed(1)}%</div>
                )}
              </div>
            ))}

          {activeTab === "fused" && (
            <div className="py-4 space-y-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">Fused Detection Score</p>
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      className="text-muted opacity-20"
                      strokeWidth="2"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="url(#grad)"
                      strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * 45 * data.fusedScore} ${2 * Math.PI * 45}`}
                      className="transition-all duration-1000"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{(data.fusedScore * 100).toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">Detection Score</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
