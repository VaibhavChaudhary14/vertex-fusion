import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ZapOff, Grid3x3, Cpu } from "lucide-react";

export default function ScalabilityTools() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-primary/2 to-background p-4 space-y-4 overflow-auto">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-cyan-500 to-primary bg-clip-text text-transparent">
          Scalability & Advanced Features
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Distributed GNN, hierarchical partitioning, and hardware acceleration for large-scale deployment
        </p>
      </div>

      <Tabs defaultValue="distributed" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="distributed" data-testid="tab-distributed-gnn">
            <Grid3x3 className="h-4 w-4 mr-2" />
            Distributed GNN
          </TabsTrigger>
          <TabsTrigger value="partitioning" data-testid="tab-graph-partitioning">
            <ZapOff className="h-4 w-4 mr-2" />
            Graph Partitioning
          </TabsTrigger>
          <TabsTrigger value="hardware" data-testid="tab-hardware-accel">
            <Cpu className="h-4 w-4 mr-2" />
            Hardware Acceleration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="distributed" className="space-y-4 mt-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">Distributed GNN Framework</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500/10 to-transparent rounded border border-cyan-500/20">
                <p className="text-sm font-semibold mb-2">Parallel Processing Configuration</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compute Nodes</span>
                    <Badge variant="outline">4 / 4 Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Graph Convolution Workers</span>
                    <Badge variant="outline">16 Parallel</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data Pipeline Throughput</span>
                    <Badge variant="outline">850K nodes/sec</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Load Balancing Strategy</p>
                <div className="p-2 bg-background rounded border border-primary/10 text-xs space-y-1">
                  <p>Graph sharding via node-affinity based on electrical distance</p>
                  <p className="text-muted-foreground">Minimizes inter-shard communication overhead</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Supported Frameworks</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {["DGL (Distributed)", "PyG Distributed", "GraphChef", "FlexGraph"].map((f) => (
                    <Badge key={f} variant="secondary" className="justify-center py-1">{f}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partitioning" className="space-y-4 mt-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">Hierarchical Graph Partitioning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-gradient-to-br from-purple-500/10 to-transparent rounded border border-purple-500/20">
                <p className="text-sm font-semibold mb-2">Multi-Level Hierarchy</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Level 1: Regional Zones</span>
                    <Badge variant="outline">6 subgraphs</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Level 2: Distribution Areas</span>
                    <Badge variant="outline">24 subgraphs</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Level 3: Local Clusters</span>
                    <Badge variant="outline">72 subgraphs</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Partitioning Algorithm</p>
                <div className="p-2 bg-background rounded border border-primary/10 text-xs">
                  <p className="font-semibold mb-1">Metis + Electrical Distance Coupling</p>
                  <p className="text-muted-foreground">
                    Combines graph topology (Metis) with power system electrical metrics for optimal subgraph boundaries
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Scalability Impact (IEEE 118-bus)</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-muted/50 rounded border border-primary/10">
                    <p className="text-muted-foreground mb-1">Inference Time</p>
                    <p className="font-semibold text-cyan-500">~28ms → ~7ms</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded border border-primary/10">
                    <p className="text-muted-foreground mb-1">Memory Usage</p>
                    <p className="font-semibold text-cyan-500">850MB → 180MB</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded border border-primary/10">
                    <p className="text-muted-foreground mb-1">Throughput</p>
                    <p className="font-semibold text-cyan-500">35 samples/s → 140 samples/s</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hardware" className="space-y-4 mt-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">Hardware Acceleration Optimization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-gradient-to-br from-orange-500/10 to-transparent rounded border border-orange-500/20">
                <p className="text-sm font-semibold mb-2">Compute Hardware Options</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GPU (NVIDIA A100)</span>
                    <Badge variant="outline">2.5x speedup</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GPU (NVIDIA H100)</span>
                    <Badge variant="outline">4.2x speedup</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TPU v4</span>
                    <Badge variant="outline">5.8x speedup</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Custom AI Chip (Graphcore)</span>
                    <Badge variant="outline">6.5x speedup</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Current Deployment</p>
                <div className="p-2 bg-background rounded border border-primary/10 text-xs">
                  <p className="font-semibold mb-1">NVIDIA A100 GPU Enabled</p>
                  <p className="text-muted-foreground">Chebyshev approximation optimized for tensor operations</p>
                  <p className="text-muted-foreground mt-2">Real-time inference: 45+ samples/sec (target: 80+ samples/sec)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
