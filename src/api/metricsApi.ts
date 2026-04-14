import {apiBaseUrl} from "./config";

export interface MetricEventPayload {
    eventType: string
    route: string
    referrer: string | null
    sessionId: string
    timestampClient: string
    userKey?: string
    payload: Record<string, unknown>
}

export function sendMetricEvent(event: MetricEventPayload): void {
    void fetch(`${apiBaseUrl}/api/metrics/events`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        keepalive: true,
        body: JSON.stringify(event)
    }).catch(() => {
        // Analytics transport must never block the user flow.
    });
}
