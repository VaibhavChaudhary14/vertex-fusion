import { ModelAnalytics } from "@/components/ModelAnalytics";
import type { ModelPerformanceMetrics } from "@shared/schema";

const mockMetrics: ModelPerformanceMetrics = {
  accuracy: 0.968,
  precision: 0.952,
  recall: 0.978,
  f1Score: 0.965,
  detectionRateByAttack: {
    RW: 0.96,
    FDI: 0.98,
    RS: 0.94,
    BF: 0.97,
    BD: 0.93,
  },
  confusionMatrix: [
    [487, 11],
    [24, 478],
  ],
  rocCurve: [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.01, tpr: 0.45 },
    { fpr: 0.02, tpr: 0.68 },
    { fpr: 0.03, tpr: 0.78 },
    { fpr: 0.05, tpr: 0.85 },
    { fpr: 0.08, tpr: 0.90 },
    { fpr: 0.10, tpr: 0.92 },
    { fpr: 0.15, tpr: 0.95 },
    { fpr: 0.20, tpr: 0.96 },
    { fpr: 0.30, tpr: 0.97 },
    { fpr: 0.50, tpr: 0.98 },
    { fpr: 0.70, tpr: 0.99 },
    { fpr: 1.0, tpr: 1.0 },
  ],
  scalabilityMetrics: [
    { topology: "ieee14", inferenceTimeMs: 8.2, detectionRate: 0.962 },
    { topology: "ieee30", inferenceTimeMs: 12.5, detectionRate: 0.978 },
    { topology: "ieee118", inferenceTimeMs: 18.7, detectionRate: 0.984 },
  ],
};

export default function Analytics() {
  return (
    <div className="p-4 h-full overflow-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Model Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Performance metrics and analysis of the GNN-based intrusion detection model
        </p>
      </div>

      <ModelAnalytics metrics={mockMetrics} />
    </div>
  );
}
