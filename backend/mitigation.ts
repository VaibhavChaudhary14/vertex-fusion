
import { Alert, InsertMitigationLog } from "@shared/schema";
import { storage } from "./storage";
import { broadcast } from "./websocket";

export class MitigationEngine {
    /**
     * Evaluates an alert and triggers automated mitigation if criteria are met.
     */
    static async evaluateAlert(alert: Alert) {
        // Only automate critical severity attacks with high confidence
        if (alert.severity === "critical" && alert.confidenceScore > 0.8) {
            await this.executeMitigation(alert);
        }
    }

    /**
     * Executes the appropriate mitigation logic based on the attack type.
     */
    private static async executeMitigation(alert: Alert) {
        let actionType = "Logging Only";
        let target = "System";
        let message = "No automated action defined";

        // Define mitigation strategies
        if (alert.attackType === "FDI") {
            actionType = "Isolate Zone";
            target = alert.affectedNodes ? alert.affectedNodes[0] : "Grid Subsystem";
            message = `Automatically isolating ${target} due to high-confidence FDI attack.`;
        } else if (alert.attackType === "DoS") {
            actionType = "Rate Limiting";
            target = "HMI Interface";
            message = "Enabling strict rate limiting on HMI traffic.";
        } else if (alert.attackType === "RW") {
            actionType = "System Lockdown";
            target = "Entire Grid";
            message = "Initiating emergency lockdown procedure to prevent lateral movement.";
        } else if (alert.attackType === "RS") {
            actionType = "Terminate Connection";
            target = "External IP";
            message = "Terminating suspicious reverse shell connection immediately.";
        }

        // Create log entry
        const logEntry: InsertMitigationLog = {
            alertId: alert.id,
            actionType,
            target,
            status: "success",
            message,
        };

        const log = await storage.createMitigationLog(logEntry);

        // Broadcast the mitigation event so frontend updates instantly
        broadcast("MITIGATION_ACTION", log);

        console.log(`[MitigationEngine] Executed ${actionType} on ${target}`);
    }
}
