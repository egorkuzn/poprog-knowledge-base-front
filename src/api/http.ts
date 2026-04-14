import {apiBaseUrl} from "./config";
import {getLocalAuthHeaders} from "../utils/localAuth";

function buildUrl(path: string): string {
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    if (!path.startsWith("/")) {
        throw new Error(`API path must start with "/": ${path}`);
    }

    return `${apiBaseUrl}${path}`;
}

function getEnvDebugAuthHeaders(): Record<string, string> {
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

function getAuthHeaders(): Record<string, string> {
    return {
        ...getEnvDebugAuthHeaders(),
        ...getLocalAuthHeaders()
    };
}

function buildHeaders(headers?: HeadersInit): HeadersInit {
    return {
        Accept: "application/json",
        ...getAuthHeaders(),
        ...(headers ?? {})
    };
}

async function readErrorDetails(response: Response): Promise<string> {
    const rawText = await response.text();
    if (!rawText) {
        return "";
    }

    try {
        const parsed = JSON.parse(rawText) as {
            detail?: string
            message?: string
            error?: string
            title?: string
        };
        return parsed.detail ?? parsed.message ?? parsed.error ?? parsed.title ?? rawText;
    } catch {
        return rawText;
    }
}

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(buildUrl(path), {
        ...init,
        headers: buildHeaders(init.headers)
    });

    if (!response.ok) {
        const errorText = await readErrorDetails(response);
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

export async function deleteJson(path: string): Promise<void> {
    const response = await fetch(buildUrl(path), {
        method: "DELETE",
        headers: buildHeaders()
    });

    if (!response.ok) {
        const errorText = await readErrorDetails(response);
        const details = errorText ? `: ${errorText}` : "";
        throw new Error(`Request failed with status ${response.status}${details}`);
    }
}

function resolveFilename(response: Response, fallbackFilename: string): string {
    const contentDisposition = response.headers.get("Content-Disposition");
    if (!contentDisposition) {
        return fallbackFilename;
    }

    const match = contentDisposition.match(/filename="?([^"]+)"?/i);
    return match?.[1] ?? fallbackFilename;
}

export async function downloadFile(path: string, fallbackFilename: string): Promise<void> {
    const response = await fetch(buildUrl(path), {
        method: "GET",
        headers: {
            ...getAuthHeaders()
        }
    });

    if (!response.ok) {
        const errorText = await readErrorDetails(response);
        const details = errorText ? `: ${errorText}` : "";
        throw new Error(`Request failed with status ${response.status}${details}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = resolveFilename(response, fallbackFilename);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}
