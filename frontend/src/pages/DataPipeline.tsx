import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HyperparameterTuning } from "@/components/HyperparameterTuning";
import { SCADAProtocolIntegration } from "@/components/SCADAProtocolIntegration";
import { Database, Zap } from "lucide-react";

export default function DataPipeline() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-primary/2 to-background p-4 space-y-4 overflow-auto">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-cyan-500 to-primary bg-clip-text text-transparent">
          Data Pipeline & Model Optimization
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          SCADA protocol integration, real-time normalization, and hyper-parameter optimization
        </p>
      </div>

      <Tabs defaultValue="scada" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scada" data-testid="tab-scada">
            <Database className="h-4 w-4 mr-2" />
            SCADA Integration
          </TabsTrigger>
          <TabsTrigger value="tuning" data-testid="tab-hyperparameters">
            <Zap className="h-4 w-4 mr-2" />
            Hyper-Parameters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scada" className="space-y-4 mt-4">
          <SCADAProtocolIntegration />
          
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">Real-Time Feature Normalization Engine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="space-y-2">
                <p className="text-muted-foreground">Current Pipeline Status</p>
                {[
                  { stage: "SCADA Data Ingestion", status: "active", rate: "2,450 samples/sec" },
                  { stage: "Protocol Translation", status: "active", rate: "100% throughput" },
                  { stage: "Feature Normalization", status: "active", rate: "15ms latency" },
                  { stage: "One-Hot Encoding (Protocol)", status: "active", rate: "4 categories" },
                  { stage: "Cyber-Physical Fusion", status: "active", rate: "9-dim output" },
                ].map((item) => (
                  <div key={item.stage} className="p-2 bg-muted/50 rounded border border-primary/10 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{item.stage}</p>
                      <p className="text-muted-foreground">{item.rate}</p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tuning" className="space-y-4 mt-4">
          <HyperparameterTuning />

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">Previous Tuning Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {[
                { grid: "IEEE 14-bus", layers: 3, lr: 0.015, bs: 64, dr: 97.8, date: "Nov 28" },
                { grid: "IEEE 30-bus", layers: 4, lr: 0.01, bs: 32, dr: 98.2, date: "Nov 20" },
              ].map((result) => (
                <div key={result.grid} className="p-2 bg-muted/50 rounded border border-primary/10">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold">{result.grid}</p>
                    <p className="text-muted-foreground text-xs">{result.date}</p>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    L:{result.layers} • LR:{result.lr} • BS:{result.bs} → DR: {result.dr}%
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
