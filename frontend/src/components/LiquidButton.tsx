import { Button, type ButtonProps } from "@/components/ui/button";
import { ReactNode } from "react";

interface LiquidButtonProps extends ButtonProps {
  children: ReactNode;
  animated?: boolean;
}

export function LiquidButton({ children, animated = true, className = "", ...props }: LiquidButtonProps) {
  return (
    <Button
      className={`hover-elevate active-elevate-2 relative overflow-hidden ${animated ? "bg-gradient-to-r from-primary via-secondary to-accent bg-size-200 hover:bg-right transition-all duration-500" : ""} ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}
