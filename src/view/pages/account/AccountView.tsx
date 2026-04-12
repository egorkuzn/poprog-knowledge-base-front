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

const serviceRoles = new Set(["ADMIN", "MODERATOR", "SUPPORT", "DEVOPS", "PM", "EDITOR"]);

export function AccountView() {
    const [profile, setProfile] = useState<AccountProfileResponse | null>(null);
    const [chats, setChats] = useState<AccountChatSummaryResponse[]>([]);
    const [favorites, setFavorites] = useState<AccountFavoriteResponse[]>([]);
    const [donations, setDonations] = useState<AccountDonationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isCreatingDonation, setIsCreatingDonation] = useState(false);

    const hasServiceRole = (profile?.roles ?? []).some((role) => serviceRoles.has(role.toUpperCase()));

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

    const exportDonationsCsv = () => {
        if (donations.length === 0) {
            setError("Нет данных для выгрузки.");
            return;
        }

        const header = ["id", "amount", "currency", "status", "source", "message", "createdAt"];
        const rows = donations.map((item) => [
            item.id,
            item.amount,
            item.currency,
            item.status,
            item.source ?? "",
            (item.message ?? "").replace(/\n/g, " ").trim(),
            item.createdAt
        ]);

        const csvContent = [header, ...rows]
            .map((row) => row.map((value) => `"${String(value).replace(/"/g, "\"\"")}"`).join(","))
            .join("\n");

        const blob = new Blob([`\uFEFF${csvContent}`], {type: "text/csv;charset=utf-8;"});
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    };

    const exportDonationsPdf = () => {
        if (donations.length === 0) {
            setError("Нет данных для выгрузки.");
            return;
        }

        const win = window.open("", "_blank");
        if (!win) {
            setError("Не удалось открыть окно для печати PDF.");
            return;
        }

        const rows = donations
            .map((item) =>
                `<tr>
                    <td>${item.id}</td>
                    <td>${item.amount} ${item.currency}</td>
                    <td>${item.status}</td>
                    <td>${new Date(item.createdAt).toLocaleString()}</td>
                </tr>`
            )
            .join("");

        win.document.write(`
            <html lang="ru">
              <head>
                <title>История операций</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; }
                  h1 { margin-top: 0; }
                  table { border-collapse: collapse; width: 100%; }
                  th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; }
                  th { background: #f3f3f3; }
                </style>
              </head>
              <body>
                <h1>История операций (донаты)</h1>
                <table>
                  <thead>
                    <tr><th>ID</th><th>Сумма</th><th>Статус</th><th>Дата</th></tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>
              </body>
            </html>
        `);
        win.document.close();
        win.focus();
        win.print();
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
                            {hasServiceRole && <div><strong>Роли:</strong> {profile.roles.join(", ") || "—"}</div>}
                        </div>
                    </section>

                    <div className="account-wide-grid">
                        <section className="account-card">
                            <div className="account-card-header">
                                <h2>Донаты</h2>
                                <div className="account-card-actions">
                                    <button disabled={isCreatingDonation} onClick={handleCreateDonation} type="button">
                                        {isCreatingDonation ? "Создаём..." : "Поддержать проект (300 ₽)"}
                                    </button>
                                    <button onClick={exportDonationsCsv} type="button">Экспорт CSV</button>
                                    <button onClick={exportDonationsPdf} type="button">Экспорт PDF</button>
                                </div>
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
