import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import {
    LayoutDashboard,
    Activity,
    ShieldAlert,
    Microscope,
    Server,
    Cpu,
    Settings,
    ChevronLeft,
    ChevronRight,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [location] = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/" },
        { icon: Activity, label: "Grid Monitor", path: "/monitor" },
        { icon: ShieldAlert, label: "AI Detection", path: "/ai-detection" },
        { icon: Microscope, label: "SHAP Explainer", path: "/shap" },
        { icon: Server, label: "SCADA Bridge", path: "/scada" },
        { icon: Cpu, label: "Model Perf", path: "/performance" },
        { icon: Settings, label: "Settings", path: "/settings" },
    ];

    return (
        <div
            className={cn(
                "h-screen bg-deep-navy border-r border-white/10 flex flex-col transition-all duration-300 relative z-50",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Header */}
            <div className="h-16 flex items-center justify-center border-b border-white/10 relative">
                <div className="flex items-center gap-2 text-electric-cyan font-bold text-xl tracking-tighter">
                    <Zap className="fill-current w-6 h-6 animate-pulse" />
                    {!collapsed && <span className="animate-in fade-in duration-300">VERTEX</span>}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-deep-navy border border-white/20 text-muted-foreground hover:text-white hover:bg-neural-purple/20"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </Button>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 space-y-2 px-3">
                {navItems.map((item) => {
                    const isActive = location === item.path;
                    return (
                        <Link key={item.path} href={item.path}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer group transition-all duration-200 relative overflow-hidden",
                                    isActive
                                        ? "bg-neural-purple/10 text-electric-cyan"
                                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-electric-cyan shadow-[0_0_10px_#00E0FF]" />
                                )}

                                <item.icon
                                    size={20}
                                    className={cn(
                                        "transition-all duration-300",
                                        isActive ? "text-neural-purple drop-shadow-[0_0_5px_rgba(124,77,255,0.5)]" : "group-hover:text-white"
                                    )}
                                />

                                {!collapsed && (
                                    <span className="font-medium tracking-wide text-sm whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200">
                                        {item.label}
                                    </span>
                                )}

                                {/* Hover Glow */}
                                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border border-white/5" />
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Status Footer */}
            <div className="p-4 border-t border-white/10">
                {!collapsed ? (
                    <div className="bg-card-surface/50 rounded-lg p-3 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-grid-green animate-pulse" />
                            <span className="text-xs font-mono text-grid-green">SYSTEM ONLINE</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                            VER: 3.0.1-CYBER
                            <br />
                            LAT: 12ms
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div className="w-2 h-2 rounded-full bg-grid-green animate-pulse" />
                    </div>
                )}
            </div>
        </div>
    );
}
