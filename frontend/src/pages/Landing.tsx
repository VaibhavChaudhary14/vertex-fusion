import { Shield, ArrowRight, CheckCircle, Zap, Lock, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Landing() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black text-white">
      {/* Animated background grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, 0.05) 25%, rgba(0, 255, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, 0.05) 75%, rgba(0, 255, 0, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 0, 0.05) 25%, rgba(0, 255, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, 0.05) 75%, rgba(0, 255, 0, 0.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px',
          animation: 'grid-shift 8s linear infinite'
        }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-green-900/30 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-gradient-to-br from-green-500 to-green-700 border border-green-400/50">
              <Shield className="h-5 w-5 text-black" />
            </div>
            <span className="font-bold text-lg tracking-tight font-mono">VERTEX FUSION</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative w-full">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Radial glow background */}
          <div className="absolute inset-0 bg-radial-gradient opacity-30 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center, rgba(0, 255, 0, 0.1) 0%, transparent 70%)'
          }} />

          <div className="container max-w-7xl mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-green-500/30 bg-green-500/5 text-sm font-mono text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                IEEE OAJPE RESEARCH
              </div>

              {/* Main Headline */}
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight font-mono tracking-tighter">
                <span className="block text-white">DETECT</span>
                <span className="block bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 bg-clip-text text-transparent animate-pulse">
                  CYBER-PHYSICAL
                </span>
                <span className="block text-white">ATTACKS</span>
              </h1>

              {/* Subheading */}
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
                Enterprise-grade GNN-powered intrusion detection for smart grids.
                Fuse cyber and physical data for superior threat detection.
              </p>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-6 py-8">
                {[
                  { label: "FASTER", value: "26%" },
                  { label: "ACCURATE", value: "97.8%" },
                  { label: "LATENCY", value: "<30ms" },
                ].map((stat, i) => (
                  <div key={i} className="p-4 border border-green-900/30 bg-green-500/5 rounded-sm">
                    <div className="font-mono text-2xl md:text-3xl text-green-400 font-bold">{stat.value}</div>
                    <div className="text-xs md:text-sm text-gray-400 font-mono mt-2">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <a href="/dashboard">
                  <button className="px-8 py-3 bg-green-500 text-black font-bold font-mono rounded-sm hover:bg-green-400 transition-all hover:shadow-lg hover:shadow-green-500/50 flex items-center gap-2">
                    ENTER TO DASHBOARD
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </a>
              </div>
            </div>
          </div>

          {/* Animated lines accent */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50" />
        </section>

        {/* Features Section */}
        <section className="relative py-24 md:py-32 overflow-hidden border-t border-green-900/30">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="text-4xl md:text-5xl font-bold font-mono mb-4">CAPABILITIES</h2>
              <p className="text-gray-400 text-lg">Advanced threat detection for smart grids</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  title: "REAL-TIME",
                  desc: "Sub-30ms latency with WebSocket streaming"
                },
                {
                  icon: Lock,
                  title: "FUSION",
                  desc: "Cyber-physical data integration and analysis"
                },
                {
                  icon: Cpu,
                  title: "GNN POWERED",
                  desc: "Graph neural network intrusion detection"
                },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <Card key={i} className="border-green-900/30 bg-gradient-to-b from-green-500/5 to-transparent p-8 rounded-sm hover:border-green-500/50 transition-all group cursor-pointer">
                    <div className="flex items-start gap-4">
                      <Icon className="h-6 w-6 text-green-400 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold font-mono text-white mb-2">{feature.title}</h3>
                        <p className="text-sm text-gray-400">{feature.desc}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Attacks Detection */}
        <section className="relative py-24 md:py-32 overflow-hidden border-t border-green-900/30">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="text-4xl md:text-5xl font-bold font-mono mb-4">ATTACK DETECTION</h2>
              <p className="text-gray-400 text-lg">5 Advanced Threat Types</p>
            </div>

            <div className="grid md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {[
                { code: "RW", name: "Ransomware", color: "red" },
                { code: "FDI", name: "False Data", color: "yellow" },
                { code: "RS", name: "Reverse Shell", color: "red" },
                { code: "BF", name: "Brute Force", color: "yellow" },
                { code: "BD", name: "Backdoor", color: "red" },
              ].map((attack, i) => (
                <div key={i} className="p-6 border border-green-900/30 bg-green-500/5 rounded-sm hover:border-green-500/50 transition-all text-center group cursor-pointer">
                  <div className="font-mono text-2xl font-bold mb-2">{attack.code}</div>
                  <div className="text-xs text-gray-400 font-mono">{attack.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Grid Topologies */}
        <section className="relative py-24 md:py-32 overflow-hidden border-t border-green-900/30">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="text-4xl md:text-5xl font-bold font-mono mb-4">IEEE TOPOLOGIES</h2>
              <p className="text-gray-400 text-lg">Support for standard power grid configurations</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { buses: "14 Bus", desc: "Small power system" },
                { buses: "30 Bus", desc: "Medium network" },
                { buses: "118 Bus", desc: "Large-scale grid" },
              ].map((topo, i) => (
                <div key={i} className="p-8 border border-green-900/30 bg-green-500/5 rounded-sm text-center hover:border-green-500/50 transition-all">
                  <div className="font-mono text-3xl font-bold text-green-400 mb-2">{topo.buses}</div>
                  <div className="text-sm text-gray-400">{topo.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features List */}
        <section className="relative py-24 md:py-32 overflow-hidden border-t border-green-900/30">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold font-mono mb-12">ENTERPRISE FEATURES</h2>

              <div className="grid md:grid-cols-2 gap-8">
                {[
                  "GNN-based intrusion detection",
                  "Multi-modal data fusion",
                  "Virtual lab environment",
                  "Real-time graph visualization",
                  "AI threat analysis",
                  "SCADA protocol support",
                  "Online learning mode",
                  "Attack localization",
                  "Slow injection detection",
                  "Benchmark comparisons",
                  "Dataset generation",
                  "Role-based access",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 border border-green-900/30 bg-green-500/5 rounded-sm hover:border-green-500/50 transition-all">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="font-mono text-sm">{feature.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-24 md:py-32 overflow-hidden border-t border-green-900/30">
          <div className="container max-w-4xl mx-auto px-4 text-center space-y-8">
            <h2 className="text-5xl md:text-6xl font-bold font-mono">READY TO DEPLOY?</h2>
            <p className="text-xl text-gray-400 font-light">
              Protect your smart grid infrastructure with enterprise-grade threat detection
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a href="/dashboard">
                <button className="px-8 py-3 bg-green-500 text-black font-bold font-mono rounded-sm hover:bg-green-400 transition-all hover:shadow-lg hover:shadow-green-500/50 flex items-center gap-2">
                  ENTER TO DASHBOARD
                  <ArrowRight className="h-4 w-4" />
                </button>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-green-900/30 py-12 mt-20 bg-black/50">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="font-bold font-mono text-sm">VERTEX FUSION</span>
            </div>
            <p className="text-sm text-gray-500 font-mono">
              IEEE OAJPE Research-backed GNN Intrusion Detection
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes grid-shift {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
