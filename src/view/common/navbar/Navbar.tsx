import {useEffect, useMemo, useRef, useState} from "react";
import {Link, NavLink, useLocation, useNavigate} from "react-router-dom";
import type {MouseEvent as ReactMouseEvent} from "react";
import {searchKnowledgeBase} from "../../../api/knowledgeBaseApi";
import {apiBaseUrl} from "../../../api/config";
import type {SearchResultItem} from "../../../api/types";
import {
    EXTERNAL_NAVIGATION_REQUEST_EVENT,
    openExternalUrlInNewTabWithCheck,
    type ExternalNavigationRequestDetail
} from "../../../utils/externalNavigation";
import {normalizeSourceType, trackMetricEvent} from "../../../utils/analytics";
import {clearLocalAuthSession, localAuthChangedEventName, readLocalAuthSession} from "../../../utils/localAuth";
import {rideConsoleUrl} from "../../../utils/ridePortal";
import {NavigationTree} from "../../../data/navbar/NavigationTree";
import searchIcon from "../../../assets/home/icons/search.svg";
import accountIcon from "../../../assets/home/icons/account.svg";
import supportIcon from "../../../assets/home/icons/support.svg";
import arrowRightAltIcon from "../../../assets/home/icons/arrow-right-alt.svg";
import caseOneImage from "../../../assets/home/cases/case-1.png";
import caseTwoImage from "../../../assets/home/cases/case-2.png";

type SearchState = "idle" | "loading" | "ready" | "error";
type PanelKind = "projects" | "discover";
type ProjectLeafItem = { slug: string, title: string, to?: string };
type SearchFilter = "all" | "publication" | "work";
type TopLinkAction = "openAccount";
type TopLinkItem = {
    label: string
    icon?: string
    to?: string
    action?: TopLinkAction
};

