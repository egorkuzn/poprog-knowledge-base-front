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

export async function getJson<T>(path: string): Promise<T> {
    const response = await fetch(buildUrl(path), {
        headers: {
            Accept: "application/json"
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        const details = errorText ? `: ${errorText}` : "";
        throw new Error(`Request failed with status ${response.status}${details}`);
    }

    return response.json() as Promise<T>;
}
