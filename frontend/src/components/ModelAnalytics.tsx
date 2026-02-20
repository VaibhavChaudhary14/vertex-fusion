import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";
import type { ModelPerformanceMetrics, AttackType } from "@shared/schema";
import { attackTypeLabels } from "@shared/schema";

interface ModelAnalyticsProps {
  metrics: ModelPerformanceMetrics;
}

const chartColors = {
  primary: "hsl(217, 91%, 55%)",
  success: "hsl(142, 71%, 45%)",
  warning: "hsl(38, 92%, 50%)",
  critical: "hsl(0, 84%, 60%)",
  muted: "hsl(220, 14%, 65%)",
};

const attackColors: Record<AttackType, string> = {
  RW: "#ef4444",
  FDI: "#f59e0b",
  RS: "#8b5cf6",
  BF: "#3b82f6",
  BD: "#ec4899",
};

export function ModelAnalytics({ metrics }: ModelAnalyticsProps) {
  const detectionRateData = Object.entries(metrics.detectionRateByAttack).map(
    ([attack, rate]) => ({
      attack: attackTypeLabels[attack as AttackType] || attack,
      rate: rate * 100,
      shortName: attack,
    })
  );

  const confusionData = [
    { name: "True Positive", value: metrics.confusionMatrix[0]?.[0] || 0 },
    { name: "False Negative", value: metrics.confusionMatrix[0]?.[1] || 0 },
    { name: "False Positive", value: metrics.confusionMatrix[1]?.[0] || 0 },
    { name: "True Negative", value: metrics.confusionMatrix[1]?.[1] || 0 },
  ];

  const scalabilityData = metrics.scalabilityMetrics.map((m) => ({
    topology: m.topology.toUpperCase().replace("IEEE", "IEEE "),
    detectionRate: m.detectionRate * 100,
    inferenceTime: m.inferenceTimeMs,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {(metrics.accuracy * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Precision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {(metrics.precision * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recall
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {(metrics.recall * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              F1 Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {(metrics.f1Score * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="detection-rate" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="detection-rate" data-testid="tab-detection-rate">
            Detection Rate by Attack
          </TabsTrigger>
          <TabsTrigger value="roc" data-testid="tab-roc">
            ROC Curve
          </TabsTrigger>
          <TabsTrigger value="scalability" data-testid="tab-scalability">
            Scalability
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detection-rate">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detection Rate by Attack Type</CardTitle>
              <CardDescription>
                GNN model performance across different cyber-physical attacks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={detectionRateData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: "hsl(220, 14%, 65%)", fontSize: 12 }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="attack"
                      tick={{ fill: "hsl(220, 14%, 65%)", fontSize: 12 }}
                      width={150}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(220, 17%, 10%)",
                        border: "1px solid hsl(220, 14%, 18%)",
                        borderRadius: "6px",
                      }}
                      labelStyle={{ color: "hsl(220, 17%, 92%)" }}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, "Detection Rate"]}
                    />
                    <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                      {detectionRateData.map((entry) => (
                        <Cell
                          key={entry.shortName}
                          fill={attackColors[entry.shortName as AttackType] || chartColors.primary}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {Object.entries(attackColors).map(([attack, color]) => (
                  <div key={attack} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {attackTypeLabels[attack as AttackType]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roc">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ROC Curve</CardTitle>
              <CardDescription>
                Receiver Operating Characteristic - True Positive Rate vs False Positive Rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.rocCurve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
                    <XAxis
                      dataKey="fpr"
                      tick={{ fill: "hsl(220, 14%, 65%)", fontSize: 12 }}
                      tickFormatter={(v) => v.toFixed(1)}
                      label={{
                        value: "False Positive Rate",
                        position: "insideBottom",
                        offset: -5,
                        fill: "hsl(220, 14%, 65%)",
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      dataKey="tpr"
                      tick={{ fill: "hsl(220, 14%, 65%)", fontSize: 12 }}
                      tickFormatter={(v) => v.toFixed(1)}
                      label={{
                        value: "True Positive Rate",
                        angle: -90,
                        position: "insideLeft",
                        fill: "hsl(220, 14%, 65%)",
                        fontSize: 12,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(220, 17%, 10%)",
                        border: "1px solid hsl(220, 14%, 18%)",
                        borderRadius: "6px",
                      }}
                      labelStyle={{ color: "hsl(220, 17%, 92%)" }}
                      formatter={(value: number, name: string) => [
                        value.toFixed(3),
                        name === "tpr" ? "TPR" : "FPR",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="tpr"
                      stroke={chartColors.primary}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="linear"
                      data={[
                        { fpr: 0, tpr: 0 },
                        { fpr: 1, tpr: 1 },
                      ]}
                      dataKey="tpr"
                      stroke={chartColors.muted}
                      strokeDasharray="5 5"
                      strokeWidth={1}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scalability">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scalability Metrics</CardTitle>
              <CardDescription>
                Model performance across different grid sizes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scalabilityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
                    <XAxis
                      dataKey="topology"
                      tick={{ fill: "hsl(220, 14%, 65%)", fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fill: "hsl(220, 14%, 65%)", fontSize: 12 }}
                      tickFormatter={(v) => `${v}%`}
                      label={{
                        value: "Detection Rate (%)",
                        angle: -90,
                        position: "insideLeft",
                        fill: "hsl(220, 14%, 65%)",
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: "hsl(220, 14%, 65%)", fontSize: 12 }}
                      tickFormatter={(v) => `${v}ms`}
                      label={{
                        value: "Inference Time (ms)",
                        angle: 90,
                        position: "insideRight",
                        fill: "hsl(220, 14%, 65%)",
                        fontSize: 12,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(220, 17%, 10%)",
                        border: "1px solid hsl(220, 14%, 18%)",
                        borderRadius: "6px",
                      }}
                      labelStyle={{ color: "hsl(220, 17%, 92%)" }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="detectionRate"
                      name="Detection Rate"
                      fill={chartColors.success}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="inferenceTime"
                      name="Inference Time"
                      fill={chartColors.primary}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Confusion Matrix</CardTitle>
          <CardDescription>
            Binary classification results for attack detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="text-center p-4 rounded-md bg-success/10 border border-success/20">
              <div className="text-2xl font-bold font-mono text-success">
                {confusionData[0].value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                True Positive
              </div>
            </div>
            <div className="text-center p-4 rounded-md bg-warning/10 border border-warning/20">
              <div className="text-2xl font-bold font-mono text-warning">
                {confusionData[1].value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                False Negative
              </div>
            </div>
            <div className="text-center p-4 rounded-md bg-critical/10 border border-critical/20">
              <div className="text-2xl font-bold font-mono text-critical">
                {confusionData[2].value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                False Positive
              </div>
            </div>
            <div className="text-center p-4 rounded-md bg-primary/10 border border-primary/20">
              <div className="text-2xl font-bold font-mono text-primary">
                {confusionData[3].value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                True Negative
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
