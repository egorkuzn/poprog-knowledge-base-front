import {useMemo, useState} from "react";
import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import "../../../styles/common/PageShell.scss";

interface VideoCatalogItem {
    id: string
    title: string
    category: string
    keywords: string[]
    summary: string
}

const videoItems: VideoCatalogItem[] = [
    {
        id: "intro-poprog",
        title: "Введение в Poprog",
        category: "Обзор",
        keywords: ["платформа", "введение", "процессы"],
        summary: "Короткий обзор платформы, ролей пользователей и ключевых инженерных сценариев."
    },
    {
        id: "reflex-basics",
        title: "Reflex за 20 минут",
        category: "Языки",
        keywords: ["reflex", "синтаксис", "процессы"],
        summary: "Базовый синтаксис языка Reflex, модель процессов и первые практические примеры."
    },
    {
        id: "post-practice",
        title: "poST на практике",
        category: "Языки",
        keywords: ["post", "st", "миграция"],
        summary: "Как переносить логику с классического ST на процесс-ориентированный подход."
    },
    {
        id: "ride-cloud-workflow",
        title: "RIDE Cloud Workflow",
        category: "Инструменты",
        keywords: ["ride", "cloud", "командная работа"],
        summary: "Совместная разработка, проверка сценариев и диагностика прямо в командном контуре."
    },
    {
        id: "edtl-traceability",
        title: "EDTL и трассировка требований",
        category: "Требования",
        keywords: ["edtl", "трассировка", "требования"],
        summary: "От требований к исполняемым спецификациям и обратно через прозрачные связи."
    },
    {
        id: "static-analysis",
        title: "Статический анализ контроллерного кода",
        category: "Качество",
        keywords: ["статический анализ", "qa", "industrial"],
        summary: "Практики раннего обнаружения дефектов и построения устойчивых quality gate."
    },
    {
        id: "industrial-migration",
        title: "Миграция legacy-контуров",
        category: "Кейсы",
        keywords: ["legacy", "модернизация", "промышленность"],
        summary: "Кейс перевода унаследованных систем в поддерживаемую архитектуру без остановки процессов."
    }
];

const categories = ["Все", "Обзор", "Языки", "Инструменты", "Требования", "Качество", "Кейсы"];

export function VideoView() {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("Все");

    const visibleItems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return videoItems.filter((item) => {
            const matchesCategory = category === "Все" || item.category === category;
            const haystack = [item.title, item.summary, ...item.keywords].join(" ").toLowerCase();
            const matchesQuery = normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
            return matchesCategory && matchesQuery;
        });
    }, [category, query]);

    return BodyView(
        <main className="site-page">
            <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Видео"}]}/>
            <section className="site-page-content">
                <h1>Видео</h1>
                <p className="site-page-muted">
                    Каталог записей по процесс-ориентированному программированию, инженерным инструментам и практикам внедрения.
                </p>

                <label>
                    Поиск по названию и ключевым словам
                    <input
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Например, Reflex, трассировка, legacy"
                        type="search"
                        value={query}
                    />
                </label>

                <h2>Категории</h2>
                <div className="site-page-chip-row">
                    {categories.map((item) => (
                        <button
                            className={category === item ? "site-page-chip site-page-chip-active" : "site-page-chip"}
                            key={item}
                            onClick={() => setCategory(item)}
                            type="button"
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <h2>Каталог видео</h2>
                <p className="site-page-muted">Найдено материалов: {visibleItems.length}</p>

                {visibleItems.length === 0 ? (
                    <p>По выбранным фильтрам записи пока не найдены. Попробуйте изменить запрос или категорию.</p>
                ) : (
                    <ul className="site-page-card-list">
                        {visibleItems.map((item) => (
                            <li className="site-page-card-item" key={item.id}>
                                <strong>{item.title}</strong>
                                <p><strong>Категория:</strong> {item.category}</p>
                                <p>{item.summary}</p>
                                <p><strong>Ключевые слова:</strong> {item.keywords.join(", ")}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}
