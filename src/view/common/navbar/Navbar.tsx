import {useEffect, useMemo, useRef, useState} from "react";
import {Link, NavLink, useLocation} from "react-router-dom";
import {searchKnowledgeBase} from "../../../api/knowledgeBaseApi";
import type {SearchResultItem} from "../../../api/types";
import {NavigationTree} from "../../../data/navbar/NavigationTree";
import searchIcon from "../../../assets/home/icons/search.svg";
import accountIcon from "../../../assets/home/icons/account.svg";
import supportIcon from "../../../assets/home/icons/support.svg";

type SearchState = "idle" | "loading" | "ready" | "error";

const topLinks = [
    {label: "Помочь проекту", href: "#support", icon: supportIcon},
    {label: "Свяжитесь с нами", href: "#contacts"},
    {label: "Poprog маркет", href: "#market"},
    {label: "Поддержка", href: "#support"},
    {label: "Мой аккаунт", href: "#account", icon: accountIcon}
];

function getSearchResultTitle(item: SearchResultItem): string {
    return item.theme ?? item.title ?? "Без названия";
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
    const [searchQuery, setSearchQuery] = useState("");
    const [searchState, setSearchState] = useState<SearchState>("idle");
    const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
    const [searchError, setSearchError] = useState("");
    const menuRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const requestIdRef = useRef(0);
    const location = useLocation();
    const trimmedQuery = searchQuery.trim();

    useEffect(() => {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsMenuOpen(false);
                setIsSearchOpen(false);
            }
        };

        const handleOpenSearch = () => {
            setIsMenuOpen(false);
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
                        key={`${item.type}-${item.id ?? item.hash ?? index}`}
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
        setIsSearchOpen((isOpen) => !isOpen);
    };

    return (
        <header className={`site-header${isSearchOpen ? " site-header-search-open" : ""}`}>
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
                                <NavLink
                                    className={({isActive}) => `site-navigation-link${isActive ? " site-navigation-link-active" : ""}`}
                                    key={path}
                                    to={path}
                                >
                                    {title}
                                </NavLink>
                            ))}
                        </nav>

                        <button
                            aria-expanded={isMenuOpen}
                            className={`site-navigation-link site-navigation-menu-button${isMenuOpen ? " site-navigation-link-active" : ""}`}
                            onClick={() => {
                                setIsSearchOpen(false);
                                setIsMenuOpen((isOpen) => !isOpen);
                            }}
                            type="button"
                        >
                            <span aria-hidden="true" className="site-navigation-menu-icon">
                                <span/>
                                <span/>
                                <span/>
                            </span>
                            <span className="site-navigation-menu-label">Меню</span>
                            <span aria-hidden="true" className="site-navigation-menu-caret"/>
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

                                <div className="site-navigation-dropdown-divider"/>

                                {topLinks.map((link) => (
                                    <a className="site-navigation-link site-navigation-dropdown-link" href={link.href} key={`top-${link.label}`}>
                                        <span>{link.label}</span>
                                        {link.icon && <img alt="" aria-hidden="true" src={link.icon}/>}
                                    </a>
                                ))}

                                <div className="site-navigation-dropdown-divider"/>

                                <button className="site-navigation-link site-navigation-dropdown-link" type="button">
                                    Вход в консоль
                                </button>
                                <button className="site-navigation-link site-navigation-dropdown-link" type="button">
                                    Создать аккаунт
                                </button>
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
                    </div>
                </div>
            </div>

            {isSearchOpen && (
                <>
                    <button aria-label="Закрыть поиск" className="site-search-backdrop" onClick={() => setIsSearchOpen(false)} type="button"/>

                    <div className="site-search-panel" role="dialog" aria-label="Поиск по порталу">
                        <div className="site-search-toolbar">
                            <label className="site-search-input-shell">
                                <img alt="" aria-hidden="true" src={searchIcon}/>
                                <input
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Я ищу..."
                                    ref={inputRef}
                                    type="search"
                                    value={searchQuery}
                                />
                            </label>

                            <button className="site-search-filter-button" type="button">
                                <span aria-hidden="true" className="site-search-filter-icon">
                                    <span/>
                                    <span/>
                                    <span/>
                                </span>
                                <span>Фильтр</span>
                            </button>

                            <button
                                aria-label="Закрыть поиск"
                                className="site-search-close-button"
                                onClick={() => setIsSearchOpen(false)}
                                type="button"
                            >
                                ×
                            </button>
                        </div>

                        <div className="site-search-results">
                            {searchResultContent}
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}
