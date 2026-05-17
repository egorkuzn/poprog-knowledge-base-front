import {useMemo} from "react";
import {Link, useParams} from "react-router-dom";
import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import "../../../styles/pages/Projects.scss";

type ProjectDocsStatus = "ready" | "draft";

interface ProjectDocsSection {
    id: string
    title: string
    body: string
    bullets: string[]
}

interface ProjectDocsLink {
    label: string
    to: string
}

interface ProjectDocsContent {
    title: string
    status: ProjectDocsStatus
    summary: string
    sections: ProjectDocsSection[]
    links: ProjectDocsLink[]
}

const coreLinks: ProjectDocsLink[] = [
    {label: "Публикации", to: "/publications"},
    {label: "Студенческие работы", to: "/works"},
    {label: "Видео", to: "/video"},
    {label: "Задать вопрос ИИ", to: "/chat"}
];

const projectDocsMap: Record<string, ProjectDocsContent> = {
    reflex: {
        title: "Reflex",
        status: "ready",
        summary: "Документация по процесс-ориентированному языку Reflex: модель процессов, события, сценарии запуска и дальнейшее изучение.",
        sections: [
            {
                id: "overview",
                title: "Назначение",
                body: "Reflex используется для описания управляющего программного обеспечения через процессы и события, чтобы поведение системы было проще читать, проверять и сопровождать.",
                bullets: ["процессная модель вместо неявной логики состояний", "подходит для embedded и промышленной автоматизации", "удобен как точка входа в технологии Poprog"]
            },
            {
                id: "start",
                title: "Быстрый старт",
                body: "Начинать лучше с обзора модели исполнения, затем перейти к простому процессу, обработке событий и диагностике типовых ошибок.",
                bullets: ["изучить базовые конструкции языка", "разобрать пример управляющего процесса", "связать пример с публикациями и учебными работами"]
            },
            {
                id: "materials",
                title: "Материалы",
                body: "Раздел собирает ссылки на материалы портала, которые помогают перейти от знакомства с языком к практическому применению.",
                bullets: ["научные публикации по Reflex", "студенческие работы и демонстрационные проекты", "видеоматериалы и ответы ИИ-агента"]
            }
        ],
        links: coreLinks
    },
    post: {
        title: "poST",
        status: "ready",
        summary: "Документация по poST как процесс-ориентированному расширению Structured Text для команд, работающих с ПЛК и IEC 61131-3.",
        sections: [
            {
                id: "overview",
                title: "Назначение",
                body: "poST помогает описывать параллельные и событийные сценарии в привычной для автоматизации ST-парадигме, но с более явной процессной структурой.",
                bullets: ["связь с IEC 61131-3 Structured Text", "описание параллельных процессов", "снижение риска гонок состояний"]
            },
            {
                id: "start",
                title: "Быстрый старт",
                body: "Для первого знакомства полезно сравнить типовой ST-фрагмент с poST-представлением и посмотреть, какие состояния становятся явными.",
                bullets: ["выбрать небольшой ST-сценарий", "выделить процессы и события", "проверить сценарий через материалы портала"]
            },
            {
                id: "materials",
                title: "Материалы",
                body: "Связанные материалы будут расширяться по мере наполнения базы знаний и появления новых демонстраций.",
                bullets: ["публикации по poST", "учебные и выпускные работы", "релизные заметки и видеообзоры"]
            }
        ],
        links: coreLinks
    },
    "industrial-c": {
        title: "IndustrialC",
        status: "draft",
        summary: "Черновой центр документации по IndustrialC: промышленная автоматизация, real-time контуры и безопасные инженерные практики.",
        sections: [
            {
                id: "overview",
                title: "Назначение",
                body: "IndustrialC ориентирован на команды, которым нужна гибкость C вместе с доменными ограничениями и практиками промышленной разработки.",
                bullets: ["низкоуровневый контроль исполнения", "фокус на надежности промышленных контуров", "интеграция с существующими цепочками сборки"]
            },
            {
                id: "start",
                title: "Что будет добавлено",
                body: "Раздел готовится как точка входа: обзор языка, требования к окружению, примеры и ссылки на связанные материалы.",
                bullets: ["первый пример IndustrialC", "гайд по запуску окружения", "связанные публикации и учебные работы"]
            },
            {
                id: "materials",
                title: "Связанные разделы",
                body: "Пока документация неполная, пользователь не должен попадать в тупик: доступны поиск, публикации, работы и чат.",
                bullets: ["искать материалы по IndustrialC", "задать вопрос ИИ-агенту", "перейти к общему каталогу проектов"]
            }
        ],
        links: coreLinks
    }
};

