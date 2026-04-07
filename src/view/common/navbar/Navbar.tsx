import {useEffect, useMemo, useRef, useState} from "react";
import {Link, NavLink, useLocation} from "react-router-dom";
import {searchKnowledgeBase} from "../../../api/knowledgeBaseApi";
import {apiBaseUrl} from "../../../api/config";
import type {SearchResultItem} from "../../../api/types";
import {
    EXTERNAL_NAVIGATION_REQUEST_EVENT,
    openExternalUrlInNewTabWithCheck,
    type ExternalNavigationRequestDetail
} from "../../../utils/externalNavigation";
import {NavigationTree} from "../../../data/navbar/NavigationTree";
import searchIcon from "../../../assets/home/icons/search.svg";
import accountIcon from "../../../assets/home/icons/account.svg";
import supportIcon from "../../../assets/home/icons/support.svg";
import arrowRightAltIcon from "../../../assets/home/icons/arrow-right-alt.svg";
import caseOneImage from "../../../assets/home/cases/case-1.png";
import caseTwoImage from "../../../assets/home/cases/case-2.png";

type SearchState = "idle" | "loading" | "ready" | "error";
type ProjectLeafItem = { slug: string, title: string };

const topLinks = [
    {label: "Помочь проекту", href: "#support", icon: supportIcon},
    {label: "Свяжитесь с нами", href: "#contacts"},
    {label: "Poprog маркет", href: "#market"},
    {label: "Поддержка", href: "#support"},
    {label: "Мой аккаунт", href: "#account", icon: accountIcon}
];

const projectsCategories = [
    {
        key: "languages",
        label: "Языки программирования",
        title: "Языки программирования",
        description: "Программируйте ПЛК и микроконтроллеры на инновационных языках быстрее и проще",
        centerLinkLabel: "Перейти в центр Языков программирования"
    },
    {
        key: "ride",
        label: "Облачная среда разработки RIDE",
        title: "Облачная среда разработки RIDE",
        description: "Создавайте, тестируйте и поддерживайте программы в единой среде разработки",
        centerLinkLabel: "Перейти в центр RIDE"
    },
    {
        key: "edtl",
        label: "Инженерия требований и EDTL",
        title: "Инженерия требований и EDTL",
        description: "Формализуйте требования и связывайте их с исполняемыми спецификациями",
        centerLinkLabel: "Перейти в центр инженерии требований"
    },
    {
        key: "distributed",
        label: "Распределенные микроконтроллерные системы",
        title: "Распределенные микроконтроллерные системы",
        description: "Проектируйте устойчивые многоконтурные системы для производственных задач",
        centerLinkLabel: "Перейти в центр распределенных систем"
    },
    {
        key: "analysis",
        label: "Инструменты статического анализа",
        title: "Инструменты статического анализа",
        description: "Анализируйте код и модели заранее, чтобы снижать риски на этапе разработки",
        centerLinkLabel: "Перейти в центр статического анализа"
    }
];

const mobileProjectsItemsByCategory: Record<string, ProjectLeafItem[]> = {
    languages: [
        {slug: "reflex", title: "Reflex"},
        {slug: "post", title: "poST"},
        {slug: "industrial-c", title: "IndustrialC"},
        {slug: "languages-whats-new", title: "Что нового?"},
        {slug: "success-stories", title: "Истории успеха"}
    ],
    ride: [
        {slug: "ride-overview", title: "Обзор RIDE"},
        {slug: "ride-cloud-launch", title: "Запуск в облаке"},
        {slug: "ride-debug", title: "Инструменты отладки"},
        {slug: "ride-whats-new", title: "Что нового?"}
    ],
    edtl: [
        {slug: "requirements", title: "Требования"},
        {slug: "traceability", title: "Трассировка"},
        {slug: "edtl-spec", title: "EDTL-спецификации"},
        {slug: "edtl-whats-new", title: "Что нового?"}
    ],
    distributed: [
        {slug: "architecture-templates", title: "Шаблоны архитектур"},
        {slug: "communication-modules", title: "Модули связи"},
        {slug: "typical-solutions", title: "Типовые решения"},
        {slug: "distributed-whats-new", title: "Что нового?"}
    ],
    analysis: [
        {slug: "code-checks", title: "Проверки кода"},
        {slug: "quality-metrics", title: "Метрики качества"},
        {slug: "analysis-reports", title: "Отчеты анализа"},
        {slug: "analysis-whats-new", title: "Что нового?"}
    ]
};

