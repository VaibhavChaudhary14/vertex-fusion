import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Activity, Zap, ShieldCheck, Server } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = "/api"; // Proxy configured in vite or backend runs on same port? 
// Actually standard Vite setup usually proxies /api to backend. 
// If not, we might need absolute URL. main.py is on 8000.
// Let's assume relative path works or we use absolute for now to be safe.
const API_URL = "http://localhost:8000";

export default function DigitalTwinDashboard() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState([]);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/detect-attack`);
            const data = await res.json();
            setStatus(data);

            // Update history for chart
            if (data.detection) {
                setHistory(prev => {
                    const newPoint = {
                        time: new Date().toLocaleTimeString(),
                        confidence: data.detection.confidence * 100
                    };
                    return [...prev.slice(-19), newPoint]; // Keep last 20
                });
            }
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch Twin status", error);
        }
    };

    useEffect(() => {
        const interval = setInterval(fetchStatus, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleTrip = async (lineId) => {
        try {
            await fetch(`${API_URL}/trip-breaker?line_id=${lineId}`, { method: 'POST' });
            alert(`Sent TRIP command for Line ${lineId}`);
        } catch (e) {
            alert("Failed to send command");
        }
    };

    if (loading) return <div className="p-8 text-center">Connecting to Digital Twin...</div>;

    const isAttack = status?.detection?.action === "TRIP" || status?.detection?.action === "ALARM";
    const isConnected = status?.connected;

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Activity className="h-8 w-8 text-primary" />
                        Digital Twin: IEEE 9-Bus System
                    </h1>
                    <p className="text-muted-foreground">Real-Time Cyber-Physical Surveillance</p>
                </div>
                <Badge variant={isConnected ? "default" : "destructive"} className="text-lg px-4 py-1">
                    {isConnected ? "TWIN CONNECTED" : "OFFLINE / SIMULATION"}
                </Badge>
            </div>

            {/* Main Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className={isAttack ? "border-red-500 bg-red-50 dark:bg-red-950/20" : "border-green-500 bg-green-50 dark:bg-green-950/20"}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">System Status</CardTitle>
                        <ShieldCheck className={`h-4 w-4 ${isAttack ? "text-red-500" : "text-green-500"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isAttack ? "THREAT DETECTED" : "SECURE"}</div>
                        <p className="text-xs text-muted-foreground">
                            {status?.detection?.type || "Normal Operation"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(status?.detection?.confidence * 100).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Action: {status?.detection?.action}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Grid Source</CardTitle>
                        <Server className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{status?.source}</div>
                        <p className="text-xs text-muted-foreground">
                            {isConnected ? "Streaming from MATLAB" : "Running Local Sim"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts & Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live Confidence Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Attack Probability (Live)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Line type="monotone" dataKey="confidence" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Manual Controls / Grid State */}
                <Card>
                    <CardHeader>
                        <CardTitle>Grid Controls & Telemetry</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Button variant="destructive" onClick={() => handleTrip("5")}>
                                    <Zap className="mr-2 h-4 w-4" />
                                    EMERGENCY TRIP LINE 5
                                </Button>
                                <Button variant="outline" onClick={() => handleTrip("7")}>
                                    TRIP LINE 7
                                </Button>
                            </div>

                            <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">Live Bus Data (First 5 Buses)</h4>
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Bus ID</TableHead>
                                                <TableHead>Voltage (pu)</TableHead>
                                                <TableHead>Freq (Hz)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {status?.grid_summary?.slice(0, 5).map((val, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{idx + 1}</TableCell>
                                                    <TableCell>{val.toFixed(3)}</TableCell>
                                                    <TableCell>50.00</TableCell>
                                                    {/* Assuming flat vector structure for demo. 
                                            Real mapping needs proper index from 54-feat vector */}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {isAttack && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Critical Alert</AlertTitle>
                    <AlertDescription>
                        AI has detected <strong>{status?.detection?.type}</strong> with high confidence.
                        {status?.detection?.action === "TRIP" && " Automated protective tripping initiated."}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