const genericDocsTitles: Record<string, string> = {
    "languages-whats-new": "Что нового в языках",
    "ride-overview": "RIDE",
    "ride-cloud-launch": "Запуск RIDE в облаке",
    "ride-debug": "Инструменты отладки RIDE",
    "ride-whats-new": "Что нового в RIDE",
    requirements: "Требования",
    traceability: "Трассировка",
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

function buildDraftDocs(slug: string): ProjectDocsContent {
    const title = genericDocsTitles[slug] ?? "Проект";

    return {
        title,
        status: "draft",
        summary: `Документация раздела «${title}» готовится. Вместо общей инструкции портала здесь показана проектная точка входа и быстрые переходы к связанным материалам.`,
        sections: [
            {
                id: "scope",
                title: "Что будет в разделе",
                body: "На этой странице будут собраны пользовательские инструкции, архитектурные заметки, демонстрационные сценарии и ссылки на материалы базы знаний.",
                bullets: ["назначение проекта или технологии", "первые шаги для пользователя", "ссылки на публикации, работы, видео и поддержку"]
            },
            {
                id: "current",
                title: "Текущий статус",
                body: "Пока содержимое не наполнено, пользователь остается в контексте выбранного проекта и может перейти в смежные разделы, а не на общую страницу-заглушку.",
                bullets: ["не теряется выбранная технология", "виден статус подготовки", "доступны быстрые действия"]
            }
        ],
        links: [
            {label: "Все проекты", to: "/projects"},
            {label: "Поддержка", to: "/support"},
            {label: "Связаться с нами", to: "/contact"},
            {label: "Задать вопрос ИИ", to: "/chat"}
        ]
    };
}

export function ProjectDocsView() {
    const {itemSlug = ""} = useParams();
    const content = useMemo(() => projectDocsMap[itemSlug] ?? buildDraftDocs(itemSlug), [itemSlug]);
    const statusLabel = content.status === "ready" ? "Документация доступна" : "Раздел готовится";

    return BodyView(
        <main className="projects-page project-docs-page">
            <Breadcrumbs items={[
                {label: "Главная", to: "/home"},
                {label: "Проекты", to: "/projects"},
                {label: content.title, to: `/projects/${itemSlug}`},
                {label: "Документация"}
            ]}/>

            <section className="project-docs-layout">
                <aside className="project-docs-sidebar" aria-label="Навигация по документации проекта">
                    <span className={`project-docs-status project-docs-status-${content.status}`}>{statusLabel}</span>
                    {content.sections.map((section) => (
                        <a href={`#${section.id}`} key={section.id}>{section.title}</a>
                    ))}
                </aside>

                <article className="project-docs-content">
                    <header className="project-docs-hero">
                        <span>Документация проекта</span>
                        <h1>{content.title}</h1>
                        <p>{content.summary}</p>
                    </header>

                    {content.sections.map((section) => (
                        <section className="project-docs-section" id={section.id} key={section.id}>
                            <h2>{section.title}</h2>
                            <p>{section.body}</p>
                            <ul>
                                {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                            </ul>
                        </section>
                    ))}

                    <section className="project-docs-links" aria-label="Связанные разделы">
                        <h2>Быстрые переходы</h2>
                        <div>
                            {content.links.map((link) => <Link key={link.to} to={link.to}>{link.label}</Link>)}
                        </div>
                    </section>
                </article>
            </section>
        </main>
    );
}
