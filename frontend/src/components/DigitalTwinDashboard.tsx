import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { AIDetectionPanel } from './AIDetectionPanel';
import { SCADAMonitor } from './SCADAMonitor';
import { VoltageGraph } from './VoltageGraph';
import { CurrentGraph } from './CurrentGraph';
import { Button } from "@/components/ui/button";
import { Zap, Activity, RefreshCw } from 'lucide-react';
import { cn } from "@/lib/utils";

const API_URL = "http://localhost:8000";

interface Detection {
    type: string;
    confidence: number;
    action: string;
    timestamp: number;
}

interface Status {
    source: string;
    connected: boolean;
    detection: Detection | null;
    grid_summary: number[];
}

interface HistoryPoint {
    time: string;
    vm_pu: number;
    loading: number;
    confidence: number;
}

export default function DigitalTwinDashboard() {
    const [status, setStatus] = useState<Status | null>(null);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<HistoryPoint[]>([]);
    const [breakerStatus, setBreakerStatus] = useState<"CLOSED" | "TRIPPED">("CLOSED");
    const [activeAttack, setActiveAttack] = useState<string>("none");

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/detect-attack`);
            const data = await res.json();
            setStatus(data);

            // Mocking the breaker status based on last action for now
            // Ideally this comes from the backend grid state
            if (data.detection?.action === "TRIP") {
                setBreakerStatus("TRIPPED");
            }

            return data;
        } catch (e) {
            console.error("Connection lost:", e);
            setStatus(prev => prev ? { ...prev, connected: false } : null);
        }
    };

    // WebSocket Connection Logic
    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:3000`);

        ws.onopen = () => {
            console.log("Connected to Grid Stream");
            setLoading(false);
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === "GRID_UPDATE") {
                    const gridState = message.data; // { step, grid_state, detection }

                    if (gridState?.detection) {
                        setStatus(prev => ({
                            source: "Real-Time Engine",
                            connected: true,
                            detection: gridState.detection,
                            grid_summary: []
                        }));

                        // Update Breaker Status if detected action
                        // (In a real app, we'd read the line status from grid_state)

                        // Parse grid_state for history
                        // grid_state is array of buses/lines. 
                        // We extract Bus 2 Voltage (index 1) and Line 2-3 Loading (index 1) for demo
                        const bus2 = gridState.grid_state.find((i: any) => i.type === "bus" && i.id === "1"); // 0-indexed usually
                        const line23 = gridState.grid_state.find((i: any) => i.type === "line" && i.id === "1");

                        const newPoint = {
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                            vm_pu: bus2 ? bus2.vm_pu : 1.0,
                            loading: line23 ? line23.loading : 50.0,
                            confidence: gridState.detection.confidence || 0
                        };

                        setHistory(prev => [...prev.slice(-19), newPoint]);
                    }
                }
            } catch (e) {
                console.error("WS Parse Error", e);
            }
        };

        const interval = setInterval(fetchStatus, 2000); // Fallback poll
        return () => {
            clearInterval(interval);
            ws.close();
        };
    }, []);

    const handleTrip = async () => {
        try {
            await fetch(`${API_URL}/trip-breaker?line_id=2-3`, { method: 'POST' });
            setBreakerStatus("TRIPPED");
        } catch (e) {
            console.error("Trip failed", e);
        }
    };

    const handleAttack = async (type: string) => {
        try {
            await fetch(`${API_URL}/attack`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attack_type: type, params: {} })
            });
            setActiveAttack(type);
        } catch (e) {
            console.error("Attack injection failed", e);
        }
    };

    const handleReset = async () => {
        try {
            await fetch(`${API_URL}/attack`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attack_type: "none", params: {} })
            });
            // Also reset breaker/simulation if endpoint existed
            setActiveAttack("none");
            setBreakerStatus("CLOSED");
        } catch (e) {
            console.error("Reset failed", e);
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-deep-navy text-electric-cyan animate-pulse">
            <Activity className="w-10 h-10 mr-2" />
            <span className="text-xl font-mono tracking-widest">INITIALIZING NEURAL LINK...</span>
        </div>
    );

    return (
        <div className="flex h-screen bg-background overflow-hidden text-foreground font-sans">
            {/* Left Panel */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Hero Wave Animation Background */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/2 left-0 w-[200%] h-64 -translate-y-1/2 bg-[url('/wave.svg')] bg-repeat-x animate-wave-slow opacity-30 blur-xl" />
                    {/* We will add a proper SVG wave here later, for now just a gradient placeholder */}
                    <div className="absolute inset-0 bg-gradient-radial from-neural-purple/10 to-transparent" />
                </div>

                {/* Header Status Bar */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-card-surface/50 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                            CONTROL ROOM <span className="text-electric-cyan font-mono text-sm px-2 py-0.5 rounded bg-electric-cyan/10 border border-electric-cyan/30">LIVE</span>
                        </h1>
                    </div>

                    {/* Attack Injection Controls (Demo Purpose) */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground mr-2 font-mono uppercase">Injection:</span>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn("border-white/10 hover:border-electric-cyan hover:text-electric-cyan", activeAttack === "none" && "bg-white/5")}
                            onClick={handleReset}
                        >
                            NORMAL
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn("border-white/10 hover:border-critical-red hover:text-critical-red", activeAttack === "FDI" && "bg-critical-red/10 border-critical-red text-critical-red")}
                            onClick={() => handleAttack("FDI")}
                        >
                            FDI ATTACK
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn("border-white/10 hover:border-alert-orange hover:text-alert-orange", activeAttack === "DoS" && "bg-alert-orange/10 border-alert-orange text-alert-orange")}
                            onClick={() => handleAttack("DoS")}
                        >
                            DoS
                        </Button>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <main className="flex-1 p-6 grid grid-rows-[45%_45%] gap-6 overflow-y-auto relative z-10">

                    {/* Top Row: Graphs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                        <VoltageGraph data={history} attackType={status?.detection?.detected ? status?.detection?.type : "none"} />
                        <CurrentGraph data={history} breakerStatus={breakerStatus} />
                    </div>

                    {/* Bottom Row: Panels */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                        <div className="md:col-span-1">
                            <AIDetectionPanel
                                status={status?.detection || null}
                                breakerStatus={breakerStatus}
                                onTripBreaker={handleTrip}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <SCADAMonitor connected={status?.connected || false} source={status?.source} />

                            {/* Placeholder for SHAP Mini-panel */}
                            <div className="mt-6 glass-panel p-4 h-32 flex items-center justify-center text-muted-foreground font-mono text-xs border-dashed">
                                SHAP EXPLAINABILITY MODULE LOADING...
                            </div>
                        </div>
                        <div className="md:col-span-1 glass-panel p-4 overflow-hidden relative">
                            {/* System Logs / Terminal */}
                            <div className="absolute top-0 left-0 w-full h-8 bg-white/5 border-b border-white/10 flex items-center px-4 text-xs font-mono text-muted-foreground">
                                 > SYSTEM_LOGS
                            </div>
                            <div className="mt-8 font-mono text-[10px] space-y-1 text-spring-green/80 h-full overflow-hidden">
                                <div className="opacity-50">10:42:01 Initializing connection...</div>
                                <div className="opacity-70">10:42:02 Stream active (20Hz)</div>
                                <div>10:42:05 Verified Grid State: OK</div>
                                {status?.detection?.detected && (
                                    <div className="text-critical-red animate-pulse">
                                        {`10:42:15 ALERT: ${status.detection.type} DETECTED (Conf: ${(status.detection.confidence * 100).toFixed(1)}%)`}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
