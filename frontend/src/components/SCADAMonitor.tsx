import React from 'react';
import { Server, Activity } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SCADAMonitorProps {
    connected: boolean;
    source?: string;
}

export function SCADAMonitor({ connected, source }: SCADAMonitorProps) {
    return (
        <Card className="glass-panel p-4 flex items-center justify-between border-l-4 border-l-electric-cyan">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-card-surface border border-white/5 rounded-lg text-electric-cyan">
                    <Server className="w-5 h-5" />
                </div>
                <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">SCADA Bridge</div>
                    <div className="text-sm font-bold text-white font-mono flex items-center gap-2">
                        {source || "LOCALHOST:5020"}
                        <span className="text-[10px] text-muted-foreground font-normal">
                            (Modbus TCP)
                        </span>
                    </div>
                </div>
            </div>

            <div className="text-right">
                <div className="flex items-center justify-end gap-2 mb-1">
                    <div className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        connected ? "bg-grid-green shadow-[0_0_10px_#00FF88]" : "bg-critical-red shadow-[0_0_10px_#FF1744]"
                    )} />
                    <span className={cn(
                        "text-xs font-bold tracking-wider",
                        connected ? "text-grid-green" : "text-critical-red"
                    )}>
                        {connected ? "ONLINE" : "OFFLINE"}
                    </span>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground flex items-center justify-end gap-1">
                    <Activity className="w-3 h-3" /> 20Hz RATE
                </div>
            </div>
        </Card>
    );
}
