import { createContext, useContext } from "react";
import type { GridNode, GridEdge, GNNInferenceResult } from "@shared/schema";

export interface VirtualLabState {
  isRunning: boolean;
  nodes: GridNode[];
  edges: GridEdge[];
  inferenceResult: GNNInferenceResult | undefined;
  beforeAttackNodes: GridNode[];
  beforeAttackMetrics: {
    criticalCount: number;
    warningCount: number;
    avgAnomalyScore: number;
  };
  afterAttackMetrics: {
    criticalCount: number;
    warningCount: number;
    avgAnomalyScore: number;
  };
}

export const VirtualLabContext = createContext<VirtualLabState | null>(null);

export function useVirtualLabState() {
  const state = useContext(VirtualLabContext);
  if (!state) {
    return {
      isRunning: false,
      nodes: [],
      edges: [],
      inferenceResult: undefined,
      beforeAttackNodes: [],
      beforeAttackMetrics: { criticalCount: 0, warningCount: 0, avgAnomalyScore: 0 },
      afterAttackMetrics: { criticalCount: 0, warningCount: 0, avgAnomalyScore: 0 },
    };
  }
  return state;
}

export function calculateMetrics(nodes: GridNode[]) {
  const criticalCount = nodes.filter((n) => n.status === "critical").length;
  const warningCount = nodes.filter((n) => n.status === "warning").length;
  const avgAnomalyScore =
    nodes.length > 0
      ? nodes.reduce((sum, n) => sum + n.anomalyScore, 0) / nodes.length
      : 0;

  return { criticalCount, warningCount, avgAnomalyScore };
}
