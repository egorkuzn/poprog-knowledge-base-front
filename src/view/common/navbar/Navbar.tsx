import {useEffect, useMemo, useRef, useState} from "react";
import {Link, NavLink, useLocation} from "react-router-dom";
import {searchKnowledgeBase} from "../../../api/knowledgeBaseApi";
import type {SearchResultItem} from "../../../api/types";
import {NavigationTree} from "../../../data/navbar/NavigationTree";
import searchIcon from "../../../assets/home/icons/search.svg";
import accountIcon from "../../../assets/home/icons/account.svg";
import supportIcon from "../../../assets/home/icons/support.svg";
import arrowRightAltIcon from "../../../assets/home/icons/arrow-right-alt.svg";
import caseOneImage from "../../../assets/home/cases/case-1.png";
import caseTwoImage from "../../../assets/home/cases/case-2.png";

type SearchState = "idle" | "loading" | "ready" | "error";

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

function getSearchResultTarget(item: SearchResultItem): string {
    const normalizedType = item.type.toLowerCase();

    if (normalizedType.includes("publication")) {
        return "/publications";
    }

    if (normalizedType.includes("work") || normalizedType.includes("diploma") || normalizedType.includes("dissertation")) {
        return "/works";
    }

    if (normalizedType.includes("project")) {
        return "/projects";
    }

    if (normalizedType.includes("doc")) {
        return "/docs";
    }

    return "/home";
}

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isProjectsPanelOpen, setIsProjectsPanelOpen] = useState(false);
    const [activeProjectsCategoryIndex, setActiveProjectsCategoryIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchState, setSearchState] = useState<SearchState>("idle");
    const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
    const [searchError, setSearchError] = useState("");
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
    }, [location.pathname]);

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
            }
        };

        const handleOpenSearch = () => {
            setIsMenuOpen(false);
            setIsProjectsPanelOpen(false);
            setIsSearchOpen(true);
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);
        window.addEventListener("site-search:open", handleOpenSearch);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
            window.removeEventListener("site-search:open", handleOpenSearch);
        };
    }, [isMenuOpen]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const mediaQuery = window.matchMedia("(max-width: 1235px)");
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
                    <Link
                        className="site-search-result-card"
                        key={`${item.type}-${item.id}-${item.sourceId ?? index}`}
                        onClick={() => setIsSearchOpen(false)}
                        to={getSearchResultTarget(item)}
                    >
                        <span className="site-search-result-type">{getSearchResultTypeLabel(item)}</span>
                        <strong>{getSearchResultTitle(item)}</strong>
                        <span>{getSearchResultDescription(item)}</span>
                    </Link>
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

    const closeProjectsPanel = () => {
        setIsProjectsPanelOpen(false);
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
                                        <NavLink
                                            className={({isActive}) => `site-navigation-link site-navigation-dropdown-link${isActive ? " site-navigation-link-active" : ""}`}
                                            key={`dropdown-${path}`}
                                            to={path}
                                        >
                                            {title}
                                        </NavLink>
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
                                <Link className="site-projects-panel-center-link" onClick={closeProjectsPanel} to="/projects">
                                    {activeProjectsCategory.centerLinkLabel}
                                </Link>

                                <div className="site-projects-panel-top-row">
                                    <Link className="site-projects-feature-card" onClick={closeProjectsPanel} to="/projects">
                                        <div className="site-projects-feature-copy">
                                            <strong>Reflex</strong>
                                            <span>Язык для разработки ПО микроконтроллеров во встраиваемых системах с использованием методик процесс-ориентированного программирования</span>
                                        </div>
                                        <img alt="" aria-hidden="true" src={arrowRightAltIcon}/>
                                    </Link>

                                    <article className="site-projects-plain-card">
                                        <strong>poST</strong>
                                        <span>Процесс-ориентированное расширение языка Structured Text (ST) для программирования алгоритмически сложных управляющих программ для ПЛК</span>
                                    </article>

                                    <article className="site-projects-plain-card">
                                        <strong>IndustrialC</strong>
                                        <span>Специализированный процесс-ориентированный язык программирования для задач промышленной автоматизации и систем реального времени с синтаксисом, похожим на Cи</span>
                                    </article>
                                </div>

                                <div className="site-projects-panel-bottom-row">
                                    <Link className="site-projects-news-card" onClick={closeProjectsPanel} to="/projects">
                                        <img alt="" src={caseOneImage}/>
                                        <div className="site-projects-news-copy">
                                            <strong>Что нового?</strong>
                                            <span>Изучите новые возможности и передовые технологии</span>
                                        </div>
                                        <img alt="" aria-hidden="true" src={arrowRightAltIcon}/>
                                    </Link>

                                    <article className="site-projects-success-card">
                                        <img alt="" src={caseTwoImage}/>
                                        <div className="site-projects-success-copy">
                                            <strong>Истории успеха наших пользователей</strong>
                                            <span>Узнайте, как технологии Poprog ускоряют переход предприятий в Индустрию 4.0</span>
                                        </div>
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
                            {NavigationTree.map(([path, title]) => (
                                <NavLink
                                    className={({isActive}) => `site-navigation-link site-navigation-dropdown-link${isActive ? " site-navigation-link-active" : ""}`}
                                    key={`mobile-${path}`}
                                    to={path}
                                >
                                    {title}
                                </NavLink>
                            ))}
                        </div>

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
        </header>
    );
}
