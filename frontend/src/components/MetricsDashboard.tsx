import React from 'react';
import { Sidebar } from './Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';
import { Activity, Target, ShieldCheck, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";

// Mock Data for Metrics
const rocData = [
    { fpr: 0, tpr: 0 },
    { fpr: 0.05, tpr: 0.85 }, // High early detection
    { fpr: 0.1, tpr: 0.92 },
    { fpr: 0.2, tpr: 0.96 },
    { fpr: 0.5, tpr: 0.98 },
    { fpr: 1, tpr: 1 },
];

const confusionMatrix = [
    { actual: 'Normal', predicted: 'Normal', count: 1450, color: '#00FF88' }, // True Negative
    { actual: 'Normal', predicted: 'Attack', count: 12, color: '#FF9100' },   // False Positive
    { actual: 'Attack', predicted: 'Normal', count: 5, color: '#FF1744' },    // False Negative (Critical)
    { actual: 'Attack', predicted: 'Attack', count: 320, color: '#00E0FF' },  // True Positive
];

export default function MetricsDashboard() {
    return (
        <div className="flex h-screen bg-background overflow-hidden text-foreground font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 relative p-8 overflow-y-auto">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                        <Target className="w-8 h-8 text-electric-cyan" />
                        MODEL PERFORMANCE ANALYTICS
                    </h1>
                    <p className="text-muted-foreground font-mono">
                        ST-GNN v3.0 • TRAINING SET: IEEE 9-BUS DYNAMIC • LAST RETRAIN: 2 HOURS AGO
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* ROC Curve */}
                    <Card className="glass-panel">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium tracking-widest text-muted-foreground flex items-center justify-between">
                                <span>ROC CURVE (AUC = 0.98)</span>
                                <Activity className="w-4 h-4 text-electric-cyan" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={rocData}>
                                    <defs>
                                        <linearGradient id="colorRoc" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00E0FF" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#00E0FF" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey="fpr"
                                        label={{ value: 'False Positive Rate', position: 'insideBottomRight', offset: -10, fill: '#64748b' }}
                                        stroke="rgba(255,255,255,0.2)"
                                    />
                                    <YAxis
                                        label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                                        stroke="rgba(255,255,255,0.2)"
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0B0F1A', borderColor: 'rgba(255,255,255,0.2)', color: '#E0F2FE' }}
                                    />
                                    <Area type="monotone" dataKey="tpr" stroke="#00E0FF" fillOpacity={1} fill="url(#colorRoc)" />
                                    {/* Random Guess Line */}
                                    <Area type="linear" dataKey="fpr" stroke="#64748b" strokeDasharray="5 5" fill="none" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Confusion Matrix Visualization */}
                    <Card className="glass-panel">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium tracking-widest text-muted-foreground flex items-center justify-between">
                                <span>CONFUSION MATRIX</span>
                                <ShieldCheck className="w-4 h-4 text-grid-green" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center">
                            <div className="grid grid-cols-2 gap-4 w-full h-full p-4">
                                <div className="bg-grid-green/10 border border-grid-green/30 rounded-lg flex flex-col items-center justify-center p-4 relative group hover:bg-grid-green/20 transition-colors">
                                    <div className="text-4xl font-bold text-grid-green mb-1">1450</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">True Negative</div>
                                    <div className="text-[10px] text-white/50 absolute top-2 right-2">SECURE</div>
                                </div>
                                <div className="bg-alert-orange/10 border border-alert-orange/30 rounded-lg flex flex-col items-center justify-center p-4 relative group hover:bg-alert-orange/20 transition-colors">
                                    <div className="text-4xl font-bold text-alert-orange mb-1">12</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">False Positive</div>
                                    <div className="text-[10px] text-white/50 absolute top-2 right-2">FALSE ALARM</div>
                                </div>
                                <div className="bg-critical-red/10 border border-critical-red/30 rounded-lg flex flex-col items-center justify-center p-4 relative group hover:bg-critical-red/20 transition-colors">
                                    <div className="text-4xl font-bold text-critical-red mb-1">5</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">False Negative</div>
                                    <div className="text-[10px] text-white/50 absolute top-2 right-2">MISSED ATTACK</div>
                                </div>
                                <div className="bg-electric-cyan/10 border border-electric-cyan/30 rounded-lg flex flex-col items-center justify-center p-4 relative group hover:bg-electric-cyan/20 transition-colors">
                                    <div className="text-4xl font-bold text-electric-cyan mb-1">320</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">True Positive</div>
                                    <div className="text-[10px] text-white/50 absolute top-2 right-2">DETECTED</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="glass-panel border-l-4 border-l-grid-green p-4">
                        <div className="text-xs text-muted-foreground font-mono">ACCURACY</div>
                        <div className="text-2xl font-bold text-white">99.1%</div>
                    </Card>
                    <Card className="glass-panel border-l-4 border-l-electric-cyan p-4">
                        <div className="text-xs text-muted-foreground font-mono">PRECISION</div>
                        <div className="text-2xl font-bold text-white">96.4%</div>
                    </Card>
                    <Card className="glass-panel border-l-4 border-l-neural-purple p-4">
                        <div className="text-xs text-muted-foreground font-mono">F1-SCORE</div>
                        <div className="text-2xl font-bold text-white">0.97</div>
                    </Card>
                    <Card className="glass-panel border-l-4 border-l-alert-orange p-4">
                        <div className="text-xs text-muted-foreground font-mono">DETECTION LATENCY</div>
                        <div className="text-2xl font-bold text-white">12ms</div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
