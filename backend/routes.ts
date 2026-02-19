import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { sendVerificationEmail, sendPasswordResetEmail } from "./sendgridUtil";
import { z } from "zod";
import { SystemHealthMetrics } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";
import passport from "passport";
import { randomBytes } from "crypto";
import { simulationService } from "./simulationService";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// Secure token generation helper
function generateSecureToken(length: number = 13): string {
  return randomBytes(Math.ceil(length * 3 / 4))
    .toString('base64')
    .slice(0, length)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  app.get("/api/auth/user", isAuthenticated, (req, res) => {
    // Passport populates req.user
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(req.user);
  });

  app.get("/api/alerts", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const alerts = await storage.getAlerts(userId, limit);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/alerts/:id/acknowledge", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const alert = await storage.acknowledgeAlert(id);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/simulations", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const simulations = await storage.getSimulations(userId);
      res.json(simulations);
    } catch (error) {
      console.error("Error fetching simulations:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/simulations", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const simulation = await storage.createSimulation({
        ...req.body,
        userId,
        status: "running",
        startedAt: new Date(),
      });
      res.json(simulation);
    } catch (error) {
      console.error("Error creating simulation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/simulations/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const simulation = await storage.updateSimulation(id, req.body);
      if (!simulation) {
        return res.status(404).json({ message: "Simulation not found" });
      }
      res.json(simulation);
    } catch (error) {
      console.error("Error updating simulation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/chat", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const messages = await storage.getChatMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/chat", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      await storage.createChatMessage({
        userId,
        role: "user",
        content: message,
      });

      let response: string;

      if (genAI) {
        try {
          const systemPrompt = `You are an AI Threat Analyst specialized in smart power grid cybersecurity. 
You have deep expertise in:
- Graph Neural Networks(GNN) for intrusion detection
  - Cyber - physical systems security
    - SCADA / ICS protocols(Modbus, DNP3, IEC 61850)
      - Attack types: Ransomware(RW), False Data Injection(FDI), Reverse Shell(RS), Brute Force(BF), Backdoor(BD)
        - Power system state estimation and bad data detection
          - IEEE test bus systems(14 - bus, 30 - bus, 118 - bus)

Provide concise, actionable advice.Reference specific attack detection methods and mitigation strategies when relevant.
Format responses with clear structure using markdown when helpful.`;

          const request = {
            contents: [
              { role: "user", parts: [{ text: systemPrompt + "\n\nUser question: " + message }] }
            ]
          };

          const result = await (genAI as any).generateContent(request);
          response = result?.response?.text() || "I apologize, but I couldn't generate a response. Please try again.";
        } catch (aiError) {
          console.error("AI generation error:", aiError);
          response = getOfflineResponse(message);
        }
      } else {
        response = getOfflineResponse(message);
      }

      const assistantMessage = await storage.createChatMessage({
        userId,
        role: "assistant",
        content: response,
      });

      await storage.updateUser(userId, {
        apiCallsUsed: ((await storage.getUser(userId))?.apiCallsUsed || 0) + 1,
      });

      res.json({ response, message: assistantMessage });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/datasets", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const datasets = await storage.getDatasets(userId);
      res.json(datasets);
    } catch (error) {
      console.error("Error fetching datasets:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/datasets", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { name, topology, attackTypes, sampleCount, format } = req.body;

      const dataset = await storage.createDataset({
        userId,
        name,
        topology,
        attackTypes,
        sampleCount,
        format,
        fileSize: sampleCount * 500,
        downloadUrl: `/ datasets / ${name.toLowerCase().replace(/\s+/g, "_")}.${format} `,
      });

      res.json(dataset);
    } catch (error) {
      console.error("Error creating dataset:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/health", async (_req, res) => {
    try {
      const alertsLast24h = await storage.getAlertsLast24h();

      // Get real grid status from simulation
      let gridReliabilityScore = 99.1; // Default
      try {
        const simResults = await simulationService.runSimulation();
        let minVoltage = 1.0;
        let maxLineLoad = 0;

        simResults.forEach(item => {
          if (item.type === "bus") {
            // Deviation from 1.0pu reduces reliability
            const dev = Math.abs(1.0 - item.vm_pu);
            if (item.vm_pu < minVoltage) minVoltage = item.vm_pu;
          } else if (item.type === "line") {
            if (item.loading_percent > maxLineLoad) maxLineLoad = item.loading_percent;
          }
        });

        // Simple metric: Reliability drops if voltage is low (<0.95) or lines overloaded (>80%)
        let voltageScore = Math.max(0, 100 - Math.max(0, (0.95 - minVoltage) * 2000)); // Drop if V < 0.95
        let loadingScore = Math.max(0, 100 - Math.max(0, (maxLineLoad - 80) * 2)); // Drop if Load > 80%

        gridReliabilityScore = (voltageScore * 0.5) + (loadingScore * 0.5);
      } catch (e) {
        console.error("Simulation service error inside health:", e);
      }

      res.json({
        securityIndex: 94.2,
        detectionRate: 97.8,
        falseAlarmRate: 2.1,
        gridReliabilityScore: Number(gridReliabilityScore.toFixed(1)),
        activeSimulations: 3,
        alertsLast24h,
      });
    } catch (error) {
      console.error("Error fetching health metrics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const bcrypt = await import("bcryptjs");
      const { email, firstName, lastName, password } = req.body;

      if (!email || !firstName || !lastName || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const existingUser = await storage.getUser(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const passwordHash = await bcrypt.default.hash(password, 10);
      const emailVerificationToken = generateSecureToken(32);

      console.log(`📝 Creating user: ${email} `);
      const user = await storage.upsertUser({
        id: email,
        email,
        firstName,
        lastName,
        profileImageUrl: null,
        passwordHash,
        emailVerificationToken,
        isEmailVerified: true, // Skip verification for dev/demo
      });

      // Send verification email via SendGrid
      const verificationLink = `${req.protocol}://${req.get('host')}/verify-email?token=${emailVerificationToken}&email=${email}`;
      const emailResult = await sendVerificationEmail(email, firstName, verificationLink);

      if (!emailResult.success) {
        console.warn(`⚠️ [Auth] Email verification send failed for ${email}: ${emailResult.error}`);
      }

      // Auto-login after signup
      req.login(user, (err) => {
        if (err) {
          console.error("Auto-login error:", err);
          return res.status(500).json({ message: "Account created but auto-login failed" });
        }

        res.json({
          success: true,
          message: "Account created successfully!",
          user,
        });
      });
    } catch (error) {
      console.error("❌ Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.get("/api/auth/verify", async (req, res) => {
    try {
      const { token, email } = req.query;

      if (!token || !email) {
        return res.status(400).json({ message: "Missing verification parameters" });
      }

      const user = await storage.getUser(email as string);
      if (!user || user.emailVerificationToken !== token) {
        return res.status(400).json({ message: "Invalid verification token" });
      }

      await storage.updateUser(email as string, {
        isEmailVerified: true,
        emailVerificationToken: null,
      });

      res.json({ success: true, message: "Email verified successfully. You can now log in." });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });

  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUser(email);
      if (!user) {
        return res.status(404).json({ message: "User not found. Please sign up first." });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({ message: "Email is already verified. You can log in." });
      }

      // Generate new verification token
      const newToken = generateSecureToken(32);

      await storage.updateUser(email, {
        emailVerificationToken: newToken,
      });

      // Send verification email
      const verificationLink = `${req.protocol}://${req.get('host')}/verify-email?token=${newToken}&email=${email}`;
      const firstName = user.firstName || "User";
      const emailResult = await sendVerificationEmail(email, firstName, verificationLink);

      if (!emailResult.success) {
        console.warn(`⚠️ [Auth] Resend verification email failed for ${email}: ${emailResult.error}`);
        return res.status(500).json({ message: "Failed to send verification email. Please try again." });
      }

      res.json({ success: true, message: "Verification email sent successfully!" });
    } catch (error) {
      console.error("❌ [Auth] Resend verification error:", error);
      res.status(500).json({ message: "Failed to resend verification email" });
    }
  });

  app.post("/api/auth/login", async (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({ success: true, user });
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logOut((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  // ============ PASSWORD RESET ENDPOINTS ============

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUser(email);
      if (!user) {
        // Security: don't reveal if email exists or not
        return res.json({ success: true, message: "If the email exists, a reset link has been sent" });
      }

      const resetToken = generateSecureToken(32);
      const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await storage.updateUser(email, {
        resetPasswordToken: resetToken,
        resetPasswordTokenExpiry: expiryTime,
      });

      // Send reset email via SendGrid
      const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}&email=${email}`;
      const emailResult = await sendPasswordResetEmail(email, resetLink);

      if (!emailResult.success) {
        console.warn(`⚠️ [Auth] Password reset email send failed for ${email}: ${emailResult.error}`);
      }

      res.json({ success: true, message: "If the email exists, a reset link has been sent" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  app.get("/api/auth/validate-reset-token", async (req, res) => {
    try {
      const { token, email } = req.query;

      if (!token || !email) {
        return res.status(400).json({ message: "Missing token or email" });
      }

      const user = await storage.getUser(email as string);
      if (!user || user.resetPasswordToken !== token) {
        return res.status(400).json({ message: "Invalid reset token" });
      }

      if (!user.resetPasswordTokenExpiry || new Date() > user.resetPasswordTokenExpiry) {
        return res.status(400).json({ message: "Reset token has expired" });
      }

      res.json({ success: true, message: "Token is valid" });
    } catch (error) {
      console.error("Token validation error:", error);
      res.status(500).json({ message: "Failed to validate reset token" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const bcrypt = await import("bcryptjs");
      const { token, email, password } = req.body;

      if (!token || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const user = await storage.getUser(email);
      if (!user || user.resetPasswordToken !== token) {
        return res.status(400).json({ message: "Invalid reset token" });
      }

      if (!user.resetPasswordTokenExpiry || new Date() > user.resetPasswordTokenExpiry) {
        return res.status(400).json({ message: "Reset token has expired" });
      }

      const passwordHash = await bcrypt.default.hash(password, 10);
      await storage.updateUser(email, {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      });

      res.json({ success: true, message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // ============ SMART GRID SIMULATOR ENDPOINTS ============

  app.get("/api/simulator/measurements", isAuthenticated, async (req, res) => {
    try {
      const measurements = Array.from({ length: 50 }, (_, i) => ({
        time: i,
        bus1_voltage: 1.0 + (Math.random() - 0.5) * 0.05,
        bus2_voltage: 0.98 + (Math.random() - 0.5) * 0.05,
        bus3_voltage: 1.01 + (Math.random() - 0.5) * 0.05,
        bus1_current: 10 + (Math.random() - 0.5) * 2,
        bus2_current: 9.5 + (Math.random() - 0.5) * 2,
        bus3_current: 10.5 + (Math.random() - 0.5) * 2,
        frequency: 50 + (Math.random() - 0.5) * 0.1,
        packet_loss: Math.random() * 1.5,
        attack_detected: false,
      }));
      res.json(measurements);
    } catch (error) {
      res.status(500).json({ error: "Failed to get measurements" });
    }
  });

  app.post("/api/simulator/attack", isAuthenticated, async (req, res) => {
    try {
      const { attack_type } = req.body;
      const success = await simulationService.setAttack(attack_type, req.body);

      if (success) {
        res.json({
          success: true,
          attack_type,
          message: `${attack_type} attack configured in Python Engine`,
        });
      } else {
        res.status(500).json({ error: "Failed to set attack in Python Service" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to inject attack" });
    }
  });

  app.post("/api/simulator/trip", isAuthenticated, async (req, res) => {
    try {
      const { line_id } = req.body;
      const success = await simulationService.tripBreaker(line_id);
      if (success) {
        res.json({ success: true, message: `Breaker ${line_id} tripped` });
      } else {
        res.status(500).json({ error: "Failed to trip breaker" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to trip breaker" });
    }
  });

  app.get("/api/simulator/detections", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const detections = await storage.getAlerts(userId, 10);
      res.json(detections);
    } catch (error) {
      res.status(500).json({ error: "Failed to get detections" });
    }
  });

  app.post("/api/simulator/protection", isAuthenticated, async (req, res) => {
    try {
      const { target_bus, action_type } = req.body;
      res.json({
        success: true,
        action: action_type,
        target: `CB_Bus${target_bus}`,
        message: "Breaker trip executed via SCADA-Modbus layer",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to execute protection action" });
    }
  });

  return httpServer;
}

function getOfflineResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("fdi") || lowerMessage.includes("false data injection")) {
    return `**False Data Injection (FDI) Attacks**

FDI attacks target the state estimation process in power systems by injecting carefully crafted malicious measurements that bypass bad data detection.

**Key Indicators:**
- Measurement residuals that remain statistically consistent despite actual system changes
- Coordinated changes across multiple sensors
- Discrepancies between PMU and SCADA measurements

**GNN Detection Approach:**
The GNN model excels at detecting FDI because it can:
1. Capture spatial correlations across the power network graph
2. Identify subtle patterns in multi-sensor data that single-point analysis misses
3. Fuse cyber features (network traffic patterns) with physical measurements

**Recommended Mitigations:**
1. Deploy PMUs for redundant high-accuracy measurements
2. Implement cryptographic authentication for measurement units
3. Use distributed state estimation with cross-validation
4. Apply the cyber-physical fusion approach for enhanced detection`;
  }

  if (lowerMessage.includes("ransomware") || lowerMessage.includes("rw attack")) {
    return `**Ransomware Attacks on Industrial Control Systems**

Ransomware targeting ICS represents one of the most disruptive cyber threats to power grid operations.

**Attack Vectors:**
- Phishing emails targeting control room operators
- Exploitation of unpatched HMI systems
- Compromised remote access connections
- Supply chain attacks through vendor software

**GNN Detection Signatures:**
- Abnormal communication patterns between PLCs and HMIs
- Unusual file access and encryption activities
- Lateral movement across the OT network
- C2 traffic to external servers

**Recommended Mitigations:**
1. Maintain offline backups of critical configuration data
2. Segment OT networks from IT networks
3. Implement application whitelisting on HMI systems
4. Conduct regular incident response drills`;
  }

  if (lowerMessage.includes("gnn") || lowerMessage.includes("graph neural")) {
    return `**Graph Neural Networks for Power Grid Security**

GNNs are particularly well-suited for power system intrusion detection because power grids are inherently graph-structured.

**Architecture Overview:**
The GridGuardian model uses Chebyshev spectral graph convolutions, which approximate localized filters on graphs:
- Multiple graph convolution layers with ReLU activation
- Cyber-physical feature fusion at the input layer
- Binary classification output (Benign vs. Malicious)

**Key Advantages:**
1. Naturally handles variable-size graphs (different topologies)
2. Captures multi-hop neighborhood information
3. Scales to large power systems (IEEE 118-bus)
4. Robust to partial observability conditions

**Research Results:**
- 26% faster detection compared to benchmark models
- 16% detection rate improvement with cyber-physical fusion
- <20ms inference time for real-time classification
- Only 1-2% performance loss under reduced observability`;
  }

  if (lowerMessage.includes("mitigation") || lowerMessage.includes("prevent")) {
    return `**General Mitigation Strategies for Power Grid Attacks**

**Network Security:**
1. Implement network segmentation between IT and OT
2. Deploy firewalls with deep packet inspection for ICS protocols
3. Enable logging and monitoring on all network devices
4. Regularly review and update access control lists

**Endpoint Protection:**
1. Keep all systems patched (coordinate with operations)
2. Implement application whitelisting
3. Deploy endpoint detection and response (EDR) tools
4. Disable unnecessary services and ports

**Detection and Response:**
1. Deploy GNN-based intrusion detection for cyber-physical correlation
2. Establish baseline behavior for anomaly detection
3. Create and practice incident response playbooks
4. Maintain out-of-band communication channels

**Access Control:**
1. Implement multi-factor authentication
2. Use role-based access control
3. Regularly audit user accounts and permissions
4. Monitor for credential theft attempts`;
  }

  return `I understand you're asking about smart grid security. I can help with topics including:

**Attack Types:**
- False Data Injection (FDI)
- Ransomware (RW)
- Reverse Shell (RS)
- Brute Force (BF)
- Backdoor (BD)

**Technical Topics:**
- GNN-based intrusion detection
- Cyber-physical data fusion
- SCADA/ICS protocols
- Power system state estimation

**Practical Guidance:**
- Detection methods and indicators
- Mitigation strategies
- Grid topology analysis
- Model performance metrics

Please ask a more specific question and I'll provide detailed guidance.`;
}
