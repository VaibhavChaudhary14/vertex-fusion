import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Zap, Activity, FileJson, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DataIngestionPanel() {
  const [physicalStatus, setPhysicalStatus] = useState("idle");
  const [cyberStatus, setCyberStatus] = useState("idle");

  return (
    <Card className="border-primary/20 animate-neon">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-cyan-500" />
          Multi-Modal Data Ingestion
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="physical" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="physical" data-testid="tab-physical-ingestion">
              <Zap className="h-4 w-4 mr-2" />
              Physical Layer
            </TabsTrigger>
            <TabsTrigger value="cyber" data-testid="tab-cyber-ingestion">
              <Activity className="h-4 w-4 mr-2" />
              Cyber Layer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="physical" className="space-y-4 mt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Real-time power system measurements</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-muted rounded border border-primary/20">
                  <p className="text-muted-foreground">Active Power (P)</p>
                  <p className="font-semibold">1247.5 MW</p>
                </div>
                <div className="p-2 bg-muted rounded border border-primary/20">
                  <p className="text-muted-foreground">Reactive Power (Q)</p>
                  <p className="font-semibold">84.2 MVar</p>
                </div>
                <div className="p-2 bg-muted rounded border border-primary/20">
                  <p className="text-muted-foreground">Voltage</p>
                  <p className="font-semibold">138.5 kV</p>
                </div>
                <div className="p-2 bg-muted rounded border border-primary/20">
                  <p className="text-muted-foreground">Frequency</p>
                  <p className="font-semibold">59.98 Hz</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPhysicalStatus("connected")}
                data-testid="button-connect-physical"
              >
                <Upload className="h-4 w-4 mr-2" />
                Connect SCADA
              </Button>
              <Badge variant="outline" className={physicalStatus === "connected" ? "bg-success/20" : ""}>
                {physicalStatus === "connected" ? "Live" : "Idle"}
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="cyber" className="space-y-4 mt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Network traffic and device logs</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-muted rounded border border-primary/20">
                  <p className="text-muted-foreground">Packets/sec</p>
                  <p className="font-semibold">2,847</p>
                </div>
                <div className="p-2 bg-muted rounded border border-primary/20">
                  <p className="text-muted-foreground">Active Connections</p>
                  <p className="font-semibold">34</p>
                </div>
                <div className="p-2 bg-muted rounded border border-primary/20">
                  <p className="text-muted-foreground">Router Activity</p>
                  <p className="font-semibold">High</p>
                </div>
                <div className="p-2 bg-muted rounded border border-primary/20">
                  <p className="text-muted-foreground">PLC Commands</p>
                  <p className="font-semibold">156</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCyberStatus("connected")}
                data-testid="button-connect-cyber"
              >
                <FileJson className="h-4 w-4 mr-2" />
                Upload PCAP
              </Button>
              <Badge variant="outline" className={cyberStatus === "connected" ? "bg-success/20" : ""}>
                {cyberStatus === "connected" ? "Streaming" : "Idle"}
              </Badge>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-2 bg-muted/50 rounded border border-primary/10 text-xs text-muted-foreground">
          <p>🔄 Data Synchronization: Imputation engine harmonizes cyber/physical data streams</p>
        </div>
      </CardContent>
    </Card>
  );
}
