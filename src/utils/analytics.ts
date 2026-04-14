import {sendMetricEvent} from "../api/metricsApi";
import {readLocalAuthSession} from "./localAuth";

const analyticsSessionStorageKey = "poprog_analytics_session_id";

function getOrCreateSessionId(): string {
    if (typeof window === "undefined") {
        return "server-session";
    }

    const existingValue = window.sessionStorage.getItem(analyticsSessionStorageKey);
    if (existingValue) {
        return existingValue;
    }

    const generatedValue = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `session-${Date.now()}`;
    window.sessionStorage.setItem(analyticsSessionStorageKey, generatedValue);
    return generatedValue;
}

export function trackMetricEvent(eventType: string, payload: Record<string, unknown> = {}, route?: string): void {
    if (typeof window === "undefined") {
        return;
    }

    const authSession = readLocalAuthSession();

    sendMetricEvent({
        eventType,
        route: route ?? `${window.location.pathname}${window.location.search}`,
        referrer: document.referrer || null,
        sessionId: getOrCreateSessionId(),
        timestampClient: new Date().toISOString(),
        userKey: authSession?.subject,
        payload
    });
}

export function normalizeSourceType(type: string): string {
    const normalizedType = type.toLowerCase();
    if (normalizedType.includes("publication")) {
        return "publication";
    }
    if (normalizedType.includes("work") || normalizedType.includes("diploma") || normalizedType.includes("dissertation")) {
        return "student-work";
    }
    return normalizedType;
}
