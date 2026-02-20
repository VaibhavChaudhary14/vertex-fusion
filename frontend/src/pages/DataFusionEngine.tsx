import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImputationMonitor } from "@/components/ImputationMonitor";
import { AutomatedHPO } from "@/components/AutomatedHPO";

export default function DataFusionEngine() {
  return (
    <div className="h-screen overflow-auto bg-background">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Data Fusion & Model Refinement</h1>
          <p className="text-muted-foreground">Cyber-Physical Integration & Hyper-Parameter Optimization</p>
        </div>

        <Tabs defaultValue="imputation" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="imputation">Imputation Monitor</TabsTrigger>
            <TabsTrigger value="hpo">HPO Tool</TabsTrigger>
          </TabsList>

          <TabsContent value="imputation" className="space-y-4">
            <ImputationMonitor />
          </TabsContent>

          <TabsContent value="hpo" className="space-y-4">
            <AutomatedHPO />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
