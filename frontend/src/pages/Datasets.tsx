import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { DatasetGenerator, type DatasetConfig } from "@/components/DatasetGenerator";
import { useToast } from "@/hooks/use-toast";
import type { Dataset } from "@shared/schema";

const mockDatasets: Dataset[] = [
  {
    id: "1",
    userId: null,
    name: "IEEE14_FDI_Training",
    topology: "ieee14",
    attackTypes: ["FDI"],
    sampleCount: 5000,
    format: "csv",
    fileSize: 2456000,
    downloadUrl: "/datasets/ieee14_fdi_training.csv",
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: "2",
    userId: null,
    name: "IEEE30_MultiAttack",
    topology: "ieee30",
    attackTypes: ["RW", "FDI", "RS"],
    sampleCount: 10000,
    format: "json",
    fileSize: 8912000,
    downloadUrl: "/datasets/ieee30_multiattack.json",
    createdAt: new Date(Date.now() - 172800000),
  },
  {
    id: "3",
    userId: null,
    name: "IEEE14_AllAttacks_Research",
    topology: "ieee14",
    attackTypes: ["RW", "FDI", "RS", "BF", "BD"],
    sampleCount: 25000,
    format: "hdf5",
    fileSize: 45678000,
    downloadUrl: "/datasets/ieee14_all_research.hdf5",
    createdAt: new Date(Date.now() - 604800000),
  },
];

export default function Datasets() {
  const { toast } = useToast();
  const [datasets, setDatasets] = useState<Dataset[]>(mockDatasets);

  const generateMutation = useMutation({
    mutationFn: async (config: DatasetConfig) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const newDataset: Dataset = {
        id: Date.now().toString(),
        userId: null,
        name: config.name,
        topology: config.topology,
        attackTypes: config.attackTypes,
        sampleCount: config.sampleCount,
        format: config.format,
        fileSize: config.sampleCount * 500,
        downloadUrl: `/datasets/${config.name.toLowerCase().replace(/\s+/g, "_")}.${config.format}`,
        createdAt: new Date(),
      };
      
      return newDataset;
    },
    onSuccess: (newDataset) => {
      setDatasets((prev) => [newDataset, ...prev]);
      toast({
        title: "Dataset Generated",
        description: `${newDataset.name} is ready for download.`,
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate dataset. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = (config: DatasetConfig) => {
    generateMutation.mutate(config);
  };

  const handleDownload = (datasetId: string) => {
    const dataset = datasets.find((d) => d.id === datasetId);
    if (dataset) {
      toast({
        title: "Download Started",
        description: `Downloading ${dataset.name}...`,
      });
    }
  };

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Dataset Generation</h1>
        <p className="text-sm text-muted-foreground">
          Generate cyber-physical datasets for research and model training
        </p>
      </div>

      <DatasetGenerator
        existingDatasets={datasets}
        onGenerate={handleGenerate}
        onDownload={handleDownload}
        isGenerating={generateMutation.isPending}
      />
    </div>
  );
}
