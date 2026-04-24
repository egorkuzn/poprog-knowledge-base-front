import {useEffect, useMemo, useState} from "react";
import type {FormEvent} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import {
    createDonation,
    downloadAccountDonationsCsv,
    downloadAccountDonationsPdf,
    getAccountChats,
    getAccountProfile,
    getDonations,
    getFavorites,
    updateAccountProfile
} from "../../../api/accountApi";
import type {
    AccountChatSummaryResponse,
    AccountDonationResponse,
    AccountFavoriteResponse,
    AccountProfileResponse
} from "../../../api/types";
import {
    clearLocalAuthSession,
    createLocalAuthSession,
    findLocalAuthUserByCredentials,
    readLocalAuthSession,
    registerLocalAuthUser,
    saveLocalAuthSession,
    updateLocalAuthSessionProfile,
    type AuthMode,
    type LocalAuthSession
} from "../../../utils/localAuth";
import "../../../styles/pages/Account.scss";

const serviceRoles = new Set(["ADMIN", "MODERATOR", "SUPPORT", "DEVOPS", "PM", "EDITOR"]);
const localRoleOptions = ["USER", "ADMIN", "SUPPORT", "PM", "DEVOPS"];

function buildProfileFromSession(session: LocalAuthSession): AccountProfileResponse {
    return {
        subject: session.subject,
        name: session.name,
        email: session.email,
        roles: session.roles
    };
}

function getAuthModeFromSearch(search: string): AuthMode {
    const params = new URLSearchParams(search);
    return params.get("mode") === "register" ? "register" : "login";
}

