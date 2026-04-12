import {useEffect, useState} from "react";
import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import {
    createDonation,
    getAccountChats,
    getAccountProfile,
    getDonations,
    getFavorites
} from "../../../api/accountApi";
import type {
    AccountChatSummaryResponse,
    AccountDonationResponse,
    AccountFavoriteResponse,
    AccountProfileResponse
} from "../../../api/types";
import "../../../styles/pages/Account.scss";

export function AccountView() {
    const [profile, setProfile] = useState<AccountProfileResponse | null>(null);
    const [chats, setChats] = useState<AccountChatSummaryResponse[]>([]);
    const [favorites, setFavorites] = useState<AccountFavoriteResponse[]>([]);
    const [donations, setDonations] = useState<AccountDonationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isCreatingDonation, setIsCreatingDonation] = useState(false);

    useEffect(() => {
        let isMounted = true;

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

                setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить личный кабинет.");
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const handleCreateDonation = async () => {
        if (isCreatingDonation) {
            return;
        }

        setIsCreatingDonation(true);
        setError("");

        try {
            const donation = await createDonation({
                amount: 300,
                currency: "RUB",
                source: "account-support",
                message: "Поддержка проекта",
                returnUrl: `${window.location.origin}/home#support`
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

    return BodyView(
        <main className="account-page">
            <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Мой аккаунт"}]}/>

            <section className="account-hero">
                <h1>Личный кабинет</h1>
                <p>Вы вошли в тестовый профиль. Данные можно использовать для отладки интеграций.</p>
            </section>

            {isLoading && <p className="account-state">Загружаем личный кабинет...</p>}
            {error.length > 0 && <p className="account-state account-state-error">{error}</p>}

            {!isLoading && !error && profile && (
                <>
                    <section className="account-card">
                        <h2>Профиль</h2>
                        <div className="account-grid">
                            <div><strong>Subject:</strong> {profile.subject}</div>
                            <div><strong>Имя:</strong> {profile.name}</div>
                            <div><strong>Email:</strong> {profile.email}</div>
                            <div><strong>Роли:</strong> {profile.roles.join(", ") || "—"}</div>
                        </div>
                    </section>

                    <div className="account-wide-grid">
                        <section className="account-card">
                            <div className="account-card-header">
                                <h2>Донаты</h2>
                                <button disabled={isCreatingDonation} onClick={handleCreateDonation} type="button">
                                    {isCreatingDonation ? "Создаём..." : "Поддержать проект (300 ₽)"}
                                </button>
                            </div>
                            {donations.length === 0 ? <p>Пожертвований пока нет.</p> : (
                                <ul className="account-list">
                                    {donations.map((item) => (
                                        <li key={item.id}>
                                            <strong>{item.amount} {item.currency}</strong> · {item.status} · {new Date(item.createdAt).toLocaleString()}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section className="account-card">
                            <h2>Избранное</h2>
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

                        <section className="account-card account-card-full">
                            <h2>Мои чаты</h2>
                            {chats.length === 0 ? <p>Чатов пока нет.</p> : (
                                <ul className="account-list">
                                    {chats.map((item) => (
                                        <li key={item.chatId}>
                                            <strong>{item.messageCount} сообщений</strong> · {new Date(item.createdAt).toLocaleString()} · {item.lastMessagePreview ?? "без превью"}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>
                </>
            )}
        </main>
    );
}
