import { GridNode, GridEdge } from "@shared/schema";

interface AnimatedGridProps {
  nodes: GridNode[];
  edges: GridEdge[];
}

export function AnimatedGrid({ nodes, edges }: AnimatedGridProps) {
  return (
    <div className="relative w-full h-full min-h-[400px] bg-black/50 rounded-lg overflow-hidden border border-cyan-500/30 animate-neon">
      {/* Grid background */}
      <svg className="absolute inset-0 w-full h-full" style={{ background: "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.05), transparent)" }}>
        {/* Grid lines */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={`${(i + 1) * 10}%`}
            y1="0"
            x2={`${(i + 1) * 10}%`}
            y2="100%"
            stroke="rgba(6, 182, 212, 0.1)"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={`${(i + 1) * 10}%`}
            x2="100%"
            y2={`${(i + 1) * 10}%`}
            stroke="rgba(6, 182, 212, 0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Edges */}
        {edges.map((edge, idx) => {
          const fromNode = nodes.find(n => n.id === edge.source);
          const toNode = nodes.find(n => n.id === edge.target);
          if (!fromNode || !toNode) return null;

          return (
            <line
              key={idx}
              x1={`${fromNode.x * 100}%`}
              y1={`${fromNode.y * 100}%`}
              x2={`${toNode.x * 100}%`}
              y2={`${toNode.y * 100}%`}
              stroke={edge.type === "coupling" ? "rgba(255, 0, 255, 0.5)" : "rgba(6, 182, 212, 0.3)"}
              strokeWidth="2"
              className="transition-all duration-300"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            {/* Outer glow */}
            <circle
              cx={`${node.x * 100}%`}
              cy={`${node.y * 100}%`}
              r="20"
              fill="none"
              stroke="rgba(6, 182, 212, 0.2)"
              strokeWidth="1"
              className="animate-pulse-glow"
            />
            {/* Node circle */}
            <circle
              cx={`${node.x * 100}%`}
              cy={`${node.y * 100}%`}
              r="10"
              fill={
                node.status === "critical" ? "rgba(239, 68, 68, 0.8)" :
                node.status === "warning" ? "rgba(245, 158, 11, 0.8)" :
                "rgba(6, 182, 212, 0.8)"
              }
              stroke={
                node.status === "critical" ? "#ef4444" :
                node.status === "warning" ? "#f59e0b" :
                "#06b6d4"
              }
              strokeWidth="2"
              className="transition-all duration-300 cursor-pointer hover:r-[14]"
            />
            {/* Label */}
            <text
              x={`${node.x * 100}%`}
              y={`${node.y * 100}%`}
              textAnchor="middle"
              dy="0.3em"
              fill="white"
              fontSize="10"
              fontWeight="bold"
              pointerEvents="none"
              className="text-xs"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
