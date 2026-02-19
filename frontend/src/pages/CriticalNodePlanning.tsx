import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CriticalNodeConfiguration } from "@/components/CriticalNodeConfiguration";
import { AttackFlowVisualizer } from "@/components/AttackFlowVisualizer";

export default function CriticalNodePlanning() {
  return (
    <div className="h-screen overflow-auto bg-background">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Virtual Lab & Attack Forensics</h1>
          <p className="text-muted-foreground">Critical Node Selection & Attack Flow Analysis</p>
        </div>

        <Tabs defaultValue="nodes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nodes">Critical Node Selection</TabsTrigger>
            <TabsTrigger value="attacks">Attack Flow Visualizer</TabsTrigger>
          </TabsList>

          <TabsContent value="nodes" className="space-y-4">
            <CriticalNodeConfiguration />
          </TabsContent>

          <TabsContent value="attacks" className="space-y-4">
            <AttackFlowVisualizer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
