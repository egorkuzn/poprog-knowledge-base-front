import {useCallback, useEffect, useMemo, useState} from "react";
import type {ChangeEvent} from "react";
import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import {getLab19News} from "../../../api/knowledgeBaseApi";
import type {Lab19NewsItemResponse} from "../../../api/types";
import {useRemoteData} from "../../../hooks/useRemoteData";
import "../../../styles/pages/News.scss";

type NewsFilterKind = "NEWS";

export function NewsView() {
    const [query, setQuery] = useState("");
    const [year, setYear] = useState<string>("");
    const [offset, setOffset] = useState(0);
    const limit = 40;
    const kind: NewsFilterKind = "NEWS";

    const parsedYear = useMemo(() => {
        const value = year.trim();
        if (!value) return undefined;
        const num = Number(value);
        return Number.isFinite(num) ? num : undefined;
    }, [year]);

    const load = useCallback(
        () => getLab19News({q: query.trim() || undefined, year: parsedYear, kind, limit, offset}),
        [query, parsedYear, kind, limit, offset]
    );
    const {data, error, isLoading} = useRemoteData(load);

    useEffect(() => {
        // When filters change, restart pagination from the beginning.
        setOffset(0);
    }, [query, year]);

    const onQueryChange = (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value);
    const onYearChange = (event: ChangeEvent<HTMLInputElement>) => setYear(event.target.value);

    const canLoadMore = !isLoading && !error && (data?.length ?? 0) === limit;

    return BodyView(page({
        items: data,
        isLoading,
        error,
        query,
        year,
        onQueryChange,
        onYearChange,
        onLoadMore: () => setOffset((prev) => prev + limit),
        canLoadMore
    }));
}

function page(props: {
    items: Lab19NewsItemResponse[] | null
    isLoading: boolean
    error: string | null
    query: string
    year: string
    onQueryChange: (event: ChangeEvent<HTMLInputElement>) => void
    onYearChange: (event: ChangeEvent<HTMLInputElement>) => void
    onLoadMore: () => void
    canLoadMore: boolean
}) {
    return (
        <main>
            <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Новости"}]}/>
            <div className="news-page">
                <header className="news-header">
                    <div>
                        <h1>Новости</h1>
                        <p className="news-subtitle">
                            Новостные и событийные материалы лаборатории 19 ИАиЭ СО РАН. Это не научная библиография.
                        </p>
                    </div>
                    <div className="news-filters">
                        <label className="news-filter">
                            <span>Поиск</span>
                            <input
                                value={props.query}
                                onChange={props.onQueryChange}
                                placeholder="Например: конференция, семинар, грант"
                                type="search"
                            />
                        </label>
                        <label className="news-filter">
                            <span>Год</span>
                            <input
                                inputMode="numeric"
                                maxLength={4}
                                value={props.year}
                                onChange={props.onYearChange}
                                placeholder="2024"
                                type="text"
                            />
                        </label>
                    </div>
                </header>

                {props.isLoading && <p className="remote-data-state">Загрузка новостей...</p>}
                {props.error && <p className="remote-data-state remote-data-state-error">Не удалось загрузить новости: {props.error}</p>}
                {!props.isLoading && !props.error && props.items?.length === 0 && (
                    <p className="remote-data-state">Материалы пока не найдены.</p>
                )}

                <div className="news-grid">
                    {props.items?.map((item) => (
                        <article className="news-card" key={item.id}>
                            <div className="news-card-meta">
                                <span>{item.year ?? "—"}</span>
                                <span className="news-card-source">Источник: {item.sourcePage}</span>
                            </div>
                            <h2 className="news-card-title">
                                <a href={item.sourceUrl} rel="noopener noreferrer" target="_blank">{item.title}</a>
                            </h2>
                            <div className="news-card-actions">
                                <a className="news-card-link" href={item.sourceUrl} rel="noopener noreferrer" target="_blank">
                                    Открыть материал
                                </a>
                            </div>
                        </article>
                    ))}
                </div>

                {props.canLoadMore && (
                    <div className="news-more">
                        <button className="news-more-button" onClick={props.onLoadMore} type="button">Показать еще</button>
                    </div>
                )}
            </div>
        </main>
    );
}

