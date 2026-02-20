import { Button } from "@/components/ui/button";
import { RefreshCw, Pause, Play } from "lucide-react";
import { useState } from "react";

interface DataRefreshControlProps {
  onRefresh: () => void;
  onToggleAutoRefresh?: (enabled: boolean) => void;
  isLoading?: boolean;
}

export function DataRefreshControl({
  onRefresh,
  onToggleAutoRefresh,
  isLoading = false,
}: DataRefreshControlProps) {
  const [autoRefresh, setAutoRefresh] = useState(false);

  const handleToggle = () => {
    const newState = !autoRefresh;
    setAutoRefresh(newState);
    onToggleAutoRefresh?.(newState);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
        data-testid="button-manual-refresh"
        className="gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        Refresh Data
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        data-testid="button-toggle-auto-refresh"
      >
        {autoRefresh ? (
          <>
            <Pause className="h-4 w-4 mr-1" />
            Auto (On)
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-1" />
            Auto (Off)
          </>
        )}
      </Button>
    </div>
  );
}
