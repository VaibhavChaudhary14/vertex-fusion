import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComparativePerformanceDashboard } from "@/components/ComparativePerformanceDashboard";
import { PartialObservabilityReport } from "@/components/PartialObservabilityReport";

export default function ScientificValidation() {
  return (
    <div className="h-screen overflow-auto bg-background">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Scientific Validation</h1>
          <p className="text-muted-foreground">IEEE OAJPE Research-Based GNN-IDS Validation</p>
        </div>

        <Tabs defaultValue="comparative" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comparative">Comparative Analysis</TabsTrigger>
            <TabsTrigger value="robustness">Robustness Report</TabsTrigger>
          </TabsList>

          <TabsContent value="comparative" className="space-y-4">
            <ComparativePerformanceDashboard />
          </TabsContent>

          <TabsContent value="robustness" className="space-y-4">
            <PartialObservabilityReport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
