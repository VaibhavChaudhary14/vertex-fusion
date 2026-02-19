import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Download } from "lucide-react";

export function ReproducibleDataGeneration() {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-green-500" />
          Reproducible Data Generation Environment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-gradient-to-br from-green-500/10 to-transparent rounded border border-green-500/20">
          <p className="text-sm font-semibold mb-2">Site-Specific Attack Dataset Generation</p>
          <p className="text-xs text-muted-foreground">
            Based on OPAL-RT CP testbed. Simulate realistic attacks (RW, FDI, BF, RS, BD) on your specific grid topology
          </p>
        </div>

        <div className="space-y-2 text-xs">
          <p className="font-semibold mb-2">Generated Datasets</p>
          {[
            { name: "Normal Operations", samples: 50000, duration: "24h simulation" },
            { name: "False Data Injection", samples: 2500, duration: "50 injection events" },
            { name: "Ransomware Attacks", samples: 1800, duration: "30 attack sequences" },
            { name: "Brute Force Attempts", samples: 1200, duration: "40 login attempts" },
            { name: "Reverse Shell", samples: 1500, duration: "25 shell sessions" },
            { name: "Backdoor Persistence", samples: 2000, duration: "35 backdoor behaviors" },
          ].map((ds) => (
            <div key={ds.name} className="p-2 bg-muted/50 rounded border border-primary/10 flex justify-between items-center">
              <div>
                <p className="font-semibold text-foreground">{ds.name}</p>
                <p className="text-muted-foreground text-xs">{ds.duration}</p>
              </div>
              <Badge variant="outline" className="text-xs">{ds.samples.toLocaleString()} samples</Badge>
            </div>
          ))}
        </div>

        <div className="p-2 bg-background rounded border border-primary/10 text-xs space-y-1">
          <p className="text-muted-foreground mb-1">Testbed Components</p>
          <p className="font-semibold">OPAL-RT simulator + Docker containers + Modbus/TCP network</p>
          <p className="text-muted-foreground mt-1">Generates realistic multi-modal datasets addressing scarcity of public ICS/grid attack data</p>
        </div>

        <Button size="sm" className="w-full" data-testid="button-generate-dataset">
          <Download className="h-3.5 w-3.5 mr-2" />
          Generate and Export Dataset
        </Button>
      </CardContent>
    </Card>
  );
}
