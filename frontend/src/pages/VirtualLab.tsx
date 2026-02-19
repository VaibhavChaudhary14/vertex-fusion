import { useState, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { VirtualLabControls } from "@/components/VirtualLabControls";
import { GridVisualization } from "@/components/GridVisualization";
import { SimulationResults } from "@/components/SimulationResults";
import { VirtualLabContext, calculateMetrics } from "@/lib/virtualLabContext";
import type {
  SimulationConfig,
  AttackType,
  GridNode,
  GridEdge,
  GNNInferenceResult,
} from "@shared/schema";

interface SimulationEvent {
  id: string;
  timestamp: Date;
  type: "attack_injected" | "detection" | "mitigation" | "status_change";
  description: string;
  metadata?: Record<string, unknown>;
}

const generateNodes = (topology: string): GridNode[] => {
  const baseNodes: GridNode[] = [
    { id: "gen1", type: "generator", layer: "physical", x: 0.15, y: 0.15, status: "normal", anomalyScore: 0, label: "Gen 1" },
    { id: "gen2", type: "generator", layer: "physical", x: 0.85, y: 0.15, status: "normal", anomalyScore: 0, label: "Gen 2" },
    { id: "bus1", type: "bus", layer: "physical", x: 0.2, y: 0.3, status: "normal", anomalyScore: 0, label: "Bus 1" },
    { id: "bus2", type: "bus", layer: "physical", x: 0.4, y: 0.25, status: "normal", anomalyScore: 0, label: "Bus 2" },
    { id: "bus3", type: "bus", layer: "physical", x: 0.6, y: 0.25, status: "normal", anomalyScore: 0, label: "Bus 3" },
    { id: "bus4", type: "bus", layer: "physical", x: 0.8, y: 0.3, status: "normal", anomalyScore: 0, label: "Bus 4" },
    { id: "bus5", type: "bus", layer: "physical", x: 0.3, y: 0.45, status: "normal", anomalyScore: 0, label: "Bus 5" },
    { id: "bus6", type: "bus", layer: "physical", x: 0.5, y: 0.45, status: "normal", anomalyScore: 0, label: "Bus 6" },
    { id: "bus7", type: "bus", layer: "physical", x: 0.7, y: 0.45, status: "normal", anomalyScore: 0, label: "Bus 7" },
    { id: "load1", type: "load", layer: "physical", x: 0.25, y: 0.6, status: "normal", anomalyScore: 0, label: "Load 1" },
    { id: "load2", type: "load", layer: "physical", x: 0.5, y: 0.6, status: "normal", anomalyScore: 0, label: "Load 2" },
    { id: "load3", type: "load", layer: "physical", x: 0.75, y: 0.6, status: "normal", anomalyScore: 0, label: "Load 3" },
    { id: "plc1", type: "plc", layer: "cyber", x: 0.2, y: 0.8, status: "normal", anomalyScore: 0, label: "PLC 1" },
    { id: "plc2", type: "plc", layer: "cyber", x: 0.4, y: 0.8, status: "normal", anomalyScore: 0, label: "PLC 2" },
    { id: "plc3", type: "plc", layer: "cyber", x: 0.6, y: 0.8, status: "normal", anomalyScore: 0, label: "PLC 3" },
    { id: "router1", type: "router", layer: "cyber", x: 0.5, y: 0.9, status: "normal", anomalyScore: 0, label: "Router" },
    { id: "hmi1", type: "hmi", layer: "cyber", x: 0.8, y: 0.8, status: "normal", anomalyScore: 0, label: "HMI" },
  ];

  if (topology === "ieee30") {
    return [
      ...baseNodes,
      { id: "bus8", type: "bus", layer: "physical", x: 0.35, y: 0.35, status: "normal", anomalyScore: 0, label: "Bus 8" },
      { id: "bus9", type: "bus", layer: "physical", x: 0.65, y: 0.35, status: "normal", anomalyScore: 0, label: "Bus 9" },
      { id: "gen3", type: "generator", layer: "physical", x: 0.5, y: 0.1, status: "normal", anomalyScore: 0, label: "Gen 3" },
    ];
  }

  return baseNodes;
};

const generateEdges = (): GridEdge[] => [
  { source: "gen1", target: "bus1", type: "physical", weight: 1 },
  { source: "gen2", target: "bus4", type: "physical", weight: 1 },
  { source: "bus1", target: "bus2", type: "physical", weight: 1 },
  { source: "bus2", target: "bus3", type: "physical", weight: 1 },
  { source: "bus3", target: "bus4", type: "physical", weight: 1 },
  { source: "bus1", target: "bus5", type: "physical", weight: 1 },
  { source: "bus4", target: "bus7", type: "physical", weight: 1 },
  { source: "bus5", target: "bus6", type: "physical", weight: 1 },
  { source: "bus6", target: "bus7", type: "physical", weight: 1 },
  { source: "bus5", target: "load1", type: "physical", weight: 1 },
  { source: "bus6", target: "load2", type: "physical", weight: 1 },
  { source: "bus7", target: "load3", type: "physical", weight: 1 },
  { source: "plc1", target: "router1", type: "cyber", weight: 1 },
  { source: "plc2", target: "router1", type: "cyber", weight: 1 },
  { source: "plc3", target: "router1", type: "cyber", weight: 1 },
  { source: "router1", target: "hmi1", type: "cyber", weight: 1 },
  { source: "gen1", target: "plc1", type: "coupling", weight: 0.5 },
  { source: "bus6", target: "plc2", type: "coupling", weight: 0.5 },
  { source: "load2", target: "plc3", type: "coupling", weight: 0.5 },
];

const mitigationRecommendations: Record<AttackType, string[]> = {
  RW: [
    "Immediately isolate affected systems from the network",
    "Activate backup systems and restore from clean snapshots",
    "Engage incident response team and notify stakeholders",
    "Review and patch vulnerabilities in compromised systems",
  ],
  FDI: [
    "Cross-validate sensor readings with redundant measurements",
    "Switch to manual control mode for affected buses",
    "Deploy anomaly detection on all measurement units",
    "Recalibrate sensors after verification",
  ],
  RS: [
    "Terminate suspicious processes and connections immediately",
    "Block outbound connections from compromised hosts",
    "Conduct forensic analysis of affected systems",
    "Update firewall rules to prevent re-exploitation",
  ],
  BF: [
    "Enable account lockout after failed login attempts",
    "Implement multi-factor authentication",
    "Review and strengthen password policies",
    "Monitor for credential stuffing attempts",
  ],
  BD: [
    "Scan all systems for persistence mechanisms",
    "Review startup scripts and scheduled tasks",
    "Audit user accounts and access permissions",
    "Deploy endpoint detection and response tools",
  ],
};

export default function VirtualLab() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [config, setConfig] = useState<SimulationConfig | null>(null);
  const [nodes, setNodes] = useState<GridNode[]>([]);
  const [edges, setEdges] = useState<GridEdge[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [inferenceResult, setInferenceResult] = useState<GNNInferenceResult | undefined>();
  const [currentMitigations, setCurrentMitigations] = useState<string[]>([]);
  const [beforeAttackNodes, setBeforeAttackNodes] = useState<GridNode[]>([]);

  const handleStart = useCallback((newConfig: SimulationConfig) => {
    setConfig(newConfig);
    setIsRunning(true);
    setNodes(generateNodes(newConfig.topology));
    setEdges(generateEdges());
    setHighlightedNodes([]);
    setEvents([
      {
        id: "1",
        timestamp: new Date(),
        type: "status_change",
        description: `Simulation started with ${newConfig.topology.toUpperCase()} topology, ${newConfig.loadProfile} load profile, ${newConfig.observabilityMode} observability`,
      },
    ]);
    setInferenceResult(undefined);
    setCurrentMitigations([]);

    toast({
      title: "Simulation Started",
      description: `Running ${newConfig.topology.toUpperCase()} with ${newConfig.loadProfile} load`,
    });
  }, [toast]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setEvents((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: "status_change",
        description: "Simulation stopped",
      },
    ]);
    toast({
      title: "Simulation Stopped",
      description: "The virtual lab simulation has been stopped.",
    });
  }, [toast]);

  const handleClearAttacks = useCallback(() => {
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        status: "normal" as const,
        anomalyScore: 0,
      }))
    );
    setHighlightedNodes([]);
    setInferenceResult(undefined);
    setCurrentMitigations([]);
    setEvents((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: "status_change",
        description: "All attacks cleared - Grid returned to normal state",
      },
    ]);
    toast({
      title: "Attacks Cleared",
      description: "All attacks have been removed from the grid.",
    });
  }, [toast]);

  const handleInjectAttack = useCallback(
    (attackType: AttackType, targetNode: string) => {
      setNodes((prev) => {
        setBeforeAttackNodes(JSON.parse(JSON.stringify(prev)));
        return prev;
      });

      const affectedNodes = [targetNode];
      
      const connectedNodes = edges
        .filter((e) => e.source === targetNode || e.target === targetNode)
        .map((e) => (e.source === targetNode ? e.target : e.source))
        .slice(0, 2);
      
      affectedNodes.push(...connectedNodes);

      setNodes((prev) =>
        prev.map((node) => {
          if (affectedNodes.includes(node.id)) {
            return {
              ...node,
              status: "critical" as const,
              anomalyScore: 0.7 + Math.random() * 0.3,
            };
          }
          return node;
        })
      );

      setHighlightedNodes(affectedNodes);

      setEvents((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          timestamp: new Date(),
          type: "attack_injected",
          description: `${attackType} attack injected targeting ${targetNode}`,
        },
      ]);

      setTimeout(() => {
        const result: GNNInferenceResult = {
          classification: "malicious",
          probability: 0.85 + Math.random() * 0.14,
          attackType,
          affectedNodes,
          confidenceScore: 0.8 + Math.random() * 0.19,
          inferenceTimeMs: 8 + Math.random() * 10,
        };

        setInferenceResult(result);
        setCurrentMitigations(mitigationRecommendations[attackType]);

        setEvents((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            timestamp: new Date(),
            type: "detection",
            description: `GNN detected ${attackType} attack with ${(result.confidenceScore * 100).toFixed(1)}% confidence`,
          },
        ]);

        toast({
          title: "Attack Detected",
          description: `GNN identified ${attackType} attack with ${(result.confidenceScore * 100).toFixed(1)}% confidence`,
          variant: "destructive",
        });
      }, 500 + Math.random() * 500);
    },
    [edges, toast]
  );

  const availableNodes = nodes.map((n) => n.id);

  const beforeAttackMetrics = calculateMetrics(beforeAttackNodes);
  const afterAttackMetrics = calculateMetrics(nodes);

  const contextValue = useMemo(
    () => ({
      isRunning,
      nodes,
      edges,
      inferenceResult,
      beforeAttackNodes,
      beforeAttackMetrics,
      afterAttackMetrics,
    }),
    [isRunning, nodes, edges, inferenceResult, beforeAttackNodes, beforeAttackMetrics, afterAttackMetrics]
  );

  return (
    <VirtualLabContext.Provider value={contextValue}>
      <div className="p-4 space-y-4 h-full overflow-auto">
      <div>
        <h1 className="text-2xl font-semibold">Virtual Lab</h1>
        <p className="text-sm text-muted-foreground">
          Simulate cyber-physical attacks and observe GNN detection in a safe environment
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <VirtualLabControls
            isRunning={isRunning}
            onStart={handleStart}
            onStop={handleStop}
            onInjectAttack={handleInjectAttack}
            onClearAttacks={handleClearAttacks}
            availableNodes={availableNodes}
          />
        </div>
        <div className="lg:col-span-5">
          {isRunning && config ? (
            <GridVisualization
              nodes={nodes}
              edges={edges}
              topology={config.topology}
              highlightedNodes={highlightedNodes}
            />
          ) : (
            <div className="h-[500px] rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">No Active Simulation</p>
                <p className="text-sm">Configure and start a simulation to visualize the grid</p>
              </div>
            </div>
          )}
        </div>
        <div className="lg:col-span-4">
          <SimulationResults
            inferenceResult={inferenceResult}
            events={events}
            mitigationRecommendations={currentMitigations}
          />
        </div>
      </div>
    </div>
    </VirtualLabContext.Provider>
  );
}
