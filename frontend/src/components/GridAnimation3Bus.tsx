import { memo } from "react";

interface GridAnimationProps {
  bus1Voltage: number;
  bus2Voltage: number;
  bus3Voltage: number;
  bus1Current: number;
  bus2Current: number;
  bus3Current: number;
  attackMode: boolean;
  selectedAttack: string;
  attackDetected: boolean;
  protectedZone?: string;
  isRunning: boolean;
}

export const GridAnimation3Bus = memo(function GridAnimation3Bus({
  bus1Voltage,
  bus2Voltage,
  bus3Voltage,
  bus1Current,
  bus2Current,
  bus3Current,
  attackMode,
  selectedAttack,
  attackDetected,
  protectedZone,
  isRunning,
}: GridAnimationProps) {
  // Helper function to determine bus status color
  const getBusColor = (voltage: number, busId: string) => {
    if (attackDetected && protectedZone === busId) {
      return "#dc2626"; // Red for attacked
    }
    if (protectedZone && protectedZone !== busId) {
      return "#10b981"; // Green for protected zones
    }
    if (Math.abs(voltage - 1.0) > 0.08) {
      return "#f59e0b"; // Amber for anomaly
    }
    return "#3b82f6"; // Blue for normal
  };

  // Helper function to get glow animation
  const getGlowAnimation = (busId: string) => {
    if (attackDetected && protectedZone === busId) {
      return "redPulse";
    }
    if (isRunning) {
      return "bluePulse";
    }
    return "none";
  };

  // SVG dimensions and scaling
  const width = 1000;
  const height = 500;
  const centerY = height / 2;

  // Bus positions
  const gen1X = 100, gen1Y = 150;
  const gen2X = 900, gen2Y = 150;
  const bus1X = 200, bus1Y = centerY;
  const bus2X = 500, bus2Y = centerY;
  const bus3X = 800, bus3Y = centerY;
  const load1X = 200, load1Y = 350;
  const load2X = 500, load2Y = 350;
  const load3X = 800, load3Y = 350;

  // Determine zone status
  const zone1Protected = protectedZone === "Bus1";
  const zone2Protected = protectedZone === "Bus2";
  const zone3Protected = protectedZone === "Bus3";
  const zone1Attacked = attackDetected && protectedZone === "Bus1";
  const zone2Attacked = attackDetected && protectedZone === "Bus2";
  const zone3Attacked = attackDetected && protectedZone === "Bus3";

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card rounded-lg border border-primary/20">
      <style>{`
        @keyframes bluePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes redPulse {
          0%, 100% { filter: drop-shadow(0 0 8px #dc2626); }
          50% { filter: drop-shadow(0 0 20px #dc2626); }
        }
        @keyframes greenPulse {
          0%, 100% { filter: drop-shadow(0 0 8px #10b981); }
          50% { filter: drop-shadow(0 0 15px #10b981); }
        }
        @keyframes flowAnimation {
          0%, 100% { stroke-dashoffset: 10; }
          50% { stroke-dashoffset: 0; }
        }
        .bus-circle { animation: bluePulse 1.5s ease-in-out infinite; }
        .red-attack { animation: redPulse 0.8s ease-in-out infinite; }
        .green-protect { animation: greenPulse 1.2s ease-in-out infinite; }
        .power-flow { animation: flowAnimation 2s linear infinite; }
        .protection-zone { 
          stroke-dasharray: 5, 5;
          stroke-dashoffset: 0;
          animation: ${zone1Attacked || zone2Attacked || zone3Attacked ? "flowAnimation 1s linear infinite" : "none"};
        }
      `}</style>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-4xl h-auto" style={{ aspectRatio: "2/1" }}>
        {/* Background */}
        <rect width={width} height={height} fill="transparent" />

        {/* Zone 1 Protection Box - Left */}
        {(zone1Protected || zone1Attacked) && (
          <rect
            x={80}
            y={130}
            width={220}
            height={250}
            fill={zone1Attacked ? "#dc2626" : "#10b981"}
            opacity={zone1Attacked ? 0.15 : 0.1}
            stroke={zone1Attacked ? "#dc2626" : "#10b981"}
            strokeWidth="3"
            strokeDasharray="8,4"
            rx="8"
          />
        )}

        {/* Zone 2 Protection Box - Center */}
        {(zone2Protected || zone2Attacked) && (
          <rect
            x={380}
            y={130}
            width={240}
            height={250}
            fill={zone2Attacked ? "#dc2626" : "#10b981"}
            opacity={zone2Attacked ? 0.15 : 0.1}
            stroke={zone2Attacked ? "#dc2626" : "#10b981"}
            strokeWidth="3"
            strokeDasharray="8,4"
            rx="8"
          />
        )}

        {/* Zone 3 Protection Box - Right */}
        {(zone3Protected || zone3Attacked) && (
          <rect
            x={680}
            y={130}
            width={220}
            height={250}
            fill={zone3Attacked ? "#dc2626" : "#10b981"}
            opacity={zone3Attacked ? 0.15 : 0.1}
            stroke={zone3Attacked ? "#dc2626" : "#10b981"}
            strokeWidth="3"
            strokeDasharray="8,4"
            rx="8"
          />
        )}

        {/* ===== GENERATORS ===== */}
        {/* Generator 1 */}
        <circle
          cx={gen1X}
          cy={gen1Y}
          r={25}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          className={isRunning ? "bus-circle" : ""}
        />
        <text x={gen1X} y={gen1Y + 45} textAnchor="middle" className="text-sm font-semibold fill-foreground" fontSize="14">
          Gen 1
        </text>

        {/* Generator 2 */}
        <circle
          cx={gen2X}
          cy={gen2Y}
          r={25}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          className={isRunning ? "bus-circle" : ""}
        />
        <text x={gen2X} y={gen2Y + 45} textAnchor="middle" className="text-sm font-semibold fill-foreground" fontSize="14">
          Gen 2
        </text>

        {/* ===== BUSES ===== */}
        {/* Bus 1 */}
        <circle
          cx={bus1X}
          cy={bus1Y}
          r={30}
          fill="none"
          stroke={getBusColor(bus1Voltage, "Bus1")}
          strokeWidth="4"
          className={zone1Attacked ? "red-attack" : zone1Protected ? "green-protect" : isRunning ? "bus-circle" : ""}
        />
        <text x={bus1X} y={bus1Y + 5} textAnchor="middle" className="text-xs font-bold fill-foreground" fontSize="12">
          Bus 1
        </text>
        <text x={bus1X} y={bus1Y + 65} textAnchor="middle" className="text-xs fill-muted-foreground" fontSize="11">
          {bus1Voltage.toFixed(3)} p.u.
        </text>

        {/* Bus 2 */}
        <circle
          cx={bus2X}
          cy={bus2Y}
          r={30}
          fill="none"
          stroke={getBusColor(bus2Voltage, "Bus2")}
          strokeWidth="4"
          className={zone2Attacked ? "red-attack" : zone2Protected ? "green-protect" : isRunning ? "bus-circle" : ""}
        />
        <text x={bus2X} y={bus2Y + 5} textAnchor="middle" className="text-xs font-bold fill-foreground" fontSize="12">
          Bus 2
        </text>
        <text x={bus2X} y={bus2Y + 65} textAnchor="middle" className="text-xs fill-muted-foreground" fontSize="11">
          {bus2Voltage.toFixed(3)} p.u.
        </text>

        {/* Bus 3 */}
        <circle
          cx={bus3X}
          cy={bus3Y}
          r={30}
          fill="none"
          stroke={getBusColor(bus3Voltage, "Bus3")}
          strokeWidth="4"
          className={zone3Attacked ? "red-attack" : zone3Protected ? "green-protect" : isRunning ? "bus-circle" : ""}
        />
        <text x={bus3X} y={bus3Y + 5} textAnchor="middle" className="text-xs font-bold fill-foreground" fontSize="12">
          Bus 3
        </text>
        <text x={bus3X} y={bus3Y + 65} textAnchor="middle" className="text-xs fill-muted-foreground" fontSize="11">
          {bus3Voltage.toFixed(3)} p.u.
        </text>

        {/* ===== TRANSMISSION LINES ===== */}
        {/* Gen1 to Bus1 */}
        <line
          x1={gen1X + 25}
          y1={gen1Y}
          x2={bus1X - 30}
          y2={bus1Y}
          stroke={zone1Attacked ? "#dc2626" : "#3b82f6"}
          strokeWidth="3"
          opacity={zone1Attacked ? 0.5 : 1}
        />

        {/* Gen2 to Bus3 */}
        <line
          x1={gen2X - 25}
          y1={gen2Y}
          x2={bus3X + 30}
          y2={bus3Y}
          stroke={zone3Attacked ? "#dc2626" : "#3b82f6"}
          strokeWidth="3"
          opacity={zone3Attacked ? 0.5 : 1}
        />

        {/* Bus1 to Bus2 */}
        <line
          x1={bus1X + 30}
          y1={bus1Y}
          x2={bus2X - 30}
          y2={bus2Y}
          stroke={zone1Attacked || zone2Attacked ? "#dc2626" : "#3b82f6"}
          strokeWidth="3"
          opacity={zone1Attacked || zone2Attacked ? 0.5 : 1}
        />

        {/* Bus2 to Bus3 */}
        <line
          x1={bus2X + 30}
          y1={bus2Y}
          x2={bus3X - 30}
          y2={bus3Y}
          stroke={zone2Attacked || zone3Attacked ? "#dc2626" : "#3b82f6"}
          strokeWidth="3"
          opacity={zone2Attacked || zone3Attacked ? 0.5 : 1}
        />

        {/* ===== CIRCUIT BREAKERS (Separation Points) ===== */}
        {/* CB1 - Between Gen1 and Bus1 */}
        {zone1Attacked && (
          <g>
            <rect x={150} y={centerY - 8} width="16" height="16" fill="none" stroke="#dc2626" strokeWidth="2" />
            <line x1={148} y1={centerY + 6} x2={166} y2={centerY - 6} stroke="#dc2626" strokeWidth="2" />
          </g>
        )}

        {/* CB2 - Between Bus1 and Bus2 */}
        {zone1Attacked && (
          <g>
            <rect x={350} y={centerY - 8} width="16" height="16" fill="none" stroke="#dc2626" strokeWidth="2" />
            <line x1={348} y1={centerY + 6} x2={366} y2={centerY - 6} stroke="#dc2626" strokeWidth="2" />
          </g>
        )}

        {/* CB3 - Between Bus2 and Bus3 */}
        {zone2Attacked && (
          <g>
            <rect x={650} y={centerY - 8} width="16" height="16" fill="none" stroke="#dc2626" strokeWidth="2" />
            <line x1={648} y1={centerY + 6} x2={666} y2={centerY - 6} stroke="#dc2626" strokeWidth="2" />
          </g>
        )}

        {/* CB4 - Between Gen2 and Bus3 */}
        {zone3Attacked && (
          <g>
            <rect x={850} y={gen2Y + 25} width="16" height="16" fill="none" stroke="#dc2626" strokeWidth="2" />
            <line x1={848} y1={gen2Y + 31} x2={866} y2={gen2Y + 41} stroke="#dc2626" strokeWidth="2" />
          </g>
        )}

        {/* ===== LOADS ===== */}
        {/* Load 1 */}
        <rect
          x={load1X - 20}
          y={load1Y - 20}
          width="40"
          height="40"
          fill="none"
          stroke={zone1Attacked ? "#dc2626" : "#06b6d4"}
          strokeWidth="2"
          rx="4"
          opacity={zone1Attacked ? 0.5 : 1}
        />
        <text x={load1X} y={load1Y + 5} textAnchor="middle" className="text-xs font-bold" fill="currentColor" fontSize="12">
          L1
        </text>
        <line x1={load1X} y1={load1Y - 20} x2={load1X} y2={bus1Y + 30} stroke={zone1Attacked ? "#dc2626" : "#06b6d4"} strokeWidth="2" opacity={zone1Attacked ? 0.5 : 1} />

        {/* Load 2 */}
        <rect
          x={load2X - 20}
          y={load2Y - 20}
          width="40"
          height="40"
          fill="none"
          stroke={zone2Attacked ? "#dc2626" : "#06b6d4"}
          strokeWidth="2"
          rx="4"
          opacity={zone2Attacked ? 0.5 : 1}
        />
        <text x={load2X} y={load2Y + 5} textAnchor="middle" className="text-xs font-bold" fill="currentColor" fontSize="12">
          L2
        </text>
        <line x1={load2X} y1={load2Y - 20} x2={load2X} y2={bus2Y + 30} stroke={zone2Attacked ? "#dc2626" : "#06b6d4"} strokeWidth="2" opacity={zone2Attacked ? 0.5 : 1} />

        {/* Load 3 */}
        <rect
          x={load3X - 20}
          y={load3Y - 20}
          width="40"
          height="40"
          fill="none"
          stroke={zone3Attacked ? "#dc2626" : "#06b6d4"}
          strokeWidth="2"
          rx="4"
          opacity={zone3Attacked ? 0.5 : 1}
        />
        <text x={load3X} y={load3Y + 5} textAnchor="middle" className="text-xs font-bold" fill="currentColor" fontSize="12">
          L3
        </text>
        <line x1={load3X} y1={load3Y - 20} x2={load3X} y2={bus3Y + 30} stroke={zone3Attacked ? "#dc2626" : "#06b6d4"} strokeWidth="2" opacity={zone3Attacked ? 0.5 : 1} />

        {/* ===== ATTACK INDICATORS ===== */}
        {zone1Attacked && (
          <>
            <text x={bus1X} y={bus1Y - 50} textAnchor="middle" className="text-xs font-bold fill-destructive" fontSize="13">
              ⚠ {selectedAttack} ATTACK
            </text>
            <text x={bus1X} y={bus1Y - 35} textAnchor="middle" className="text-xs fill-destructive" fontSize="11">
              ZONE ISOLATED
            </text>
          </>
        )}
        {zone2Attacked && (
          <>
            <text x={bus2X} y={bus2Y - 50} textAnchor="middle" className="text-xs font-bold fill-destructive" fontSize="13">
              ⚠ {selectedAttack} ATTACK
            </text>
            <text x={bus2X} y={bus2Y - 35} textAnchor="middle" className="text-xs fill-destructive" fontSize="11">
              ZONE ISOLATED
            </text>
          </>
        )}
        {zone3Attacked && (
          <>
            <text x={bus3X} y={bus3Y - 50} textAnchor="middle" className="text-xs font-bold fill-destructive" fontSize="13">
              ⚠ {selectedAttack} ATTACK
            </text>
            <text x={bus3X} y={bus3Y - 35} textAnchor="middle" className="text-xs fill-destructive" fontSize="11">
              ZONE ISOLATED
            </text>
          </>
        )}

        {/* Status at bottom */}
        {!attackMode && !attackDetected && (
          <text x={width / 2} y={height - 20} textAnchor="middle" className="text-sm fill-primary font-semibold" fontSize="14">
            ✓ All Systems Normal - Grid Operating Safely
          </text>
        )}
        {attackMode && !attackDetected && (
          <text x={width / 2} y={height - 20} textAnchor="middle" className="text-sm fill-amber-500 font-semibold" fontSize="14">
            ⚡ Attack Injected - Waiting for Detection...
          </text>
        )}
        {attackDetected && (
          <text x={width / 2} y={height - 20} textAnchor="middle" className="text-sm fill-destructive font-semibold" fontSize="14">
            🛡️ Attack Detected - Zone Protection Activated
          </text>
        )}
      </svg>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Normal Operation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">Anomaly Detected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600" />
          <span className="text-muted-foreground">Under Attack</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600" />
          <span className="text-muted-foreground">Zone Protected</span>
        </div>
      </div>
    </div>
  );
});
