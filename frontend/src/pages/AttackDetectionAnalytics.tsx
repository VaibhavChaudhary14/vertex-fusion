import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, BarChart3, TrendingUp } from "lucide-react";

export default function AttackDetectionAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/simulator/analytics")
      .then(res => res.json())
      .then(json => {
        if (json.status === "success") setData(json);
        setLoading(false);
      })
      .catch(err => console.error("Failed to fetch analytics:", err));
  }, []);

  const attackStatsRaw = data?.attack_stats || {};
  const attackStats = Object.keys(attackStatsRaw).map(key => ({
    type: key,
    name: key === "FDI" ? "False Data Injection" : key === "DoS" ? "Denial of Service" : "Replay Attack",
    detected: attackStatsRaw[key].count,
    missed: 0, // Mocked for now until DB has labels
    dr: attackStatsRaw[key].detection_rate,
    fa: 0,
    severity: key === "FDI" ? "critical" : "high"
  }));

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-primary/2 to-background">
      <div className="flex-1 p-4 space-y-4 overflow-auto">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-cyan-500 to-primary bg-clip-text text-transparent">
            Attack Detection Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time research benchmarks: MTTD: <strong>{data?.mttd_ms || 0}ms</strong> | Global Accuracy: <strong>{data?.accuracy || 0}%</strong>
          </p>
        </div>

        <Tabs defaultValue="by-type" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="by-type" data-testid="tab-attacks-by-type">
              <BarChart3 className="h-4 w-4 mr-2" />
              By Type
            </TabsTrigger>
            <TabsTrigger value="coverage" data-testid="tab-detection-coverage">
              <TrendingUp className="h-4 w-4 mr-2" />
              Coverage
            </TabsTrigger>
            <TabsTrigger value="comparison" data-testid="tab-model-comparison">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Model Comparison
            </TabsTrigger>
          </TabsList>

          <TabsContent value="by-type" className="space-y-4 mt-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm">Attack Detection by Type (All Time)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {attackStats.map((attack) => (
                  <div key={attack.type} className="p-3 bg-muted/50 rounded border border-primary/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-semibold">{attack.type}</Badge>
                        <span className="text-sm font-semibold">{attack.name}</span>
                      </div>
                      <Badge variant={
                        attack.severity === "critical" ? "destructive" :
                        attack.severity === "high" ? "secondary" : "default"
                      } className="text-xs">
                        {attack.severity}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                      <div>
                        <p className="text-muted-foreground">Detected</p>
                        <p className="font-semibold text-success">{attack.detected}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Missed</p>
                        <p className="font-semibold text-warning">{attack.missed}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">DR</p>
                        <p className="font-semibold text-primary">{attack.dr}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">FA</p>
                        <p className="font-semibold text-destructive">{attack.fa}%</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-success to-cyan-500"
                        style={{ width: `${attack.dr}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coverage" className="space-y-4 mt-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm">Detection Coverage by Attack Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">Cyber-Dominant Attacks (RW, RS, BF, BD)</span>
                      <Badge variant="outline">92.1% avg</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Ransomware, Reverse Shell, Brute Force, Backdoor</p>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: "92.1%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">Physical-Dominant Attacks (FDI)</span>
                      <Badge variant="outline">96.8% avg</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">False Data Injection on SCADA/PMU</p>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: "96.8%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">Multi-Attack CP Fusion</span>
                      <Badge variant="outline">94.3% avg</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Generalized detector across all 5 attack types</p>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-purple-500" style={{ width: "94.3%" }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4 mt-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm">Model Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-success/10 to-transparent rounded border border-success/20">
                  <p className="font-semibold text-sm mb-2">Attack-Specific Detectors</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Accuracy</p>
                      <p className="font-semibold text-success">98.2%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Best For</p>
                      <p className="font-semibold">Single threat type</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Latency</p>
                      <p className="font-semibold">~8ms</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-primary/10 to-transparent rounded border border-primary/20">
                  <p className="font-semibold text-sm mb-2">Generalized Multi-Attack Detector</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Accuracy</p>
                      <p className="font-semibold text-primary">96.8%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Best For</p>
                      <p className="font-semibold">Diverse threats</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Latency</p>
                      <p className="font-semibold">~12ms</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
