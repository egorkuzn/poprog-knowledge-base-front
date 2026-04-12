import {useEffect, useMemo, useState} from "react";
import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import {getMarketCategories, searchMarketApps} from "../../../api/marketApi";
import type {MarketApp} from "../../../api/types";
import "../../../styles/pages/Market.scss";

export function MarketView() {
    const [categories, setCategories] = useState<string[]>(["Все"]);
    const [selectedCategory, setSelectedCategory] = useState("Все");
    const [query, setQuery] = useState("");
    const [items, setItems] = useState<MarketApp[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        getMarketCategories()
            .then((response) => {
                if (!isMounted) {
                    return;
                }

                setCategories(["Все", ...response.categories]);
            })
            .catch(() => {
                if (!isMounted) {
                    return;
                }

                setCategories(["Все"]);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setError("");

        searchMarketApps(query, selectedCategory === "Все" ? null : selectedCategory)
            .then((response) => {
                if (!isMounted) {
                    return;
                }

                setItems(response.items);
                setTotal(response.total);
            })
            .catch((loadError) => {
                if (!isMounted) {
                    return;
                }

                setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить Poprog Market");
                setItems([]);
                setTotal(0);
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [query, selectedCategory]);

    const totalLabel = useMemo(() => {
        if (isLoading) {
            return "Загрузка...";
        }

        return `Найдено: ${total}`;
    }, [isLoading, total]);

    return BodyView(
        <main className="market-page">
            <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Poprog Market"}]}/>

            <section className="market-hero">
                <h1>Poprog Market</h1>
                <p>Каталог программных утилит для автоматизации, верификации и промышленной инженерии.</p>
            </section>

            <section className="market-controls">
                <input
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Поиск по утилитам"
                    type="search"
                    value={query}
                />

                <div className="market-categories" role="tablist" aria-label="Категории Poprog Market">
                    {categories.map((category) => (
                        <button
                            aria-selected={selectedCategory === category}
                            className={selectedCategory === category ? "market-category-active" : ""}
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            type="button"
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <p className="market-total">{totalLabel}</p>
            </section>

            {error.length > 0 && <p className="market-state market-state-error">{error}</p>}
            {isLoading && <p className="market-state">Загружаем каталог...</p>}

            {!isLoading && !error && (
                <section className="market-grid">
                    {items.map((item) => (
                        <article className="market-card" key={item.id}>
                            <span className="market-card-category">{item.category}</span>
                            <h3>{item.title}</h3>
                            <p>{item.summary}</p>
                            <div className="market-card-meta">
                                <span>{item.platform}</span>
                                <span>v{item.version}</span>
                                <span>{item.priceModel}</span>
                            </div>
                            <div className="market-tags">
                                {item.tags.map((tag) => <span key={`${item.id}-${tag}`}>{tag}</span>)}
                            </div>
                            <button disabled={!item.downloadUrl} type="button">{item.downloadUrl ? "Скачать" : "Скоро"}</button>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}
