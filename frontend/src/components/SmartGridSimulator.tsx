import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Play, Pause, RotateCcw, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Bar } from "recharts";
import { useToast } from "@/hooks/use-toast";
import IEEE9BusSLD from "./IEEE9BusSLD";
import { GridState } from "@/types/grid";

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
  breaker_status?: string;
}

interface Detection {
  timestamp: Date;
  attack_type: string;
  confidence: string;
  affected_buses: string;
}

interface ProtectionAction {
  timestamp: Date;
  action: string;
  target: string;
  status: string;
}

export function SmartGridSimulator() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [data, setData] = useState<GridMeasurement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attackMode, setAttackMode] = useState(false);
  const [selectedAttack, setSelectedAttack] = useState("none");
  const [detections, setDetections] = useState<Detection[]>([]);
  const [protectionActions, setProtectionActions] = useState<ProtectionAction[]>([]);
  const [protectedZone, setProtectedZone] = useState<string | undefined>();
  const [selectedTargetBus, setSelectedTargetBus] = useState<number>(1);
  const [lastAttackedBus, setLastAttackedBus] = useState<string>("");
  const [latestState, setLatestState] = useState<GridState | null>(null);

  // Poll backend for real-time measurements
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/simulator/measurements");
        if (!res.ok) throw new Error("Failed to fetch metrics");

        const metrics = await res.json();
        setLatestState(metrics);

        // Map backend state to frontend measurement format
        const newPoint: GridMeasurement = {
          time: metrics.timestamp, // Unix timestamp from backend
          bus1_voltage: metrics.bus1_voltage,
          bus2_voltage: metrics.bus2_voltage,
          bus3_voltage: metrics.bus3_voltage,
          bus1_current: metrics.bus1_current,
          bus2_current: metrics.bus2_current,
          bus3_current: metrics.bus3_current,
          frequency: metrics.frequency,
          packet_loss: metrics.packet_loss,
          attack_type: metrics.attack_type === "None" ? "" : metrics.attack_type,
          attack_detected: metrics.status.startsWith("ATTACK"),
        };

        setData((prev) => {
          const updated = [...prev, newPoint];
          return updated.slice(-50); // Keep last 50 points
        });

        // Handle Detections from Backend state
        if (metrics.prediction > 0 && metrics.status.startsWith("ATTACK")) {
          setDetections((prev: Detection[]) => {
            if (prev.length > 0 && prev[prev.length - 1].timestamp.getTime() === new Date(metrics.timestamp * 1000).getTime()) {
              return prev;
            }
            return [...prev, {
              timestamp: new Date(),
              attack_type: metrics.attack_type,
              confidence: metrics.confidence.toFixed(3),
              affected_buses: metrics.target_bus > 0 ? `Bus ${metrics.target_bus}` : "System-wide",
            }].slice(-10);
          });
        }

        // Handle Individual Breaker Status (Localized Isolation)
        const openBreakers = Object.entries(metrics.breaker_states || {}).filter(([_, status]) => status === "OPEN");
        if (openBreakers.length > 0) {
          const isolationInfo = openBreakers.length > 10 ? "Grid Isolated" : `${openBreakers.length} Breakers OPEN`;
          if (isolationInfo !== protectedZone) {
            setProtectedZone(isolationInfo);
            setProtectionActions((prev: ProtectionAction[]) => [...prev, {
              timestamp: new Date(),
              action: "ISOLATION",
              target: isolationInfo,
              status: "Active"
            }].slice(-10));
          }
        } else if (protectedZone) {
          setProtectedZone(undefined);
        }

      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 500); // Poll every 500ms

    return () => clearInterval(interval);
  }, [isRunning, protectedZone]);

  const resetSimulation = async () => {
    try {
      await fetch("/api/simulator/attack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attack_type: "None" })
      });
      await fetch("/api/simulator/protection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CLOSE" })
      });
      setData([]);
      setDetections([]);
      setProtectionActions([]);
      setProtectedZone(undefined);
      setAttackMode(false);
      setSelectedAttack("none");
    } catch (e) {
      toast({ title: "Reset Failed", description: "Could not reset simulation.", variant: "destructive" });
    }
  };

  const currentData = data[data.length - 1] || {
    bus1_voltage: 1.0, bus2_voltage: 1.0, bus3_voltage: 1.0, bus4_voltage: 1.0, bus5_voltage: 1.0, bus6_voltage: 1.0, bus7_voltage: 1.0, bus8_voltage: 1.0, bus9_voltage: 1.0,
    bus1_current: 10, bus2_current: 10, bus3_current: 10, bus4_current: 10, bus5_current: 10, bus6_current: 10, bus7_current: 10, bus8_current: 10, bus9_current: 10,
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

      {/* 9-Bus Substation SLD Visualization */}
      <IEEE9BusSLD state={latestState} />

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <p className="text-sm font-semibold">Target Bus:</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <Button
                    key={num}
                    size="sm"
                    variant={selectedTargetBus === num ? "default" : "outline"}
                    className="w-8 h-8 p-0 text-xs"
                    onClick={() => setSelectedTargetBus(num)}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>

            <p className="text-sm font-semibold">Inject Attack Type:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {["none", "FDI", "DoS", "Replay"].map((attack) => (
                <Button
                  key={attack}
                  onClick={async () => {
                    setSelectedAttack(attack);
                    setAttackMode(attack !== "none");

                    try {
                      const res = await fetch("/api/simulator/attack", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ 
                          attack_type: attack === "none" ? "None" : attack,
                          target_bus: attack === "none" ? 0 : selectedTargetBus
                        })
                      });
                      if (!res.ok) throw new Error("Attack injection failed");

                      if (attack !== "none") {
                        toast({
                          title: `${attack} Active on Bus ${selectedTargetBus}`,
                          description: `Localized perturbation injected.`,
                        });
                      }
                    } catch (e) {
                      toast({ title: "Error", description: "Failed to inject attack.", variant: "destructive" });
                    }
                  }}
                  variant={selectedAttack === attack ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                >
                  {attack === "none" ? "Clear All" : attack}
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

      {/* Frequency & Packet Loss */}
      <Card className="border border-primary/20 bg-card">
        <CardHeader>
          <CardTitle>Grid Frequency & Network Anomalies</CardTitle>
          <CardDescription>Frequency stability and cyber-layer packet loss indicators</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" opacity={0.2} />
                <XAxis dataKey="time" stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
                <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
                <Tooltip contentStyle={{ backgroundColor: "var(--muted)", border: "1px solid var(--primary)" }} />
                <Legend />
                <Line type="monotone" dataKey="frequency" stroke="hsl(var(--primary))" dot={false} name="Frequency (Hz)" />
                <Bar dataKey="packet_loss" fill="hsl(var(--accent))" opacity={0.6} name="Packet Loss (%)" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-muted-foreground">Start simulation to view data</div>
          )}
        </CardContent>
      </Card>

      {/* Bus Status Grid */}
      <Card className="border border-primary/20 bg-card">
        <CardHeader>
          <CardTitle>Bus Voltage Status (Real-time)</CardTitle>
          <CardDescription>Individual bus voltage readings with anomaly detection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-9 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((id) => {
              const voltage = (currentData as any)[`bus${id}_voltage`];
              const current = (currentData as any)[`bus${id}_current`];
              const isHigh = Math.abs(voltage - 1.0) > 0.05;
              
              return (
                <div
                  key={id}
                  className={`p-2 rounded-lg border text-center ${isHigh
                    ? "border-destructive/50 bg-destructive/5"
                    : "border-primary/20 bg-muted/50"
                    }`}
                >
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Bus {id}</p>
                  <p className={`text-sm font-bold mt-1 ${isHigh ? "text-destructive" : "text-primary"}`}>
                    {voltage.toFixed(3)}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{current.toFixed(1)}A</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ML Detections */}
      {detections.length > 0 && (
        <Card className="border border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              ST-GNN Attack Detections
            </CardTitle>
            <CardDescription>Multi-class attack classification from Spatio-Temporal Graph Neural Network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {detections.slice(-5).map((det, idx) => (
                <div key={idx} className="border border-destructive/20 rounded-lg p-3 bg-background/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-destructive">{det.attack_type} Attack Detected</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Confidence: {det.confidence} | Affected: {det.affected_buses}
                      </p>
                    </div>
                    <Badge className="bg-destructive text-destructive-foreground">{det.timestamp.toLocaleTimeString()}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}
