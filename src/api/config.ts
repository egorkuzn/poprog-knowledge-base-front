const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? "http://localhost:8080";

export const apiBaseUrl = rawApiBaseUrl.replace(/\/+$/, "");
