import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ShieldCheck, AlertTriangle, Activity } from "lucide-react";

interface AIExplanationPanelProps {
    detection: {
        detected: boolean;
        type: string;
        confidence: number;
        contributing_features: { feature: string; importance: number }[];
    } | null;
}

export function AIExplanationPanel({ detection }: AIExplanationPanelProps) {
    if (!detection) {
        return (
            <Card className="border border-primary/20 bg-card h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        AI Threat Analysis
                    </CardTitle>
                    <CardDescription>Real-time GNN Inference & Explainability</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
                    Waiting for simulation data...
                </CardContent>
            </Card>
        );
    }

    const isAttack = detection.detected && detection.type !== "Normal";
    const confidencePercent = Math.round(detection.confidence * 100);

    return (
        <Card className={`border h-full ${isAttack ? "border-destructive/50 bg-destructive/5" : "border-primary/20 bg-card"}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        {isAttack ? <AlertTriangle className="w-5 h-5 text-destructive" /> : <ShieldCheck className="w-5 h-5 text-primary" />}
                        AI Threat Analysis
                    </CardTitle>
                    <Badge variant={isAttack ? "destructive" : "outline"} className={!isAttack ? "bg-primary/10 text-primary border-primary/20" : ""}>
                        {isAttack ? "THREAT DETECTED" : "SYSTEM SECURE"}
                    </Badge>
                </div>
                <CardDescription>
                    Model: ST-GNN (Spatio-Temporal Graph Neural Network)
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Detection Status */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Classification</span>
                        <span className={`font-bold ${isAttack ? "text-destructive" : "text-primary"}`}>
                            {detection.type}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-mono">{confidencePercent}%</span>
                    </div>
                    <Progress
                        value={confidencePercent}
                        className={`h-2 ${isAttack ? "bg-destructive/20" : "bg-primary/20"}`}
                    // indicatorClassName not directly exposing color prop in standard shadcn, controlled via CSS variable usually or custom class if modified
                    />
                </div>

                {/* Feature Importance (SHAP) */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        Top Contributing Factors (SHAP)
                    </h4>
                    <div className="h-[150px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={detection.contributing_features} layout="vertical" margin={{ left: 0, right: 30 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="feature"
                                    type="category"
                                    width={120}
                                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: "6px" }}
                                />
                                <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={20}>
                                    {detection.contributing_features.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={isAttack ? "hsl(var(--destructive))" : "hsl(var(--primary))"} opacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
