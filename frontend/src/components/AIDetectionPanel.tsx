import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Zap, Activity, Radio } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AIDetectionPanelProps {
    status: {
        detected: boolean;
        type?: string;
        confidence?: number;
    } | null;
    breakerStatus: "CLOSED" | "TRIPPED";
    onTripBreaker: () => void;
}

export function AIDetectionPanel({ status, breakerStatus, onTripBreaker }: AIDetectionPanelProps) {
    const isAttack = status?.detected || false;
    const confidence = (status?.confidence || 0) * 100;

    // Pulse speed increases with attack confidence
    const pulseClass = isAttack ? "animate-cyber-pulse shadow-[0_0_30px_rgba(255,23,68,0.4)]" : "shadow-[0_0_15px_rgba(0,255,136,0.1)]";
    const borderClass = isAttack ? "border-critical-red" : "border-grid-green/30";
    const bgClass = isAttack ? "bg-critical-red/5" : "bg-grid-green/5";

    return (
        <Card className={cn("glass-panel transition-all duration-500 relative overflow-hidden", borderClass, pulseClass, bgClass)}>
            {/* Scan Line Animation */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-full w-full animate-grid-flow pointer-events-none opacity-20" />

            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-full", isAttack ? "bg-critical-red/20 text-critical-red" : "bg-grid-green/20 text-grid-green")}>
                            {isAttack ? <ShieldAlert className="w-6 h-6 animate-pulse" /> : <ShieldCheck className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-sm font-mono text-muted-foreground tracking-widest uppercase">AI Threat Detection</h3>
                            <div className={cn("text-xl font-bold tracking-tight", isAttack ? "text-critical-red" : "text-grid-green")}>
                                {isAttack ? `THREAT DETECTED: ${status?.type}` : "SYSTEM SECURE"}
                            </div>
                        </div>
                    </div>

                    {/* Confidence Radial (Simplified as text for now, could be a chart) */}
                    <div className="text-right">
                        <div className="text-3xl font-mono font-bold text-white">
                            {confidence.toFixed(1)}<span className="text-sm text-muted-foreground">%</span>
                        </div>
                        <div className="text-xs text-electric-cyan tracking-wider uppercase">Confidence</div>
                    </div>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-card-surface/50 p-3 rounded border border-white/5">
                        <div className="text-xs text-muted-foreground uppercase mb-1">Recommended Action</div>
                        <div className={cn("font-mono font-bold text-sm", isAttack ? "text-alert-orange animate-flicker" : "text-white/50")}>
                            {isAttack ? "ISOLATE BUS 2" : "MONITORING..."}
                        </div>
                    </div>
                    <div className="bg-card-surface/50 p-3 rounded border border-white/5">
                        <div className="text-xs text-muted-foreground uppercase mb-1">Grid Status</div>
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", breakerStatus === "TRIPPED" ? "bg-red-500" : "bg-green-500 animate-pulse")} />
                            <span className="font-mono font-bold text-sm text-white">{breakerStatus}</span>
                        </div>
                    </div>
                </div>

                {/* Manual Override - Breaker Switch */}
                <div className="relative group">
                    <Button
                        onClick={onTripBreaker}
                        disabled={breakerStatus === "TRIPPED"}
                        className={cn(
                            "w-full h-12 font-mono text-lg tracking-widest border border-white/10 uppercase transition-all duration-300",
                            breakerStatus === "TRIPPED"
                                ? "bg-white/5 text-white/30 cursor-not-allowed"
                                : isAttack
                                    ? "bg-critical-red hover:bg-red-600 text-white animate-pulse shadow-[0_0_20px_rgba(255,23,68,0.5)]"
                                    : "bg-deep-navy hover:bg-white/10 text-electric-cyan hover:text-white hover:border-electric-cyan/50"
                        )}
                    >
                        {breakerStatus === "TRIPPED" ? (
                            <span className="flex items-center gap-2"><Radio className="w-4 h-4" /> LINK SEVERED</span>
                        ) : (
                            <span className="flex items-center gap-2"><Zap className="w-4 h-4 fill-current" /> EMERGENCY TRIP</span>
                        )}
                    </Button>

                    {/* Hover tooltip for button */}
                    {breakerStatus !== "TRIPPED" && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            MANUAL OVERRIDE: OPEN LINE 2-3
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
