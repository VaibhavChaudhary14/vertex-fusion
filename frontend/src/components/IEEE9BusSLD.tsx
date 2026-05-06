import { Shield, AlertTriangle, Zap, Power, Activity } from 'lucide-react';
import { GridState } from '@/types/grid';

interface BusData {
  voltage: number;
  current: number;
  status: 'normal' | 'attack' | 'critical';
}

interface Props {
  state: GridState | null;
  showHeatmap?: boolean;
}

const IEEE9BusSLD: React.FC<Props> = ({ state, showHeatmap = true }) => {
  // Bus positions in SVG space
  const busPositions: Record<number, { x: number; y: number }> = {
    1: { x: 100, y: 100 },
    2: { x: 500, y: 100 },
    3: { x: 900, y: 100 },
    4: { x: 100, y: 300 },
    7: { x: 500, y: 300 },
    9: { x: 900, y: 300 },
    5: { x: 250, y: 500 },
    6: { x: 500, y: 600 },
    8: { x: 750, y: 500 },
  };

  const getBusData = (id: number): BusData => {
    if (!state) return { voltage: 1.0, current: 0.0, status: 'normal' };
    const voltageId = `bus${id}_voltage` as keyof GridState;
    const currentId = `bus${id}_current` as keyof GridState;

    const voltage = (state[voltageId] as number) || 0;
    const current = (state[currentId] as number) || 0;

    let status: 'normal' | 'attack' | 'critical' = 'normal';
    if (state.prediction > 0) {
      // If there's an attack, highlight buses with high deviation or just general warning
      // In a real system we'd use node-level anomaly scores. 
      // For now, if pred > 0, we highlight everything as 'attack' if it's the target.
      status = 'attack';
    }
    if (voltage < 0.9 || voltage > 1.1) status = 'critical';

    return { voltage, current, status };
  };

  const lines = [
    [1, 4], [2, 7], [3, 9], // Transformer lines
    [4, 5], [4, 6], [5, 7], [6, 9], [7, 8], [8, 9] // Loop lines
  ];
  const renderLine = (start: number, end: number) => {
    const p1 = busPositions[start];
    const p2 = busPositions[end];
    const d1 = getBusData(start);
    const d2 = getBusData(end);

    const isCritical = d1.status === 'critical' || d2.status === 'critical';
    const isAttack = d1.status === 'attack' || d2.status === 'attack';

    const stroke = isCritical ? 'hsl(var(--destructive))' : isAttack ? 'hsl(var(--warning))' : 'hsl(var(--border))';

    // Calculate breaker positions (20% and 80% along the line)
    const b1x = p1.x + 0.2 * (p2.x - p1.x);
    const b1y = p1.y + 0.2 * (p2.y - p1.y);
    const b2x = p1.x + 0.8 * (p2.x - p1.x);
    const b2y = p1.y + 0.8 * (p2.y - p1.y);

    const lineId = `L${Math.min(start, end)}-${Math.max(start, end)}`;
    const b1Key = `${lineId}_B${start}`;
    const b2Key = `${lineId}_B${end}`;

    const b1Status = state?.breaker_states?.[b1Key] || 'CLOSED';
    const b2Status = state?.breaker_states?.[b2Key] || 'CLOSED';

    const toggleBreaker = async (line: string, bus: number, current: string) => {
      const nextStatus = current === 'CLOSED' ? 'OPEN' : 'CLOSED';
      try {
        await fetch("/api/simulator/protection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: nextStatus === 'OPEN' ? 'TRIP' : 'CLOSE', bus_id: bus, line_id: line })
        });
      } catch (e) {
        console.error("Failed to toggle breaker:", e);
      }
    };

    return (
      <g key={`${start}-${end}`}>
        <line
          x1={p1.x} y1={p1.y}
          x2={p2.x} y2={p2.y}
          stroke={stroke}
          strokeWidth={isCritical ? 4 : 2}
          strokeDasharray={b1Status === 'OPEN' || b2Status === 'OPEN' ? "5,5" : "0"}
          className="transition-all duration-500"
        />
        {/* Breaker 1 (Near start bus) */}
        <rect
          x={b1x - 6} y={b1y - 6} width={12} height={12}
          rx={2}
          className={`cursor-pointer transition-colors duration-300 ${b1Status === 'OPEN' ? 'fill-destructive' : 'fill-primary'}`}
          onClick={() => toggleBreaker(lineId, start, b1Status)}
        />
        {/* Breaker 2 (Near end bus) */}
        <rect
          x={b2x - 6} y={b2y - 6} width={12} height={12}
          rx={2}
          className={`cursor-pointer transition-colors duration-300 ${b2Status === 'OPEN' ? 'fill-destructive' : 'fill-primary'}`}
          onClick={() => toggleBreaker(lineId, end, b2Status)}
        />
      </g>
    );
  };

  const renderHeatGlow = (id: number) => {
    if (!showHeatmap || !state?.heatmap) return null;
    const pos = busPositions[id];
    const intensity = state.heatmap[id - 1] || 0;
    const normalizedIntensity = Math.min(intensity * 10, 1.0);
    
    if (normalizedIntensity < 0.05) return null;

    return (
      <g key={`heat-${id}`}>
        <defs>
          <radialGradient id={`glow-${id}`}>
            <stop offset="0%" stopColor="red" stopOpacity={normalizedIntensity * 0.6} />
            <stop offset="100%" stopColor="red" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle 
          cx={pos.x} cy={pos.y} 
          r={50 + (normalizedIntensity * 100)} 
          fill={`url(#glow-${id})`}
          className="animate-pulse"
        />
      </g>
    );
  };

  const renderBus = (id: number) => {
    const pos = busPositions[id];
    const data = getBusData(id);

    let color = 'bg-primary';
    if (data.status === 'critical') color = 'bg-destructive';
    else if (data.status === 'attack') color = 'bg-warning';

    const isGenerator = id <= 3;
    const isLoad = [5, 6, 8].includes(id);

    return (
      <g key={id} className="group cursor-pointer">
        {/* Connection visuals */}
        {isGenerator && (
          <g>
            <circle cx={pos.x} cy={pos.y - 40} r={15} fill="none" stroke="currentColor" strokeWidth={2} />
            <path d={`M ${pos.x - 8} ${pos.y - 40} Q ${pos.x} ${pos.y - 50} ${pos.x + 8} ${pos.y - 40} T ${pos.x + 8} ${pos.y - 40}`} fill="none" stroke="currentColor" strokeWidth={2} />
            <line x1={pos.x} y1={pos.y - 25} x2={pos.x} y2={pos.y - 10} stroke="currentColor" strokeWidth={2} />
            <text x={pos.x + 20} y={pos.y - 35} className="text-[10px] fill-muted-foreground font-bold">G{id}</text>
          </g>
        )}

        {isLoad && (
          <g>
            <path d={`M ${pos.x} ${pos.y + 10} L ${pos.x - 10} ${pos.y + 30} L ${pos.x + 10} ${pos.y + 30} Z`} fill="hsl(var(--accent))" />
            <text x={pos.x + 15} y={pos.y + 25} className="text-[10px] fill-muted-foreground font-bold">L{id}</text>
          </g>
        )}

        {/* Bus Bar */}
        <rect
          x={pos.x - 30}
          y={pos.y - 5}
          width={60}
          height={10}
          rx={2}
          className={`${color} transition-colors duration-500`}
        />

        {/* Label */}
        <text
          x={pos.x}
          y={pos.y + 20}
          textAnchor="middle"
          className="text-[12px] font-mono font-bold fill-foreground"
        >
          BUS {id}
        </text>

        {/* Tooltip-like popup on hover */}
        <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <rect x={pos.x + 35} y={pos.y - 30} width={100} height={50} rx={4} className="fill-card stroke-border" />
          <text x={pos.x + 40} y={pos.y - 15} className="text-[10px] fill-foreground font-bold">{data.voltage.toFixed(4)} pu</text>
          <text x={pos.x + 40} y={pos.y} className="text-[10px] fill-muted-foreground">{data.current.toFixed(2)} A</text>
        </g>
      </g>
    );
  };

  return (
    <div className="relative w-full aspect-[16/9] bg-card/50 rounded-xl border border-border overflow-hidden">
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-sm uppercase tracking-wider">IEEE 9-Bus Substation SLD</h3>
      </div>

      {state?.prediction ? (
        <div className="absolute top-4 right-4 flex items-center gap-2 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="text-xs font-bold text-destructive uppercase">{state.attack_type} DETECTED</span>
        </div>
      ) : (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-success" />
          <span className="text-xs font-bold text-success uppercase">Grid Secure</span>
        </div>
      )}

      <svg viewBox="0 0 1000 700" className="w-full h-full p-10 text-foreground">
        {/* Heatmap Layer */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(id => renderHeatGlow(id))}

        {/* Draw Lines */}
        {lines.map(([start, end]) => renderLine(start, end))}

        {/* Draw Buses */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(id => renderBus(id))}

        {/* Legend */}
        <g transform="translate(800, 600)">
          <rect width={150} height={80} rx={8} className="fill-background/80 stroke-border" />
          <g transform="translate(10, 20)">
            <rect width={15} height={5} className="bg-primary" />
            <text x={20} y={6} className="text-[10px] fill-muted-foreground">Normal</text>
          </g>
          <g transform="translate(10, 40)">
            <rect width={15} height={5} className="bg-warning" />
            <text x={20} y={6} className="text-[10px] fill-muted-foreground">Attack</text>
          </g>
          <g transform="translate(10, 60)">
            <rect width={15} height={5} className="bg-destructive" />
            <text x={20} y={6} className="text-[10px] fill-muted-foreground">Critical</text>
          </g>
        </g>
      </svg>

      {/* Breaker Overlay */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-background/80 p-2 rounded-lg border border-border">
        <Power className={`w-4 h-4 ${state?.breaker_status === 'OPEN' ? 'text-destructive' : 'text-primary'}`} />
        <span className="text-xs font-mono font-bold">BREAKER: {state?.breaker_status || 'CLOSED'}</span>
      </div>
    </div>
  );
};

export default IEEE9BusSLD;
