export interface GridState {
    timestamp: number;
    bus1_voltage: number; bus2_voltage: number; bus3_voltage: number;
    bus4_voltage: number; bus5_voltage: number; bus6_voltage: number;
    bus7_voltage: number; bus8_voltage: number; bus9_voltage: number;

    bus1_current: number; bus2_current: number; bus3_current: number;
    bus4_current: number; bus5_current: number; bus6_current: number;
    bus7_current: number; bus8_current: number; bus9_current: number;

    frequency: number;
    packet_loss: number;
    prediction: number;
    confidence: number;
    status: string;
    attack_type: string;
    breaker_status: string;
    latency_ms: number;
    probabilities: Record<string, number>;
}
