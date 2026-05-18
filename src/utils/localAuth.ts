export type AuthMode = "login" | "register";

export interface LocalAuthSession {
    subject: string
    name: string
    email: string
    roles: string[]
    createdAt: string
    accessToken: string
    refreshToken?: string
    expiresAt?: number
}

const localAuthStorageKey = "poprog_local_auth_session";
const legacyLocalAuthUsersStorageKey = "poprog_local_auth_users";
export const localAuthChangedEventName = "poprog-auth-changed";

function isLocalAuthSession(value: unknown): value is LocalAuthSession {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Record<string, unknown>;
    return typeof candidate.subject === "string"
        && typeof candidate.name === "string"
        && typeof candidate.email === "string"
        && Array.isArray(candidate.roles)
        && typeof candidate.createdAt === "string"
        && typeof candidate.accessToken === "string"
        && (candidate.refreshToken === undefined || typeof candidate.refreshToken === "string")
        && (candidate.expiresAt === undefined || typeof candidate.expiresAt === "number");
}

function emitAuthChanged(): void {
    if (typeof window === "undefined") {
        return;
    }
    window.dispatchEvent(new CustomEvent(localAuthChangedEventName));
}

export function readLocalAuthSession(): LocalAuthSession | null {
    if (typeof window === "undefined") {
        return null;
    }

    const raw = window.localStorage.getItem(localAuthStorageKey);
    if (!raw) {
        return null;
    }

    try {
        const parsed: unknown = JSON.parse(raw);
        if (!isLocalAuthSession(parsed)) {
            clearLocalAuthSession();
            return null;
        }
        return parsed;
    } catch {
        clearLocalAuthSession();
        return null;
    }
}

export function saveLocalAuthSession(session: LocalAuthSession): void {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(localAuthStorageKey, JSON.stringify(session));
    window.localStorage.removeItem(legacyLocalAuthUsersStorageKey);
    emitAuthChanged();
}

export function clearLocalAuthSession(): void {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.removeItem(localAuthStorageKey);
    window.localStorage.removeItem(legacyLocalAuthUsersStorageKey);
    emitAuthChanged();
}

export function getLocalAuthHeaders(): Record<string, string> {
    const session = readLocalAuthSession();
    if (!session) {
        return {};
    }

    return {
        Authorization: `Bearer ${session.accessToken}`
    };
}

interface KeycloakTokenResponse {
    access_token: string
    refresh_token?: string
    expires_in?: number
}

interface KeycloakErrorResponse {
    error?: string
    error_description?: string
}

interface KeycloakJwtClaims {
    sub?: string
    email?: string
    name?: string
    preferred_username?: string
    realm_access?: {
        roles?: string[]
    }
    resource_access?: Record<string, {
        roles?: string[]
    }>
    scope?: string
}

function resolveKeycloakTokenUrl(): string {
    const configuredUrl = import.meta.env.VITE_KEYCLOAK_TOKEN_URL?.trim();
    if (configuredUrl) {
        return configuredUrl;
    }

    const configuredBaseUrl = import.meta.env.VITE_KEYCLOAK_BASE_URL?.trim() ?? "";
    const baseUrl = configuredBaseUrl || (typeof window !== "undefined" ? window.location.origin : "http://localhost:18080");
    const realm = import.meta.env.VITE_KEYCLOAK_REALM?.trim() || "poprog-portal";

    return `${baseUrl.replace(/\/+$/, "")}/realms/${encodeURIComponent(realm)}/protocol/openid-connect/token`;
}

function resolveKeycloakClientId(): string {
    return import.meta.env.VITE_KEYCLOAK_CLIENT_ID?.trim() || "poprog-portal-frontend";
}

function decodeBase64UrlJson<T>(encoded: string): T {
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const json = decodeURIComponent(
        Array.from(atob(padded))
            .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
            .join("")
    );
    return JSON.parse(json) as T;
}

function decodeJwtClaims(token: string): KeycloakJwtClaims {
    const [, payload] = token.split(".");
    if (!payload) {
        throw new Error("Keycloak вернул некорректный access token.");
    }
    return decodeBase64UrlJson<KeycloakJwtClaims>(payload);
}

function collectKeycloakRoles(claims: KeycloakJwtClaims, clientId: string): string[] {
    const roles = new Set<string>(["USER"]);

    claims.realm_access?.roles?.forEach((role) => roles.add(role.toUpperCase()));
    claims.resource_access?.[clientId]?.roles?.forEach((role) => roles.add(role.toUpperCase()));
    claims.scope?.split(/\s+/).forEach((scope) => {
        const normalized = scope.trim().toUpperCase();
        if (normalized) {
            roles.add(normalized);
        }
    });

    return Array.from(roles);
}

async function resolveKeycloakLoginError(response: Response): Promise<Error> {
    let details: KeycloakErrorResponse | null = null;
    try {
        details = await response.json() as KeycloakErrorResponse;
    } catch {
        details = null;
    }

    const description = details?.error_description?.toLowerCase() ?? "";

    if (description.includes("account is not fully set up") || description.includes("update_password")) {
        return new Error(
            import.meta.env.PROD
                ? "Вход временно недоступен для этой учетной записи. Обратитесь в поддержку."
                : "Пароль в Keycloak помечен как временный. Зайдите в Keycloak напрямую и завершите смену пароля либо в админке задайте пароль с Temporary = Off."
        );
    }

    if (description.includes("invalid user credentials")) {
        return new Error("Неверный логин или пароль.");
    }

    if (details?.error === "unauthorized_client") {
        return new Error("Клиент Keycloak не разрешает вход по паролю. Проверьте Direct Access Grants для клиента портала.");
    }

    return new Error("Keycloak отклонил вход. Проверьте пароль, realm пользователя и required actions в профиле Keycloak.");
}

export async function loginKeycloakAccount(email: string, password: string): Promise<LocalAuthSession> {
    const clientId = resolveKeycloakClientId();
    const body = new URLSearchParams({
        grant_type: "password",
        client_id: clientId,
        username: email.trim(),
        password
    });

    const response = await fetch(resolveKeycloakTokenUrl(), {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body
    });

    if (!response.ok) {
        throw await resolveKeycloakLoginError(response);
    }

    const tokenResponse = await response.json() as KeycloakTokenResponse;
    const claims = decodeJwtClaims(tokenResponse.access_token);
    const normalizedEmail = claims.email?.trim() || email.trim().toLowerCase();
    const displayName = claims.name?.trim()
        || claims.preferred_username?.trim()
        || normalizedEmail;

    return {
        subject: claims.sub?.trim() || normalizedEmail,
        name: displayName,
        email: normalizedEmail,
        roles: collectKeycloakRoles(claims, clientId),
        createdAt: new Date().toISOString(),
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: tokenResponse.expires_in ? Date.now() + tokenResponse.expires_in * 1000 : undefined
    };
}
