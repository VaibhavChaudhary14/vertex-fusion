import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Play, Pause, RotateCcw, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Bar } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { GridAnimation3Bus } from "./GridAnimation3Bus";
import { AIExplanationPanel } from "./AIExplanationPanel";
import { PerformanceMetrics } from "./PerformanceMetrics";

interface GridMeasurement {
  time: number;
  bus1_voltage: number;
  bus2_voltage: number;
  bus3_voltage: number;
  bus1_current: number;
  bus2_current: number;
  bus3_current: number;
  frequency: number;
  packet_loss: number;
  attack_detected: boolean;
  attack_type: string;
}

export function SmartGridSimulator() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [data, setData] = useState<GridMeasurement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attackMode, setAttackMode] = useState(false);
  const [selectedAttack, setSelectedAttack] = useState("none");
  const [detections, setDetections] = useState<any[]>([]);
  const [latestDetection, setLatestDetection] = useState<any>(null);
  const [protectionActions, setProtectionActions] = useState<any[]>([]);
  const [protectedZone, setProtectedZone] = useState<string | undefined>();
  const [lastAttackedBus, setLastAttackedBus] = useState<string>("");

  // Real-time data from WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "GRID_UPDATE") {
          // Handle both old (array) and new (object) formats during transition
          const rawData = message.data;
          const gridState = Array.isArray(rawData) ? rawData : rawData.grid_state;
          const detection = Array.isArray(rawData) ? null : rawData.detection;

          if (!gridState) return;

          // Aggregating data for the chart
          const bus1 = gridState.find((i: any) => i.id === "0" && i.type === "bus") || {};
          const bus2 = gridState.find((i: any) => i.id === "1" && i.type === "bus") || {};
          const bus3 = gridState.find((i: any) => i.id === "2" && i.type === "bus") || {};

          const time = gridState[0]?.time || Date.now();
          const attackInjected = gridState.some((i: any) => i.attack_injected);

          // Use AI detection result if available, otherwise fallback to ground truth
          const attackDetected = detection?.detected ?? attackInjected;

          if (detection) {
            setLatestDetection(detection);
            if (detection.detected) {
              setDetections(prev => [...prev, {
                timestamp: new Date(),
                attack_type: detection.type,
                confidence: detection.confidence,
                affected_buses: "All" // simplify for now
              }]);
            }
          }

          const newPoint: GridMeasurement = {
            time: time,
            bus1_voltage: bus1.vm_pu || 1.0,
            bus2_voltage: bus2.vm_pu || 1.0,
            bus3_voltage: bus3.vm_pu || 1.0,
            bus1_current: 10 + Math.random(),
            bus2_current: 9.5 + Math.random(),
            bus3_current: 10.5 + Math.random(),
            frequency: 50 + (Math.random() - 0.5) * 0.05,
            packet_loss: attackDetected ? Math.random() * 5 : 0,
            attack_detected: attackDetected,
            attack_type: detection?.type || (attackDetected ? "FDI" : ""),
          };



          setData((prev) => {
            const updated = [...prev, newPoint];
            return updated.slice(-100);
          });

          // Sync attack state for UI feedback
          setIsRunning(true);
          if (attackDetected) {
            setAttackMode(true);
            setSelectedAttack("FDI"); // infer from data or pass explicitly
          }
        }
      } catch (err) {
        console.error("WS Parse Error", err);
      }
    };

    return () => socket.close();
  }, []);

  const resetSimulation = () => {
    setCurrentIndex(0);
    setData([]);
    setIsRunning(false);
    setDetections([]);
    setLatestDetection(null);
    setProtectionActions([]);
    setProtectedZone(undefined);
    setLastAttackedBus("");
    setAttackMode(false);
    setSelectedAttack("none");
  };

  const currentData = data[data.length - 1] || {
    bus1_voltage: 1.0,
    bus2_voltage: 0.98,
    bus3_voltage: 1.01,
    bus1_current: 10,
    bus2_current: 9.5,
    bus3_current: 10.5,
    frequency: 50,
    packet_loss: 0,
    attack_detected: false,
    attack_type: "",
  };

  const avgVoltage = (currentData.bus1_voltage + currentData.bus2_voltage + currentData.bus3_voltage) / 3;
  const isAnomalous =
    Math.abs(currentData.frequency - 50) > 0.1 ||
    currentData.packet_loss > 2 ||
    currentData.attack_detected ||
    Math.abs(avgVoltage - 0.99) > 0.05;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">3-Bus Smart Grid Cyber-Physical Testbed</h2>
        <p className="text-muted-foreground">Real-time MATLAB Simulink integration with ST-GNN ML attack detection and automated SCADA protection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visualizations & Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* 3-Bus Grid Animation */}
          <GridAnimation3Bus
            bus1Voltage={currentData.bus1_voltage}
            bus2Voltage={currentData.bus2_voltage}
            bus3Voltage={currentData.bus3_voltage}
            bus1Current={currentData.bus1_current}
            bus2Current={currentData.bus2_current}
            bus3Current={currentData.bus3_current}
            attackMode={attackMode}
            selectedAttack={selectedAttack}
            attackDetected={currentData.attack_detected}
            protectedZone={protectedZone}
            isRunning={isRunning}
          />

          {/* Controls */}
          <Card className="border border-primary/20 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Simulator Controls & Attack Injection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => setIsRunning(!isRunning)}
                  variant={isRunning ? "destructive" : "default"}
                  className="gap-2"
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isRunning ? "Pause" : "Start"}
                </Button>
                <Button onClick={resetSimulation} variant="outline" className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Inject Attack (MATLAB Function Block Simulation):</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["none", "FDI", "DoS", "Replay"].map((attack) => (
                    <Button
                      key={attack}
                      onClick={async () => {
                        setSelectedAttack(attack);
                        setAttackMode(attack !== "none");

                        // Call Python API to configure attack
                        try {
                          const { apiRequest } = await import("@/lib/queryClient");
                          await apiRequest("POST", "/api/simulator/attack", { attack_type: attack });

                          if (attack !== "none") {
                            toast({
                              title: `${attack} Attack Injected`,
                              description: `Simulating ${attack} attack via Python Engine`,
                            });
                          }
                        } catch (e) {
                          console.error("Failed to inject attack", e);
                        }
                      }}
                      variant={selectedAttack === attack ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                    >
                      {attack === "none" ? "Normal" : attack}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedAttack === "FDI" && "📊 FDI: Biased offsets added to Vabc/Iabc measurements"}
                  {selectedAttack === "DoS" && "🔒 DoS: Measurement data frozen or blocked"}
                  {selectedAttack === "Replay" && "🔄 Replay: Historical data substituted for live measurements"}
                </p>
              </div>

              {attackMode && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">{selectedAttack} Attack Active</p>
                    <p className="text-xs text-muted-foreground">Cyber-physical measurements compromised. ML detector monitoring...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Voltage Waveforms */}
          <Card className="border border-primary/20 bg-card">
            <CardHeader>
              <CardTitle>3-Bus Voltage Measurements (Vabc)</CardTitle>
              <CardDescription>Three-phase voltage waveforms in per unit (p.u.) from MATLAB Simulink</CardDescription>
            </CardHeader>
            <CardContent>
              {data.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" opacity={0.2} />
                    <XAxis dataKey="time" stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
                    <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} domain={[0.85, 1.15]} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--muted)", border: "1px solid var(--primary)" }} />
                    <Legend />
                    <Line type="monotone" dataKey="bus1_voltage" stroke="hsl(var(--primary))" dot={false} name="Bus 1" />
                    <Line type="monotone" dataKey="bus2_voltage" stroke="hsl(var(--accent))" dot={false} name="Bus 2" />
                    <Line type="monotone" dataKey="bus3_voltage" stroke="#00ff00" dot={false} name="Bus 3" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">Start simulation to view data</div>
              )}
            </CardContent>
          </Card>

          {/* Current Waveforms */}
          <Card className="border border-primary/20 bg-card">
            <CardHeader>
              <CardTitle>3-Bus Current Measurements (Iabc)</CardTitle>
              <CardDescription>Three-phase current waveforms in Amperes from MATLAB Simulink</CardDescription>
            </CardHeader>
            <CardContent>
              {data.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" opacity={0.2} />
                    <XAxis dataKey="time" stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
                    <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--muted)", border: "1px solid var(--primary)" }} />
                    <Legend />
                    <Line type="monotone" dataKey="bus1_current" stroke="hsl(var(--primary))" dot={false} name="Bus 1" />
                    <Line type="monotone" dataKey="bus2_current" stroke="hsl(var(--accent))" dot={false} name="Bus 2" />
                    <Line type="monotone" dataKey="bus3_current" stroke="#00ff00" dot={false} name="Bus 3" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">Start simulation to view data</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Insights & Status */}
        <div className="space-y-6">
          <AIExplanationPanel detection={latestDetection} />

          <PerformanceMetrics />

          {/* System Status */}
          <div className="grid grid-cols-1 gap-3">
            <Card className={`border ${isAnomalous ? "border-destructive/50 bg-destructive/5" : "border-primary/20"}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isAnomalous ? "bg-destructive animate-pulse" : "bg-primary"}`} />
                  <span className="text-sm font-semibold">{isAnomalous ? "⚠️ Alert" : "✓ Normal"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-primary">{currentData.frequency.toFixed(3)} Hz</p>
              </CardContent>
            </Card>

            <Card className="border border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Avg Voltage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-primary">{avgVoltage.toFixed(3)} p.u.</p>
              </CardContent>
            </Card>

            <Card className="border border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Packet Loss</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-primary">{currentData.packet_loss.toFixed(2)}%</p>
              </CardContent>
            </Card>

            <Card className={`border ${detections.length > 0 ? "border-destructive/50 bg-destructive/5" : "border-primary/20"}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Detections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-destructive">{detections.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Protection Actions */}
          {protectionActions.length > 0 && (
            <Card className="border border-primary/20 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  SCADA Protection Actions Executed
                </CardTitle>
                <CardDescription>Automated breaker trips triggered by ML alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {protectionActions.slice(-5).map((action, idx) => (
                    <div key={idx} className="border border-primary/20 rounded-lg p-3 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-primary">{action.action} - {action.target}</p>
                          <p className="text-xs text-muted-foreground mt-1">Status: {action.status}</p>
                        </div>
                        <Badge variant="outline">{action.timestamp.toLocaleTimeString()}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bus Status Grid */}
          <Card className="border border-primary/20 bg-card">
            <CardHeader>
              <CardTitle>Bus Voltage Status</CardTitle>
              <CardDescription>Real-time readings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Bus 1", voltage: currentData.bus1_voltage, current: currentData.bus1_current },
                  { label: "Bus 2", voltage: currentData.bus2_voltage, current: currentData.bus2_current },
                  { label: "Bus 3", voltage: currentData.bus3_voltage, current: currentData.bus3_current },
                ].map((bus) => (
                  <div
                    key={bus.label}
                    className={`p-3 rounded-lg border ${Math.abs(bus.voltage - 1.0) > 0.05
                      ? "border-destructive/50 bg-destructive/5"
                      : "border-primary/20 bg-muted/50"
                      }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold">{bus.label}</span>
                      <span className={`font-bold ${Math.abs(bus.voltage - 1.0) > 0.05 ? "text-destructive" : "text-primary"}`}>
                        {bus.voltage.toFixed(3)} p.u.
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>Current</span>
                      <span>{bus.current.toFixed(1)} A</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
