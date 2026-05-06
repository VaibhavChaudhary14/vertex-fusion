import { useEffect, useRef, useState, useCallback } from "react";
import { Activity, AlertTriangle, Shield, Zap, TrendingUp, Clock, Power, Play, Square, RotateCcw, Wifi, WifiOff, Terminal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useToast } from "@/hooks/use-toast";
import IEEE9BusSLD from "@/components/IEEE9BusSLD";

import { GridState } from "@/types/grid";

interface ChartPoint {
  t: string;
  v1: number; v2: number; v3: number;
  v4: number; v5: number; v6: number;
  v7: number; v8: number; v9: number;
  i1: number; i2: number; i3: number;
  i4: number; i5: number; i6: number;
  i7: number; i8: number; i9: number;
  freq: number;
}

interface ThreatEvent {
  id: number;
  time: string;
  type: string;
  confidence: number;
  status: string;
}

const ATTACK_OPTIONS = [
  { value: "None", label: "No Attack", color: "bg-green-500" },
  { value: "FDI", label: "False Data Injection", color: "bg-yellow-500" },
  { value: "DoS", label: "Denial of Service", color: "bg-orange-500" },
  { value: "Replay", label: "Replay Attack", color: "bg-red-500" },
  { value: "Noise", label: "Noise Injection", color: "bg-blue-500" },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [simConnected, setSimConnected] = useState(false);
  const [latestState, setLatestState] = useState<GridState | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [threats, setThreats] = useState<ThreatEvent[]>([]);
  const [rocData, setRocData] = useState<{ fpr: number, tpr: number }[]>([]);
  const [auc, setAuc] = useState<number>(0);
  const [selectedAttack, setSelectedAttack] = useState("None");
  const [showHeatmap, setShowHeatmap] = useState(true);
  const threatIdRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Network Telemetry Logs ────────────────────────────────────────────────
  const [networkLogs, setNetworkLogs] = useState<{ id: number, time: string, msg: string, type: 'sent' | 'received' | 'info' }[]>([]);
  const logIdRef = useRef(0);

  const addLog = useCallback((msg: string, type: 'sent' | 'received' | 'info' = 'info') => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    setNetworkLogs(prev => {
      const newLogs = [{ id: logIdRef.current++, time, msg, type }, ...prev].slice(0, 50);
      return newLogs;
    });
  }, []);

  // ── Poll measurements ─────────────────────────────────────────────────────
  const poll = useCallback(async () => {
    try {
      addLog("GET /metrics -> Polling Python FastAPI (54 features)", "sent");
      const res = await fetch("/api/simulator/metrics");
      
      if (res.status === 503) {
        addLog("503 Service Unavailable -> AI Engine is Offline.", "received");
        setSimConnected(false);
        return;
      }
      
      if (!res.ok) {
        setSimConnected(false);
        return;
      }

      const data: GridState = await res.json();
      addLog(`200 OK -> Received state (Score: ${data.score?.toFixed(4)})`, "received");
      setSimConnected(true);
      setLatestState(data);

      // Keep last 60 chart points
      const now = new Date();
      const label = `${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
      setChartData(prev => {
        const point: ChartPoint = {
          t: label,
          v1: +(data.bus1_voltage ?? 0).toFixed(4),
          v2: +(data.bus2_voltage ?? 0).toFixed(4),
          v3: +(data.bus3_voltage ?? 0).toFixed(4),
          v4: +(data.bus4_voltage ?? 0).toFixed(4),
          v5: +(data.bus5_voltage ?? 0).toFixed(4),
          v6: +(data.bus6_voltage ?? 0).toFixed(4),
          v7: +(data.bus7_voltage ?? 0).toFixed(4),
          v8: +(data.bus8_voltage ?? 0).toFixed(4),
          v9: +(data.bus9_voltage ?? 0).toFixed(4),
          i1: +(data.bus1_current ?? 0).toFixed(2),
          i2: +(data.bus2_current ?? 0).toFixed(2),
          i3: +(data.bus3_current ?? 0).toFixed(2),
          i4: +(data.bus4_current ?? 0).toFixed(2),
          i5: +(data.bus5_current ?? 0).toFixed(2),
          i6: +(data.bus6_current ?? 0).toFixed(2),
          i7: +(data.bus7_current ?? 0).toFixed(2),
          i8: +(data.bus8_current ?? 0).toFixed(2),
          i9: +(data.bus9_current ?? 0).toFixed(2),
          freq: +data.frequency.toFixed(3),
        };
        return [...prev.slice(-59), point];
      });

      // Log threats
      const detectionScore = data.score ?? data.confidence;
      if (data.prediction > 0 && detectionScore > 0.9) {
        setThreats(prev => {
          const last = prev[prev.length - 1];
          if (last && last.type === data.attack_type && Date.now() - new Date().getTime() < 1000) return prev;
          const event: ThreatEvent = {
            id: ++threatIdRef.current,
            time: now.toLocaleTimeString(),
            type: data.attack_type,
            confidence: +(detectionScore * 100).toFixed(1),
            status: "DETECTED",
          };
          return [...prev.slice(-19), event];
        });
      }
    } catch {
      setSimConnected(false);
    }
  }, []);

  // ── Poll ROC metrics ──────────────────────────────────────────────────────
  const pollRoc = useCallback(async () => {
    try {
      addLog("GET /metrics/roc -> Fetching ML ROC Truths", "sent");
      const res = await fetch("/api/simulator/metrics/roc");
      if (!res.ok) return;
      const data = await res.json();
      addLog(`200 OK -> Processed ${data.records?.length || 0} SQLite inferences`, "received");
      if (!data.records || data.records.length === 0) return;

      const points = data.records.map((r: any) => ({
        y_true: r.true_label > 0 ? 1 : 0,
        y_score: r.pred_label > 0 ? r.confidence : Math.max(0, 1.0 - r.confidence)
      }));

      points.sort((a: any, b: any) => b.y_score - a.y_score);

      let numPos = points.filter((p: any) => p.y_true === 1).length;
      let numNeg = points.filter((p: any) => p.y_true === 0).length;

      if (numPos === 0 || numNeg === 0) {
        setRocData([{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]);
        setAuc(numPos === 0 ? 1.0 : (numNeg === 0 ? 1.0 : 0));
        return;
      }

      let tp = 0;
      let fp = 0;
      const calcData = [];
      let last_score = -1;

      points.forEach((p: any, i: number) => {
        if (p.y_score !== last_score && i > 0) {
          calcData.push({ fpr: +(fp / numNeg).toFixed(3), tpr: +(tp / numPos).toFixed(3) });
        }
        if (p.y_true === 1) tp++;
        else fp++;
        last_score = p.y_score;
      });
      calcData.push({ fpr: +(fp / numNeg).toFixed(3), tpr: +(tp / numPos).toFixed(3) });
      calcData.unshift({ fpr: 0, tpr: 0 });

      let currentAuc = 0;
      for (let i = 1; i < calcData.length; i++) {
        currentAuc += (calcData[i].fpr - calcData[i - 1].fpr) * (calcData[i].tpr + calcData[i - 1].tpr) / 2;
      }
      setAuc(currentAuc);
      setRocData(calcData);
    } catch {
      // ignore
    }
  }, []);

  // ── Start / Stop ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (isRunning) {
      poll(); // immediate first call
      pollRoc();
      intervalRef.current = setInterval(() => { poll(); pollRoc(); }, 200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, poll, pollRoc]);

  // ── Attack injection ──────────────────────────────────────────────────────
  const injectAttack = async (type: string) => {
    setSelectedAttack(type);
    addLog(`POST /attack -> Pushing ${type} vector to Python Engine`, "sent");
    try {
      await fetch("/api/simulator/attack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attack_type: type }),
      });
      toast({ title: type === "None" ? "Attack Cleared" : `Attack Injected: ${type}`, variant: type === "None" ? "default" : "destructive" });
    } catch {
      toast({ title: "Error", description: "Could not reach simulation service.", variant: "destructive" });
    }
  };

  // ── Breaker control ───────────────────────────────────────────────────────
  const setBreakerStatus = async (action: "TRIP" | "CLOSE") => {
    addLog(`POST /protection -> TCP Relay to MATLAB (${action})`, "sent");
    try {
      await fetch("/api/simulator/protection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action_type: action, target_bus: 0 }),
      });
      toast({ title: `Breaker ${action}`, description: `Main breaker ${action === "TRIP" ? "opened" : "closed"}.` });
    } catch {
      toast({ title: "Error", description: "Could not send protection command.", variant: "destructive" });
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = async () => {
    await injectAttack("None");
    await setBreakerStatus("CLOSE");
    setChartData([]);
    setThreats([]);
    setLatestState(null);
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const isAttacking = latestState?.status.startsWith("ATTACK") ?? false;
  const breakerOpen = latestState?.breaker_status === "OPEN";
  const avgVoltage = latestState
    ? (
      ((latestState.bus1_voltage ?? 0) + (latestState.bus2_voltage ?? 0) + (latestState.bus3_voltage ?? 0) +
        (latestState.bus4_voltage ?? 0) + (latestState.bus5_voltage ?? 0) + (latestState.bus6_voltage ?? 0) +
        (latestState.bus7_voltage ?? 0) + (latestState.bus8_voltage ?? 0) + (latestState.bus9_voltage ?? 0)) / 9
    ).toFixed(4)
    : "—";

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vertex Fusion Control Center</h1>
          <p className="text-muted-foreground text-sm mt-1">Live IEEE 9-Bus Real-Time Digital Twin ↔ MATLAB Scada Simulation</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection badge */}
          <Badge variant={simConnected ? "default" : "secondary"} className="gap-1">
            {simConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {simConnected ? "Simulation Connected" : "Simulation Offline"}
          </Badge>
          <Button variant="outline" size="sm" onClick={reset} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={async () => {
              try {
                await fetch("/api/simulator/control/retrain", { method: "POST" });
                toast({ title: "Retraining Triggered", description: "The ST-GNN pipeline is re-learning the grid baseline." });
              } catch (e) {
                toast({ title: "Error", description: "Failed to trigger retraining.", variant: "destructive" });
              }
            }} 
            className="gap-2"
          >
            <Shield className="w-4 h-4" /> Retrain AI
          </Button>
          <Button
            size="sm"
            onClick={() => setIsRunning(r => !r)}
            className={`gap-2 ${isRunning ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}`}
          >
            {isRunning ? <><Square className="w-4 h-4" /> Stop</> : <><Play className="w-4 h-4" /> Start</>}
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { icon: Shield, label: "System Status", value: isAttacking ? "⚠  ATTACK" : "✓  Normal", color: isAttacking ? "text-destructive" : "text-primary" },
          { icon: Zap, label: "Avg Voltage (pu)", value: avgVoltage, color: "text-primary" },
          { icon: Activity, label: "Frequency (Hz)", value: latestState ? latestState.frequency.toFixed(3) : "—", color: "text-accent" },
          { icon: TrendingUp, label: "Packet Loss (%)", value: latestState ? latestState.packet_loss.toFixed(2) : "—", color: "text-warning" },
          { icon: AlertTriangle, label: "Threats Logged", value: threats.length, color: "text-destructive" },
          { icon: Power, label: "Breaker", value: breakerOpen ? "OPEN" : "CLOSED", color: breakerOpen ? "text-destructive" : "text-primary" },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <Card key={i} className="border border-border">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Icon className={`w-5 h-5 mb-1 ${color}`} />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
              <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── IEEE 9-Bus Single Line Diagram ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Live Spatial Anomaly Heatmap
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase font-bold">Heatmap</span>
            <Button 
              variant={showHeatmap ? "default" : "outline"} 
              size="xs" 
              className="h-7 text-[10px]" 
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              {showHeatmap ? "ON" : "OFF"}
            </Button>
          </div>
        </div>
        <IEEE9BusSLD state={latestState} showHeatmap={showHeatmap} />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Voltage chart */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Bus Voltage (per-unit)
            </CardTitle>
            <CardDescription>Live voltage readings from all 3 buses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis domain={[0.9, 1.1]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="v1" name="Bus 1" stroke="#3b82f6" dot={false} strokeWidth={2} isAnimationActive={false} />
                <Line type="monotone" dataKey="v2" name="Bus 2" stroke="#10b981" dot={false} strokeWidth={2} isAnimationActive={false} />
                <Line type="monotone" dataKey="v3" name="Bus 3" stroke="#8b5cf6" dot={false} strokeWidth={2} isAnimationActive={false} />
                <Line type="monotone" dataKey="v4" name="Bus 4" stroke="#f59e0b" dot={false} strokeWidth={1} isAnimationActive={false} />
                <Line type="monotone" dataKey="v5" name="Bus 5" stroke="#ef4444" dot={false} strokeWidth={1} isAnimationActive={false} />
                <Line type="monotone" dataKey="v6" name="Bus 6" stroke="#06b6d4" dot={false} strokeWidth={1} isAnimationActive={false} />
                <Line type="monotone" dataKey="v7" name="Bus 7" stroke="#ec4899" dot={false} strokeWidth={1} isAnimationActive={false} />
                <Line type="monotone" dataKey="v8" name="Bus 8" stroke="#84cc16" dot={false} strokeWidth={1} isAnimationActive={false} />
                <Line type="monotone" dataKey="v9" name="Bus 9" stroke="#64748b" dot={false} strokeWidth={1} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Current chart */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" /> Bus Current (A)
            </CardTitle>
            <CardDescription>Live current readings from all 3 buses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="i3" name="Bus 3" stroke="#8b5cf6" dot={false} strokeWidth={2} isAnimationActive={false} />
                <Line type="monotone" dataKey="i4" name="Bus 4" stroke="#f59e0b" dot={false} strokeWidth={1} isAnimationActive={false} />
                <Line type="monotone" dataKey="i5" name="Bus 5" stroke="#ef4444" dot={false} strokeWidth={1} isAnimationActive={false} />
                <Line type="monotone" dataKey="i6" name="Bus 6" stroke="#06b6d4" dot={false} strokeWidth={1} isAnimationActive={false} />
                <Line type="monotone" dataKey="i7" name="Bus 7" stroke="#ec4899" dot={false} strokeWidth={1} isAnimationActive={false} />
                <Line type="monotone" dataKey="i8" name="Bus 8" stroke="#84cc16" dot={false} strokeWidth={1} isAnimationActive={false} />
                <Line type="monotone" dataKey="i9" name="Bus 9" stroke="#64748b" dot={false} strokeWidth={1} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Control + Threat Log row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Research Attack Injection */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" /> Research Attack Injection
            </CardTitle>
            <CardDescription>Inject custom cyber-physical distortions into the IEEE 9-bus grid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Target Bus</label>
                <select 
                  className="w-full bg-muted border border-border rounded px-2 py-1 text-sm font-mono"
                  onChange={(e) => setLatestState(prev => prev ? {...prev, target_bus: parseInt(e.target.value)} : null)}
                  defaultValue="5"
                >
                  {[1,2,3,4,5,6,7,8,9].map(b => <option key={b} value={b}>Bus {b}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Attack Vector</label>
                <select 
                  id="attack-type-select" 
                  className="w-full bg-muted border border-border rounded px-2 py-1 text-sm font-mono"
                  onChange={(e) => setSelectedAttack(e.target.value)}
                  value={selectedAttack}
                >
                  {ATTACK_OPTIONS.filter(o => o.value !== "None").map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Feature Distortion</label>
                <select id="feat-select" className="w-full bg-muted border border-border rounded px-2 py-1 text-sm font-mono">
                  <option value="0">Voltage (V)</option>
                  <option value="1">Current (I)</option>
                  <option value="2">Active Power (P)</option>
                  <option value="3">Reactive Power (Q)</option>
                  <option value="4">Frequency (F)</option>
                  <option value="5">Angle (Phase)</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Distortion Magnitude</label>
                <span id="mag-val" className="text-xs font-mono text-primary">0.10</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" defaultValue="0.1" 
                className="w-full" 
                onChange={(e) => {
                  const el = document.getElementById('mag-val');
                  if (el) el.innerText = parseFloat(e.target.value).toFixed(2);
                }}
                id="mag-slider"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={async () => {
                  const bus = parseInt((document.querySelector('select') as HTMLSelectElement).value);
                  const type = (document.getElementById('attack-type-select') as HTMLSelectElement).value;
                  const feat = parseInt((document.getElementById('feat-select') as HTMLSelectElement).value);
                  const mag = parseFloat((document.getElementById('mag-slider') as HTMLInputElement).value);
                  await fetch("/api/simulator/attack", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ attack_type: type, target_bus: bus, feature_idx: feat, magnitude: mag })
                  });
                  toast({ title: "Attack Injected", description: `${type} at Bus ${bus} (Feat ${feat})`, variant: "destructive" });
                }}
              >
                Inject Attack
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={async () => {
                  await fetch("/api/simulator/attack", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ attack_type: "None" })
                  });
                  toast({ title: "Attack Cleared", description: "Grid returning to normal state." });
                }}
              >
                Clear
              </Button>
            </div>

            {/* AI Explainability Diagnostics */}
            <div className="border-t border-border pt-4 mt-4 space-y-3">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Terminal className="w-4 h-4 text-accent" /> XAI AI Diagnostics
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-accent/10 border border-accent/20 rounded p-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Suspected Bus</p>
                  <p className="text-lg font-bold text-accent font-mono">
                    {latestState?.score && latestState.score > 0.9 ? `BUS ${latestState.fault_node}` : "—"}
                  </p>
                </div>
                <div className="bg-accent/10 border border-accent/20 rounded p-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Dominant Signal</p>
                  <p className="text-sm font-bold text-accent font-mono truncate">
                    {latestState?.score && latestState.score > 0.9 ? latestState.top_feature : "CALIBRATING..."}
                  </p>
                </div>
              </div>
            </div>
            {/* SCADA Breaker Control */}
            <div className="border border-border rounded-lg p-4 space-y-3 mt-4">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Power className="w-4 h-4 text-primary" /> SCADA Protection — Main Breaker
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${breakerOpen ? "bg-destructive animate-pulse" : "bg-primary"}`} />
                <span className="text-sm font-mono">{breakerOpen ? "OPEN — Grid Isolated" : "CLOSED — Grid Active"}</span>
              </div>
              <div className="flex gap-3">
                <Button size="sm" variant="destructive" onClick={() => setBreakerStatus("TRIP")} disabled={breakerOpen} className="flex-1">
                  TRIP Breaker
                </Button>
                <Button size="sm" variant="outline" onClick={() => setBreakerStatus("CLOSE")} disabled={!breakerOpen} className="flex-1">
                  CLOSE Breaker
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Threat log */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-destructive" /> Live Threat Log
            </CardTitle>
            <CardDescription>Real-time ST-GNN attack detection events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {threats.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No threats detected. Start the simulation to begin monitoring.
                </div>
              ) : (
                [...threats].reverse().map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                    <div>
                      <p className="text-sm font-semibold text-destructive">{t.type}</p>
                      <p className="text-xs text-muted-foreground">{t.time}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive" className="text-xs mb-1">{t.status}</Badge>
                      <p className="text-xs text-muted-foreground">Conf: {t.confidence}%</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Advanced ML Metrics ── */}
      <div className="grid grid-cols-1 gap-6">
        {/* ROC Curve */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-warning" /> Live ROC Curve</span>
                <Badge variant="outline" className="text-xs">AUC: {auc.toFixed(3)}</Badge>
              </CardTitle>
              <CardDescription>Receiver Operating Characteristic (Rolling 100 Inferences via SQLite)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={rocData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="fpr" type="number" domain={[0, 1]} tick={{ fontSize: 10 }} allowDataOverflow />
                  <YAxis dataKey="tpr" type="number" domain={[0, 1]} tick={{ fontSize: 10 }} allowDataOverflow />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
                  <Line type="stepAfter" dataKey="tpr" name="TPR vs FPR" stroke="#ec4899" dot={false} strokeWidth={2} isAnimationActive={false} />
                  <Line type="monotone" dataKey="fpr" name="Random Guess" stroke="hsl(var(--muted-foreground))" dot={false} strokeWidth={1} strokeDasharray="5 5" isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Multi-Class Confusion Matrix */}
          <Card className="border border-border overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Live Confusion Matrix (Research Proof)
              </CardTitle>
              <CardDescription>5x5 Classification Matrix: True Class (Rows) vs Predicted (Cols)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-1 bg-muted/30 p-2 rounded-lg border border-border">
                {/* Headers */}
                <div className="h-8" />
                {["Norm", "FDI", "DoS", "Repl", "Nois"].map(h => (
                  <div key={h} className="h-8 flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">{h}</div>
                ))}

                {/* Data Rows */}
                {["Norm", "FDI", "DoS", "Repl", "Nois"].map((row, i) => (
                  <>
                    <div key={`row-${i}`} className="h-10 flex items-center pr-2 text-[10px] font-bold text-muted-foreground uppercase justify-end">{row}</div>
                    {[0, 1, 2, 3, 4].map(j => {
                      const val = latestState?.confusion_matrix?.[i]?.[j] || 0;
                      // Calculate row total for color weight
                      const rowTotal = latestState?.confusion_matrix?.[i]?.reduce((a, b) => a + b, 0) || 1;
                      const weight = Math.min(val / rowTotal, 1);
                      const isDiagonal = i === j;
                      
                      return (
                        <div 
                          key={`cell-${i}-${j}`} 
                          className={`h-10 flex flex-col items-center justify-center rounded text-xs font-mono font-bold transition-all
                            ${isDiagonal ? (weight > 0.5 ? 'bg-green-500 text-white' : 'bg-green-500/20 text-green-500') : 
                                          (val > 0 ? 'bg-destructive/40 text-destructive' : 'bg-muted/50 text-muted-foreground/30')}`}
                        >
                          {val}
                          {val > 0 && <span className="text-[8px] opacity-70">{(weight * 100).toFixed(0)}%</span>}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Current Bus Readings ── */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-base">Current Bus Readings</CardTitle>
          <CardDescription>Latest snapshot from the 3-bus simulation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
            {latestState ? (
              <>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(bus => {
                  const v = (latestState as any)[`bus${bus}_voltage`]?.toFixed(4) || "0.0000";
                  const i = (latestState as any)[`bus${bus}_current`]?.toFixed(2) || "0.00";
                  return (
                    <div key={bus} className="space-y-1">
                      <p className="text-xs text-muted-foreground font-mono">BUS {bus}</p>
                      <p className="text-lg font-bold text-primary font-mono">{v} <span className="text-xs">pu</span></p>
                      <p className="text-sm text-accent font-mono">{i} <span className="text-xs">A</span></p>
                    </div>
                  );
                })}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-mono">FREQ</p>
                  <p className="text-lg font-bold text-primary font-mono">{latestState.frequency.toFixed(3)} <span className="text-xs">Hz</span></p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-mono">PKT LOSS</p>
                  <p className="text-lg font-bold text-warning font-mono">{latestState.packet_loss.toFixed(2)} <span className="text-xs">%</span></p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-mono">ML CONF</p>
                  <p className="text-lg font-bold text-accent font-mono">{(latestState.confidence * 100).toFixed(1)} <span className="text-xs">%</span></p>
                </div>
              </>
            ) : (
              <div className="col-span-6 text-center py-6 text-muted-foreground text-sm">
                Start the simulation to see live readings.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Network Trace Console ── */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" /> Network Telemetry Trace
          </CardTitle>
          <CardDescription>Explicit communication trace: Frontend ↔ Python FastAPI ↔ MATLAB TCP</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] font-mono text-xs p-4 rounded-md h-[200px] overflow-y-auto space-y-1">
            {networkLogs.length === 0 ? (
              <span className="opacity-50 text-green-500">Waiting for network traffic...</span>
            ) : (
              networkLogs.map(log => (
                <div key={log.id} className="flex gap-3 border-b border-green-900/20 pb-1">
                  <span className="text-muted-foreground shrink-0 w-24">[{log.time}]</span>
                  <span className={`shrink-0 w-16 font-bold ${log.type === 'sent' ? 'text-blue-400' : log.type === 'received' ? 'text-green-400' : 'text-gray-400'}`}>
                    {log.type === 'sent' ? '↑ OUT' : log.type === 'received' ? '↓ IN ' : 'ℹ SYS'}
                  </span>
                  <span className={log.type === 'sent' ? 'text-blue-300 break-all' : log.type === 'received' ? 'text-green-300 break-all' : 'text-gray-300 break-all'}>
                    {log.msg}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
