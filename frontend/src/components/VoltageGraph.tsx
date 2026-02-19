import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap } from 'lucide-react';
import { cn } from "@/lib/utils";

interface VoltageGraphProps {
    data: any[];
    attackType?: string;
}

export function VoltageGraph({ data, attackType }: VoltageGraphProps) {
    const isAttack = attackType && attackType !== "none";
    const isDoS = attackType === "DoS";

    // Cyber-physical coloring
    const strokeColor = isAttack ? "#FF1744" : "#00E0FF"; // Critical Red or Electric Cyan

    return (
        <Card className={cn("glass-panel h-full flex flex-col relative overflow-hidden", isAttack ? "neon-border border-critical-red/50" : "")}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium tracking-widest text-muted-foreground flex items-center gap-2">
                    <Activity className={cn("w-4 h-4", isAttack ? "text-critical-red animate-pulse" : "text-electric-cyan")} />
                    BUS VOLTAGE (PU)
                    {isAttack && <span className="ml-auto text-xs text-critical-red font-mono animate-flicker">ANOMALY DETECTED</span>}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 relative">
                {/* Background Grid Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,224,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,224,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <defs>
                            <linearGradient id="voltageGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis
                            dataKey="time"
                            stroke="rgba(255,255,255,0.3)"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.3)"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            domain={[0.8, 1.2]}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0B0F1A', borderColor: 'rgba(255,255,255,0.2)', color: '#E0F2FE' }}
                            itemStyle={{ color: strokeColor }}
                            labelStyle={{ color: '#94a3b8' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="vm_pu"
                            stroke={strokeColor}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, fill: '#fff', stroke: strokeColor, strokeWidth: 2 }}
                            animationDuration={isDoS ? 0 : 500} // Eliminate anim for DoS (flatline effect)
                            isAnimationActive={!isDoS}
                        />
                        {isAttack && (
                            <ReferenceArea y1={0} y2={2} fill="rgba(255, 23, 68, 0.1)" />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