type MobileProjectsMenuStage = "root" | "groups" | "items";

function getSearchResultTitle(item: SearchResultItem): string {
    return item.theme;
}

function getSearchResultDescription(item: SearchResultItem): string {
    const fragments = [item.authors, item.published].filter(Boolean);
    return fragments.length > 0 ? fragments.join(" · ") : "Материал портала";
}

function getSearchResultTypeLabel(item: SearchResultItem): string {
    const normalizedType = item.type.toLowerCase();

    if (normalizedType.includes("publication")) {
        return "Публикация";
    }

    if (normalizedType.includes("work") || normalizedType.includes("diploma") || normalizedType.includes("dissertation")) {
        return "Работа";
    }

    if (normalizedType.includes("project")) {
        return "Проект";
    }

    return "Материал";
}

function getSearchResultFallbackTarget(item: SearchResultItem): string {
    const normalizedType = item.type.toLowerCase();

    if (normalizedType.includes("publication")) {
        return "/publications";
    }

    if (normalizedType.includes("work") || normalizedType.includes("diploma") || normalizedType.includes("dissertation")) {
        return "/works";
    }

    if (normalizedType.includes("project")) {
        return "/home";
    }

    if (normalizedType.includes("doc")) {
        return "/docs";
    }

    return "/home";
}

function getApiHostFromBaseUrl(): string {
    if (apiBaseUrl.length === 0) {
        return "http://localhost:8080";
    }

    if (apiBaseUrl.startsWith("http://") || apiBaseUrl.startsWith("https://")) {
        try {
            return new URL(apiBaseUrl).origin;
        } catch {
            return apiBaseUrl;
        }
    }

    return apiBaseUrl;
}

