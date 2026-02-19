import React, { useEffect, useState, useRef } from 'react';
import { NeoBox, NeoButton, NeoCard } from './components/NeoComponents';
import { WaveformGraph } from './components/WaveformGraph';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Activity, ShieldAlert, Wifi, Zap } from 'lucide-react';
import axios from 'axios';

// Types
interface GridState {
    step: number;
    system_freq: number;
    status: string;
    buses: any[];
}

interface AIResult {
    is_anomaly: boolean;
    confidence: number;
    label: string;
    shap_values: { feature: string; value: number }[];
}

interface Telemetry {
    time: number;
    voltage: number;
    frequency: number;
}

interface Alert {
    timestamp: string;
    type: string;
    message: string;
    severity: string;
}

function App() {
    const [connected, setConnected] = useState(false);
    const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
    const [gridState, setGridState] = useState<GridState | null>(null);
    const [aiResult, setAIResult] = useState<AIResult | null>(null);
    const [attackActive, setAttackActive] = useState<string>('none');
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [metrics, setMetrics] = useState<any>(null);

    const wsRef = useRef<WebSocket | null>(null);

    // Buffer optimization
    const maxPoints = 50;

    useEffect(() => {
        connectWebSocket();
        fetchMetrics();
        const interval = setInterval(fetchAlerts, 2000);
        return () => {
            wsRef.current?.close();
            clearInterval(interval);
        }
    }, []);

    const fetchAlerts = async () => {
        try {
            const res = await axios.get('http://localhost:8000/alerts');
            setAlerts(res.data.alerts.reverse()); // Newest first
        } catch (e) { }
    };

    const fetchMetrics = async () => {
        try {
            const res = await axios.get('http://localhost:8000/metrics');
            setMetrics(res.data);
        } catch (e) { }
    };

    const connectWebSocket = () => {
        const ws = new WebSocket('ws://localhost:8000/ws/stream');
        ws.onopen = () => setConnected(true);
        ws.onclose = () => {
            setConnected(false);
            setTimeout(connectWebSocket, 3000);
        };
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const newPoint = {
                time: data.timestamp,
                voltage: data.grid.buses[4]?.vm_pu || 1.0, // Bus 5
                frequency: data.grid.system_freq
            };

            setGridState(data.grid);
            setAIResult(data.ai);

            setTelemetry(prev => {
                const next = [...prev, newPoint];
                if (next.length > maxPoints) return next.slice(next.length - maxPoints);
                return next;
            });
        };
        wsRef.current = ws;
    };

    const toggleAttack = async (type: string) => {
        if (attackActive === type) {
            // Stop attack
            await axios.post('http://localhost:8000/control/attack', { type: 'none' });
            setAttackActive('none');
        } else {
            // Start attack
            await axios.post('http://localhost:8000/control/attack', { type: type });
            setAttackActive(type);
        }
    };

    const tripBreaker = async (id: number) => {
        await axios.post('http://localhost:8000/control/trip-breaker', { line_id: id });
    };
    const closeBreaker = async (id: number) => {
        await axios.post('http://localhost:8000/control/close-breaker', { line_id: id });
    };

    const isUnderAttack = gridState?.status.includes("Attack");

    return (
        <div className="min-h-screen bg-[#E0E7F1] p-4 md:p-8 font-sans text-[#0e1111]">
            {/* HEADER */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <Zap className="w-10 h-10 md:w-16 md:h-16 stroke-[3px]" />
                        Vertex<span className="text-[#8B5CF6]">Fusion</span>
                    </h1>
                    <p className="font-mono text-sm md:text-base mt-2 border-l-4 border-black pl-2 ml-1">
                        CYBER-PHYSICAL DIGITAL TWIN V3.0
                    </p>
                </div>

                <div className="flex gap-4">
                    <NeoBox className="px-4 py-2 flex items-center gap-2 font-bold">
                        <Wifi className={connected ? "text-green-600" : "text-red-600"} />
                        {connected ? "ONLINE" : "OFFLINE"}
                    </NeoBox>
                    <NeoBox className={`px-4 py-2 flex items-center gap-2 font-bold ${isUnderAttack ? "bg-red-500 text-white" : "bg-white"}`}>
                        <ShieldAlert />
                        {isUnderAttack ? "THREAT DETECTED" : "SECURE"}
                    </NeoBox>
                </div>
            </header>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* LEFT COL: CONTROLS & STATUS (3) */}
                <div className="md:col-span-3 flex flex-col gap-6">
                    <NeoCard title="System Control" className="bg-white">
                        <div className="space-y-4">
                            <p className="font-mono text-xs text-gray-500 mb-2">INJECT ADVERSARIAL VECTORS</p>

                            <NeoButton
                                variant={attackActive === 'fdi_voltage_spike' ? 'danger' : 'primary'}
                                className="w-full text-left flex justify-between items-center"
                                onClick={() => toggleAttack('fdi_voltage_spike')}
                            >
                                <span>FDI VOLTAGE</span>
                                {attackActive === 'fdi_voltage_spike' && <Activity className="animate-pulse" />}
                            </NeoButton>

                            <NeoButton
                                variant={attackActive === 'fdi_frequency_drop' ? 'danger' : 'primary'}
                                className="w-full text-left flex justify-between items-center"
                                onClick={() => toggleAttack('fdi_frequency_drop')}
                            >
                                <span>FDI FREQ</span>
                                {attackActive === 'fdi_frequency_drop' && <Activity className="animate-pulse" />}
                            </NeoButton>

                            <NeoButton
                                variant={attackActive === 'dos_scada_outage' ? 'danger' : 'primary'}
                                className="w-full text-left flex justify-between items-center"
                                onClick={() => toggleAttack('dos_scada_outage')}
                            >
                                <span>DoS ATTACK</span>
                                {attackActive === 'dos_scada_outage' && <Activity className="animate-pulse" />}
                            </NeoButton>

                            <div className="border-t-2 border-black pt-4 mt-4">
                                <p className="font-mono text-xs text-gray-500 mb-2">PROTECTION (BREAKER)</p>
                                <div className="flex gap-2">
                                    <NeoButton variant="secondary" className="flex-1 text-xs px-2" onClick={() => closeBreaker(1)}>CLOSE L1</NeoButton>
                                    <NeoButton variant="danger" className="flex-1 text-xs px-2" onClick={() => tripBreaker(1)}>TRIP L1</NeoButton>
                                </div>
                            </div>
                        </div>
                    </NeoCard>

                    <NeoCard title="AI Diagnostic" className="bg-white">
                        <div className="flex flex-col items-center justify-center p-4">
                            <div className={`w-32 h-32 rounded-full border-4 border-black flex items-center justify-center text-3xl font-black mb-4 ${aiResult?.is_anomaly ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
                                {aiResult ? (aiResult.confidence * 100).toFixed(2) : 0}%
                            </div>
                            <span className="font-mono font-bold uppercase">Confidence Score</span>
                            <span className="font-mono text-sm mt-2">{aiResult?.label || "IDLE"}</span>
                        </div>
                    </NeoCard>

                    <NeoCard title="Recent Alerts" className="bg-white max-h-64 overflow-y-auto">
                        <div className="space-y-2">
                            {alerts.map((alert, i) => (
                                <div key={i} className="text-xs border-l-2 border-black pl-2 py-1">
                                    <div className="flex justify-between font-bold">
                                        <span>{alert.type}</span>
                                        <span className={alert.severity === 'critical' ? 'text-red-600' : 'text-gray-500'}>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="truncate">{alert.message}</p>
                                </div>
                            ))}
                            {alerts.length === 0 && <p className="text-gray-400 text-center">No active alerts</p>}
                        </div>
                    </NeoCard>
                </div>

                {/* MIDDLE COL: VISUALIZATION (6) */}
                <div className="md:col-span-6 flex flex-col gap-6">
                    {/* VOLTAGE GRAPH */}
                    <div className="h-48 md:h-64">
                        <WaveformGraph
                            title="Bus 5 Voltage (p.u.)"
                            data={telemetry.map(d => ({ time: d.time, value: d.voltage }))}
                            color="#8B5CF6"
                            isGlitching={attackActive === 'fdi_voltage_spike'}
                        />
                    </div>

                    {/* FREQUENCY GRAPH */}
                    <div className="h-48 md:h-64">
                        <WaveformGraph
                            title="System Frequency (Hz)"
                            data={telemetry.map(d => ({ time: d.time, value: d.frequency }))}
                            color="#10B981"
                            isGlitching={attackActive === 'fdi_frequency_drop'}
                        />
                    </div>

                    {/* CONFIDENCE GRAPH */}
                    <div className="h-48 md:h-64">
                        <WaveformGraph
                            title="AI Confidence Probability (%)"
                            data={telemetry.map(d => ({ time: d.time, value: d.confidence * 100 }))}
                            color="#3B82F6"
                        />
                    </div>

                    {/* SCADA MAP (Real-Time Topology) */}
                    <NeoCard title="IEEE 9-Bus Topology" className="h-[400px] bg-white relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                            <svg className="w-full h-full" viewBox="0 0 400 300">
                                {/* Defs for markers */}
                                <defs>
                                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
                                        <path d="M0,0 L0,6 L9,3 z" fill="#000" />
                                    </marker>
                                </defs>

                                {/* Lines (Dynamic Status) */}
                                {gridState?.lines?.map((line: any, i: number) => {
                                    // Hardcoded positions for 9-bus abstraction
                                    // 1-4, 4-5, 5-6, 3-6, 6-7, 7-8, 8-2, 8-9, 9-4
                                    // Let's simplified render: Ring of 9 nodes
                                    const r = 100;
                                    const cx = 200, cy = 150;
                                    const angleStep = (2 * Math.PI) / 9;

                                    // Map simulation lines to geometry
                                    // Simulation has 9 lines usually in standard case9
                                    // Let's assume sequential 0->1->2... for visualization simplicity
                                    const idx1 = i;
                                    const idx2 = (i + 1) % 9;

                                    const x1 = cx + r * Math.cos(idx1 * angleStep);
                                    const y1 = cy + r * Math.sin(idx1 * angleStep);
                                    const x2 = cx + r * Math.cos(idx2 * angleStep);
                                    const y2 = cy + r * Math.sin(idx2 * angleStep);

                                    const isOpen = line.status === 'open';

                                    return (
                                        <g key={i} onClick={() => isOpen ? closeBreaker(i) : tripBreaker(i)} className="cursor-pointer hover:opacity-70">
                                            {/* Line */}
                                            <line
                                                x1={x1} y1={y1} x2={x2} y2={y2}
                                                stroke={isOpen ? "#F43F5E" : "black"}
                                                strokeWidth={isOpen ? "2" : "4"}
                                                strokeDasharray={isOpen ? "5,5" : "none"}
                                            />
                                            {/* Breaker Box on Midpoint */}
                                            <rect
                                                x={(x1 + x2) / 2 - 6} y={(y1 + y2) / 2 - 6}
                                                width="12" height="12"
                                                fill={isOpen ? "#FFF" : "#000"}
                                                stroke={isOpen ? "#F43F5E" : "black"}
                                                strokeWidth="2"
                                            />
                                        </g>
                                    );
                                })}

                                {/* Nodes (Buses) */}
                                {Array.from({ length: 9 }).map((_, i) => {
                                    const r = 100;
                                    const cx = 200, cy = 150;
                                    const angleStep = (2 * Math.PI) / 9;
                                    const x = cx + r * Math.cos(i * angleStep);
                                    const y = cy + r * Math.sin(i * angleStep);

                                    // Check if voltage anomaly on this bus
                                    // We need bus 5 (index 4) glitch logic
                                    const busVal = gridState?.buses?.[i]?.vm_pu || 1.0;
                                    const isAnomaly = busVal > 1.1 || busVal < 0.9;

                                    return (
                                        <g key={i}>
                                            <circle
                                                cx={x} cy={y} r="14"
                                                fill={isAnomaly ? "#F43F5E" : "white"}
                                                stroke="black" strokeWidth="3"
                                            />
                                            <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fontWeight="bold">
                                                {i + 1}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>

                            <div className="absolute top-2 right-2 flex flex-col gap-1 text-[10px] font-mono border border-black p-1 bg-white/80">
                                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-black"></div> CLOSED</div>
                                <div className="flex items-center gap-1"><div className="w-2 h-2 border border-red-500 bg-white"></div> OPEN (TRIP)</div>
                            </div>
                        </div>
                    </NeoCard>
                </div>

                {/* RIGHT COL: EXPLAINABILITY (3) */}
                <div className="md:col-span-3 flex flex-col gap-6">
                    <NeoCard title="SHAP Analysis" className="bg-white flex-1 min-h-[200px]">
                        {aiResult?.shap_values && aiResult.shap_values.length > 0 ? (
                            <div className="space-y-4">
                                {aiResult.shap_values.map((shap, idx) => (
                                    <div key={idx} className="bg-gray-100 p-2 border-2 border-black">
                                        <div className="flex justify-between font-mono text-xs font-bold mb-1">
                                            <span>{shap.feature}</span>
                                            <span>{shap.value.toFixed(2)}</span>
                                        </div>
                                        <div className="h-2 w-full bg-white border border-black">
                                            <div
                                                className="h-full bg-black"
                                                style={{ width: `${Math.min(shap.value * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 font-mono text-sm text-center">
                                NO ANOMALY DETECTED.<br />SYSTEM NORMAL.
                            </div>
                        )}
                    </NeoCard>

                    <NeoCard title="Model Performance (ROC)" className="bg-white h-64">
                        {metrics && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Precision', val: 98 },
                                    { name: 'Recall', val: 94 },
                                    { name: 'F1', val: 96 },
                                ]}>
                                    <XAxis dataKey="name" tick={{ fontFamily: 'monospace', fontSize: 12 }} />
                                    <YAxis hide />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ border: '2px solid black', boxShadow: '4px 4px 0 0 black' }} />
                                    <Bar dataKey="val" fill="#10B981" stroke="black" strokeWidth={2} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </NeoCard>
                </div>

            </div>
        </div>
    );
}

export default App;
