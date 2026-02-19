import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ahpWeights = [
  { metric: "Effective Resistance", weight: 0.25, impact: "High" },
  { metric: "Connectivity Centrality", weight: 0.20, impact: "High" },
  { metric: "Load Shedding Risk", weight: 0.20, impact: "High" },
  { metric: "Geodesic Vulnerability", weight: 0.18, impact: "Medium" },
  { metric: "Control Center Links", weight: 0.17, impact: "Medium" },
];

const nodeRanking = [
  { rank: 1, nodeId: "12", name: "Gen Bus 1", score: 0.94, resistance: 0.15, centrality: 0.92 },
  { rank: 2, nodeId: "08", name: "Load Center A", score: 0.89, resistance: 0.22, centrality: 0.87 },
  { rank: 3, nodeId: "14", name: "Control Hub", score: 0.85, resistance: 0.18, centrality: 0.83 },
  { rank: 4, nodeId: "06", name: "Gen Bus 2", score: 0.81, resistance: 0.25, centrality: 0.78 },
  { rank: 5, nodeId: "11", name: "Load Center B", score: 0.77, resistance: 0.28, centrality: 0.75 },
];

const coverageImpact = [
  { nodeCount: "5% (1)", dr: 78.2 },
  { nodeCount: "10% (2)", dr: 85.4 },
  { nodeCount: "20% (3)", dr: 91.3 },
  { nodeCount: "35% (5)", dr: 96.5 },
];

export function CriticalNodeConfiguration() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Critical Node Configuration Utility</h2>
        <p className="text-muted-foreground">Analytical Hierarchical Process (AHP) for optimal sensor placement</p>
      </div>

      {/* AHP Methodology */}
      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardHeader>
          <CardTitle>AHP-Based Critical Node Selection (35% Coverage)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Analytical Hierarchical Process weights topological and electrical metrics to identify the optimal {35}% of nodes for monitoring.
          </p>
          <div className="space-y-3">
            {ahpWeights.map((metric) => (
              <div key={metric.metric} className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium text-sm">{metric.metric}</p>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-blue-600" style={{ width: `${metric.weight * 100}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{(metric.weight * 100).toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">{metric.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Critical Nodes */}
      <Card>
        <CardHeader>
          <CardTitle>Top Critical Nodes for IEEE 30-bus Network</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {nodeRanking.map((node) => (
              <div key={node.nodeId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-blue-600">{node.rank}</Badge>
                    <span className="font-bold">Node {node.nodeId}: {node.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground mt-2">
                    <div>Resistance: {(node.resistance).toFixed(2)}</div>
                    <div>Centrality: {(node.centrality * 100).toFixed(0)}%</div>
                    <div>Vulnerability: High</div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{(node.score * 100).toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">AHP Score</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coverage Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Detection Rate vs. Node Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={coverageImpact}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nodeCount" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="dr" fill="#0088ff" name="Detection Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Implementation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-background border border-green-500/30 rounded-lg">
              <p className="font-semibold text-sm mb-1">Recommended (35% Coverage)</p>
              <p className="text-sm">Install sensors on nodes: 12, 08, 14, 06, 11</p>
              <p className="text-xs text-green-600 mt-1">✓ 96.5% detection rate | 1.3% degradation from full observability</p>
            </div>
            <div className="p-3 bg-background border border-yellow-500/30 rounded-lg">
              <p className="font-semibold text-sm mb-1">Extended (50% Coverage)</p>
              <p className="text-sm">Add nodes: 04, 10, 16, 20, 25</p>
              <p className="text-xs text-yellow-600 mt-1">✓ 97.4% detection rate | Reduced for budget-constrained scenarios</p>
            </div>
            <div className="p-3 bg-background border border-blue-500/30 rounded-lg">
              <p className="font-semibold text-sm mb-1">Minimal (20% Coverage)</p>
              <p className="text-sm">Critical nodes only: 12, 08, 14, 06</p>
              <p className="text-xs text-blue-600 mt-1">⚠ 91.3% detection rate | Emergency/budget deployments only</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
