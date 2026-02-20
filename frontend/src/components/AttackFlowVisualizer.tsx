import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const fdiFlowSteps = [
  {
    step: 1,
    name: "Initial Reconnaissance",
    desc: "Attacker scans network for SCADA devices and protocol endpoints",
    duration: "5-30 min",
    color: "amber"
  },
  {
    step: 2,
    name: "ARP Spoofing Attack",
    desc: "Attacker poisons ARP table to redirect Modbus/TCP traffic",
    duration: "< 1 sec",
    color: "orange"
  },
  {
    step: 3,
    name: "Man-in-the-Middle Position",
    desc: "Attacker intercepts communication between control center and PLC",
    duration: "Continuous",
    color: "red"
  },
  {
    step: 4,
    name: "Fake PLC Deployment",
    desc: "Attacker sets up rogue PLC to forward modified Modbus commands",
    duration: "< 5 sec",
    color: "red"
  },
  {
    step: 5,
    name: "FDI Injection",
    desc: "Attacker injects false data into sensor readings (voltage, current, power)",
    duration: "Continuous",
    color: "red"
  },
  {
    step: 6,
    name: "Circuit Breaker Disablement",
    desc: "Compromised control signals disable protective relays and breakers",
    duration: "< 2 sec",
    color: "red"
  },
  {
    step: 7,
    name: "Grid Disruption",
    desc: "Cascade failure due to unprotected overcurrent conditions",
    duration: "Milliseconds",
    color: "destructive"
  },
];

const ransomwareFlowSteps = [
  {
    step: 1,
    name: "Phishing Campaign",
    desc: "Attacker targets operator credentials via email/social engineering",
    duration: "Minutes",
    color: "amber"
  },
  {
    step: 2,
    name: "Credential Compromise",
    desc: "Operator unknowingly provides access credentials",
    duration: "Immediate",
    color: "orange"
  },
  {
    step: 3,
    name: "VPN/Remote Access Exploitation",
    desc: "Attacker uses credentials to access SCADA network remotely",
    duration: "< 1 min",
    color: "red"
  },
  {
    step: 4,
    name: "Malware Propagation",
    desc: "Ransomware deployed across HMI and control servers",
    duration: "1-5 min",
    color: "red"
  },
  {
    step: 5,
    name: "Encryption & Lockdown",
    desc: "Critical files encrypted; operators locked out of systems",
    duration: "< 1 min",
    color: "destructive"
  },
];

function AttackFlowStep({ step, attack }: { step: any; attack: string }) {
  const colorMap = {
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-600",
    orange: "bg-orange-500/10 border-orange-500/30 text-orange-600",
    red: "bg-red-500/10 border-red-500/30 text-red-600",
    destructive: "bg-destructive/10 border-destructive/30 text-destructive",
  };

  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center gap-2">
        <Badge className={`w-8 h-8 flex items-center justify-center rounded-full ${colorMap[step.color] || ''}`}>
          {step.step}
        </Badge>
        {step.step < (attack === 'fdi' ? 7 : 5) && (
          <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
        )}
      </div>
      <div className="flex-1 p-4 border rounded-lg bg-card">
        <h4 className="font-semibold mb-1">{step.name}</h4>
        <p className="text-sm text-muted-foreground mb-2">{step.desc}</p>
        <p className="text-xs font-mono text-muted-foreground">Duration: {step.duration}</p>
      </div>
    </div>
  );
}

export function AttackFlowVisualizer() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Attack Flow Visualizer</h2>
        <p className="text-muted-foreground">Step-by-step attack propagation for training and forensic analysis</p>
      </div>

      {/* FDI Attack Flow */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-red-600">CRITICAL</Badge>
            False Data Injection (FDI) Attack Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {fdiFlowSteps.map((step) => (
              <AttackFlowStep key={step.step} step={step} attack="fdi" />
            ))}
          </div>
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm font-semibold text-red-600 mb-2">Impact</p>
            <ul className="text-sm space-y-1">
              <li>• Manipulated measurements bypass operator awareness</li>
              <li>• Protective relays respond to false sensor data</li>
              <li>• Cascade blackouts across dependent substations</li>
              <li>• Potential infrastructure damage and safety hazards</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Ransomware Attack Flow */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-red-600">CRITICAL</Badge>
            Ransomware (RW) Attack Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {ransomwareFlowSteps.map((step) => (
              <AttackFlowStep key={step.step} step={step} attack="ransomware" />
            ))}
          </div>
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm font-semibold text-red-600 mb-2">Impact</p>
            <ul className="text-sm space-y-1">
              <li>• Operators unable to manually control systems</li>
              <li>• Loss of situational awareness on network state</li>
              <li>• Forced shutdown or risky recovery procedures</li>
              <li>• Extended outages without proper remediation</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* GNN Detection Points */}
      <Card>
        <CardHeader>
          <CardTitle>GNN-IDS Detection Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border border-green-500/30 bg-green-500/5 rounded-lg">
              <p className="font-semibold text-green-600 mb-2">FDI Detection</p>
              <ul className="text-sm space-y-1">
                <li>✓ Step 2: ARP anomalies (cyber layer)</li>
                <li>✓ Step 5: Voltage/current inconsistencies (physical layer)</li>
                <li>✓ Graph correlation: Physical-cyber mismatch</li>
              </ul>
            </div>
            <div className="p-4 border border-green-500/30 bg-green-500/5 rounded-lg">
              <p className="font-semibold text-green-600 mb-2">RW Detection</p>
              <ul className="text-sm space-y-1">
                <li>✓ Step 3: Network access patterns (cyber layer)</li>
                <li>✓ Step 4: Malware signatures (cyber layer)</li>
                <li>✓ Network graph anomalies and behavior shift</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SCADA Protocol Details */}
      <Card>
        <CardHeader>
          <CardTitle>SCADA Protocol Vulnerabilities Exploited</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              protocol: "Modbus/TCP",
              weakness: "No authentication or encryption",
              mitigation: "Monitor anomalous command sequences"
            },
            {
              protocol: "DNP3",
              weakness: "Cleartext authentication",
              mitigation: "Detect unexpected control center commands"
            },
            {
              protocol: "IEC 61850",
              weakness: "Limited cyber-physical correlation",
              mitigation: "Fused anomaly detection across layers"
            },
          ].map((item, i) => (
            <div key={i} className="p-3 border rounded-lg">
              <p className="font-semibold text-sm mb-1">{item.protocol}</p>
              <p className="text-xs text-muted-foreground mb-2">Weakness: {item.weakness}</p>
              <p className="text-xs text-green-600">✓ GNN Mitigation: {item.mitigation}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
