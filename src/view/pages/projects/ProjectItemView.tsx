import {useMemo} from "react";
import {useParams} from "react-router-dom";
import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import "../../../styles/pages/Projects.scss";

interface LanguagePromo {
    title: string
    subtitle: string
    audience: string
    highlights: string[]
    outcomes: string[]
    cta: string
}

const languagePromos: Record<string, LanguagePromo> = {
    reflex: {
        title: "Reflex",
        subtitle: "Язык для разработки управляющего ПО в процесс-ориентированной модели",
        audience: "Инженеры АСУ ТП, команды ПЛК, разработчики embedded-логики",
        highlights: [
            "Читаемая модель процессов и событий",
            "Снижение количества ошибок синхронизации",
            "Подготовка к формальной верификации"
        ],
        outcomes: [
            "Сокращение времени на отладку",
            "Прозрачность архитектуры контроллерного ПО",
            "Быстрый онбординг новых инженеров"
        ],
        cta: "Запросить демо-пакет Reflex"
    },
    post: {
        title: "poST",
        subtitle: "Процесс-ориентированное расширение IEC 61131-3 Structured Text",
        audience: "Команды, работающие с ПЛК и переходящие к сложным распределённым сценариям",
        highlights: [
            "Совместимость с привычным ST-подходом",
            "Удобное описание параллельных процессов",
            "Инструментальная поддержка сценариев диагностики"
        ],
        outcomes: [
            "Более предсказуемое поведение систем",
            "Сокращение аварий из-за гонок состояний",
            "Повторное использование типовых паттернов"
        ],
        cta: "Получить гайд по poST"
    },
    "industrial-c": {
        title: "IndustrialC",
        subtitle: "Язык для промышленной автоматизации и real-time контуров",
        audience: "Производственные команды, которым нужна гибкость C и доменная строгость",
        highlights: [
            "Контроль над производительностью на уровне низкоуровневой логики",
            "Фокус на безопасных промышленных паттернах",
            "Интеграция с существующими цепочками сборки"
        ],
        outcomes: [
            "Стабильные релизы для критичных контуров",
            "Упрощение сопровождения legacy-частей",
            "Единый стиль кода для команд автоматизации"
        ],
        cta: "Запустить пилот IndustrialC"
    }
};

const projectItemTitles: Record<string, string> = {
    "languages-whats-new": "Что нового в языках",
    "success-stories": "Истории успеха",
    "ride-overview": "Обзор RIDE",
    "ride-cloud-launch": "Запуск в облаке",
    "ride-debug": "Инструменты отладки",
    "ride-whats-new": "Что нового в RIDE",
    "requirements": "Требования",
    "traceability": "Трассировка",
    "edtl-spec": "EDTL-спецификации",
    "edtl-whats-new": "Что нового в EDTL",
    "architecture-templates": "Шаблоны архитектур",
    "communication-modules": "Модули связи",
    "typical-solutions": "Типовые решения",
    "distributed-whats-new": "Что нового в распределенных системах",
    "code-checks": "Проверки кода",
    "quality-metrics": "Метрики качества",
    "analysis-reports": "Отчеты анализа",
    "analysis-whats-new": "Что нового в анализе"
};

export function ProjectItemView() {
    const {itemSlug = ""} = useParams();

    const languagePromo = useMemo(() => languagePromos[itemSlug], [itemSlug]);
    const fallbackTitle = useMemo(() => projectItemTitles[itemSlug] ?? "Элемент проекта", [itemSlug]);

    return BodyView(
        <main className="projects-page">
            <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Проекты", to: "/projects"}, {label: languagePromo?.title ?? fallbackTitle}]}/>

            {languagePromo ? (
                <section className="project-promo">
                    <header className="project-promo-hero">
                        <h1>{languagePromo.title}</h1>
                        <p>{languagePromo.subtitle}</p>
                    </header>

                    <div className="project-promo-grid">
                        <article className="project-promo-card">
                            <h2>Для кого</h2>
                            <p>{languagePromo.audience}</p>
                        </article>

                        <article className="project-promo-card">
                            <h2>Ключевые возможности</h2>
                            <ul>
                                {languagePromo.highlights.map((line) => <li key={line}>{line}</li>)}
                            </ul>
                        </article>

                        <article className="project-promo-card">
                            <h2>Бизнес-эффект</h2>
                            <ul>
                                {languagePromo.outcomes.map((line) => <li key={line}>{line}</li>)}
                            </ul>
                        </article>
                    </div>

                    <div className="project-promo-cta">
                        <button type="button">{languagePromo.cta}</button>
                    </div>
                </section>
            ) : (
                <section className="projects-placeholder-card">
                    <h1>{fallbackTitle}</h1>
                    <p>Контент раздела в работе. Сейчас здесь будет размещена полноценная презентация направления.</p>
                </section>
            )}
        </main>
    );
}