const topLinks: TopLinkItem[] = [
    {label: "Помочь проекту", to: "/donate", icon: supportIcon},
    {label: "Свяжитесь с нами", to: "/contact"},
    {label: "Poprog маркет", to: "/market"},
    {label: "Поддержка", to: "/support"},
    {label: "Мой аккаунт", action: "openAccount", icon: accountIcon}
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

const discoverCategories = [
    {
        key: "start",
        label: "Старт и основы",
        title: "Старт и основы процесс-ориентированного программирования",
        description: "Быстро разберитесь в ключевых принципах и начните работать с экосистемой Poprog.",
        centerLinkLabel: "Перейти к обзорным материалам"
    },
    {
        key: "languages",
        label: "Языки и среды",
        title: "Языки и среды разработки",
        description: "Изучайте Reflex, poST, IndustrialC, облачную среду RIDE и связанные инженерные практики.",
        centerLinkLabel: "Открыть каталог языков и сред"
    },
    {
        key: "practice",
        label: "Практика и внедрение",
        title: "Практика и внедрение в инженерных командах",
        description: "Используйте готовые материалы для внедрения процесс-ориентированного подхода в реальные проекты.",
        centerLinkLabel: "Перейти к кейсам внедрения"
    }
];

const mobileDiscoverItemsByCategory: Record<string, ProjectLeafItem[]> = {
    start: [
        {slug: "intro", title: "Что такое Poprog", to: "/docs"},
        {slug: "quick-start", title: "Быстрый старт", to: "/video"},
        {slug: "publications", title: "Публикации", to: "/publications"},
        {slug: "works", title: "Студенческие работы", to: "/works"},
        {slug: "support", title: "Поддержка", to: "/support"}
    ],
    languages: [
        {slug: "reflex", title: "Reflex", to: "/projects/reflex"},
        {slug: "post", title: "poST", to: "/projects/post"},
        {slug: "industrial-c", title: "IndustrialC", to: "/projects/industrial-c"},
        {slug: "ride", title: "RIDE", to: "/projects/ride-overview"},
        {slug: "edtl", title: "EDTL", to: "/projects/edtl-spec"}
    ],
    practice: [
        {slug: "success", title: "Истории успеха", to: "/projects/success-stories"},
        {slug: "research", title: "Материалы исследований", to: "/publications"},
        {slug: "thesis", title: "Дипломные и диссертации", to: "/works"},
        {slug: "market", title: "Poprog маркет", to: "/market"},
        {slug: "contact", title: "Свяжитесь с нами", to: "/contact"}
    ]
};

const projectItemDescriptions: Record<string, string> = {
    "reflex": "Язык для разработки ПО микроконтроллеров во встраиваемых системах с использованием методик процесс-ориентированного программирования",
    "post": "Процесс-ориентированное расширение языка Structured Text (ST) для программирования алгоритмически сложных управляющих программ для ПЛК",
    "industrial-c": "Специализированный процесс-ориентированный язык программирования для промышленной автоматизации и систем реального времени",
    "languages-whats-new": "Изучите новые возможности и передовые технологии",
    "success-stories": "Узнайте, как технологии Poprog ускоряют переход предприятий в Индустрию 4.0",
    "ride-overview": "Ознакомьтесь с возможностями облачной среды разработки RIDE для промышленных задач",
    "ride-cloud-launch": "Запускайте проекты в облаке и работайте с командами в едином контуре",
    "ride-debug": "Используйте инструменты отладки для ускорения диагностики и тестирования",
    "ride-whats-new": "Новые релизы, функции и улучшения платформы RIDE",
    "requirements": "Собирайте и структурируйте требования к промышленным системам разработки",
    "traceability": "Настраивайте трассировку требований, реализации и результатов проверки",
    "edtl-spec": "Работайте с EDTL-спецификациями как с исполняемыми моделями требований",
    "edtl-whats-new": "Следите за обновлениями в инструментах инженерии требований",
    "architecture-templates": "Используйте шаблоны архитектур для быстрых стартов распределенных систем",
    "communication-modules": "Собирайте надежные контуры обмена с типовыми модулями связи",
    "typical-solutions": "Применяйте проверенные практики для типовых промышленных сценариев",
    "distributed-whats-new": "Новые материалы по распределенным микроконтроллерным системам",
    "code-checks": "Проверяйте код заранее и находите дефекты до этапа внедрения",
    "quality-metrics": "Отслеживайте метрики качества и стабильности ваших решений",
    "analysis-reports": "Формируйте отчеты статического анализа для инженерных команд",
    "analysis-whats-new": "Новые функции и подходы в инструментах анализа"
};

const discoverItemDescriptions: Record<string, string> = {
    "intro": "Обзор портала, направлений и ключевых сценариев работы с инструментами Poprog.",
    "quick-start": "Краткий маршрут запуска: от первого шага до рабочего демонстрационного сценария.",
    "publications": "Подборка публикаций и методических материалов по процесс-ориентированному программированию.",
    "works": "Коллекция студенческих работ, дипломов и диссертаций с практическими результатами.",
    "support": "Канал поддержки по вопросам запуска, обучения и использования компонентов платформы.",
    "reflex": "Язык для разработки ПО микроконтроллеров с акцентом на процесс-ориентированное проектирование.",
    "post": "Расширение Structured Text для сложных управляющих алгоритмов в ПЛК.",
    "industrial-c": "Процесс-ориентированный язык для промышленной автоматизации и систем реального времени.",
    "ride": "Облачная среда разработки для командной работы над промышленными программными системами.",
    "edtl": "Инструменты формализации требований и связи спецификаций с реализацией.",
    "success": "Практические примеры внедрения и эффекты от применения подходов Poprog.",
    "research": "Научные и прикладные материалы для инженерных и исследовательских команд.",
    "thesis": "Работы студентов и аспирантов, отражающие практику применения методов.",
    "market": "Каталог утилит и модулей для ускорения разработки и поддержки решений.",
    "contact": "Свяжитесь с командой для сотрудничества, обратной связи и партнерских сценариев."
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

function matchesSearchFilter(item: SearchResultItem, filter: SearchFilter): boolean {
    if (filter === "all") {
        return true;
    }

    const normalizedType = item.type.toLowerCase();
    if (filter === "publication") {
        return normalizedType.includes("publication");
    }

    return normalizedType.includes("work") || normalizedType.includes("diploma") || normalizedType.includes("dissertation");
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

function getPanelItemsByCategory(
    itemsByCategory: Record<string, ProjectLeafItem[]>,
    categoryKey: string,
    fallbackKey: string
): ProjectLeafItem[] {
    const sourceItems = itemsByCategory[categoryKey] ?? [];
    const fallbackItems = itemsByCategory[fallbackKey] ?? [];
    const itemsToUse = sourceItems.length > 0 ? [...sourceItems] : [...fallbackItems];

    while (itemsToUse.length > 0 && itemsToUse.length < 5) {
        itemsToUse.push(itemsToUse[itemsToUse.length - 1]);
    }

    return itemsToUse.slice(0, 5);
}

function getProjectItemDescription(item: ProjectLeafItem): string {
    return projectItemDescriptions[item.slug] ?? `Откройте раздел «${item.title}» и изучите материалы по направлению.`;
}

function getDiscoverItemDescription(item: ProjectLeafItem): string {
    return discoverItemDescriptions[item.slug] ?? `Откройте раздел «${item.title}» и изучите материалы портала Poprog.`;
}

function getPanelItemPath(item: ProjectLeafItem, panelKind: PanelKind): string {
    if (item.to && item.to.length > 0) {
        return item.to;
    }
    if (panelKind === "discover") {
        return "/docs";
    }
    return `/projects/${item.slug}`;
}

function resolveSearchResultNavigation(item: SearchResultItem): { externalUrl?: string, internalPath: string } {
    const rawLink = item.link?.trim();
    const fallbackPath = getSearchResultFallbackTarget(item);

    if (!rawLink) {
        if (typeof item.sourceId === "number" && Number.isFinite(item.sourceId)) {
            const normalizedType = item.type.toLowerCase();
            if (normalizedType.includes("publication")) {
                return {internalPath: `/publications?focusType=publication&focusId=${item.sourceId}`};
            }
            if (normalizedType.includes("work") || normalizedType.includes("diploma") || normalizedType.includes("dissertation")) {
                return {internalPath: `/works?focusType=student-work&focusId=${item.sourceId}`};
            }
        }
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
    if (normalizedLink.startsWith("files/")) {
        return {
            externalUrl: `${apiHost}/api/${normalizedLink}`,
            internalPath: fallbackPath
        };
    }

    return {
        externalUrl: `${apiHost}/${normalizedLink}`,
        internalPath: fallbackPath
    };
}

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isProjectsPanelOpen, setIsProjectsPanelOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(() => readLocalAuthSession() !== null);
    const [activePanelKind, setActivePanelKind] = useState<PanelKind>("projects");
    const [activeProjectsCategoryIndex, setActiveProjectsCategoryIndex] = useState(0);
    const [mobileProjectsMenuStage, setMobileProjectsMenuStage] = useState<MobileProjectsMenuStage>("root");
    const [mobilePanelKind, setMobilePanelKind] = useState<PanelKind>("projects");
    const [mobileProjectsCategoryIndex, setMobileProjectsCategoryIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchState, setSearchState] = useState<SearchState>("idle");
    const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
    const [searchError, setSearchError] = useState("");
    const [searchFilter, setSearchFilter] = useState<SearchFilter>("all");
    const [externalNavigationRequest, setExternalNavigationRequest] = useState<ExternalNavigationRequestDetail | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const projectsPanelRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const requestIdRef = useRef(0);
    const searchQueryIdRef = useRef<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
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
            trackMetricEvent("search_open");
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
        const syncAuthState = () => {
            setIsAuthenticated(readLocalAuthSession() !== null);
        };

        syncAuthState();
        window.addEventListener("storage", syncAuthState);
        window.addEventListener("focus", syncAuthState);
        window.addEventListener(localAuthChangedEventName, syncAuthState as EventListener);

        return () => {
            window.removeEventListener("storage", syncAuthState);
            window.removeEventListener("focus", syncAuthState);
            window.removeEventListener(localAuthChangedEventName, syncAuthState as EventListener);
        };
    }, []);

    useEffect(() => {
        if (!isSearchOpen || trimmedQuery.length === 0) {
            setSearchState("idle");
            setSearchResults([]);
            setSearchError("");
            searchQueryIdRef.current = null;
            return;
        }

        const currentRequestId = ++requestIdRef.current;
        const queryId = typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `query-${Date.now()}`;
        searchQueryIdRef.current = queryId;
        setSearchState("loading");
        setSearchError("");
        trackMetricEvent("search_query_submitted", {
            queryId,
            query: trimmedQuery
        });

        const timeoutId = window.setTimeout(async () => {
            try {
                const response = await searchKnowledgeBase(trimmedQuery, 8);

                if (requestIdRef.current !== currentRequestId) {
                    return;
                }

                const items = Array.isArray(response.items) ? response.items : [];
                const publicationCount = items.filter((item) => normalizeSourceType(item.type) === "publication").length;
                const studentWorkCount = items.filter((item) => normalizeSourceType(item.type) === "student-work").length;

                setSearchResults(items);
                setSearchState("ready");
                trackMetricEvent("search_result_shown", {
                    queryId,
                    query: trimmedQuery,
                    total: items.length,
                    publicationCount,
                    studentWorkCount
                });
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
        const filteredResults = searchResults.filter((item) => matchesSearchFilter(item, searchFilter));

        if (trimmedQuery.length === 0) {
            return <p className="site-search-status">Введите запрос, чтобы найти публикации и студенческие работы.</p>;
        }

        if (searchState === "loading") {
            return <p className="site-search-status">Ищем материалы по порталу...</p>;
        }

        if (searchState === "error") {
            return <p className="site-search-status site-search-status-error">Не удалось выполнить поиск: {searchError}</p>;
        }

        if (!Array.isArray(filteredResults) || filteredResults.length === 0) {
            return <p className="site-search-status">Ничего не найдено. Попробуйте изменить запрос.</p>;
        }

        return (
            <div className="site-search-results-list">
                {filteredResults.map((item, index) => (
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
    }, [searchError, searchFilter, searchResults, searchState, trimmedQuery]);

    const toggleSearch = () => {
        setIsMenuOpen(false);
        setIsProjectsPanelOpen(false);
        setIsSearchOpen((isOpen) => {
            const nextState = !isOpen;
            if (nextState) {
                trackMetricEvent("search_open");
            }
            return nextState;
        });
    };

    const toggleSearchFilter = () => {
        setSearchFilter((currentFilter) => {
            if (currentFilter === "all") {
                return "publication";
            }
            if (currentFilter === "publication") {
                return "work";
            }
            return "all";
        });
    };

    const openAccount = () => {
        setIsMenuOpen(false);
        setIsProjectsPanelOpen(false);
        setIsSearchOpen(false);
        navigate("/account");
    };

    const openAccountLogin = () => {
        setIsMenuOpen(false);
        setIsProjectsPanelOpen(false);
        setIsSearchOpen(false);
        navigate("/account?mode=login");
    };

    const openAccountRegister = () => {
        setIsMenuOpen(false);
        setIsProjectsPanelOpen(false);
        setIsSearchOpen(false);
        navigate("/account?mode=register");
    };

    const openRideConsole = () => {
        setIsMenuOpen(false);
        setIsProjectsPanelOpen(false);
        setIsSearchOpen(false);
        window.open(rideConsoleUrl, "_blank", "noopener,noreferrer");
    };

    const handleAuthAction = () => {
        if (isAuthenticated) {
            clearLocalAuthSession();
            navigate("/account?mode=login");
            return;
        }
        openAccountRegister();
    };

    const activeProjectsCategory = projectsCategories[activeProjectsCategoryIndex] ?? projectsCategories[0];
    const activeDiscoverCategory = discoverCategories[activeProjectsCategoryIndex] ?? discoverCategories[0];
    const panelCategories = activePanelKind === "projects" ? projectsCategories : discoverCategories;
    const activePanelCategory = activePanelKind === "projects" ? activeProjectsCategory : activeDiscoverCategory;
    const panelItemsByCategory = activePanelKind === "projects" ? mobileProjectsItemsByCategory : mobileDiscoverItemsByCategory;
    const panelDescriptions = activePanelKind === "projects" ? getProjectItemDescription : getDiscoverItemDescription;
    const panelFallbackKey = activePanelKind === "projects" ? "languages" : "start";
    const mobilePanelCategories = mobilePanelKind === "projects" ? projectsCategories : discoverCategories;
    const mobilePanelItemsByCategory = mobilePanelKind === "projects" ? mobileProjectsItemsByCategory : mobileDiscoverItemsByCategory;
    const mobilePanelCategory = mobilePanelCategories[mobileProjectsCategoryIndex] ?? mobilePanelCategories[0];
    const mobileProjectsItems = mobilePanelItemsByCategory[mobilePanelCategory.key] ?? [];
    const projectsPanelItems = getPanelItemsByCategory(panelItemsByCategory, activePanelCategory.key, panelFallbackKey);
    const featureProjectItem = projectsPanelItems[0];
    const plainProjectItemOne = projectsPanelItems[1];
    const plainProjectItemTwo = projectsPanelItems[2];
    const newsProjectItem = projectsPanelItems[3];
    const successProjectItem = projectsPanelItems[4];
    const isProjectsRouteActive = location.pathname.startsWith("/projects");
    const isDiscoverRouteActive = location.pathname.startsWith("/docs");

    const closeProjectsPanel = () => {
        setIsProjectsPanelOpen(false);
    };

    const openSearchResultInNewTab = async (item: SearchResultItem) => {
        const navigationTarget = resolveSearchResultNavigation(item);
        const sourceType = normalizeSourceType(item.type);
        const queryId = searchQueryIdRef.current;

        trackMetricEvent("search_result_click", {
            queryId,
            resultId: item.id,
            sourceId: item.sourceId,
            sourceType
        });
        trackMetricEvent("search_result_opened", {
            queryId,
            resultId: item.id,
            sourceId: item.sourceId,
            sourceType
        });

        if (!navigationTarget.externalUrl) {
            window.open(`${window.location.origin}${navigationTarget.internalPath}`, "_blank");
            return;
        }
        setExternalNavigationRequest({
            targetUrl: navigationTarget.externalUrl
        });
    };

    const scrollToAnchorIfExists = (anchorId: string) => {
        const targetElement = document.getElementById(anchorId);
        if (!targetElement) {
            return;
        }

        targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };

    const handleTopLinkHashClick = (to: string) => (event: ReactMouseEvent<HTMLAnchorElement>) => {
        const hashIndex = to.indexOf("#");
        if (hashIndex < 0) {
            return;
        }

        const targetPath = to.slice(0, hashIndex) || location.pathname;
        const anchorId = to.slice(hashIndex + 1);
        if (!anchorId) {
            return;
        }

        if (targetPath === location.pathname) {
            event.preventDefault();
            scrollToAnchorIfExists(anchorId);
        }
    };

    const renderTopLink = (link: TopLinkItem, key: string, className: string) => {
        const content = (
            <>
                <span>{link.label}</span>
                {link.icon && <img alt="" aria-hidden="true" src={link.icon}/>}
            </>
        );

        if (link.action === "openAccount") {
            return (
                <button className={className} key={key} onClick={openAccount} type="button">
                    {content}
                </button>
            );
        }

        return (
            <Link
                className={className}
                key={key}
                onClick={link.to?.includes("#") ? handleTopLinkHashClick(link.to) : undefined}
                to={link.to ?? "/home"}
            >
                {content}
            </Link>
        );
    };

    return (
        <header className={`site-header${isSearchOpen ? " site-header-search-open" : ""}${isProjectsPanelOpen ? " site-header-projects-open" : ""}`}>
            <div className="site-header-stack">
                <div className="site-header-top">
                    <div className="site-header-top-links">
                        {topLinks.map((link) => renderTopLink(link, link.label, "site-header-top-link"))}
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
                                            className={`site-navigation-link${isProjectsRouteActive ? " site-navigation-link-active" : ""}`}
                                            key={path}
                                            onClick={() => {
                                                setIsSearchOpen(false);
                                                setIsMenuOpen(false);
                                                setActivePanelKind("projects");
                                                setActiveProjectsCategoryIndex(0);
                                                setIsProjectsPanelOpen((isOpen) => activePanelKind === "projects" ? !isOpen : true);
                                            }}
                                            type="button"
                                        >
                                            {title}
                                        </button>
                                    ) : path === "/docs" ? (
                                        <button
                                            aria-expanded={isProjectsPanelOpen}
                                            className={`site-navigation-link${isDiscoverRouteActive ? " site-navigation-link-active" : ""}`}
                                            key={path}
                                            onClick={() => {
                                                setIsSearchOpen(false);
                                                setIsMenuOpen(false);
                                                setActivePanelKind("discover");
                                                setActiveProjectsCategoryIndex(0);
                                                setIsProjectsPanelOpen((isOpen) => activePanelKind === "discover" ? !isOpen : true);
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
                                        path === "/projects" || path === "/docs" ? (
                                            <button
                                                className="site-navigation-link site-navigation-dropdown-link"
                                                key={`dropdown-${path}`}
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    setIsSearchOpen(false);
                                                    setActivePanelKind(path === "/docs" ? "discover" : "projects");
                                                    setActiveProjectsCategoryIndex(0);
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

                                        <button
                                            className="site-navigation-link site-navigation-dropdown-link"
                                            onClick={isAuthenticated ? openRideConsole : openAccountLogin}
                                            type="button"
                                        >
                                            {isAuthenticated ? "В RIDE" : "Войти в RIDE"}
                                        </button>
                                        <button className="site-navigation-link site-navigation-dropdown-link" onClick={handleAuthAction} type="button">
                                            {isAuthenticated ? "Выйти" : "Создать аккаунт"}
                                        </button>
                                        <button className="site-navigation-link site-navigation-dropdown-link" onClick={openAccount} type="button">
                                            Мой аккаунт
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
                            <button
                                className="site-console-button"
                                onClick={isAuthenticated ? openRideConsole : openAccountLogin}
                                type="button"
                            >
                                {isAuthenticated ? "В RIDE" : "Войти в RIDE"}
                            </button>
                            <button className="site-account-button" onClick={handleAuthAction} type="button">
                                {isAuthenticated ? "Выйти" : "Создать аккаунт"}
                            </button>
                            <button className="site-mobile-account-button" onClick={openAccount} type="button">
                                <img alt="" aria-hidden="true" src={accountIcon}/>
                            </button>
                        </div>
                    </div>

                </div>

                {isProjectsPanelOpen && (
                    <div
                        className="site-projects-panel"
                        ref={projectsPanelRef}
                        role="dialog"
                        aria-label={activePanelKind === "projects" ? "Панель проектов" : "Панель раздела Откройте для себя poprog"}
                    >
                        <button
                            aria-label="Закрыть панель проектов"
                            className="site-projects-panel-close site-search-x-button"
                            onClick={closeProjectsPanel}
                            type="button"
                        />

                        <div className="site-projects-panel-layout">
                            <aside className="site-projects-panel-sidebar" aria-label={activePanelKind === "projects" ? "Разделы проектов" : "Разделы Откройте для себя poprog"}>
                                {panelCategories.map((category, index) => (
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
                                <h3>{activePanelCategory.title}</h3>
                                <p>{activePanelCategory.description}</p>
                                <Link className="site-projects-panel-center-link" onClick={closeProjectsPanel} to={getPanelItemPath(featureProjectItem, activePanelKind)}>
                                    {activePanelCategory.centerLinkLabel}
                                </Link>

                                <div className="site-projects-panel-top-row">
                                    <Link className="site-projects-feature-card site-projects-hover-card" onClick={closeProjectsPanel} to={getPanelItemPath(featureProjectItem, activePanelKind)}>
                                        <div className="site-projects-feature-copy">
                                            <strong>{featureProjectItem.title}</strong>
                                            <span>{panelDescriptions(featureProjectItem)}</span>
                                        </div>
                                        <img alt="" aria-hidden="true" className="site-projects-card-arrow" src={arrowRightAltIcon}/>
                                    </Link>

                                    <Link className="site-projects-plain-card site-projects-hover-card" onClick={closeProjectsPanel} to={getPanelItemPath(plainProjectItemOne, activePanelKind)}>
                                        <strong>{plainProjectItemOne.title}</strong>
                                        <span>{panelDescriptions(plainProjectItemOne)}</span>
                                        <img alt="" aria-hidden="true" className="site-projects-card-arrow" src={arrowRightAltIcon}/>
                                    </Link>

                                    <Link className="site-projects-plain-card site-projects-hover-card" onClick={closeProjectsPanel} to={getPanelItemPath(plainProjectItemTwo, activePanelKind)}>
                                        <strong>{plainProjectItemTwo.title}</strong>
                                        <span>{panelDescriptions(plainProjectItemTwo)}</span>
                                        <img alt="" aria-hidden="true" className="site-projects-card-arrow" src={arrowRightAltIcon}/>
                                    </Link>
                                </div>

                                <div className="site-projects-panel-bottom-row">
                                    <Link className="site-projects-news-card site-projects-hover-card" onClick={closeProjectsPanel} to={getPanelItemPath(newsProjectItem, activePanelKind)}>
                                        <img alt="" className="site-projects-news-image" src={caseOneImage}/>
                                        <div className="site-projects-news-copy">
                                            <strong>{newsProjectItem.title}</strong>
                                            <span>{panelDescriptions(newsProjectItem)}</span>
                                        </div>
                                        <img alt="" aria-hidden="true" className="site-projects-card-arrow" src={arrowRightAltIcon}/>
                                    </Link>

                                    <Link className="site-projects-success-card site-projects-hover-card" onClick={closeProjectsPanel} to={getPanelItemPath(successProjectItem, activePanelKind)}>
                                        <img alt="" className="site-projects-success-image" src={caseTwoImage}/>
                                        <div className="site-projects-success-copy">
                                            <strong>{successProjectItem.title}</strong>
                                            <span>{panelDescriptions(successProjectItem)}</span>
                                        </div>
                                        <img alt="" aria-hidden="true" className="site-projects-card-arrow" src={arrowRightAltIcon}/>
                                    </Link>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {isMenuOpen && (
                    <div className="site-header-main-menu">
                        <div className="site-header-main-menu-top-links">
                            {topLinks.map((link) => (
                                renderTopLink(link, `mobile-inline-link-${link.label}`, "site-header-main-menu-top-link")
                            ))}
                        </div>

                        <div className="site-header-main-menu-links">
                            {mobileProjectsMenuStage === "root" && NavigationTree.map(([path, title]) => (
                                path === "/projects" || path === "/docs" ? (
                                    <button
                                        className="site-navigation-link site-navigation-dropdown-link site-navigation-dropdown-link-has-children"
                                        key={`mobile-${path}`}
                                        onClick={() => {
                                            setMobilePanelKind(path === "/docs" ? "discover" : "projects");
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
                                        <span>{mobilePanelKind === "projects" ? "Проекты" : "Откройте для себя poprog"}</span>
                                    </button>

                                    {mobilePanelCategories.map((category, index) => (
                                        <button
                                            className={`site-navigation-link site-navigation-dropdown-link${(mobilePanelItemsByCategory[category.key] ?? []).length > 0 ? " site-navigation-dropdown-link-has-children" : ""}`}
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
                                        <span>{mobilePanelCategory.label}</span>
                                    </button>

                                    {mobileProjectsItems.map((item) => (
                                        <NavLink
                                            className="site-navigation-link site-navigation-dropdown-link"
                                            key={`mobile-project-item-${mobilePanelCategory.key}-${item.slug}`}
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                setIsSearchOpen(false);
                                                setIsProjectsPanelOpen(false);
                                            }}
                                            to={getPanelItemPath(item, mobilePanelKind)}
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
                                    <button
                                        className="site-navigation-link site-navigation-dropdown-link"
                                        onClick={isAuthenticated ? openRideConsole : openAccountLogin}
                                        type="button"
                                    >
                                        {isAuthenticated ? "В RIDE" : "Войти в RIDE"}
                                    </button>
                                    <button className="site-navigation-link site-navigation-dropdown-link" onClick={handleAuthAction} type="button">
                                        {isAuthenticated ? "Выйти" : "Создать аккаунт"}
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

                                <button className="site-search-filter-button" onClick={toggleSearchFilter} type="button">
                                    <span aria-hidden="true" className="site-search-filter-icon">
                                        <span/>
                                        <span/>
                                        <span/>
                                    </span>
                                    <span>Фильтр: {searchFilter === "all" ? "Все" : searchFilter === "publication" ? "Публикации" : "Работы"}</span>
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
