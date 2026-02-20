import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plug, Check, AlertTriangle } from "lucide-react";
import { useState } from "react";

export function SCADAProtocolIntegration() {
  const [protocols, setProtocols] = useState({
    dnp3: true,
    iec61850: true,
    modbustcp: true,
    pcap: true,
  });

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-green-500" />
          SCADA Protocol Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-gradient-to-br from-green-500/10 to-transparent rounded border border-green-500/20">
          <p className="text-sm font-semibold mb-2">Native Protocol Support</p>
          <p className="text-xs text-muted-foreground">
            Direct ingestion from SCADA/ICS devices without PCAP conversion
          </p>
        </div>

        <div className="space-y-2">
          {[
            { name: "DNP3", desc: "Distribution Network Protocol", status: "connected", connected: 3 },
            { name: "IEC 61850 GOOSE", desc: "Generic Object-Oriented Substation Event", status: "connected", connected: 5 },
            { name: "Modbus/TCP", desc: "Testbed primary protocol", status: "connected", connected: 2 },
            { name: "PCAP Import", desc: "Legacy file-based ingestion", status: "ready", connected: 0 },
          ].map((proto) => (
            <div key={proto.name} className="p-2.5 bg-muted/50 rounded border border-primary/10 space-y-1.5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{proto.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {proto.status === "connected" ? (
                        <span className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-500" />
                          Connected
                        </span>
                      ) : (
                        "Ready"
                      )}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{proto.desc}</p>
                </div>
                {proto.connected > 0 && (
                  <Badge variant="secondary" className="text-xs">{proto.connected} devices</Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-2 bg-background rounded border border-primary/10 text-xs space-y-1">
          <p className="text-muted-foreground mb-1">Data Pipeline Status</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-green-500" />
              <span>Real-time ingestion</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-green-500" />
              <span>Protocol translation</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-green-500" />
              <span>Cyber-physical fusion</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-green-500" />
              <span>Feature normalization</span>
            </div>
          </div>
        </div>

        <Button size="sm" variant="outline" className="w-full" data-testid="button-add-protocol">
          <Plug className="h-3.5 w-3.5 mr-2" />
          Add SCADA Device Connection
        </Button>
      </CardContent>
    </Card>
  );
}
