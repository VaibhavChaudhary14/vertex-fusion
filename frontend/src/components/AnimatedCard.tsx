import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface AnimatedCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  animation?: "fade-in-up" | "float-in" | "slide-up" | "blur-in";
}

export function AnimatedCard({
  title,
  icon,
  children,
  className = "",
  animation = "fade-in-up",
}: AnimatedCardProps) {
  return (
    <Card className={`border-primary/20 hover-elevate group overflow-hidden shimmer ${animation} ${className}`}>
      <CardHeader>
        {icon && (
          <div className="p-2 w-fit rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-300">
            {icon}
          </div>
        )}
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
