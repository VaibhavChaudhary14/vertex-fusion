import { Shield, AlertTriangle, Zap, Power, Activity } from 'lucide-react';
import { GridState } from '@/types/grid';

interface BusData {
  voltage: number;
  current: number;
  status: 'normal' | 'attack' | 'critical';
}

interface Props {
  state: GridState | null;
}

const IEEE9BusSLD: React.FC<Props> = ({ state }) => {
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
    [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 4] // Loop lines
  ];

  const renderLine = (start: number, end: number) => {
    const p1 = busPositions[start];
    const p2 = busPositions[end];
    const d1 = getBusData(start);
    const d2 = getBusData(end);

    const isCritical = d1.status === 'critical' || d2.status === 'critical';
    const isAttack = d1.status === 'attack' || d2.status === 'attack';

    let stroke = 'hsl(var(--border))';
    if (isCritical) stroke = 'hsl(var(--destructive))';
    else if (isAttack) stroke = 'hsl(var(--warning))';

    return (
      <line
        key={`${start}-${end}`}
        x1={p1.x} y1={p1.y}
        x2={p2.x} y2={p2.y}
        stroke={stroke}
        strokeWidth={isCritical ? 4 : 2}
        className="transition-all duration-500"
      />
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
