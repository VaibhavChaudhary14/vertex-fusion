import { useState } from "react";
import { KnowledgeBase } from "@/components/KnowledgeBase";
import type { KnowledgeArticle } from "@shared/schema";

const mockArticles: KnowledgeArticle[] = [
  {
    id: "1",
    title: "False Data Injection (FDI) Attacks",
    category: "attacks",
    subcategory: "Data Integrity",
    content: `
      <h2>Overview</h2>
      <p>False Data Injection (FDI) attacks target the state estimation process in power systems by injecting carefully crafted malicious measurements that bypass bad data detection mechanisms.</p>
      
      <h2>Attack Mechanism</h2>
      <p>Attackers construct attack vectors that satisfy the power flow equations, making them undetectable by traditional bad data detection methods. The attack vector <strong>a</strong> is designed such that:</p>
      <ul>
        <li>a = Hc, where H is the measurement matrix and c is an arbitrary non-zero vector</li>
        <li>The injected measurements appear statistically consistent with the system model</li>
        <li>State estimation residuals remain below detection thresholds</li>
      </ul>
      
      <h2>Impact on Power Systems</h2>
      <ul>
        <li>Incorrect state estimation leading to suboptimal dispatch</li>
        <li>Economic losses through market manipulation</li>
        <li>Physical damage from incorrect control actions</li>
        <li>Cascade failures if multiple buses are targeted</li>
      </ul>
      
      <h2>Detection with GNN</h2>
      <p>GNN-based detection leverages the graph structure of power systems to identify anomalous patterns that single-node analysis misses. By fusing cyber and physical features, the GNN can detect subtle correlations between network traffic and measurement deviations.</p>
      
      <h2>Mitigation Strategies</h2>
      <ul>
        <li>Deploy PMUs for redundant high-accuracy measurements</li>
        <li>Implement cryptographic authentication for measurement units</li>
        <li>Use distributed state estimation with cross-validation</li>
        <li>Apply machine learning-based anomaly detection</li>
      </ul>
    `,
    tags: ["FDI", "state estimation", "data integrity", "SCADA"],
    relatedArticles: ["2", "5"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Ransomware Attacks on Industrial Control Systems",
    category: "attacks",
    subcategory: "Malware",
    content: `
      <h2>Overview</h2>
      <p>Ransomware targeting industrial control systems (ICS) represents one of the most disruptive cyber threats to power grid operations. Unlike traditional IT ransomware, ICS-focused variants can cause physical consequences.</p>
      
      <h2>Attack Vectors</h2>
      <ul>
        <li>Phishing emails targeting control room operators</li>
        <li>Exploitation of unpatched HMI systems</li>
        <li>Compromised remote access connections</li>
        <li>Supply chain attacks through vendor software</li>
      </ul>
      
      <h2>Notable Incidents</h2>
      <p>The 2021 Colonial Pipeline attack demonstrated how ransomware can indirectly impact critical infrastructure operations. For power grids, direct attacks on SCADA systems could prevent operators from monitoring and controlling the grid.</p>
      
      <h2>GNN Detection Approach</h2>
      <p>Ransomware attacks generate distinctive cyber signatures in network traffic patterns. The GNN model excels at detecting these patterns because:</p>
      <ul>
        <li>Abnormal communication patterns between PLCs and HMIs</li>
        <li>Unusual file access and encryption activities</li>
        <li>Lateral movement across the OT network</li>
        <li>Command and control (C2) traffic to external servers</li>
      </ul>
      
      <h2>Prevention and Response</h2>
      <ul>
        <li>Maintain offline backups of critical configuration data</li>
        <li>Segment OT networks from IT networks</li>
        <li>Implement application whitelisting on HMI systems</li>
        <li>Conduct regular incident response drills</li>
      </ul>
    `,
    tags: ["ransomware", "malware", "ICS", "SCADA", "incident response"],
    relatedArticles: ["1", "3"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    title: "Reverse Shell Attacks",
    category: "attacks",
    subcategory: "Remote Access",
    content: `
      <h2>Overview</h2>
      <p>A reverse shell attack establishes an outbound connection from a compromised system to an attacker-controlled server, bypassing firewall restrictions that typically block inbound connections.</p>
      
      <h2>Attack Process</h2>
      <ol>
        <li>Attacker gains initial access to a target system (e.g., PLC, HMI)</li>
        <li>Malicious payload initiates outbound connection to attacker's server</li>
        <li>Attacker receives interactive shell access to the compromised system</li>
        <li>Commands are executed with the privileges of the compromised process</li>
      </ol>
      
      <h2>Detection Challenges</h2>
      <p>Reverse shells are difficult to detect because:</p>
      <ul>
        <li>They use common protocols (HTTP, HTTPS, DNS)</li>
        <li>Traffic appears as legitimate outbound connections</li>
        <li>Encrypted channels hide command content</li>
        <li>Traffic patterns can mimic normal application behavior</li>
      </ul>
      
      <h2>GNN-Based Detection</h2>
      <p>The GNN model identifies reverse shells by analyzing the graph of network communications and correlating with physical system behavior. Anomalies include:</p>
      <ul>
        <li>New edges in the communication graph to unknown destinations</li>
        <li>Timing patterns inconsistent with legitimate control traffic</li>
        <li>Physical changes not correlated with expected control commands</li>
      </ul>
    `,
    tags: ["reverse shell", "remote access", "network security", "C2"],
    relatedArticles: ["2", "4"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    title: "Brute Force Attacks",
    category: "attacks",
    subcategory: "Authentication",
    content: `
      <h2>Overview</h2>
      <p>Brute force attacks attempt to gain unauthorized access by systematically trying all possible password combinations or using dictionaries of common passwords.</p>
      
      <h2>Targets in Power Systems</h2>
      <ul>
        <li>SCADA server login interfaces</li>
        <li>HMI workstation credentials</li>
        <li>PLC programming interfaces</li>
        <li>Remote access VPNs</li>
        <li>Web-based energy management systems</li>
      </ul>
      
      <h2>Attack Variants</h2>
      <ul>
        <li><strong>Simple Brute Force:</strong> Trying all combinations sequentially</li>
        <li><strong>Dictionary Attack:</strong> Using lists of common passwords</li>
        <li><strong>Credential Stuffing:</strong> Using leaked username/password pairs</li>
        <li><strong>Password Spraying:</strong> Few passwords against many accounts</li>
      </ul>
      
      <h2>Detection Indicators</h2>
      <p>The GNN model detects brute force attacks through cyber features including:</p>
      <ul>
        <li>High volume of authentication attempts from single sources</li>
        <li>Sequential or patterned login attempts</li>
        <li>Attempts outside normal operating hours</li>
        <li>Multiple failed logins followed by successful access</li>
      </ul>
    `,
    tags: ["brute force", "authentication", "credentials", "password"],
    relatedArticles: ["3", "5"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    title: "Backdoor Attacks",
    category: "attacks",
    subcategory: "Persistence",
    content: `
      <h2>Overview</h2>
      <p>Backdoors are hidden access points installed by attackers to maintain persistent access to compromised systems, often surviving reboots and security updates.</p>
      
      <h2>Types of Backdoors</h2>
      <ul>
        <li><strong>Software Backdoors:</strong> Modified executables or services</li>
        <li><strong>Firmware Backdoors:</strong> Modifications to device firmware</li>
        <li><strong>Configuration Backdoors:</strong> Hidden admin accounts or ports</li>
        <li><strong>Supply Chain Backdoors:</strong> Pre-installed in vendor software</li>
      </ul>
      
      <h2>Persistence Mechanisms</h2>
      <ul>
        <li>Modified startup scripts and services</li>
        <li>Registry modifications (Windows systems)</li>
        <li>Cron jobs or scheduled tasks</li>
        <li>Rootkits hiding backdoor processes</li>
      </ul>
      
      <h2>Detection with GNN</h2>
      <p>Backdoors often exhibit subtle behavioral anomalies detectable by the GNN:</p>
      <ul>
        <li>Unexpected network connections at irregular intervals</li>
        <li>Processes communicating with unusual endpoints</li>
        <li>System behavior changes not correlated with operator actions</li>
        <li>File system modifications without authorized changes</li>
      </ul>
    `,
    tags: ["backdoor", "persistence", "APT", "covert access"],
    relatedArticles: ["2", "3"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    title: "Graph Neural Networks for Power Systems",
    category: "gnn",
    subcategory: "Architecture",
    content: `
      <h2>Why GNNs for Power Systems?</h2>
      <p>Power systems are inherently graph-structured, with buses (nodes) connected by transmission lines (edges). Traditional neural networks designed for grid-structured data (images) or sequential data (text) fail to capture this topology.</p>
      
      <h2>Chebyshev Graph Convolution</h2>
      <p>The GridGuardian AI model uses Chebyshev spectral graph convolutions, which approximate localized filters on graphs using Chebyshev polynomials:</p>
      <pre>X^(l) = ReLU(μ^(l) *_G X^(l-1) + b^(l))</pre>
      <p>Where μ represents learned Chebyshev coefficients and *_G denotes the graph convolution operation.</p>
      
      <h2>Multi-Layer Architecture</h2>
      <p>The model stacks multiple Chebyshev convolution layers followed by a dense classification layer:</p>
      <ol>
        <li>Input: Fused cyber-physical features X_cp</li>
        <li>Multiple graph convolution layers with ReLU activation</li>
        <li>Dense layer with softmax for binary classification</li>
        <li>Output: Probability of Benign vs. Malicious</li>
      </ol>
      
      <h2>Spatial-Temporal Dependencies</h2>
      <p>The GNN captures spatial dependencies through the graph structure and temporal dependencies through the feature vectors, which include time-series measurements from physical sensors and network logs.</p>
      
      <h2>Advantages Over Traditional Methods</h2>
      <ul>
        <li>Naturally handles variable-size graphs (different topologies)</li>
        <li>Captures multi-hop neighborhood information</li>
        <li>Scales to large power systems (IEEE 118-bus)</li>
        <li>Robust to partial observability conditions</li>
      </ul>
    `,
    tags: ["GNN", "Chebyshev", "graph convolution", "deep learning"],
    relatedArticles: ["7", "8"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "7",
    title: "Cyber-Physical Data Fusion",
    category: "gnn",
    subcategory: "Data Processing",
    content: `
      <h2>The Fusion Approach</h2>
      <p>Cyber-physical fusion combines features from both the cyber domain (network traffic) and the physical domain (power measurements) to provide a comprehensive view of system state.</p>
      
      <h2>Cyber Features (X_c)</h2>
      <p>Features extracted from network logs and traffic analysis:</p>
      <ul>
        <li>Source and destination IP addresses</li>
        <li>Port numbers and protocols</li>
        <li>Packet sizes and inter-arrival times</li>
        <li>Connection durations and states</li>
        <li>Authentication events and failures</li>
      </ul>
      
      <h2>Physical Features (X_p)</h2>
      <p>Features from SCADA/PMU measurements:</p>
      <ul>
        <li>Bus voltages (magnitude and angle)</li>
        <li>Active and reactive power flows</li>
        <li>Generator outputs and frequency</li>
        <li>Load consumption patterns</li>
        <li>Circuit breaker states</li>
      </ul>
      
      <h2>Fusion Benefits</h2>
      <p>Research shows that cyber-physical fusion improves detection rate by up to 16% compared to single-modal approaches:</p>
      <ul>
        <li>Cyber features are more effective for RW, BF, RS, and BD attacks</li>
        <li>Physical features are more effective for FDI attacks</li>
        <li>Combined features provide comprehensive coverage</li>
      </ul>
      
      <h2>Graph Modeling</h2>
      <p>The fused system is modeled as a weighted graph G=(V,E,W) where:</p>
      <ul>
        <li>V: Heterogeneous nodes (physical buses + cyber devices)</li>
        <li>E: Intra-layer edges (physical lines, cyber connections) + inter-layer coupling edges</li>
        <li>W: Weighted adjacency matrix reflecting connection strengths</li>
      </ul>
    `,
    tags: ["fusion", "multimodal", "SCADA", "network traffic"],
    relatedArticles: ["6", "8"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "8",
    title: "SCADA Systems Overview",
    category: "protocols",
    subcategory: "Control Systems",
    content: `
      <h2>What is SCADA?</h2>
      <p>Supervisory Control and Data Acquisition (SCADA) systems monitor and control industrial processes, including power generation, transmission, and distribution.</p>
      
      <h2>SCADA Architecture</h2>
      <ul>
        <li><strong>Field Devices:</strong> Sensors, actuators, PLCs, RTUs</li>
        <li><strong>Communication Network:</strong> Connects field devices to control center</li>
        <li><strong>Master Station:</strong> HMI, historian, application servers</li>
        <li><strong>Remote Sites:</strong> Substations with local automation</li>
      </ul>
      
      <h2>Common SCADA Protocols</h2>
      <ul>
        <li><strong>Modbus TCP/IP:</strong> Simple, widely used in legacy systems</li>
        <li><strong>DNP3:</strong> Distributed Network Protocol for utilities</li>
        <li><strong>IEC 61850:</strong> Modern substation automation standard</li>
        <li><strong>IEC 60870-5-104:</strong> Telecontrol protocol over TCP/IP</li>
      </ul>
      
      <h2>Security Challenges</h2>
      <ul>
        <li>Legacy protocols lack authentication and encryption</li>
        <li>Air-gapped networks increasingly connected to IT</li>
        <li>Long equipment lifecycles with infrequent patching</li>
        <li>Limited visibility into OT network traffic</li>
      </ul>
      
      <h2>Role in GNN Detection</h2>
      <p>SCADA data provides critical physical features for the GNN model, including real-time measurements and control commands that reveal the true state of the power system.</p>
    `,
    tags: ["SCADA", "ICS", "OT", "control systems", "RTU", "PLC"],
    relatedArticles: ["9", "10"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "9",
    title: "Modbus/TCP Protocol",
    category: "protocols",
    subcategory: "Communication",
    content: `
      <h2>Protocol Overview</h2>
      <p>Modbus is a serial communication protocol developed in 1979 for PLCs. Modbus/TCP adapts it for Ethernet networks, encapsulating Modbus frames in TCP/IP packets.</p>
      
      <h2>Message Structure</h2>
      <ul>
        <li><strong>Transaction ID:</strong> Matches requests to responses</li>
        <li><strong>Protocol ID:</strong> Always 0 for Modbus</li>
        <li><strong>Length:</strong> Number of following bytes</li>
        <li><strong>Unit ID:</strong> Slave address</li>
        <li><strong>Function Code:</strong> Operation to perform</li>
        <li><strong>Data:</strong> Address and values</li>
      </ul>
      
      <h2>Common Function Codes</h2>
      <ul>
        <li>01: Read Coils (discrete outputs)</li>
        <li>02: Read Discrete Inputs</li>
        <li>03: Read Holding Registers</li>
        <li>04: Read Input Registers</li>
        <li>05: Write Single Coil</li>
        <li>06: Write Single Register</li>
        <li>16: Write Multiple Registers</li>
      </ul>
      
      <h2>Security Concerns</h2>
      <ul>
        <li>No authentication - any device can send commands</li>
        <li>No encryption - traffic can be sniffed</li>
        <li>No integrity checking beyond simple CRC</li>
        <li>Vulnerable to replay and man-in-the-middle attacks</li>
      </ul>
    `,
    tags: ["Modbus", "TCP/IP", "PLC", "communication"],
    relatedArticles: ["8", "10"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "10",
    title: "IEC 61850 Standard",
    category: "protocols",
    subcategory: "Communication",
    content: `
      <h2>Overview</h2>
      <p>IEC 61850 is an international standard for communication networks and systems in substations. It provides a common framework for device interoperability and data modeling.</p>
      
      <h2>Key Features</h2>
      <ul>
        <li><strong>Object-Oriented Data Model:</strong> Logical nodes representing functions</li>
        <li><strong>Abstract Communication Service Interface (ACSI):</strong> Standard services</li>
        <li><strong>Manufacturing Message Specification (MMS):</strong> Client-server communication</li>
        <li><strong>GOOSE:</strong> Generic Object Oriented Substation Event for peer-to-peer</li>
        <li><strong>Sampled Values:</strong> Real-time measurement streaming</li>
      </ul>
      
      <h2>Communication Services</h2>
      <ul>
        <li>GetDataValues / SetDataValues</li>
        <li>Report and logging services</li>
        <li>GOOSE for protection and control</li>
        <li>Sampled Values for measurements</li>
      </ul>
      
      <h2>Security Considerations</h2>
      <p>IEC 62351 provides security extensions for IEC 61850:</p>
      <ul>
        <li>TLS for transport layer security</li>
        <li>Authentication for GOOSE and SV</li>
        <li>Role-based access control</li>
        <li>Audit logging and intrusion detection</li>
      </ul>
      
      <h2>Relevance to GNN Detection</h2>
      <p>GOOSE messages are particularly relevant for detecting attacks like FDI, as they carry protection commands that attackers may try to manipulate.</p>
    `,
    tags: ["IEC 61850", "GOOSE", "MMS", "substation automation"],
    relatedArticles: ["8", "9"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function Knowledge() {
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Knowledge Base</h1>
        <p className="text-sm text-muted-foreground">
          Learn about attack types, GNN theory, and smart grid protocols
        </p>
      </div>

      <KnowledgeBase
        articles={mockArticles}
        onArticleSelect={setSelectedArticle}
        selectedArticle={selectedArticle}
      />
    </div>
  );
}
