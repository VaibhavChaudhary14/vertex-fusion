import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GridNode, GridEdge, GridTopology } from "@shared/schema";

interface GridVisualizationProps {
  nodes: GridNode[];
  edges: GridEdge[];
  topology: GridTopology;
  highlightedNodes?: string[];
  onNodeClick?: (node: GridNode) => void;
}

const nodeColors: Record<string, string> = {
  generator: "#22c55e",
  bus: "#3b82f6",
  load: "#8b5cf6",
  transformer: "#f59e0b",
  pmu: "#06b6d4",
  plc: "#ec4899",
  router: "#6366f1",
  hmi: "#14b8a6",
};

const statusColors: Record<string, string> = {
  normal: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
  offline: "#6b7280",
};

export function GridVisualization({
  nodes,
  edges,
  topology,
  highlightedNodes = [],
  onNodeClick,
}: GridVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<GridNode | null>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(pan.x + width / 2, pan.y + height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -height / 2);

    edges.forEach((edge) => {
      const source = nodes.find((n) => n.id === edge.source);
      const target = nodes.find((n) => n.id === edge.target);
      if (!source || !target) return;

      ctx.beginPath();
      ctx.moveTo(source.x * width, source.y * height);
      ctx.lineTo(target.x * width, target.y * height);
      
      if (edge.type === "physical") {
        ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
        ctx.lineWidth = 2;
      } else if (edge.type === "cyber") {
        ctx.strokeStyle = "rgba(236, 72, 153, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
      } else {
        ctx.strokeStyle = "rgba(139, 92, 246, 0.3)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
      }
      
      ctx.stroke();
      ctx.setLineDash([]);
    });

    nodes.forEach((node) => {
      const x = node.x * width;
      const y = node.y * height;
      const radius = node.layer === "physical" ? 16 : 12;
      const isHighlighted = highlightedNodes.includes(node.id);

      if (isHighlighted) {
        ctx.beginPath();
        ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = nodeColors[node.type] || "#6b7280";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = statusColors[node.status];
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px Inter";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label.substring(0, 3), x, y);
    });

    ctx.restore();
  }, [nodes, edges, zoom, pan, highlightedNodes]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;

    const transformedX = (mouseX - pan.x - width / 2) / zoom + width / 2;
    const transformedY = (mouseY - pan.y - height / 2) / zoom + height / 2;

    const hovered = nodes.find((node) => {
      const nodeX = node.x * width;
      const nodeY = node.y * height;
      const dist = Math.sqrt(
        Math.pow(transformedX - nodeX, 2) + Math.pow(transformedY - nodeY, 2)
      );
      return dist < 20;
    });

    setHoveredNode(hovered || null);

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hoveredNode && onNodeClick) {
      onNodeClick(hoveredNode);
    }
  };

  const topologyLabels: Record<GridTopology, string> = {
    ieee14: "IEEE 14-Bus",
    ieee30: "IEEE 30-Bus",
    ieee118: "IEEE 118-Bus",
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Grid Topology</CardTitle>
            <Badge variant="outline">{topologyLabels[topology]}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              data-testid="button-zoom-in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              data-testid="button-zoom-out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              data-testid="button-reset-view"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-2 relative">
        <div
          ref={containerRef}
          className="w-full h-full min-h-[400px] relative rounded-md bg-card border overflow-hidden"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-move"
            style={{ imageRendering: "crisp-edges" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
            data-testid="canvas-grid"
          />
          
          {hoveredNode && (
            <div
              className="absolute z-10 bg-popover border rounded-md p-2 shadow-lg pointer-events-none"
              style={{
                left: "50%",
                bottom: "12px",
                transform: "translateX(-50%)",
              }}
            >
              <div className="text-xs space-y-1">
                <div className="font-medium">{hoveredNode.label}</div>
                <div className="text-muted-foreground">
                  Type: <span className="capitalize">{hoveredNode.type}</span>
                </div>
                <div className="text-muted-foreground">
                  Layer: <span className="capitalize">{hoveredNode.layer}</span>
                </div>
                <div className={`capitalize ${
                  hoveredNode.status === "normal" ? "text-success" :
                  hoveredNode.status === "warning" ? "text-warning" :
                  hoveredNode.status === "critical" ? "text-critical" :
                  "text-muted-foreground"
                }`}>
                  Status: {hoveredNode.status}
                </div>
                {hoveredNode.anomalyScore > 0 && (
                  <div className="text-warning">
                    Anomaly: {(hoveredNode.anomalyScore * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur border rounded-md p-2">
          <div className="grid grid-cols-4 gap-x-3 gap-y-1 text-xs">
            {Object.entries(nodeColors).slice(0, 4).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize text-muted-foreground">{type}</span>
              </div>
            ))}
            {Object.entries(nodeColors).slice(4).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize text-muted-foreground">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
