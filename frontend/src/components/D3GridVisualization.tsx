
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";
import { GridNode, GridEdge } from "@shared/schema";

interface D3GridVisualizationProps {
    nodes: GridNode[];
    edges: GridEdge[];
    topology: string;
    onNodeClick?: (node: GridNode) => void;
}

export const D3GridVisualization: React.FC<D3GridVisualizationProps> = ({
    nodes,
    edges,
    topology,
    onNodeClick
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoomLevel, setZoomLevel] = useState(1);

    // Example IEEE 14-bus like data if props are empty (for demo)
    const displayNodes = nodes.length > 0 ? nodes : [
        { id: "Gen1", type: "generator", x: 0, y: 0, status: "normal", label: "Gen 1" },
        { id: "Bus1", type: "bus", x: 0, y: 0, status: "normal", label: "Bus 1" },
        { id: "Bus2", type: "bus", x: 0, y: 0, status: "warning", label: "Bus 2" },
        { id: "Load1", type: "load", x: 0, y: 0, status: "normal", label: "Load 1" },
        // ... add more for demo or rely on props
    ] as GridNode[];

    const displayEdges = edges.length > 0 ? edges : [
        { source: "Gen1", target: "Bus1", type: "physical" },
        { source: "Bus1", target: "Bus2", type: "physical" },
        { source: "Bus2", target: "Load1", type: "physical" },
    ] as GridEdge[];

    useEffect(() => {
        if (!svgRef.current || !containerRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous render

        const g = svg.append("g");

        // Zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
                setZoomLevel(event.transform.k);
            });

        svg.call(zoom);

        // Simulation
        const simulation = d3.forceSimulation(displayNodes as d3.SimulationNodeDatum[])
            .force("link", d3.forceLink(displayEdges).id((d: any) => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(30));

        // Draw lines
        const link = g.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(displayEdges)
            .join("line")
            .attr("stroke-width", (d) => d.type === "physical" ? 2 : 1)
            .attr("stroke-dasharray", (d) => d.type === "cyber" ? "5,5" : null)
            .attr("stroke", (d) => d.type === "cyber" ? "#ec4899" : "#3b82f6");

        // Draw nodes
        const node = g.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(displayNodes)
            .join("circle")
            .attr("r", (d) => d.type === "generator" ? 15 : d.type === "bus" ? 10 : 8)
            .attr("fill", (d) => {
                if (d.status === "critical") return "#ef4444";
                if (d.status === "warning") return "#f59e0b";
                if (d.status === "offline") return "#6b7280";
                return d.type === "generator" ? "#22c55e" : "#3b82f6";
            })
            .call(d3.drag<SVGCircleElement, any>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended) as any);

        // Labels
        const label = g.append("g")
            .selectAll("text")
            .data(displayNodes)
            .join("text")
            .text((d) => d.label)
            .attr("font-size", 10)
            .attr("dx", 15)
            .attr("dy", 4)
            .attr("fill", "currentColor")
            .attr("class", "theme-text");

        // Simulation tick update
        simulation.on("tick", () => {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node
                .attr("cx", (d: any) => d.x)
                .attr("cy", (d: any) => d.y);

            label
                .attr("x", (d: any) => d.x)
                .attr("y", (d: any) => d.y);
        });

        function dragstarted(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event: any, d: any) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        // Cleanup
        return () => {
            simulation.stop();
        };
    }, [displayNodes, displayEdges]);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Network Topology (Force-Directed)</CardTitle>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => {
                            // Programmatic zoom logic would go here capturing the d3 zoom transform
                        }}>
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative min-h-[400px]">
                <div ref={containerRef} className="w-full h-full absolute inset-0">
                    <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
                </div>
            </CardContent>
        </Card>
    );
};
