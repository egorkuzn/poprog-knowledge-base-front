import {apiBaseUrl} from "./config";

function buildUrl(path: string): string {
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    if (!path.startsWith("/")) {
        throw new Error(`API path must start with "/": ${path}`);
    }

    return `${apiBaseUrl}${path}`;
}

function getDebugAuthHeaders(): Record<string, string> {
    const enabled = import.meta.env.VITE_DEBUG_HEADERS_ENABLED === "true";
    if (!enabled) {
        return {};
    }

    const sub = import.meta.env.VITE_DEBUG_USER_SUB?.trim();
    if (!sub) {
        return {};
    }

    const headers: Record<string, string> = {
        subject: sub
    };

    const email = import.meta.env.VITE_DEBUG_USER_EMAIL?.trim();
    if (email) {
        headers.email = email;
    }

    const name = import.meta.env.VITE_DEBUG_USER_NAME?.trim();
    if (name) {
        headers.name = name;
    }

    const roles = import.meta.env.VITE_DEBUG_USER_ROLES?.trim();
    if (roles) {
        headers.roles = roles;
    }

    return headers;
}

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(buildUrl(path), {
        ...init,
        headers: {
            Accept: "application/json",
            ...getDebugAuthHeaders(),
            ...(init.headers ?? {})
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        const details = errorText ? `: ${errorText}` : "";
        throw new Error(`Request failed with status ${response.status}${details}`);
    }

    return response.json() as Promise<T>;
}

export async function getJson<T>(path: string): Promise<T> {
    return requestJson<T>(path, {
        method: "GET"
    });
}

export async function postJson<TResponse, TRequest>(path: string, body: TRequest): Promise<TResponse> {
    return requestJson<TResponse>(path, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
}

export async function putJson<TResponse, TRequest>(path: string, body: TRequest): Promise<TResponse> {
    return requestJson<TResponse>(path, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
}
