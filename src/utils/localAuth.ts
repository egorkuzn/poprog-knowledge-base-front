export type AuthMode = "login" | "register";

export interface LocalAuthSession {
    subject: string
    name: string
    email: string
    roles: string[]
    createdAt: string
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
}

export interface LocalAuthUser {
    name: string
    email: string
    password: string
    roles: string[]
    createdAt: string
}

const localAuthStorageKey = "poprog_local_auth_session";
const localAuthUsersStorageKey = "poprog_local_auth_users";
export const localAuthChangedEventName = "poprog-auth-changed";
const demoUserEmail = "developer@dev.com";
const demoUserPassword = "developer";

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
        && (candidate.accessToken === undefined || typeof candidate.accessToken === "string")
        && (candidate.refreshToken === undefined || typeof candidate.refreshToken === "string")
        && (candidate.expiresAt === undefined || typeof candidate.expiresAt === "number");
}

function isLocalAuthUser(value: unknown): value is LocalAuthUser {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Record<string, unknown>;
    return typeof candidate.name === "string"
        && typeof candidate.email === "string"
        && typeof candidate.password === "string"
        && Array.isArray(candidate.roles)
        && typeof candidate.createdAt === "string";
}

function readLocalAuthUsersRaw(): LocalAuthUser[] {
    if (typeof window === "undefined") {
        return [];
    }

    const raw = window.localStorage.getItem(localAuthUsersStorageKey);
    if (!raw) {
        return [];
    }

    try {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.filter(isLocalAuthUser);
    } catch {
        return [];
    }
}

function saveLocalAuthUsers(users: LocalAuthUser[]): void {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(localAuthUsersStorageKey, JSON.stringify(users));
}

function ensureDemoUser(): void {
    if (typeof window === "undefined") {
        return;
    }

    const users = readLocalAuthUsersRaw();
    const hasDemoUser = users.some((user) => user.email.toLowerCase() === demoUserEmail);
    if (hasDemoUser) {
        return;
    }

    users.push({
        name: "Developer",
        email: demoUserEmail,
        password: demoUserPassword,
        roles: ["USER", "DEVOPS"],
        createdAt: new Date().toISOString()
    });
    saveLocalAuthUsers(users);
}

function emitAuthChanged(): void {
    if (typeof window === "undefined") {
        return;
    }
    window.dispatchEvent(new CustomEvent(localAuthChangedEventName));
}

export function readLocalAuthSession(): LocalAuthSession | null {
    ensureDemoUser();

    if (typeof window === "undefined") {
        return null;
    }

    const raw = window.localStorage.getItem(localAuthStorageKey);
    if (!raw) {
        return null;
    }

    try {
        const parsed: unknown = JSON.parse(raw);
        return isLocalAuthSession(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

export function saveLocalAuthSession(session: LocalAuthSession): void {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(localAuthStorageKey, JSON.stringify(session));
    emitAuthChanged();
}

export function clearLocalAuthSession(): void {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.removeItem(localAuthStorageKey);
    emitAuthChanged();
}

export function deleteLocalAuthCurrentAccount(): boolean {
    const currentSession = readLocalAuthSession();
    if (!currentSession) {
        return false;
    }

    const currentEmailNormalized = currentSession.email.trim().toLowerCase();
    const users = readLocalAuthUsersRaw();
    const filteredUsers = users.filter((user) => user.email.toLowerCase() !== currentEmailNormalized);

    if (filteredUsers.length !== users.length) {
        saveLocalAuthUsers(filteredUsers);
    }

    clearLocalAuthSession();
    return true;
}

export function createLocalAuthSession(name: string, email: string, mode: AuthMode, roles: string[] = ["USER"]): LocalAuthSession {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    const subjectPrefix = mode === "register" ? "reg" : "login";

    return {
        subject: `${subjectPrefix}-${normalizedEmail.replace(/[^a-z0-9@._-]/g, "-")}`,
        name: normalizedName,
        email: normalizedEmail,
        roles,
        createdAt: new Date().toISOString()
    };
}

export function getLocalAuthHeaders(): Record<string, string> {
    const session = readLocalAuthSession();
    if (!session) {
        return {};
    }

    if (session.accessToken) {
        return {
            Authorization: `Bearer ${session.accessToken}`
        };
    }

    return {
        subject: session.subject,
        email: session.email,
        name: session.name,
        roles: session.roles.join(",")
    };
}

export function registerLocalAuthUser(name: string, email: string, password: string, roles: string[] = ["USER"]): LocalAuthUser {
    ensureDemoUser();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    const normalizedPassword = password.trim();

    const users = readLocalAuthUsersRaw();
    const hasDuplicate = users.some((user) => user.email.toLowerCase() === normalizedEmail);
    if (hasDuplicate) {
        throw new Error("Пользователь с таким email уже зарегистрирован.");
    }

    const user: LocalAuthUser = {
        name: normalizedName,
        email: normalizedEmail,
        password: normalizedPassword,
        roles,
        createdAt: new Date().toISOString()
    };
    users.push(user);
    saveLocalAuthUsers(users);
    return user;
}

export function findLocalAuthUserByCredentials(email: string, password: string): LocalAuthUser | null {
    ensureDemoUser();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const users = readLocalAuthUsersRaw();

    const user = users.find((candidate) => (
        candidate.email.toLowerCase() === normalizedEmail
        && candidate.password === normalizedPassword
    ));

    return user ?? null;
}

interface KeycloakTokenResponse {
    access_token: string
    refresh_token?: string
    expires_in?: number
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
        throw new Error("Неверный логин или пароль.");
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

export function updateLocalAuthSessionProfile(name: string, email: string): LocalAuthSession | null {
    const currentSession = readLocalAuthSession();
    if (!currentSession) {
        return null;
    }

    const nextSession: LocalAuthSession = {
        ...currentSession,
        name: name.trim(),
        email: email.trim().toLowerCase()
    };
    saveLocalAuthSession(nextSession);

    const users = readLocalAuthUsersRaw();
    const currentEmailNormalized = currentSession.email.trim().toLowerCase();
    const targetUserIndex = users.findIndex((user) => user.email.toLowerCase() === currentEmailNormalized);
    if (targetUserIndex >= 0) {
        users[targetUserIndex] = {
            ...users[targetUserIndex],
            name: nextSession.name,
            email: nextSession.email
        };
        saveLocalAuthUsers(users);
    }

    return nextSession;
}
