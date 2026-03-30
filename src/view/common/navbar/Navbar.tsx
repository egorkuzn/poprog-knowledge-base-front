import {useEffect, useRef, useState} from "react";
import {Link, NavLink, useLocation} from "react-router-dom";
import {NavigationTree} from "../../../data/navbar/NavigationTree";
import searchIcon from "../../../assets/home/icons/search.svg";
import accountIcon from "../../../assets/home/icons/account.svg";
import supportIcon from "../../../assets/home/icons/support.svg";

const topLinks = [
    {label: "Помочь проекту", href: "#support", icon: supportIcon},
    {label: "Свяжитесь с нами", href: "#contacts"},
    {label: "Poprog маркет", href: "#market"},
    {label: "Поддержка", href: "#support"},
    {label: "Мой аккаунт", href: "#account", icon: accountIcon}
];

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const location = useLocation();

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    return (
        <header className="site-header">
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
                            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
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
                        <button className="site-search-button" type="button">
                            <img alt="" aria-hidden="true" src={searchIcon}/>
                            <span>Поиск</span>
                        </button>
                        <button className="site-console-button" type="button">Вход в консоль</button>
                        <button className="site-account-button" type="button">Создать аккаунт</button>
                    </div>
                </div>
            </div>
        </header>
    );
}
