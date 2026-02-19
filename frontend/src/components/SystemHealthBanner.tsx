import { Shield, Activity, AlertTriangle, Zap } from "lucide-react";
import type { SystemHealthMetrics } from "@shared/schema";

interface SystemHealthBannerProps {
  metrics: SystemHealthMetrics;
}

export function SystemHealthBanner({ metrics }: SystemHealthBannerProps) {
  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-critical";
  };

  const getHealthBg = (score: number) => {
    if (score >= 90) return "bg-success/10";
    if (score >= 70) return "bg-warning/10";
    return "bg-critical/10";
  };

  return (
    <div className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center justify-between gap-4 px-4 py-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`rounded-md p-1.5 ${getHealthBg(metrics.securityIndex)}`}>
              <Shield className={`h-4 w-4 ${getHealthColor(metrics.securityIndex)}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Security Index</span>
              <span className={`text-sm font-semibold font-mono ${getHealthColor(metrics.securityIndex)}`}>
                {metrics.securityIndex.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-border" />

          <div className="flex items-center gap-2">
            <div className="rounded-md p-1.5 bg-primary/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Detection Rate</span>
              <span className="text-sm font-semibold font-mono">
                {metrics.detectionRate.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-md p-1.5 bg-warning/10">
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">False Alarm</span>
              <span className="text-sm font-semibold font-mono">
                {metrics.falseAlarmRate.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-md p-1.5 bg-success/10">
              <Zap className="h-4 w-4 text-success" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Grid Reliability</span>
              <span className="text-sm font-semibold font-mono">
                {metrics.gridReliabilityScore.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Active Sims:</span>
            <span className="font-mono font-medium">{metrics.activeSimulations}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Alerts (24h):</span>
            <span className="font-mono font-medium text-warning">{metrics.alertsLast24h}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
