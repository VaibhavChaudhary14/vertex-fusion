import { ExternalLink, AlertCircle, AlertTriangle, Info, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ThreatFeed as ThreatFeedType, SeverityLevel } from "@shared/schema";

interface ThreatFeedProps {
  threats: ThreatFeedType[];
  onViewDetails?: (threat: ThreatFeedType) => void;
}

const severityConfig: Record<SeverityLevel, { icon: typeof AlertCircle; color: string; bgColor: string }> = {
  critical: { icon: AlertCircle, color: "text-critical", bgColor: "bg-critical/10" },
  high: { icon: AlertTriangle, color: "text-destructive", bgColor: "bg-destructive/10" },
  medium: { icon: AlertTriangle, color: "text-warning", bgColor: "bg-warning/10" },
  low: { icon: Info, color: "text-primary", bgColor: "bg-primary/10" },
};

export function ThreatFeed({ threats, onViewDetails }: ThreatFeedProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown";
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Trending Threat Intelligence</CardTitle>
        <CardDescription>
          AI-curated cybersecurity news relevant to smart grids
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[500px]">
          <div className="space-y-3 p-4 pt-0">
            {threats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Info className="h-8 w-8 mb-2" />
                <p className="text-sm">No threat intelligence available</p>
                <p className="text-xs">Check back later for updates</p>
              </div>
            ) : (
              threats.map((threat) => {
                const config = severityConfig[threat.severity as SeverityLevel];
                const Icon = config?.icon || Info;

                return (
                  <div
                    key={threat.id}
                    className="rounded-md border p-4 hover-elevate transition-colors"
                    data-testid={`threat-${threat.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`rounded-md p-1.5 ${config?.bgColor} shrink-0`}>
                        <Icon className={`h-4 w-4 ${config?.color}`} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-sm line-clamp-2">
                            {threat.title}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={`text-xs capitalize shrink-0 ${config?.color}`}
                          >
                            {threat.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {threat.summary}
                        </p>
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium">{threat.source}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(threat.publishedAt)}
                            </span>
                          </div>
                          {threat.sourceUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-7 px-2 text-xs"
                            >
                              <a
                                href={threat.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-testid={`link-threat-${threat.id}`}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Read more
                              </a>
                            </Button>
                          )}
                        </div>
                        {threat.category && (
                          <Badge variant="outline" className="text-xs">
                            {threat.category}
                          </Badge>
                        )}
                      </div>
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
