import { Card } from "@/components/ui/card";
import { DataIngestionPanel } from "@/components/DataIngestionPanel";
import { GraphModelingTool } from "@/components/GraphModelingTool";
import { DetectionModelSelector } from "@/components/DetectionModelSelector";
import { AnomalyVisualizationTool } from "@/components/AnomalyVisualizationTool";
import { RobustnessReport } from "@/components/RobustnessReport";

export default function DataManagement() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-primary/2 to-background">
      <div className="flex-1 p-4 space-y-4 overflow-auto">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-cyan-500 to-primary bg-clip-text text-transparent">
            Data Management & CP Fusion
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure data ingestion, graph topology, and GNN detection models
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <DataIngestionPanel />
            <GraphModelingTool />
          </div>
          <div className="space-y-4">
            <DetectionModelSelector />
            <AnomalyVisualizationTool />
          </div>
        </div>

        <div>
          <RobustnessReport />
        </div>
      </div>
    </div>
  );
}
