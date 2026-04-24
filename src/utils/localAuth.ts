export type AuthMode = "login" | "register";

export interface LocalAuthSession {
    subject: string
    name: string
    email: string
    roles: string[]
    createdAt: string
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
        && typeof candidate.createdAt === "string";
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
