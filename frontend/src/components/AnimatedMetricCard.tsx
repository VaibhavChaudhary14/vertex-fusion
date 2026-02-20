import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface AnimatedMetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  gradient?: "primary" | "secondary" | "accent";
  children?: ReactNode;
  className?: string;
}

export function AnimatedMetricCard({
  label,
  value,
  unit,
  icon,
  gradient = "primary",
  children,
  className = "",
}: AnimatedMetricCardProps) {
  const gradients = {
    primary: "from-primary/10 to-transparent",
    secondary: "from-secondary/10 to-transparent",
    accent: "from-accent/10 to-transparent",
  };

  return (
    <Card className={`bg-gradient-to-br ${gradients[gradient]} border-primary/20 hover-elevate fade-in-up overflow-hidden shimmer ${className}`}>
      <div className="p-4">
        {icon && <div className="mb-3 text-primary">{icon}</div>}
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {value}
          </p>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
        {children && <div className="mt-3">{children}</div>}
      </div>
    </Card>
  );
}
