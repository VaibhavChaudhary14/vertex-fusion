import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Clock, TrendingUp } from "lucide-react";

// Mock ROC Data for ST-GNN
const rocData = [
    { fpr: 0, tpr: 0 },
    { fpr: 0.01, tpr: 0.85 },
    { fpr: 0.05, tpr: 0.92 },
    { fpr: 0.1, tpr: 0.96 },
    { fpr: 0.2, tpr: 0.98 },
    { fpr: 0.5, tpr: 0.99 },
    { fpr: 1, tpr: 1 }
];

export function PerformanceMetrics() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ROC Curve */}
            <Card className="border border-primary/20 bg-card">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Model Performance (ROC)
                    </CardTitle>
                    <CardDescription>ST-GNN Receiver Operating Characteristic</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={rocData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" opacity={0.1} />
                                <XAxis
                                    dataKey="fpr"
                                    label={{ value: 'False Positive Rate', position: 'insideBottomRight', offset: -5, fontSize: 10 }}
                                    style={{ fontSize: "10px" }}
                                    domain={[0, 1]}
                                    type="number"
                                />
                                <YAxis
                                    label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fontSize: 10 }}
                                    style={{ fontSize: "10px" }}
                                    domain={[0, 1]}
                                />
                                <Tooltip />
                                <Line type="monotone" dataKey="tpr" stroke="hsl(var(--primary))" dot={true} strokeWidth={2} />
                                <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="var(--muted-foreground)" strokeDasharray="3 3" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>AUC: 0.96</span>
                        <span>Optimal Threshold: 0.85</span>
                    </div>
                </CardContent>
            </Card>

            {/* Latency Metrics */}
            <Card className="border border-primary/20 bg-card">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        System Latency
                    </CardTitle>
                    <CardDescription>End-to-end detection delay</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2 border border-primary/10 rounded-lg bg-primary/5">
                            <div className="text-2xl font-bold text-primary">18ms</div>
                            <div className="text-xs text-muted-foreground">Inference Time</div>
                        </div>
                        <div className="p-2 border border-primary/10 rounded-lg bg-primary/5">
                            <div className="text-2xl font-bold text-primary">45ms</div>
                            <div className="text-xs text-muted-foreground">Total Round Trip</div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span>Data Ingestion</span>
                            <span className="text-muted-foreground">12ms</span>
                        </div>
                        <Progress value={25} className="h-1.5" />

                        <div className="flex justify-between text-xs mt-2">
                            <span>GNN Inference</span>
                            <span className="text-muted-foreground">18ms</span>
                        </div>
                        <Progress value={40} className="h-1.5" />

                        <div className="flex justify-between text-xs mt-2">
                            <span>Visualization</span>
                            <span className="text-muted-foreground">15ms</span>
                        </div>
                        <Progress value={35} className="h-1.5" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function Progress({ value, className }: { value: number, className?: string }) {
    return (
        <div className={`w-full bg-secondary rounded-full overflow-hidden ${className}`}>
            <div
                className="bg-primary h-full transition-all duration-500 ease-in-out"
                style={{ width: `${value}%` }}
            />
        </div>
    );
}
