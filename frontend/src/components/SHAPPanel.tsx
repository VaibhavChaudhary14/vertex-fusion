import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Microscope, Info } from 'lucide-react';
import { cn } from "@/lib/utils";

const API_URL = "http://localhost:8000";

interface FeatureImportance {
    feature: string;
    impact: number; // SHAP value (absolute or signed)
    contribution: number; // Percentage for UI
}

export function SHAPPanel() {
    const [data, setData] = useState<FeatureImportance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real app, we'd fetch from the backend which reads the CSV/Model
                // For now, we simulate the fetch or use a placeholder endpoint
                // const res = await fetch(`${API_URL}/explain-attack`); 
                // const json = await res.json();

                // Mock Data for Demo (matches standard IEEE 9-bus features)
                const mockData = [
                    { feature: "V_Bus2", impact: 0.35, contribution: 35 },
                    { feature: "P_Line2-3", impact: 0.25, contribution: 25 },
                    { feature: "Q_Gen3", impact: 0.15, contribution: 15 },
                    { feature: "F_Bus1", impact: 0.10, contribution: 10 },
                    { feature: "I_Line4", impact: 0.05, contribution: 5 },
                ];

                setData(mockData);
                setLoading(false);
            } catch (e) {
                console.error("SHAP fetch failed", e);
                setLoading(false);
            }
        };

        fetchData();
        // Poll less frequently for explanation
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="glass-panel h-full flex flex-col relative overflow-hidden border-l-4 border-l-neural-purple">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium tracking-widest text-muted-foreground flex items-center gap-2">
                    <Microscope className="w-4 h-4 text-neural-purple" />
                    AI EXPLAINABILITY (SHAP)
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 relative">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground animate-pulse">
                        ANALYZING FEATURE SPACE...
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={data} margin={{ left: 0, right: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="feature"
                                type="category"
                                width={70}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#0B0F1A', borderColor: 'rgba(255,255,255,0.2)', color: '#E0F2FE' }}
                                itemStyle={{ color: '#7C4DFF' }}
                            />
                            <Bar dataKey="contribution" layout="vertical" radius={[0, 4, 4, 0]} barSize={12} animationDuration={1000}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#FF1744' : '#7C4DFF'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}

                {/* Explainability Overlay Text */}
                <div className="absolute bottom-2 right-4 text-[10px] text-muted-foreground font-mono flex items-center gap-1 opacity-60">
                    <Info size={10} />
                    TOP CONTRIBUTOR: {data[0]?.feature || "N/A"}
                </div>
            </CardContent>
        </Card>
    );
}
