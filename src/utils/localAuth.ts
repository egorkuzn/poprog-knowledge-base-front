export type AuthMode = "login" | "register";

export interface LocalAuthSession {
    subject: string
    name: string
    email: string
    roles: string[]
    createdAt: string
}

const localAuthStorageKey = "poprog_local_auth_session";

function isLocalAuthSession(value: unknown): value is LocalAuthSession {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Record<string, unknown>;
    return typeof candidate.subject === "string"
        && typeof candidate.name === "string"
        && typeof candidate.email === "string"
        && Array.isArray(candidate.roles)
        && typeof candidate.createdAt === "string";
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
}

export function clearLocalAuthSession(): void {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.removeItem(localAuthStorageKey);
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

    return {
        subject: session.subject,
        email: session.email,
        name: session.name,
        roles: session.roles.join(",")
    };
}
