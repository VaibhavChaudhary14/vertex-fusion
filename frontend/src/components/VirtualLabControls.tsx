import { useState } from "react";
import { Play, Square, Zap, AlertTriangle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  GridTopology,
  LoadProfile,
  ObservabilityMode,
  AttackType,
  SimulationConfig,
} from "@shared/schema";
import { attackTypeLabels } from "@shared/schema";

interface VirtualLabControlsProps {
  isRunning: boolean;
  onStart: (config: SimulationConfig) => void;
  onStop: () => void;
  onInjectAttack: (attackType: AttackType, targetNode: string) => void;
  onClearAttacks: () => void;
  availableNodes: string[];
}

const topologyDescriptions: Record<GridTopology, string> = {
  ieee14: "14 buses, 5 generators - Ideal for learning and quick experiments",
  ieee30: "30 buses, 6 generators - Standard research benchmark",
  ieee118: "118 buses, 54 generators - Large-scale testing (advanced)",
};

const attackDescriptions: Record<AttackType, string> = {
  RW: "Encrypts control systems and demands payment - Affects multiple nodes simultaneously",
  FDI: "Injects false sensor readings to mislead operators - Targets measurement data",
  RS: "Establishes remote command access to compromised systems - Persistent threat",
  BF: "Attempts to guess credentials through repeated login attempts - Network-based",
  BD: "Creates hidden access point for future exploitation - Stealthy intrusion",
};

export function VirtualLabControls({
  isRunning,
  onStart,
  onStop,
  onInjectAttack,
  onClearAttacks,
  availableNodes,
}: VirtualLabControlsProps) {
  const [topology, setTopology] = useState<GridTopology>("ieee14");
  const [loadProfile, setLoadProfile] = useState<LoadProfile>("normal");
  const [observabilityMode, setObservabilityMode] = useState<ObservabilityMode>("full");
  const [selectedAttack, setSelectedAttack] = useState<AttackType>("FDI");
  const [targetNode, setTargetNode] = useState<string>("");

  const handleStart = () => {
    onStart({
      topology,
      loadProfile,
      observabilityMode,
    });
  };

  const handleInjectAttack = () => {
    if (targetNode) {
      onInjectAttack(selectedAttack, targetNode);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Simulation Configuration</CardTitle>
          <CardDescription>
            Configure the cyber-physical testbed environment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Grid Topology</Label>
            <RadioGroup
              value={topology}
              onValueChange={(v) => setTopology(v as GridTopology)}
              className="space-y-2"
              disabled={isRunning}
            >
              {(["ieee14", "ieee30", "ieee118"] as const).map((t) => (
                <div key={t} className="flex items-start space-x-3">
                  <RadioGroupItem value={t} id={t} data-testid={`radio-${t}`} />
                  <div className="grid gap-1">
                    <Label
                      htmlFor={t}
                      className="font-medium cursor-pointer"
                    >
                      {t === "ieee14" ? "IEEE 14-Bus" : t === "ieee30" ? "IEEE 30-Bus" : "IEEE 118-Bus"}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {topologyDescriptions[t]}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Load Profile</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="load-profile"
                  checked={loadProfile === "stress"}
                  onCheckedChange={(checked) =>
                    setLoadProfile(checked ? "stress" : "normal")
                  }
                  disabled={isRunning}
                  data-testid="switch-load-profile"
                />
                <Label htmlFor="load-profile" className="cursor-pointer">
                  {loadProfile === "stress" ? (
                    <Badge variant="destructive">Stress Test</Badge>
                  ) : (
                    <Badge variant="secondary">Normal Operation</Badge>
                  )}
                </Label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {loadProfile === "stress"
                ? "High load conditions with fluctuations to test grid stability"
                : "Standard operating conditions with typical load patterns"}
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Observability Mode</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="observability"
                  checked={observabilityMode === "partial"}
                  onCheckedChange={(checked) =>
                    setObservabilityMode(checked ? "partial" : "full")
                  }
                  disabled={isRunning}
                  data-testid="switch-observability"
                />
                <Label htmlFor="observability" className="cursor-pointer">
                  {observabilityMode === "partial" ? (
                    <Badge variant="outline">Partial (~35% nodes)</Badge>
                  ) : (
                    <Badge variant="secondary">Full Observability</Badge>
                  )}
                </Label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {observabilityMode === "partial"
                ? "Realistic scenario monitoring only generators and critical loads"
                : "Complete monitoring of all power system nodes (ideal conditions)"}
            </p>
          </div>

          <div className="flex gap-2">
            {isRunning ? (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={onStop}
                data-testid="button-stop-simulation"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Simulation
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={handleStart}
                data-testid="button-start-simulation"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Simulation
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Attack Injection
            </CardTitle>
            <CardDescription>
              Inject attacks into the running simulation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Attack Type</Label>
              <Select
                value={selectedAttack}
                onValueChange={(v) => setSelectedAttack(v as AttackType)}
              >
                <SelectTrigger data-testid="select-attack-type">
                  <SelectValue placeholder="Select attack type" />
                </SelectTrigger>
                <SelectContent>
                  {(["RW", "FDI", "RS", "BF", "BD"] as const).map((attack) => (
                    <SelectItem key={attack} value={attack}>
                      <div className="flex items-center gap-2">
                        <span>{attackTypeLabels[attack]}</span>
                        <span className="text-xs text-muted-foreground">({attack})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {attackDescriptions[selectedAttack]}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Target Node</Label>
              <Select value={targetNode} onValueChange={setTargetNode}>
                <SelectTrigger data-testid="select-target-node">
                  <SelectValue placeholder="Select target node" />
                </SelectTrigger>
                <SelectContent>
                  {availableNodes.map((node) => (
                    <SelectItem key={node} value={node}>
                      {node}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleInjectAttack}
                    disabled={!targetNode}
                    data-testid="button-inject-attack"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Inject Attack
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This will trigger an attack in the simulation</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onClearAttacks}
                    data-testid="button-clear-attacks"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear all active attacks</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
