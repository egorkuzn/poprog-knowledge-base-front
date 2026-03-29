const rawApiBaseUrl = process.env.REACT_APP_API_BASE_URL?.trim() ?? "";

export const apiBaseUrl = rawApiBaseUrl.replace(/\/+$/, "");
