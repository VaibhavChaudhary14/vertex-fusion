import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: "default" | "success" | "warning" | "critical";
}

const colorClasses = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  critical: "text-critical",
};

export function MetricCard({
  title,
  value,
  unit,
  trend,
  trendLabel,
  icon,
  color = "default",
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === undefined) return null;
    if (trend > 0) return <TrendingUp className="h-3 w-3" />;
    if (trend < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (trend === undefined) return "";
    if (title.toLowerCase().includes("false") || title.toLowerCase().includes("alarm")) {
      return trend > 0 ? "text-critical" : trend < 0 ? "text-success" : "text-muted-foreground";
    }
    return trend > 0 ? "text-success" : trend < 0 ? "text-critical" : "text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold font-mono ${colorClasses[color]}`}>
            {typeof value === "number" ? value.toFixed(1) : value}
          </span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-1 text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>
              {trend > 0 ? "+" : ""}
              {trend.toFixed(1)}%
            </span>
            {trendLabel && (
              <span className="text-muted-foreground ml-1">{trendLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricsGridProps {
  metrics: {
    title: string;
    value: string | number;
    unit?: string;
    trend?: number;
    trendLabel?: string;
    icon?: React.ReactNode;
    color?: "default" | "success" | "warning" | "critical";
  }[];
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}
