import {Link, NavLink} from "react-router-dom";
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
                <div className="site-header-main-left">
                    <Link className="site-brand" to="/home">Poprog</Link>

                    <nav className="site-navigation" aria-label="Главная навигация">
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
        </header>
    );
}
