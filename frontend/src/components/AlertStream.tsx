import { useState } from "react";
import { AlertCircle, AlertTriangle, Info, XCircle, Filter, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Alert, SeverityLevel, AttackType } from "@shared/schema";
import { attackTypeLabels } from "@shared/schema";

interface AlertStreamProps {
  alerts: Alert[];
  onAcknowledge?: (alertId: string) => void;
}

const severityConfig: Record<SeverityLevel, { icon: typeof AlertCircle; color: string; bgColor: string }> = {
  critical: { icon: XCircle, color: "text-critical", bgColor: "bg-critical/10" },
  high: { icon: AlertCircle, color: "text-destructive", bgColor: "bg-destructive/10" },
  medium: { icon: AlertTriangle, color: "text-warning", bgColor: "bg-warning/10" },
  low: { icon: Info, color: "text-primary", bgColor: "bg-primary/10" },
};

export function AlertStream({ alerts, onAcknowledge }: AlertStreamProps) {
  const [severityFilter, setSeverityFilter] = useState<Set<SeverityLevel>>(
    new Set(["critical", "high", "medium", "low"])
  );

  const filteredAlerts = alerts.filter((alert) =>
    severityFilter.has(alert.severity as SeverityLevel)
  );

  const toggleSeverity = (severity: SeverityLevel) => {
    setSeverityFilter((prev) => {
      const next = new Set(prev);
      if (next.has(severity)) {
        next.delete(severity);
      } else {
        next.add(severity);
      }
      return next;
    });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">GNN Alert Stream</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-filter-alerts">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(["critical", "high", "medium", "low"] as const).map((severity) => (
                <DropdownMenuCheckboxItem
                  key={severity}
                  checked={severityFilter.has(severity)}
                  onCheckedChange={() => toggleSeverity(severity)}
                  data-testid={`filter-${severity}`}
                >
                  <span className="capitalize">{severity}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-2 p-4 pt-0">
            {filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Info className="h-8 w-8 mb-2" />
                <p className="text-sm">No alerts matching filters</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const config = severityConfig[alert.severity as SeverityLevel];
                const Icon = config?.icon || Info;
                
                return (
                  <div
                    key={alert.id}
                    className={`group rounded-md border p-3 transition-colors hover-elevate ${
                      alert.isAcknowledged ? "opacity-60" : ""
                    }`}
                    data-testid={`alert-${alert.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`rounded-md p-1.5 ${config?.bgColor}`}>
                        <Icon className={`h-4 w-4 ${config?.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="capitalize text-xs">
                            {attackTypeLabels[alert.attackType as AttackType] || alert.attackType}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className={`text-xs capitalize ${config?.color}`}
                          >
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono">
                            {formatTime(alert.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm line-clamp-2">
                          <span className="text-muted-foreground">Affected: </span>
                          <span className="font-mono text-xs">
                            {alert.affectedNodes?.join(", ") || "Unknown"}
                          </span>
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Confidence:</span>
                          <span className={`text-xs font-mono font-medium ${
                            alert.confidenceScore >= 0.9 ? "text-success" :
                            alert.confidenceScore >= 0.7 ? "text-warning" :
                            "text-muted-foreground"
                          }`}>
                            {(alert.confidenceScore * 100).toFixed(1)}%
                          </span>
                          <Badge 
                            variant={alert.classification === "malicious" ? "destructive" : "outline"}
                            className="text-xs ml-auto"
                          >
                            {alert.classification}
                          </Badge>
                        </div>
                      </div>
                      {!alert.isAcknowledged && onAcknowledge && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => onAcknowledge(alert.id)}
                          data-testid={`button-acknowledge-${alert.id}`}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