function resolveSearchResultNavigation(item: SearchResultItem): { externalUrl?: string, internalPath: string } {
    const rawLink = item.link?.trim();
    const fallbackPath = getSearchResultFallbackTarget(item);

    if (!rawLink) {
        return {internalPath: fallbackPath};
    }

    const normalizedAbsoluteCandidate = rawLink.replace(/^\/+/, "");

    if (/^https?:\/\//i.test(rawLink)) {
        return {externalUrl: rawLink, internalPath: fallbackPath};
    }

    if (/^https?:\/\//i.test(normalizedAbsoluteCandidate)) {
        return {externalUrl: normalizedAbsoluteCandidate, internalPath: fallbackPath};
    }

    if (rawLink.startsWith("//")) {
        return {externalUrl: `https:${rawLink}`, internalPath: fallbackPath};
    }

    const apiHost = getApiHostFromBaseUrl().replace(/\/+$/, "");
    const normalizedLink = rawLink.replace(/^\/+/, "");
    return {
        externalUrl: `${apiHost}/${normalizedLink}`,
        internalPath: fallbackPath
    };
}

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isProjectsPanelOpen, setIsProjectsPanelOpen] = useState(false);
    const [activeProjectsCategoryIndex, setActiveProjectsCategoryIndex] = useState(0);
    const [mobileProjectsMenuStage, setMobileProjectsMenuStage] = useState<MobileProjectsMenuStage>("root");
    const [mobileProjectsCategoryIndex, setMobileProjectsCategoryIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchState, setSearchState] = useState<SearchState>("idle");
    const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
    const [searchError, setSearchError] = useState("");
    const [externalNavigationRequest, setExternalNavigationRequest] = useState<ExternalNavigationRequestDetail | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const projectsPanelRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const requestIdRef = useRef(0);
    const location = useLocation();
    const trimmedQuery = searchQuery.trim();

    useEffect(() => {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
        setIsProjectsPanelOpen(false);
        setMobileProjectsMenuStage("root");
    }, [location.pathname]);

    useEffect(() => {
        if (!isMenuOpen) {
            setMobileProjectsMenuStage("root");
        }
    }, [isMenuOpen]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches && isMenuOpen) {
                return;
            }

            const clickedNode = event.target as Node;
            const clickedOutsideMenu = !menuRef.current || !menuRef.current.contains(clickedNode);
            const clickedOutsideProjectsPanel = !projectsPanelRef.current || !projectsPanelRef.current.contains(clickedNode);

            if (clickedOutsideMenu && clickedOutsideProjectsPanel) {
                setIsMenuOpen(false);
                setIsProjectsPanelOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsMenuOpen(false);
                setIsSearchOpen(false);
                setIsProjectsPanelOpen(false);
                setExternalNavigationRequest(null);
            }
        };

        const handleOpenSearch = () => {
            setIsMenuOpen(false);
            setIsProjectsPanelOpen(false);
            setIsSearchOpen(true);
        };

        const handleExternalNavigationRequest = (event: Event) => {
            const customEvent = event as CustomEvent<ExternalNavigationRequestDetail>;
            const targetUrl = customEvent.detail?.targetUrl;

            if (!targetUrl) {
                return;
            }

            setIsMenuOpen(false);
            setIsSearchOpen(false);
            setIsProjectsPanelOpen(false);
            setExternalNavigationRequest({
                targetUrl,
                notFoundPath: customEvent.detail?.notFoundPath
            });
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);
        window.addEventListener("site-search:open", handleOpenSearch);
        window.addEventListener(EXTERNAL_NAVIGATION_REQUEST_EVENT, handleExternalNavigationRequest as EventListener);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
            window.removeEventListener("site-search:open", handleOpenSearch);
            window.removeEventListener(EXTERNAL_NAVIGATION_REQUEST_EVENT, handleExternalNavigationRequest as EventListener);
        };
    }, [isMenuOpen]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const mediaQuery = window.matchMedia("(max-width: 720px)");
        const handleChange = (event: MediaQueryListEvent) => {
            if (event.matches) {
                setIsProjectsPanelOpen(false);
            }
        };

        if (mediaQuery.matches) {
            setIsProjectsPanelOpen(false);
        }

        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    useEffect(() => {
        if (!isSearchOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        inputRef.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isSearchOpen]);

    useEffect(() => {
        if (!isProjectsPanelOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isProjectsPanelOpen]);

    useEffect(() => {
        if (!isMenuOpen || typeof window === "undefined" || !window.matchMedia("(max-width: 720px)").matches) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMenuOpen]);

    useEffect(() => {
        if (!isSearchOpen || trimmedQuery.length === 0) {
            setSearchState("idle");
            setSearchResults([]);
            setSearchError("");
            return;
        }

        const currentRequestId = ++requestIdRef.current;
        setSearchState("loading");
        setSearchError("");

        const timeoutId = window.setTimeout(async () => {
            try {
                const response = await searchKnowledgeBase(trimmedQuery, 8);

                if (requestIdRef.current !== currentRequestId) {
                    return;
                }

                setSearchResults(Array.isArray(response.items) ? response.items : []);
                setSearchState("ready");
            } catch (error) {
                if (requestIdRef.current !== currentRequestId) {
                    return;
                }

                setSearchResults([]);
                setSearchState("error");
                setSearchError(error instanceof Error ? error.message : "Не удалось выполнить поиск");
            }
        }, 250);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [isSearchOpen, trimmedQuery]);

    const searchResultContent = useMemo(() => {
        if (trimmedQuery.length === 0) {
            return <p className="site-search-status">Введите запрос, чтобы найти публикации и студенческие работы.</p>;
        }

        if (searchState === "loading") {
            return <p className="site-search-status">Ищем материалы по порталу...</p>;
        }

        if (searchState === "error") {
            return <p className="site-search-status site-search-status-error">Не удалось выполнить поиск: {searchError}</p>;
        }

        if (!Array.isArray(searchResults) || searchResults.length === 0) {
            return <p className="site-search-status">Ничего не найдено. Попробуйте изменить запрос.</p>;
        }

        return (
            <div className="site-search-results-list">
                {searchResults.map((item, index) => (
                    <button
                        className="site-search-result-card"
                        key={`${item.type}-${item.id}-${item.sourceId ?? index}`}
                        onClick={() => {
                            setIsSearchOpen(false);
                            void openSearchResultInNewTab(item);
                        }}
                        type="button"
                    >
                        <span className="site-search-result-type">{getSearchResultTypeLabel(item)}</span>
                        <strong>{getSearchResultTitle(item)}</strong>
                        <span>{getSearchResultDescription(item)}</span>
                    </button>
                ))}
            </div>
        );
    }, [searchError, searchResults, searchState, trimmedQuery]);

    const toggleSearch = () => {
        setIsMenuOpen(false);
        setIsProjectsPanelOpen(false);
        setIsSearchOpen((isOpen) => !isOpen);
    };

    const activeProjectsCategory = projectsCategories[activeProjectsCategoryIndex] ?? projectsCategories[0];
    const mobileProjectsCategory = projectsCategories[mobileProjectsCategoryIndex] ?? projectsCategories[0];
    const mobileProjectsItems = mobileProjectsItemsByCategory[mobileProjectsCategory.key] ?? [];

    const closeProjectsPanel = () => {
        setIsProjectsPanelOpen(false);
    };

    const openSearchResultInNewTab = async (item: SearchResultItem) => {
        const navigationTarget = resolveSearchResultNavigation(item);

        if (!navigationTarget.externalUrl) {
            window.open(`${window.location.origin}${navigationTarget.internalPath}`, "_blank");
            return;
        }
        setExternalNavigationRequest({
            targetUrl: navigationTarget.externalUrl
        });
    };

    return (
        <header className={`site-header${isSearchOpen ? " site-header-search-open" : ""}${isProjectsPanelOpen ? " site-header-projects-open" : ""}`}>
            <div className="site-header-stack">
                <div className="site-header-top">
                    <div className="site-header-top-links">
                        {topLinks.map((link) => (
                            <a className="site-header-top-link" href={link.href} key={link.label}>
                                <span>{link.label}</span>
                                {link.icon && <img alt="" aria-hidden="true" src={link.icon}/>}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="site-header-main">
                    <Link className="site-brand" to="/home">Poprog</Link>

                    <div className="site-header-main-content">
                        <div className="site-navigation-shell" ref={menuRef}>
                            <nav aria-label="Главная навигация" className="site-navigation">
                                {NavigationTree.map(([path, title]) => (
                                    path === "/projects" ? (
                                        <button
                                            aria-expanded={isProjectsPanelOpen}
                                            className={`site-navigation-link${isProjectsPanelOpen || location.pathname === path ? " site-navigation-link-active" : ""}`}
                                            key={path}
                                            onClick={() => {
                                                setIsSearchOpen(false);
                                                setIsMenuOpen(false);
                                                setIsProjectsPanelOpen((isOpen) => !isOpen);
                                            }}
                                            type="button"
                                        >
                                            {title}
                                        </button>
                                    ) : (
                                        <NavLink
                                            className={({isActive}) => `site-navigation-link${isActive ? " site-navigation-link-active" : ""}`}
                                            key={path}
                                            to={path}
                                        >
                                            {title}
                                        </NavLink>
                                    )
                                ))}
                            </nav>

                            <button
                                aria-expanded={isMenuOpen}
                                className={`site-navigation-link site-navigation-menu-button${isMenuOpen ? " site-navigation-link-active" : ""}`}
                                onClick={() => {
                                    setIsSearchOpen(false);
                                    setIsProjectsPanelOpen(false);
                                    setIsMenuOpen((isOpen) => !isOpen);
                                }}
                                type="button"
                            >
                                <span aria-hidden="true" className="site-navigation-menu-icon">
                                    <span/>
                                    <span/>
                                    <span/>
                                </span>
                                <span aria-hidden="true" className="site-navigation-menu-close site-search-x-button"/>
                                <span className="site-navigation-menu-copy">
                                    <span className="site-navigation-menu-label">Меню</span>
                                    <span aria-hidden="true" className="site-navigation-menu-caret">
                                        <svg role="presentation" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                                            <path d="M8.00004 11C7.74004 11 7.49004 10.9 7.29004 10.71L3.79004 7.21005L5.20004 5.80005L7.99004 8.59005L10.78 5.80005L12.19 7.21005L8.69004 10.71C8.49004 10.91 8.24004 11 7.98004 11H8.00004Z"/>
                                        </svg>
                                    </span>
                                </span>
                            </button>

                            {isMenuOpen && (
                                <div className="site-navigation-dropdown">
                                    {NavigationTree.map(([path, title]) => (
                                        path === "/projects" ? (
                                            <button
                                                className="site-navigation-link site-navigation-dropdown-link"
                                                key={`dropdown-${path}`}
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    setIsSearchOpen(false);
                                                    setIsProjectsPanelOpen(true);
                                                }}
                                                type="button"
                                            >
                                                {title}
                                            </button>
                                        ) : (
                                            <NavLink
                                                className={({isActive}) => `site-navigation-link site-navigation-dropdown-link${isActive ? " site-navigation-link-active" : ""}`}
                                                key={`dropdown-${path}`}
                                                to={path}
                                            >
                                                {title}
                                            </NavLink>
                                        )
                                    ))}

                                    <div className="site-navigation-dropdown-actions">
                                        <div className="site-navigation-dropdown-divider"/>

                                        <button className="site-navigation-link site-navigation-dropdown-link" type="button">
                                            Вход в консоль
                                        </button>
                                        <button className="site-navigation-link site-navigation-dropdown-link" type="button">
                                            Создать аккаунт
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="site-header-actions">
                            <button className={`site-search-button${isSearchOpen ? " site-search-button-active" : ""}`} onClick={toggleSearch} type="button">
                                <img alt="" aria-hidden="true" src={searchIcon}/>
                                <span>Поиск</span>
                            </button>
                            <button className="site-console-button" type="button">Вход в консоль</button>
                            <button className="site-account-button" type="button">Создать аккаунт</button>
                            <button className="site-mobile-account-button" type="button">
                                <img alt="" aria-hidden="true" src={accountIcon}/>
                            </button>
                        </div>
                    </div>

                </div>

                {isProjectsPanelOpen && (
                    <div className="site-projects-panel" ref={projectsPanelRef} role="dialog" aria-label="Панель проектов">
                        <button
                            aria-label="Закрыть панель проектов"
                            className="site-projects-panel-close site-search-x-button"
                            onClick={closeProjectsPanel}
                            type="button"
                        />

                        <div className="site-projects-panel-layout">
                            <aside className="site-projects-panel-sidebar" aria-label="Разделы проектов">
                                {projectsCategories.map((category, index) => (
                                    <button
                                        className={`site-projects-category${index === activeProjectsCategoryIndex ? " site-projects-category-active" : ""}`}
                                        key={category.key}
                                        onClick={() => setActiveProjectsCategoryIndex(index)}
                                        type="button"
                                    >
                                        {category.label}
                                    </button>
                                ))}
                            </aside>

                            <section className="site-projects-panel-content">
                                <h3>{activeProjectsCategory.title}</h3>
                                <p>{activeProjectsCategory.description}</p>
                                <Link className="site-projects-panel-center-link" onClick={closeProjectsPanel} to="/home">
                                    {activeProjectsCategory.centerLinkLabel}
                                </Link>

                                <div className="site-projects-panel-top-row">
                                    <Link className="site-projects-feature-card site-projects-hover-card" onClick={closeProjectsPanel} to="/home">
                                        <div className="site-projects-feature-copy">
                                            <strong>Reflex</strong>
                                            <span>Язык для разработки ПО микроконтроллеров во встраиваемых системах с использованием методик процесс-ориентированного программирования</span>
                                        </div>
                                        <img alt="" aria-hidden="true" className="site-projects-card-arrow" src={arrowRightAltIcon}/>
                                    </Link>

                                    <article className="site-projects-plain-card site-projects-hover-card">
                                        <strong>poST</strong>
                                        <span>Процесс-ориентированное расширение языка Structured Text (ST) для программирования алгоритмически сложных управляющих программ для ПЛК</span>
                                        <img alt="" aria-hidden="true" className="site-projects-card-arrow" src={arrowRightAltIcon}/>
                                    </article>

                                    <article className="site-projects-plain-card site-projects-hover-card">
                                        <strong>IndustrialC</strong>
                                        <span>Специализированный процесс-ориентированный язык программирования для задач промышленной автоматизации и систем реального времени с синтаксисом, похожим на Cи</span>
                                        <img alt="" aria-hidden="true" className="site-projects-card-arrow" src={arrowRightAltIcon}/>
                                    </article>
                                </div>

                                <div className="site-projects-panel-bottom-row">
                                    <Link className="site-projects-news-card site-projects-hover-card" onClick={closeProjectsPanel} to="/home">
                                        <img alt="" className="site-projects-news-image" src={caseOneImage}/>
                                        <div className="site-projects-news-copy">
                                            <strong>Что нового?</strong>
                                            <span>Изучите новые возможности и передовые технологии</span>
                                        </div>
                                        <img alt="" aria-hidden="true" className="site-projects-card-arrow" src={arrowRightAltIcon}/>
                                    </Link>

                                    <article className="site-projects-success-card site-projects-hover-card">
                                        <img alt="" className="site-projects-success-image" src={caseTwoImage}/>
                                        <div className="site-projects-success-copy">
                                            <strong>Истории успеха наших пользователей</strong>
                                            <span>Узнайте, как технологии Poprog ускоряют переход предприятий в Индустрию 4.0</span>
                                        </div>
                                        <img alt="" aria-hidden="true" className="site-projects-card-arrow" src={arrowRightAltIcon}/>
                                    </article>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {isMenuOpen && (
                    <div className="site-header-main-menu">
                        <div className="site-header-main-menu-top-links">
                            {topLinks.map((link) => (
                                <a className="site-header-main-menu-top-link" href={link.href} key={`mobile-inline-${link.label}`}>
                                    <span>{link.label}</span>
                                    {link.icon && <img alt="" aria-hidden="true" src={link.icon}/>}
                                </a>
                            ))}
                        </div>

                        <div className="site-header-main-menu-links">
                            {mobileProjectsMenuStage === "root" && NavigationTree.map(([path, title]) => (
                                path === "/projects" ? (
                                    <button
                                        className="site-navigation-link site-navigation-dropdown-link site-navigation-dropdown-link-has-children"
                                        key={`mobile-${path}`}
                                        onClick={() => {
                                            setMobileProjectsCategoryIndex(0);
                                            setMobileProjectsMenuStage("groups");
                                        }}
                                        type="button"
                                    >
                                        {title}
                                    </button>
                                ) : (
                                    <NavLink
                                        className={({isActive}) => `site-navigation-link site-navigation-dropdown-link${isActive ? " site-navigation-link-active" : ""}`}
                                        key={`mobile-${path}`}
                                        to={path}
                                    >
                                        {title}
                                    </NavLink>
                                )
                            ))}

                            {mobileProjectsMenuStage === "groups" && (
                                <>
                                    <button
                                        className="site-navigation-link site-navigation-dropdown-link site-navigation-mobile-back"
                                        onClick={() => setMobileProjectsMenuStage("root")}
                                        type="button"
                                    >
                                        <span aria-hidden="true" className="site-navigation-mobile-back-icon"/>
                                        <span>Проекты</span>
                                    </button>

                                    {projectsCategories.map((category, index) => (
                                        <button
                                            className={`site-navigation-link site-navigation-dropdown-link${(mobileProjectsItemsByCategory[category.key] ?? []).length > 0 ? " site-navigation-dropdown-link-has-children" : ""}`}
                                            key={`mobile-project-group-${category.key}`}
                                            onClick={() => {
                                                setMobileProjectsCategoryIndex(index);
                                                setMobileProjectsMenuStage("items");
                                            }}
                                            type="button"
                                        >
                                            {category.label}
                                        </button>
                                    ))}
                                </>
                            )}

                            {mobileProjectsMenuStage === "items" && (
                                <>
                                    <button
                                        className="site-navigation-link site-navigation-dropdown-link site-navigation-mobile-back"
                                        onClick={() => setMobileProjectsMenuStage("groups")}
                                        type="button"
                                    >
                                        <span aria-hidden="true" className="site-navigation-mobile-back-icon"/>
                                        <span>{mobileProjectsCategory.label}</span>
                                    </button>

                                    {mobileProjectsItems.map((item) => (
                                        <NavLink
                                            className="site-navigation-link site-navigation-dropdown-link"
                                            key={`mobile-project-item-${mobileProjectsCategory.key}-${item.slug}`}
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                setIsSearchOpen(false);
                                                setIsProjectsPanelOpen(false);
                                            }}
                                            to={`/projects/${item.slug}`}
                                        >
                                            {item.title}
                                        </NavLink>
                                    ))}
                                </>
                            )}
                        </div>

                        {mobileProjectsMenuStage === "root" && (
                            <div className="site-header-main-menu-extra">
                                <div className="site-header-main-menu-actions">
                                    <button className="site-navigation-link site-navigation-dropdown-link" onClick={toggleSearch} type="button">
                                        <img alt="" aria-hidden="true" src={searchIcon}/>
                                        <span>Поиск</span>
                                    </button>
                                    <button className="site-navigation-link site-navigation-dropdown-link" type="button">
                                        Вход в консоль
                                    </button>
                                    <button className="site-navigation-link site-navigation-dropdown-link" type="button">
                                        Создать аккаунт
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {isSearchOpen && (
                    <div className="site-search-panel" role="dialog" aria-label="Поиск по порталу">
                        <div className="site-search-toolbar">
                            <div className="site-search-toolbar-main">
                                <label className="site-search-input-shell">
                                    <img alt="" aria-hidden="true" src={searchIcon}/>
                                    <input
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        placeholder="Я ищу..."
                                        ref={inputRef}
                                        type="search"
                                        value={searchQuery}
                                    />
                                    {searchQuery.length > 0 && (
                                        <button
                                            aria-label="Очистить поле поиска"
                                            className="site-search-clear-button site-search-x-button"
                                            onClick={() => {
                                                setSearchQuery("");
                                                inputRef.current?.focus();
                                            }}
                                            type="button"
                                        />
                                    )}
                                </label>

                                <button className="site-search-filter-button" type="button">
                                    <span aria-hidden="true" className="site-search-filter-icon">
                                        <span/>
                                        <span/>
                                        <span/>
                                    </span>
                                    <span>Фильтр</span>
                                </button>
                            </div>

                            <button
                                aria-label="Закрыть поиск"
                                className="site-search-close-button site-search-x-button"
                                onClick={() => setIsSearchOpen(false)}
                                type="button"
                            />
                        </div>

                        <div className="site-search-results">
                            {searchResultContent}
                        </div>
                    </div>
                )}
            </div>

            {isSearchOpen && (
                <button aria-label="Закрыть поиск" className="site-search-backdrop" onClick={() => setIsSearchOpen(false)} type="button"/>
            )}

            {isProjectsPanelOpen && (
                <button
                    aria-label="Закрыть панель проектов"
                    className="site-projects-backdrop"
                    onClick={closeProjectsPanel}
                    type="button"
                />
            )}

            {externalNavigationRequest && (
                <>
                    <button
                        aria-label="Закрыть предупреждение о внешнем ресурсе"
                        className="site-external-resource-backdrop"
                        onClick={() => setExternalNavigationRequest(null)}
                        type="button"
                    />
                    <div aria-label="Предупреждение о внешнем ресурсе" className="site-external-resource-modal" role="dialog">
                        <h3>Вы переходите на внешний ресурс</h3>
                        <p>Проверьте адрес перед переходом:</p>
                        <p className="site-external-resource-url">{externalNavigationRequest.targetUrl}</p>
                        <div className="site-external-resource-actions">
                            <button
                                className="site-external-resource-cancel"
                                onClick={() => setExternalNavigationRequest(null)}
                                type="button"
                            >
                                Отмена
                            </button>
                            <button
                                className="site-external-resource-confirm"
                                onClick={() => {
                                    const requestToOpen = externalNavigationRequest;
                                    setExternalNavigationRequest(null);
                                    if (requestToOpen) {
                                        void openExternalUrlInNewTabWithCheck(requestToOpen.targetUrl, {
                                            notFoundPath: requestToOpen.notFoundPath
                                        });
                                    }
                                }}
                                type="button"
                            >
                                Продолжить
                            </button>
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}
