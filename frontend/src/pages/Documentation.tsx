import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, Code2, Zap, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const wikiContent = {
  "getting-started": {
    title: "Getting Started",
    icon: BookOpen,
    sections: [
      {
        heading: "Welcome to Vertex Fusion",
        content: "Vertex Fusion is an enterprise-grade GNN-powered intrusion detection system for smart power grids. Our platform combines cyber and physical data fusion to detect advanced threats 26% faster than benchmark models."
      },
      {
        heading: "Key Concepts",
        content: "Graph Neural Networks (GNNs) analyze power grid topology as graphs with nodes representing generators/loads and edges representing transmission lines. By fusing cyber features (network traffic, SCADA commands) with physical measurements (voltage, frequency, power flow), the system detects both traditional and emerging attacks."
      },
      {
        heading: "First Steps",
        content: "1. Create an account via Google OAuth or email\n2. Explore the Dashboard to view real-time grid metrics\n3. Try the Virtual Lab to simulate attacks safely\n4. Review Detection Analytics to understand threat patterns"
      }
    ]
  },
  "attack-types": {
    title: "Attack Types & Detection",
    icon: Shield,
    sections: [
      {
        heading: "False Data Injection (FDI)",
        content: "Attackers inject false measurements into SCADA systems. Detection: GNN identifies inconsistent power flow equations. Impact: Generator/Load manipulation, cascading blackouts. Mitigation: Monitor voltage/frequency anomalies."
      },
      {
        heading: "Ransomware (RW)",
        content: "Malware encrypts critical control systems. Detection: Network traffic anomaly + command rate surge. Impact: Loss of operational control. Mitigation: Network segmentation, backup systems."
      },
      {
        heading: "Reverse Shell (RS)",
        content: "Attacker gains remote command execution. Detection: Unusual outbound connections + unauthorized SCADA commands. Impact: Complete system compromise. Mitigation: Firewall rules, application whitelisting."
      },
      {
        heading: "Brute Force (BF)",
        content: "Dictionary attacks on control system credentials. Detection: Failed login spikes + timing patterns. Impact: Account compromise. Mitigation: Rate limiting, MFA."
      },
      {
        heading: "Backdoor (BD)",
        content: "Persistent unauthorized access mechanism. Detection: Unusual privilege escalation + persistence artifacts. Impact: Long-term control. Mitigation: Regular security audits."
      },
      {
        heading: "Slow Injection Attacks",
        content: "Gradual measurement alterations over time. Detection: Temporal anomaly monitoring with exponential decay analysis. Harder to detect - requires extended observation windows (24-72 hours). Our system tracks voltage drift, frequency creep, load pattern shifts."
      }
    ]
  },
  "features": {
    title: "Features & Usage",
    icon: Zap,
    sections: [
      {
        heading: "Dashboard",
        content: "Real-time grid visualization with CP fusion metrics. View active alerts, performance statistics, and anomaly scores. Use DataRefreshControl to toggle automatic updates."
      },
      {
        heading: "Virtual Lab",
        content: "Safely simulate attacks on IEEE 14/30/118-bus topologies. Select attack type, duration, and target nodes. Observe GNN detection in real-time without affecting production systems."
      },
      {
        heading: "Online Learning Module",
        content: "Continuously adapts model to emerging threats. Tracks model updates, emerging patterns, and improvement in detection rate. Can be paused/resumed as needed. Export checkpoints for version control."
      },
      {
        heading: "Attack Localization",
        content: "Multi-task GNN learning identifies both attack location (which nodes) and type classification. Provides confidence scores for each prediction."
      },
      {
        heading: "SCADA Integration",
        content: "Native parsers for Modbus/TCP, DNP3, IEC 61850 GOOSE. Direct ingestion from PLCs and RTUs without manual PCAP conversion. Real-time feature normalization at <15ms latency."
      },
      {
        heading: "Hyper-Parameter Tuning",
        content: "Sequential grid search optimizes GNN layers, learning rate, batch size, dropout. Automatically finds best configuration for your grid topology. Results cached for reproducibility."
      },
      {
        heading: "Benchmark Comparison",
        content: "Compare GNN performance against SVM, ARIMA, FNN, LSTM-RNN, AEA. Shows GNN's 26% DR improvement with your operational data. Validates model superiority."
      }
    ]
  },
  "architecture": {
    title: "System Architecture",
    icon: Code2,
    sections: [
      {
        heading: "Data Pipeline",
        content: "SCADA Ingestion → Protocol Translation → Feature Normalization (Min-Max for numerical, One-Hot for protocol type) → Cyber-Physical Fusion (concatenate 9-dim vector) → GNN Model → Binary Classification (Attack/Normal)"
      },
      {
        heading: "GNN Model",
        content: "Chebyshev Graph Convolution with 3-5 stacked layers. Input: Fused features [cyber, physical] per node. Graph structure: Weighted adjacency matrix with physical weights (Wp), cyber weights (Wc), cross-weights (Wcp). Output: Sigmoid activation for probability."
      },
      {
        heading: "Distributed Processing",
        content: "For large grids (118-bus+): Hierarchical partitioning into regional zones → distribution areas → local clusters. Parallel GNN inference on each subgraph. 4.2x speedup on IEEE 118-bus vs monolithic model."
      },
      {
        heading: "Hardware Acceleration",
        content: "NVIDIA A100 GPU: 2.5x speedup. H100: 4.2x. TPU v4: 5.8x. Custom Graphcore chip: 6.5x. Chebyshev approximation optimized for tensor operations."
      },
      {
        heading: "Real-Time Performance",
        content: "Target: 80+ samples/sec. Current: 45+ with GPU. Inference latency: ~12ms. Memory: 145MB model + buffers. Handles sub-second update windows for critical infrastructure."
      }
    ]
  },
  "configuration": {
    title: "Configuration & Deployment",
    icon: Shield,
    sections: [
      {
        heading: "Critical Node Selection",
        content: "Use AHP-based scoring to identify top 35% nodes by vulnerability. Factors: effective graph resistance, load shedding impact, connectivity, geodesic vulnerability. Partial observability reduces monitoring costs while maintaining 98%+ DR."
      },
      {
        heading: "Protocol Selection",
        content: "Choose from: Modbus/TCP (testbed default), DNP3 (legacy utilities), IEC 61850 GOOSE (modern substations). System auto-detects and parses incoming data streams. Supports mixed environments."
      },
      {
        heading: "Online Learning Settings",
        content: "Enable/disable adaptive learning. Adjust model update frequency (default: every 500 samples). Set emerging pattern confidence threshold (default: 80%). Export checkpoints periodically."
      },
      {
        heading: "Hyper-Parameter Optimization",
        content: "Run sequential grid search on your topology: 4 GNN layers × 8 learning rates × 4 batch sizes × 5 dropout rates = 640 configurations. Estimated time: 18 hours for IEEE 14-bus."
      },
      {
        heading: "Deployment Size",
        content: "IEEE 14-bus: 14 nodes, 6 cyber features, ~12ms inference. IEEE 30-bus: 30 nodes, enhanced monitoring. IEEE 118-bus: requires hierarchical partitioning, distributed GNN."
      }
    ]
  }
};

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("getting-started");

  const currentTab = wikiContent[selectedTab as keyof typeof wikiContent];
  const CurrentIcon = currentTab.icon;

  const filteredSections = currentTab.sections.filter(
    (section) =>
      section.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-primary/5 to-background p-4 space-y-4">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Vertex Fusion Wiki
          </h1>
        </div>
        <p className="text-muted-foreground mb-6">Comprehensive documentation and guide for your GNN-powered intrusion detection system</p>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documentation..."
            className="pl-10 fade-in-up"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-wiki-search"
          />
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full flex-1">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          {Object.entries(wikiContent).map(([key, value]) => {
            const TabIcon = value.icon;
            return (
              <TabsTrigger key={key} value={key} data-testid={`tab-wiki-${key}`}>
                <TabIcon className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">{value.title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="flex-1 overflow-auto">
          <div className="space-y-4">
            {filteredSections.length > 0 ? (
              filteredSections.map((section, i) => (
                <Card key={i} className="border-primary/20 hover-elevate fade-in-up">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {section.heading}
                      <Badge variant="outline" className="ml-auto text-xs">
                        {currentTab.title}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                      {section.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-primary/20">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No results found for "{searchQuery}"
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
