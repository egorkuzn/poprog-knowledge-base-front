const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";

export const apiBaseUrl = rawApiBaseUrl.replace(/\/+$/, "");
