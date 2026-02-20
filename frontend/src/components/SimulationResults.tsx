import { Check, X, AlertTriangle, Shield, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GNNInferenceResult, AttackType } from "@shared/schema";
import { attackTypeLabels } from "@shared/schema";

interface SimulationEvent {
  id: string;
  timestamp: Date;
  type: "attack_injected" | "detection" | "mitigation" | "status_change";
  description: string;
  metadata?: Record<string, unknown>;
}

interface SimulationResultsProps {
  inferenceResult?: GNNInferenceResult;
  events: SimulationEvent[];
  mitigationRecommendations: string[];
}

export function SimulationResults({
  inferenceResult,
  events,
  mitigationRecommendations,
}: SimulationResultsProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Detection Results</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <Tabs defaultValue="inference" className="h-full">
          <div className="px-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inference" data-testid="tab-inference">Inference</TabsTrigger>
              <TabsTrigger value="events" data-testid="tab-events">Event Log</TabsTrigger>
              <TabsTrigger value="mitigation" data-testid="tab-mitigation">Mitigation</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="inference" className="mt-0 p-4 space-y-4">
            {inferenceResult ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {inferenceResult.classification === "malicious" ? (
                      <div className="rounded-full p-2 bg-critical/10">
                        <AlertTriangle className="h-6 w-6 text-critical" />
                      </div>
                    ) : (
                      <div className="rounded-full p-2 bg-success/10">
                        <Shield className="h-6 w-6 text-success" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-lg capitalize">
                        {inferenceResult.classification}
                      </div>
                      {inferenceResult.attackType && (
                        <div className="text-sm text-muted-foreground">
                          {attackTypeLabels[inferenceResult.attackType]}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={inferenceResult.classification === "malicious" ? "destructive" : "secondary"}
                    className="text-sm"
                  >
                    {(inferenceResult.probability * 100).toFixed(1)}%
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence Score</span>
                      <span className="font-mono font-medium">
                        {(inferenceResult.confidenceScore * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={inferenceResult.confidenceScore * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Inference Time:</span>
                    <span className="font-mono font-medium">
                      {inferenceResult.inferenceTimeMs.toFixed(2)}ms
                    </span>
                  </div>
                </div>

                {inferenceResult.affectedNodes.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Affected Nodes</div>
                    <div className="flex flex-wrap gap-1.5">
                      {inferenceResult.affectedNodes.map((node) => (
                        <Badge
                          key={node}
                          variant="outline"
                          className="text-xs font-mono"
                        >
                          {node}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Shield className="h-8 w-8 mb-2" />
                <p className="text-sm">No inference results yet</p>
                <p className="text-xs">Start a simulation and inject an attack</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="mt-0 h-[300px]">
            <ScrollArea className="h-full">
              <div className="space-y-2 p-4">
                {events.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <Clock className="h-8 w-8 mb-2" />
                    <p className="text-sm">No events recorded</p>
                  </div>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 rounded-md border p-3"
                    >
                      <div className="rounded-md p-1.5 bg-muted">
                        {event.type === "attack_injected" && (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                        {event.type === "detection" && (
                          <Shield className="h-4 w-4 text-primary" />
                        )}
                        {event.type === "mitigation" && (
                          <Check className="h-4 w-4 text-success" />
                        )}
                        {event.type === "status_change" && (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">
                            {formatTime(event.timestamp)}
                          </span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {event.type.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">{event.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="mitigation" className="mt-0 p-4 space-y-4">
            {mitigationRecommendations.length > 0 ? (
              <div className="space-y-3">
                <div className="text-sm font-medium">
                  Recommended Actions ({mitigationRecommendations.length})
                </div>
                {mitigationRecommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-md border p-3"
                  >
                    <div className="rounded-full h-6 w-6 bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Shield className="h-8 w-8 mb-2" />
                <p className="text-sm">No mitigation recommendations</p>
                <p className="text-xs">Recommendations appear when attacks are detected</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
