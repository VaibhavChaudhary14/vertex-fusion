


type SimulationResult = {
    type: "bus" | "line";
    id: string;
    [key: string]: any;
}[];

export class SimulationService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.PYTHON_SERVICE_URL || "http://127.0.0.1:8000";
    }

    async runSimulation(): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/simulate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                throw new Error(`Python service error: ${response.statusText}`);
            }

            const data = await response.json();

            // Return full data including detection ({ step, grid_state, detection })
            return data;
        } catch (error) {
            console.error("Simulation service failed:", error);
            // Fallback to empty array or throw, depending on resilience needs
            // For now, rethrow so the caller knows something went wrong
            throw error;
        }
    }

    async setAttack(attackType: string, params: any = {}): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/attack`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    attack_type: attackType,
                    ...params
                })
            });
            return response.ok;
        } catch (error) {
            console.error("Failed to set attack:", error);
            return false;
        }
    }
    async tripBreaker(lineId: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/trip-breaker?line_id=${lineId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            return response.ok;
        } catch (error) {
            console.error("Failed to trip breaker:", error);
            return false;
        }
    }
}

export const simulationService = new SimulationService();
