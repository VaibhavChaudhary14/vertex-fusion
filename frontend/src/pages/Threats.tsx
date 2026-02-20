import { ThreatFeed } from "@/components/ThreatFeed";
import type { ThreatFeed as ThreatFeedType } from "@shared/schema";

const mockThreats: ThreatFeedType[] = [
  {
    id: "1",
    title: "CISA Releases Advisory on Industrial Control System Vulnerabilities",
    summary: "Multiple vulnerabilities discovered in widely-used SCADA software could allow remote code execution. Patches available for most vendors.",
    source: "CISA",
    sourceUrl: "https://www.cisa.gov/",
    severity: "critical",
    category: "Vulnerability",
    publishedAt: new Date(Date.now() - 3600000),
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "New Ransomware Variant Targeting Energy Sector OT Networks",
    summary: "Security researchers identify new malware family specifically designed to propagate through industrial protocols and encrypt HMI systems.",
    source: "Dragos",
    sourceUrl: "https://www.dragos.com/",
    severity: "high",
    category: "Malware",
    publishedAt: new Date(Date.now() - 7200000),
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "APT Group Shifts Focus to Power Grid Infrastructure",
    summary: "Nation-state threat actor previously targeting financial sector now observed probing utility company networks in North America and Europe.",
    source: "Mandiant",
    sourceUrl: "https://www.mandiant.com/",
    severity: "high",
    category: "Threat Intelligence",
    publishedAt: new Date(Date.now() - 14400000),
    createdAt: new Date(),
  },
  {
    id: "4",
    title: "IEEE Publishes Updated Cybersecurity Framework for Smart Grids",
    summary: "New guidelines address emerging threats including AI-powered attacks and provide recommendations for GNN-based intrusion detection systems.",
    source: "IEEE",
    sourceUrl: "https://www.ieee.org/",
    severity: "low",
    category: "Standards",
    publishedAt: new Date(Date.now() - 86400000),
    createdAt: new Date(),
  },
  {
    id: "5",
    title: "Modbus Vulnerability Allows Unauthorized Write Commands",
    summary: "Legacy Modbus implementations found vulnerable to command injection. Affects thousands of PLCs in power substations worldwide.",
    source: "ICS-CERT",
    sourceUrl: "https://www.cisa.gov/ics-cert",
    severity: "medium",
    category: "Vulnerability",
    publishedAt: new Date(Date.now() - 172800000),
    createdAt: new Date(),
  },
  {
    id: "6",
    title: "Phishing Campaign Targets Power Utility Employees",
    summary: "Sophisticated spear-phishing emails impersonating grid operators aim to harvest credentials for SCADA system access.",
    source: "Proofpoint",
    sourceUrl: "https://www.proofpoint.com/",
    severity: "medium",
    category: "Social Engineering",
    publishedAt: new Date(Date.now() - 259200000),
    createdAt: new Date(),
  },
  {
    id: "7",
    title: "Supply Chain Attack Compromises ICS Vendor Update Server",
    summary: "Malicious code injected into firmware updates distributed by major industrial control system vendor. Rollback patches available.",
    source: "SecurityWeek",
    sourceUrl: "https://www.securityweek.com/",
    severity: "critical",
    category: "Supply Chain",
    publishedAt: new Date(Date.now() - 345600000),
    createdAt: new Date(),
  },
  {
    id: "8",
    title: "Research: Machine Learning Models Vulnerable to Adversarial Attacks",
    summary: "Academic study demonstrates how attackers can craft inputs to fool GNN-based intrusion detection systems. Defensive techniques proposed.",
    source: "arXiv",
    sourceUrl: "https://arxiv.org/",
    severity: "medium",
    category: "Research",
    publishedAt: new Date(Date.now() - 432000000),
    createdAt: new Date(),
  },
];

export default function Threats() {
  return (
    <div className="p-4 h-full overflow-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Threat Intelligence Feed</h1>
        <p className="text-sm text-muted-foreground">
          AI-curated cybersecurity news and alerts relevant to smart power grids
        </p>
      </div>

      <ThreatFeed threats={mockThreats} />
    </div>
  );
}