export function AccountView() {
    const location = useLocation();
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState<AuthMode>(() => getAuthModeFromSearch(location.search));
    const [authName, setAuthName] = useState("");
    const [authEmail, setAuthEmail] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const [authRole, setAuthRole] = useState("USER");
    const [authError, setAuthError] = useState("");
    const [profile, setProfile] = useState<AccountProfileResponse | null>(() => {
        const existingSession = readLocalAuthSession();
        return existingSession ? buildProfileFromSession(existingSession) : null;
    });
    const [chats, setChats] = useState<AccountChatSummaryResponse[]>([]);
    const [favorites, setFavorites] = useState<AccountFavoriteResponse[]>([]);
    const [donations, setDonations] = useState<AccountDonationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isCreatingDonation, setIsCreatingDonation] = useState(false);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [isProfileEditing, setIsProfileEditing] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileEditError, setProfileEditError] = useState("");

    const hasServiceRole = (profile?.roles ?? []).some((role) => serviceRoles.has(role.toUpperCase()));
    const hasAdminRole = (profile?.roles ?? []).some((role) => role.toUpperCase() === "ADMIN");
    const profileSubject = profile?.subject ?? "";
    const isLocalRoleDebugVisible = typeof window !== "undefined"
        && ["localhost", "127.0.0.1"].includes(window.location.hostname);

    useEffect(() => {
        setAuthMode(getAuthModeFromSearch(location.search));
    }, [location.search]);

    useEffect(() => {
        if (!profile) {
            return;
        }
        setEditName(profile.name);
        setEditEmail(profile.email);
        setIsProfileEditing(false);
        setProfileEditError("");
    }, [profile]);

    useEffect(() => {
        if (!profileSubject) {
            setChats([]);
            setFavorites([]);
            setDonations([]);
            return;
        }

        let isMounted = true;
        setIsLoading(true);
        setError("");

        Promise.all([
            getAccountProfile(),
            getAccountChats(20),
            getFavorites(),
            getDonations()
        ])
            .then(([profileResponse, chatsResponse, favoritesResponse, donationsResponse]) => {
                if (!isMounted) {
                    return;
                }

                setProfile(profileResponse);
                setChats(chatsResponse);
                setFavorites(favoritesResponse);
                setDonations(donationsResponse);
            })
            .catch((loadError) => {
                if (!isMounted) {
                    return;
                }

                const errorMessage = loadError instanceof Error ? loadError.message : "";
                if (errorMessage.includes("401")) {
                    setChats([]);
                    setFavorites([]);
                    setDonations([]);
                    setError("");
                    return;
                }

                setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить данные кабинета.");
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [profileSubject]);

    const authHint = useMemo(() => (
        authMode === "register"
            ? "Создайте аккаунт в интерфейсе Poprog, чтобы сохранять избранное и историю операций."
            : "Войдите в аккаунт Poprog, чтобы открыть личный кабинет без внешнего редиректа. Демо: developer@dev.com / developer"
    ), [authMode]);

    const switchAuthMode = (mode: AuthMode) => {
        setAuthMode(mode);
        setAuthError("");
        navigate(`/account?mode=${mode}`, {replace: true});
    };

    const handleAuthSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAuthError("");

        const normalizedName = authName.trim();
        const normalizedEmail = authEmail.trim();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setAuthError("Введите корректный email.");
            return;
        }

        if (authPassword.trim().length < 8) {
            setAuthError("Пароль должен содержать минимум 8 символов.");
            return;
        }

        let session: LocalAuthSession;

        if (authMode === "login") {
            const foundUser = findLocalAuthUserByCredentials(normalizedEmail, authPassword);
            if (!foundUser) {
                setAuthError("Неверный логин или пароль. Для демо используйте developer@dev.com / developer.");
                return;
            }

            session = createLocalAuthSession(foundUser.name, foundUser.email, "login", foundUser.roles);
        } else {
            if (normalizedName.length < 2) {
                setAuthError("Введите имя не короче 2 символов.");
                return;
            }

            try {
                registerLocalAuthUser(
                    normalizedName,
                    normalizedEmail,
                    authPassword,
                    isLocalRoleDebugVisible ? [authRole] : ["USER"]
                );
            } catch (registrationError) {
                setAuthError(registrationError instanceof Error ? registrationError.message : "Не удалось создать аккаунт.");
                return;
            }

            session = createLocalAuthSession(
                normalizedName,
                normalizedEmail,
                "register",
                isLocalRoleDebugVisible ? [authRole] : ["USER"]
            );
        }

        saveLocalAuthSession(session);
        setProfile(buildProfileFromSession(session));
        setAuthPassword("");
        navigate("/account", {replace: true});
    };

    const handleLogout = () => {
        clearLocalAuthSession();
        setProfile(null);
        setError("");
        setAuthPassword("");
        setIsProfileEditing(false);
        setProfileEditError("");
        navigate("/account?mode=login", {replace: true});
    };

    const handleSaveProfile = async () => {
        if (!profile) {
            return;
        }

        const normalizedName = editName.trim();
        const normalizedEmail = editEmail.trim();
        setProfileEditError("");

        if (normalizedName.length < 2) {
            setProfileEditError("Имя должно быть не короче 2 символов.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setProfileEditError("Введите корректный email.");
            return;
        }

        setIsSavingProfile(true);
        try {
            const updatedProfile = await updateAccountProfile({
                name: normalizedName,
                email: normalizedEmail
            });
            setProfile(updatedProfile);
            setIsProfileEditing(false);
        } catch {
            const localSession = updateLocalAuthSessionProfile(normalizedName, normalizedEmail);
            if (localSession) {
                setProfile(buildProfileFromSession(localSession));
                setIsProfileEditing(false);
            } else {
                setProfileEditError("Не удалось сохранить профиль.");
            }
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleCreateDonation = async (template?: AccountDonationResponse) => {
        if (isCreatingDonation || !profile) {
            return;
        }

        setIsCreatingDonation(true);
        setError("");

        try {
            const donation = await createDonation({
                amount: Number(template?.amount ?? 300),
                currency: template?.currency ?? "RUB",
                source: template?.source ?? "account-support",
                message: template?.message ?? `Поддержка проекта от ${profile.email}`,
                returnUrl: `${window.location.origin}/account`
            });

            setDonations((current) => [donation, ...current]);
            if (donation.confirmationUrl) {
                window.open(donation.confirmationUrl, "_blank");
            }
        } catch (creationError) {
            setError(creationError instanceof Error ? creationError.message : "Не удалось создать донат.");
        } finally {
            setIsCreatingDonation(false);
        }
    };

    const exportDonationsCsv = async () => {
        if (donations.length === 0) {
            setError("Нет данных для выгрузки.");
            return;
        }
        setError("");
        try {
            await downloadAccountDonationsCsv();
        } catch (exportError) {
            setError(exportError instanceof Error ? exportError.message : "Не удалось выгрузить CSV.");
        }
    };

    const exportDonationsPdf = async () => {
        if (donations.length === 0) {
            setError("Нет данных для выгрузки.");
            return;
        }
        setError("");
        try {
            await downloadAccountDonationsPdf();
        } catch (exportError) {
            setError(exportError instanceof Error ? exportError.message : "Не удалось выгрузить PDF.");
        }
    };

    const totalChatsCreated = chats.length;
    const totalChatMessages = chats.reduce((sum, item) => sum + item.messageCount, 0);
    const estimatedTokenConsumption = totalChatMessages * 320;

    return BodyView(
        <main className="account-page">
            <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Мой аккаунт"}]}/>

            {!profile && (
                <section className="account-auth-shell">
                    <header className="account-hero">
                        <h1>Вход в личный кабинет</h1>
                        <p>{authHint}</p>
                    </header>

                    <div className="account-auth-card">
                        <div className="account-auth-tabs">
                            <button
                                className={authMode === "login" ? "account-auth-tab account-auth-tab-active" : "account-auth-tab"}
                                onClick={() => switchAuthMode("login")}
                                type="button"
                            >
                                Вход
                            </button>
                            <button
                                className={authMode === "register" ? "account-auth-tab account-auth-tab-active" : "account-auth-tab"}
                                onClick={() => switchAuthMode("register")}
                                type="button"
                            >
                                Регистрация
                            </button>
                        </div>

                        <form className="account-auth-form" onSubmit={handleAuthSubmit}>
                            {authMode === "register" && (
                                <label>
                                    Имя
                                    <input
                                        autoComplete="name"
                                        onChange={(event) => setAuthName(event.target.value)}
                                        placeholder="Иван Петров"
                                        type="text"
                                        value={authName}
                                    />
                                </label>
                            )}
                            <label>
                                Email
                                <input
                                    autoComplete="email"
                                    onChange={(event) => setAuthEmail(event.target.value)}
                                    placeholder="you@example.com"
                                    type="email"
                                    value={authEmail}
                                />
                            </label>
                            <label>
                                Пароль
                                <input
                                    autoComplete={authMode === "register" ? "new-password" : "current-password"}
                                    onChange={(event) => setAuthPassword(event.target.value)}
                                    placeholder="Минимум 8 символов"
                                    type="password"
                                    value={authPassword}
                                />
                            </label>

                            {isLocalRoleDebugVisible && (
                                <label>
                                    Служебная роль для локальной отладки
                                    <select onChange={(event) => setAuthRole(event.target.value)} value={authRole}>
                                        {localRoleOptions.map((role) => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </label>
                            )}

                            {authError.length > 0 && <p className="account-auth-error">{authError}</p>}

                            <button className="account-auth-submit" type="submit">
                                {authMode === "register" ? "Создать аккаунт" : "Войти"}
                            </button>
                        </form>

                        <p className="account-auth-note">
                            Тестовый вход: <strong>developer@dev.com</strong> / <strong>developer</strong><br/>
                            После входа вы сможете управлять историей донатов, сохранять избранные материалы и переходить в чаты.
                            <Link to="/donate"> Поддержать проект</Link>
                        </p>
                    </div>
                </section>
            )}

            {profile && (
                <>
                    <section className="account-hero">
                        <h1>Личный кабинет</h1>
                        <p>Вы вошли под {profile.email}. Все действия выполняются внутри интерфейса Poprog.</p>
                    </section>

                    <section className="account-card">
                        <div className="account-card-header">
                            <h2>Профиль</h2>
                            <div className="account-card-actions">
                                {hasAdminRole && (
                                    <button onClick={() => navigate("/account/admin/donations")} type="button">
                                        Аналитика пожертвований
                                    </button>
                                )}
                                <button onClick={handleLogout} type="button">Выйти</button>
                            </div>
                        </div>
                        {!isProfileEditing && (
                            <div className="account-grid account-profile-grid">
                                <div><strong>Имя:</strong> {profile.name}</div>
                                <div><strong>Email:</strong> {profile.email}</div>
                                <div className="account-grid-link-row">
                                    <button
                                        className="account-inline-link account-inline-link-button"
                                        onClick={() => setIsProfileEditing(true)}
                                        type="button"
                                    >
                                        Редактировать
                                    </button>
                                </div>
                            </div>
                        )}
                        {isProfileEditing && (
                            <form className="account-auth-form" onSubmit={(event) => {
                                event.preventDefault();
                                void handleSaveProfile();
                            }}>
                                <label>
                                    Имя
                                    <input
                                        autoComplete="name"
                                        onChange={(event) => setEditName(event.target.value)}
                                        placeholder="Иван Петров"
                                        type="text"
                                        value={editName}
                                    />
                                </label>
                                <label>
                                    Email
                                    <input
                                        autoComplete="email"
                                        onChange={(event) => setEditEmail(event.target.value)}
                                        placeholder="you@example.com"
                                        type="email"
                                        value={editEmail}
                                    />
                                </label>
                                {profileEditError.length > 0 && <p className="account-auth-error">{profileEditError}</p>}
                                <div className="account-card-actions account-edit-actions">
                                    <button
                                        className="account-inline-link account-inline-link-button"
                                        onClick={() => {
                                            setIsProfileEditing(false);
                                            setProfileEditError("");
                                            setEditName(profile.name);
                                            setEditEmail(profile.email);
                                        }}
                                        type="button"
                                    >
                                        Отменить
                                    </button>
                                    <button className="account-auth-submit" disabled={isSavingProfile} type="submit">
                                        {isSavingProfile ? "Сохраняем..." : "Сохранить"}
                                    </button>
                                </div>
                            </form>
                        )}
                        <div className="account-grid account-profile-grid account-profile-meta">
                            <div><strong>Subject:</strong> {profile.subject}</div>
                            {hasServiceRole && <div><strong>Роли:</strong> {profile.roles.join(", ") || "—"}</div>}
                        </div>
                    </section>

                    {isLoading && <p className="account-state">Загружаем данные кабинета...</p>}
                    {error.length > 0 && <p className="account-state account-state-error">{error}</p>}

                    <div className="account-wide-grid">
                        <section className="account-card">
                            <div className="account-card-header">
                                <h2>Донаты</h2>
                                <div className="account-card-actions">
                                    {!hasServiceRole && (
                                        <button disabled={isCreatingDonation} onClick={() => void handleCreateDonation()} type="button">
                                            {isCreatingDonation ? "Создаём..." : "Поддержать проект (300 ₽)"}
                                        </button>
                                    )}
                                    <button onClick={exportDonationsCsv} type="button">Экспорт CSV</button>
                                    <button onClick={exportDonationsPdf} type="button">Экспорт PDF</button>
                                </div>
                            </div>
                            {donations.length === 0 ? <p>Пожертвований пока нет.</p> : (
                                <ul className="account-list">
                                    {donations.map((item) => (
                                        <li className="account-list-item" key={item.id}>
                                            <div>
                                                <strong>{item.amount} {item.currency}</strong> · {item.status} · {new Date(item.createdAt).toLocaleString()}
                                            </div>
                                            {!hasServiceRole && (
                                                <button onClick={() => void handleCreateDonation(item)} type="button">Повторить донат</button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section className="account-card">
                            <h2>Избранное</h2>
                            <p>Список материалов портала, которые пользователь пометил для быстрого доступа.</p>
                            {favorites.length === 0 ? <p>Избранное пока пусто.</p> : (
                                <ul className="account-list">
                                    {favorites.map((item) => (
                                        <li key={item.id}>
                                            <strong>{item.title}</strong> · {item.itemType} · {item.itemId}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        {hasAdminRole && (
                            <section className="account-card account-card-full">
                                <h2>Аналитика ИИ-чатов</h2>
                                <p>Сводные показатели по пользовательским сессиям ИИ-чата в текущем аккаунте.</p>
                                <div className="account-admin-kpi-grid account-chat-kpi-grid">
                                    <article className="account-card account-chat-kpi-card">
                                        <h3>Создано чатов</h3>
                                        <p className="account-admin-kpi-value">{totalChatsCreated}</p>
                                    </article>
                                    <article className="account-card account-chat-kpi-card">
                                        <h3>Сообщений в чатах</h3>
                                        <p className="account-admin-kpi-value">{totalChatMessages}</p>
                                    </article>
                                    <article className="account-card account-chat-kpi-card">
                                        <h3>Оценка потребления токенов</h3>
                                        <p className="account-admin-kpi-value">{estimatedTokenConsumption}</p>
                                    </article>
                                </div>
                            </section>
                        )}
                    </div>
                </>
            )}
        </main>
    );
}
