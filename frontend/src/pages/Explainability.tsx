import { useEffect, useState, useCallback } from "react";
import { BrainCircuit, AlertTriangle, ShieldCheck, RefreshCw, BarChart2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useToast } from "@/hooks/use-toast";

interface ShapFeature {
    bus: number;
    feature: string;
    importance: number;
}

interface ShapResponse {
    prediction: string;
    confidence: number;
    top_features: ShapFeature[];
    raw_matrix: number[][];
    error?: string;
}

export default function Explainability() {
    const { toast } = useToast();
    const [data, setData] = useState<ShapResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchExplainability = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/simulator/shap");
            const json = await res.json();

            if (json.error) {
                if (!autoRefresh) toast({ title: "SHAP Error", description: json.error, variant: "destructive" });
                return;
            }

            setData(json);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [toast, autoRefresh]);

    useEffect(() => {
        fetchExplainability();
        let interval: ReturnType<typeof setInterval>;
        if (autoRefresh) {
            interval = setInterval(fetchExplainability, 1500);
        }
        return () => clearInterval(interval);
    }, [fetchExplainability, autoRefresh]);

    const chartData = data?.top_features.map(f => ({
        name: `Bus ${f.bus} ${f.feature}`,
        importance: f.importance
    })) || [];

    return (
        <div className="p-6 space-y-6 h-full overflow-auto bg-background">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Explainable AI (XAI)</h1>
                    <p className="text-muted-foreground mt-1">Real-time Saliency Gradients & Feature Attribution</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant={autoRefresh ? "default" : "outline"}
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`} />
                        {autoRefresh ? "Live Sync ON" : "Live Sync OFF"}
                    </Button>
                    {!autoRefresh && (
                        <Button variant="secondary" onClick={fetchExplainability} disabled={loading}>
                            Calculate SHAP
                        </Button>
                    )}
                </div>
            </div>

            {!data ? (
                <Card className="flex items-center justify-center p-12 py-24 border-dashed">
                    <div className="text-center space-y-4">
                        <BrainCircuit className="w-12 h-12 mx-auto text-muted-foreground animate-pulse" />
                        <p className="text-lg text-muted-foreground">Waiting for simulation telemetry...</p>
                    </div>
                </Card>
            ) : (
                <>
                    {/* Status Header */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2 border-border shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Current ST-GNN Classification</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center gap-4">
                                {data.prediction === "Normal" ? (
                                    <ShieldCheck className="w-10 h-10 text-emerald-500" />
                                ) : (
                                    <AlertTriangle className="w-10 h-10 text-destructive" />
                                )}
                                <div>
                                    <div className="text-3xl font-bold">
                                        {data.prediction}
                                        <Badge variant={data.prediction === "Normal" ? "outline" : "destructive"} className="ml-3 align-middle">
                                            {(data.confidence * 100).toFixed(1)}% Conf
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {data.prediction === "Normal"
                                            ? "Grid telemetry is nominal. Feature attribution highlights baseline operational drivers."
                                            : "Anomaly detected. Feature attribution highlights the sensors triggering this classification."}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Primary Explainer Driver</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-primary">
                                    {data.top_features[0]?.feature || "N/A"}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    at Bus {data.top_features[0]?.bus || "?"} ({data.top_features[0]?.importance.toFixed(1)}% influence)
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bar Chart */}
                    <Card className="border-border shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-primary" /> Top 10 Influential Features (Saliency % Rank)
                            </CardTitle>
                            <CardDescription>
                                Direct PyTorch backward-pass gradients mapping logical physical attributes to the GNN prediction.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="hsl(var(--border))" />
                                    <XAxis type="number" domain={[0, 'dataMax + 5']} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--muted))' }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Importance']}
                                    />
                                    <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={
                                                index === 0 ? "hsl(var(--destructive))" :
                                                    index < 3 ? "hsl(var(--warning))" :
                                                        "hsl(var(--primary))"
                                            } />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Phase 4: Bus-Level Anomaly Indicators */}
                    <div className="grid grid-cols-3 md:grid-cols-9 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(bus => {
                            const busImportance = data.top_features
                                .filter(f => f.bus === bus)
                                .reduce((acc, curr) => acc + curr.importance, 0);
                            
                            const isHigh = busImportance > 15; // Threshold for "high" contribution
                            
                            return (
                                <Card key={bus} className={`border-2 ${isHigh ? "border-destructive/50 bg-destructive/5 shadow-md" : "border-border"}`}>
                                    <div className="p-3 text-center">
                                        <div className="text-xs font-medium text-muted-foreground mb-1">Bus {bus}</div>
                                        <div className={`text-xl font-bold ${isHigh ? "text-destructive" : "text-foreground"}`}>
                                            {busImportance.toFixed(0)}%
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="text-xs text-muted-foreground text-center">
                        * Explanation methodology: Mean Absolute Temporal Gradients (Saliency Map) over the 10-step spatial-temporal window.
                    </div>
                </>
            )}
        </div>
    );
}
