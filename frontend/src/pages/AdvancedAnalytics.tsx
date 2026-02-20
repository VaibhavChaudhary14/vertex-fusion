import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, AlertTriangle } from "lucide-react";

export default function AdvancedAnalytics() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-primary/2 to-background">
      <div className="flex-1 p-4 space-y-4 overflow-auto">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-cyan-500 to-primary bg-clip-text text-transparent">
            Advanced Model Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            GNN performance metrics, attack detection patterns, and continuous learning insights
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-success/20 bg-gradient-to-br from-success/10 to-transparent animate-neon">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-success" />
                Detection Rate Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">97.8%</p>
              <p className="text-xs text-muted-foreground mt-1">↑ 3.2% from last week</p>
            </CardContent>
          </Card>

          <Card className="border-warning/20 bg-gradient-to-br from-warning/10 to-transparent animate-neon">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-warning" />
                False Alarm Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning">1.2%</p>
              <p className="text-xs text-muted-foreground mt-1">↓ 0.8% from baseline</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent animate-neon">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-primary" />
                F1-Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">0.978</p>
              <p className="text-xs text-muted-foreground mt-1">Excellent balance</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Attack Detection by Type (Last 24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { attack: "FDI (False Data Injection)", count: 12, dr: 96.8 },
                { attack: "RW (Ransomware)", count: 8, dr: 94.2 },
                { attack: "RS (Reverse Shell)", count: 5, dr: 92.5 },
                { attack: "BF (Brute Force)", count: 3, dr: 87.3 },
                { attack: "BD (Backdoor)", count: 2, dr: 85.1 },
              ].map((item) => (
                <div key={item.attack} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.attack}</p>
                    <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-success to-cyan-500"
                        style={{ width: `${item.dr}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <Badge variant="outline" className="text-xs">{item.count} detected</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{item.dr}% DR</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Continuous Learning Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-2 bg-muted/50 rounded border border-primary/20">
                <p className="font-semibold text-primary">Online Learning Capability</p>
                <p className="text-xs text-muted-foreground mt-1">Model adapts to emerging threats without full retraining</p>
              </div>
              <div className="p-2 bg-muted/50 rounded border border-primary/20">
                <p className="font-semibold">Last Model Update</p>
                <p className="text-xs text-muted-foreground mt-1">2 hours ago • 847 new samples processed</p>
              </div>
              <div className="p-2 bg-success/10 rounded border border-success/20">
                <p className="font-semibold text-success">Next Retraining</p>
                <p className="text-xs text-muted-foreground mt-1">Scheduled in 6 hours with accumulated dataset improvements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
