
import React from 'react';
import { useLocation, Link } from 'wouter';
import { Activity, Radio, LayoutDashboard, Settings, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlassLayoutProps {
    children: React.ReactNode;
}

const SidebarItem = ({ icon: Icon, label, href, active }: { icon: any, label: string, href: string, active: boolean }) => (
    <Link href={href}>
        <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer group",
            active
                ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                : "text-muted-foreground hover:bg-white/5 hover:text-white hover:border hover:border-white/10"
        )}>
            <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", active && "animate-pulse")} />
            <span className="font-medium text-sm tracking-wide">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_#7c3aed]" />}
        </div>
    </Link>
);

export function GlassLayout({ children }: GlassLayoutProps) {
    const [location] = useLocation();

    return (
        <div className="min-h-screen w-full bg-[#030712] text-foreground relative overflow-hidden selection:bg-primary/30">

            {/* Animated Deep Space Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* Nebulas */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[150px] animate-pulse-glow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[150px] animate-pulse-glow delay-1000" />

                {/* Grid Overlay */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `linear-gradient(rgba(124, 58, 237, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 58, 237, 0.3) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                        maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                    }}
                />

                {/* Floating Particles (CSS Only for perf) */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="relative z-10 flex h-screen p-4 gap-4">

                {/* Floating Glass Sidebar */}
                <aside className="w-64 h-full hidden md:flex flex-col rounded-3xl border border-white/5 bg-glass-black backdrop-blur-xl shadow-2xl p-4 transition-all duration-500 hover:border-primary/20">

                    {/* Logo Area */}
                    <div className="flex items-center gap-3 px-4 py-6 mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/50 blur-lg rounded-full animate-pulse" />
                            <div className="relative w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center border border-white/20 shadow-inner">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                Vertex<span className="text-primary">Fusion</span>
                            </h1>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest pl-0.5">Digital Twin v2.0</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                        <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" active={location === '/dashboard'} />
                        <SidebarItem icon={Zap} label="Digital Twin" href="/digital-twin" active={location === '/digital-twin'} />
                        <SidebarItem icon={Activity} label="Virtual Lab" href="/virtual-lab" active={location === '/virtual-lab'} />
                        <SidebarItem icon={Radio} label="Threat Feed" href="/threats" active={location === '/threats'} />
                        <SidebarItem icon={Settings} label="ML Datasets" href="/ml-datasets" active={location === '/ml-datasets'} />
                    </nav>

                    {/* Status Card */}
                    <div className="mt-auto p-4 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-white/80">System Online</span>
                                <span className="text-[10px] text-white/40">Latency: 12ms</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 h-full rounded-3xl border border-white/5 bg-glass-black/50 backdrop-blur-md shadow-2xl overflow-hidden relative">
                    {children}
                </main>

            </div>
        </div>
    );
}
