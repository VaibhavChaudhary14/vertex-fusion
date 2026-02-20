import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, Database, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GridTopology, AttackType, Dataset } from "@shared/schema";
import { attackTypeLabels } from "@shared/schema";

interface DatasetGeneratorProps {
  existingDatasets: Dataset[];
  onGenerate: (config: DatasetConfig) => void;
  onDownload: (datasetId: string) => void;
  isGenerating?: boolean;
}

export interface DatasetConfig {
  name: string;
  topology: GridTopology;
  attackTypes: AttackType[];
  sampleCount: number;
  format: "csv" | "json" | "hdf5";
}

const formatIcons = {
  csv: FileSpreadsheet,
  json: FileJson,
  hdf5: Database,
};

export function DatasetGenerator({
  existingDatasets,
  onGenerate,
  onDownload,
  isGenerating,
}: DatasetGeneratorProps) {
  const [config, setConfig] = useState<DatasetConfig>({
    name: "",
    topology: "ieee14",
    attackTypes: ["FDI"],
    sampleCount: 1000,
    format: "csv",
  });

  const toggleAttackType = (attack: AttackType) => {
    setConfig((prev) => ({
      ...prev,
      attackTypes: prev.attackTypes.includes(attack)
        ? prev.attackTypes.filter((a) => a !== attack)
        : [...prev.attackTypes, attack],
    }));
  };

  const handleGenerate = () => {
    if (config.name && config.attackTypes.length > 0) {
      onGenerate(config);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate Dataset</CardTitle>
          <CardDescription>
            Create cyber-physical datasets for research and training
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Dataset Name</Label>
            <Input
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              placeholder="e.g., IEEE14_FDI_Training"
              data-testid="input-dataset-name"
            />
          </div>

          <div className="space-y-2">
            <Label>Grid Topology</Label>
            <Select
              value={config.topology}
              onValueChange={(v) => setConfig({ ...config, topology: v as GridTopology })}
            >
              <SelectTrigger data-testid="select-dataset-topology">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ieee14">IEEE 14-Bus</SelectItem>
                <SelectItem value="ieee30">IEEE 30-Bus</SelectItem>
                <SelectItem value="ieee118">IEEE 118-Bus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Attack Types to Include</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["RW", "FDI", "RS", "BF", "BD"] as const).map((attack) => (
                <div key={attack} className="flex items-center space-x-2">
                  <Checkbox
                    id={`attack-${attack}`}
                    checked={config.attackTypes.includes(attack)}
                    onCheckedChange={() => toggleAttackType(attack)}
                    data-testid={`checkbox-attack-${attack}`}
                  />
                  <label
                    htmlFor={`attack-${attack}`}
                    className="text-sm cursor-pointer"
                  >
                    {attackTypeLabels[attack]}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sample Count</Label>
            <Input
              type="number"
              value={config.sampleCount}
              onChange={(e) =>
                setConfig({ ...config, sampleCount: parseInt(e.target.value) || 1000 })
              }
              min={100}
              max={100000}
              step={100}
              data-testid="input-sample-count"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 1000-10000 samples per attack type
            </p>
          </div>

          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="flex gap-2">
              {(["csv", "json", "hdf5"] as const).map((format) => {
                const Icon = formatIcons[format];
                return (
                  <Button
                    key={format}
                    variant={config.format === format ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setConfig({ ...config, format })}
                    data-testid={`button-format-${format}`}
                  >
                    <Icon className="h-4 w-4 mr-1.5" />
                    {format.toUpperCase()}
                  </Button>
                );
              })}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={!config.name || config.attackTypes.length === 0 || isGenerating}
            data-testid="button-generate-dataset"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Generate Dataset
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Datasets</CardTitle>
          <CardDescription>
            Previously generated datasets available for download
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-4 pt-0">
              {existingDatasets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <Database className="h-8 w-8 mb-2" />
                  <p className="text-sm">No datasets generated yet</p>
                  <p className="text-xs">Create your first dataset using the form</p>
                </div>
              ) : (
                existingDatasets.map((dataset) => {
                  const Icon = formatIcons[dataset.format as keyof typeof formatIcons] || FileJson;
                  return (
                    <div
                      key={dataset.id}
                      className="flex items-center justify-between rounded-md border p-3"
                      data-testid={`dataset-${dataset.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-md p-2 bg-muted">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{dataset.name}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{dataset.topology.toUpperCase()}</span>
                            <span>|</span>
                            <span>{dataset.sampleCount.toLocaleString()} samples</span>
                            <span>|</span>
                            <span>{formatFileSize(dataset.fileSize)}</span>
                          </div>
                          <div className="flex gap-1 mt-1">
                            {dataset.attackTypes?.map((type) => (
                              <Badge
                                key={type}
                                variant="outline"
                                className="text-xs"
                              >
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDownload(dataset.id)}
                        data-testid={`button-download-${dataset.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
