import {useEffect, useMemo, useState} from "react";
import {Link} from "react-router-dom";
import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import {
    downloadAdminDonationEventsCsv,
    downloadAdminDonationEventsPdf,
    getAdminDonationEvents,
    getAdminDonationKpi
} from "../../../api/adminDonationApi";
import {getAccountProfile} from "../../../api/accountApi";
import type {
    AdminDonationEventPageResponse,
    AdminDonationKpiResponse,
    AccountProfileResponse
} from "../../../api/types";
import {readLocalAuthSession} from "../../../utils/localAuth";
import "../../../styles/pages/Account.scss";

const serviceRoles = new Set(["ADMIN", "MODERATOR", "SUPPORT", "DEVOPS", "PM", "EDITOR"]);
const pageSize = 10;

function isServiceRole(profile: AccountProfileResponse | null): boolean {
    return (profile?.roles ?? []).some((role) => serviceRoles.has(role.toUpperCase()));
}

function toDateStart(date: string): string | undefined {
    return date ? new Date(`${date}T00:00:00`).toISOString() : undefined;
}

function toDateEnd(date: string): string | undefined {
    return date ? new Date(`${date}T23:59:59.999`).toISOString() : undefined;
}

export function AdminDonationsView() {
    const [profile, setProfile] = useState<AccountProfileResponse | null>(() => {
        const session = readLocalAuthSession();
        return session ? {
            subject: session.subject,
            name: session.name,
            email: session.email,
            roles: session.roles
        } : null;
    });
    const [status, setStatus] = useState("ALL");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [page, setPage] = useState(0);
    const [kpi, setKpi] = useState<AdminDonationKpiResponse | null>(null);
    const [eventPage, setEventPage] = useState<AdminDonationEventPageResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const filters = useMemo(() => ({
        status,
        from: toDateStart(fromDate),
        to: toDateEnd(toDate),
        page,
        size: pageSize
    }), [fromDate, page, status, toDate]);

    useEffect(() => {
        if (!profile) {
            setIsLoading(false);
            return;
        }

        let isMounted = true;
        setIsLoading(true);
        setError("");

        Promise.all([
            getAccountProfile(),
            getAdminDonationKpi(filters),
            getAdminDonationEvents(filters)
        ])
            .then(([profileResponse, kpiResponse, eventsResponse]) => {
                if (!isMounted) {
                    return;
                }

                setProfile(profileResponse);
                setKpi(kpiResponse);
                setEventPage(eventsResponse);
            })
            .catch((loadError) => {
                if (!isMounted) {
                    return;
                }

                setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить административный экран.");
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [filters, profile?.subject]);

    const totalPages = eventPage ? Math.max(1, Math.ceil(eventPage.totalCount / eventPage.size)) : 1;
    const hasAccess = isServiceRole(profile);

    const exportCsv = async () => {
        setError("");
        try {
            await downloadAdminDonationEventsCsv(filters);
        } catch (downloadError) {
            setError(downloadError instanceof Error ? downloadError.message : "Не удалось выгрузить CSV.");
        }
    };

    const exportPdf = async () => {
        setError("");
        try {
            await downloadAdminDonationEventsPdf(filters);
        } catch (downloadError) {
            setError(downloadError instanceof Error ? downloadError.message : "Не удалось выгрузить PDF.");
        }
    };

    return BodyView(
        <main className="account-page">
            <Breadcrumbs
                items={[
                    {label: "Главная", to: "/home"},
                    {label: "Мой аккаунт", to: "/account"},
                    {label: "Админ-донаты"}
                ]}
            />

            {!profile && (
                <section className="account-card">
                    <h1>Админ-донаты</h1>
                    <p>Для доступа к административному экрану сначала войдите через внутреннюю форму авторизации.</p>
                    <Link className="account-inline-link" to="/account?mode=login">Перейти ко входу</Link>
                </section>
            )}

            {profile && !hasAccess && (
                <section className="account-card">
                    <h1>Админ-донаты</h1>
                    <p>Эта страница доступна только для служебных ролей. Для локальной отладки войдите под ролью `ADMIN` или `SUPPORT`.</p>
                    <Link className="account-inline-link" to="/account">Вернуться в личный кабинет</Link>
                </section>
            )}

            {profile && hasAccess && (
                <>
                    <section className="account-hero">
                        <h1>Административный экран донатов</h1>
                        <p>Отслеживайте статусы, источники и динамику пожертвований, не выходя из интерфейса Poprog.</p>
                    </section>

                    <section className="account-card">
                        <div className="account-card-header">
                            <h2>Фильтры</h2>
                            <div className="account-card-actions">
                                <button onClick={exportCsv} type="button">Экспорт CSV</button>
                                <button onClick={exportPdf} type="button">Экспорт PDF</button>
                            </div>
                        </div>

                        <div className="account-admin-filters">
                            <label>
                                Статус
                                <select
                                    onChange={(event) => {
                                        setStatus(event.target.value);
                                        setPage(0);
                                    }}
                                    value={status}
                                >
                                    <option value="ALL">Все</option>
                                    <option value="PENDING">PENDING</option>
                                    <option value="SUCCEEDED">SUCCEEDED</option>
                                    <option value="CANCELED">CANCELED</option>
                                </select>
                            </label>
                            <label>
                                С даты
                                <input
                                    onChange={(event) => {
                                        setFromDate(event.target.value);
                                        setPage(0);
                                    }}
                                    type="date"
                                    value={fromDate}
                                />
                            </label>
                            <label>
                                По дату
                                <input
                                    onChange={(event) => {
                                        setToDate(event.target.value);
                                        setPage(0);
                                    }}
                                    type="date"
                                    value={toDate}
                                />
                            </label>
                        </div>
                    </section>

                    {error.length > 0 && <p className="account-state account-state-error">{error}</p>}
                    {isLoading && <p className="account-state">Загружаем административные данные...</p>}

                    {!isLoading && kpi && (
                        <section className="account-admin-kpi-grid">
                            <article className="account-card">
                                <h2>Всего донатов</h2>
                                <p className="account-admin-kpi-value">{kpi.totalDonationsCount}</p>
                            </article>
                            <article className="account-card">
                                <h2>Успешные</h2>
                                <p className="account-admin-kpi-value">{kpi.succeededDonationsCount}</p>
                            </article>
                            <article className="account-card">
                                <h2>Сумма</h2>
                                <p className="account-admin-kpi-value">{kpi.totalAmount} ₽</p>
                            </article>
                            <article className="account-card">
                                <h2>Конверсия</h2>
                                <p className="account-admin-kpi-value">{kpi.conversionRatePercent}%</p>
                            </article>
                        </section>
                    )}

                    {!isLoading && eventPage && (
                        <section className="account-card">
                            <div className="account-card-header">
                                <h2>События пожертвований</h2>
                                <p>Всего записей: {eventPage.totalCount}</p>
                            </div>

                            {eventPage.items.length === 0 ? (
                                <p>По выбранным фильтрам данных нет.</p>
                            ) : (
                                <>
                                    <div className="account-admin-table-wrap">
                                        <table className="account-admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Дата</th>
                                                    <th>Сумма</th>
                                                    <th>Статус</th>
                                                    <th>Источник</th>
                                                    <th>Событие</th>
                                                    <th>ID провайдера</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {eventPage.items.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>{new Date(item.eventAt).toLocaleString()}</td>
                                                        <td>{item.amount} {item.currency}</td>
                                                        <td>{item.status}</td>
                                                        <td>{item.source ?? "—"}</td>
                                                        <td>{item.eventType}</td>
                                                        <td>{item.providerPaymentId ?? "—"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="account-admin-pagination">
                                        <button disabled={page <= 0} onClick={() => setPage((currentPage) => currentPage - 1)} type="button">
                                            Назад
                                        </button>
                                        <span>Страница {page + 1} из {totalPages}</span>
                                        <button
                                            disabled={page + 1 >= totalPages}
                                            onClick={() => setPage((currentPage) => currentPage + 1)}
                                            type="button"
                                        >
                                            Дальше
                                        </button>
                                    </div>
                                </>
                            )}
                        </section>
                    )}
                </>
            )}
        </main>
    );
}
