import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface CurrentGraphProps {
    data: any[];
    breakerStatus: "CLOSED" | "TRIPPED";
}

export function CurrentGraph({ data, breakerStatus }: CurrentGraphProps) {
    const isTripped = breakerStatus === "TRIPPED";
    const strokeColor = isTripped ? "#E0F2FE" : "#00FF88"; // White/Gray if tripped, Green normal

    return (
        <Card className={cn("glass-panel h-full flex flex-col", isTripped ? "border-alert-orange/50 bg-alert-orange/5" : "")}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium tracking-widest text-muted-foreground flex items-center gap-2">
                    <Zap className={cn("w-4 h-4", isTripped ? "text-alert-orange" : "text-grid-green")} />
                    LINE LOADING (%)
                    {isTripped && <span className="ml-auto text-xs text-alert-orange font-mono animate-pulse">BREAKER OPEN</span>}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 relative">
                {/* Tripped Overlay */}
                {isTripped && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px] z-10">
                        <div className="flex flex-col items-center text-alert-orange animate-bounce">
                            <AlertTriangle size={32} />
                            <span className="font-mono font-bold mt-2">NO FLOW</span>
                        </div>
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
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
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0B0F1A', borderColor: 'rgba(255,255,255,0.2)', color: '#E0F2FE' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="loading"
                            stroke={strokeColor}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                            animationDuration={500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
