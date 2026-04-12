import {useCallback} from "react";
import type {MouseEvent as ReactMouseEvent} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {ProjectsFooterRow} from "../../../data/footer/ProjectsFooterRow";
import {getGroupedPublications, getGroupedStudentWorks} from "../../../api/knowledgeBaseApi";
import {useRemoteData} from "../../../hooks/useRemoteData";
import type {FooterRawDataElement} from "../../../model/footer/FooterRawDataElement";
import {requestExternalNavigation} from "../../../utils/externalNavigation";
import searchIcon from "../../../assets/home/icons/search.svg";
import arrowTopIcon from "../../../assets/home/icons/arrow-top.svg";

export function Footer() {
    const navigate = useNavigate();
    const location = useLocation();
    const loadWorks = useCallback(() => getGroupedStudentWorks(), []);
    const loadPublications = useCallback(() => getGroupedPublications(), []);
    const worksState = useRemoteData(loadWorks);
    const publicationsState = useRemoteData(loadPublications);

    const footerPublications = publicationsState.data?.map((item) => ({
        title: item.date,
        hash: item.date
    })) ?? [];

    const footerWorks = worksState.data?.map((item) => ({
        title: item.title,
        hash: item.hash
    })) ?? [];

    const openSearchFromFooter = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        window.dispatchEvent(new CustomEvent("site-search:open"));
    };

    const handleExternalLinkClick = (url: string) => (event: ReactMouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        void requestExternalNavigation(url);
    };

    const openAccount = () => navigate("/account");

    const handleHashLinkClick = (to: string) => (event: ReactMouseEvent<HTMLAnchorElement>) => {
        const hashIndex = to.indexOf("#");
        if (hashIndex < 0) {
            return;
        }

        const targetPath = to.slice(0, hashIndex) || location.pathname;
        const targetId = to.slice(hashIndex + 1);
        if (targetPath !== location.pathname || targetId.length === 0) {
            return;
        }

        event.preventDefault();
        const targetElement = document.getElementById(targetId);
        if (!targetElement) {
            return;
        }

        targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };

    return (
        <footer className="site-footer">
            <div className="site-footer-top">
                <button className="site-footer-ride-button" onClick={openAccount} type="button">Мой аккаунт</button>

                <button className="site-footer-search-button" onClick={openSearchFromFooter} type="button">
                    <span>Поиск</span>
                    <img alt="" aria-hidden="true" src={searchIcon}/>
                </button>
            </div>

            <div className="site-footer-grid">
                <FooterColumn pathname="/projects" title="Проекты" values={new ProjectsFooterRow().data}/>
                <FooterColumn pathname="/works" title="Дипломные работы и диссертации" values={footerWorks}/>
                <FooterColumn pathname="/publications" title="Публикации" values={footerPublications}/>

                <div className="site-footer-meta" id="contacts">
                    <p>Почта: poprog.industrial@gmail.com</p>
                    <div className="site-footer-socials">
                        <a href="https://t.me/poprog" onClick={handleExternalLinkClick("https://t.me/poprog")} rel="noopener noreferrer" target="_blank">Телеграмм</a>
                        <a href="https://reddit.com/r/poprog/" onClick={handleExternalLinkClick("https://reddit.com/r/poprog/")} rel="noopener noreferrer" target="_blank">Реддит</a>
                        <a href="https://github.com/egorkuzn/poprog-knowledge-base-front" onClick={handleExternalLinkClick("https://github.com/egorkuzn/poprog-knowledge-base-front")} rel="noopener noreferrer" target="_blank">Гитхаб</a>
                    </div>
                    <Link onClick={handleHashLinkClick("/home#about")} to="/home#about">О нас</Link>
                    <Link onClick={handleHashLinkClick("/home#support")} to="/home#support">Помочь проекту</Link>
                    <p>© poprog 2026</p>
                </div>
            </div>

            <div className="site-footer-bottom">
                <Link className="site-footer-to-top" onClick={handleHashLinkClick("/home#top")} to="/home#top">
                    <span>В начало</span>
                    <img alt="" aria-hidden="true" src={arrowTopIcon}/>
                </Link>

                <div className="site-footer-legal">
                    <Link to="/privacy">Конфиденциальность</Link>
                    <Link to="/terms">Условия пользования сайтом</Link>
                    <Link to="/cookies">Параметры файлов cookie</Link>
                </div>
            </div>
        </footer>
    );
}

interface FooterColumnProps {
    pathname: string
    title: string
    values: FooterRawDataElement[]
}

function FooterColumn(props: FooterColumnProps) {
    return (
        <div className="site-footer-column">
            <h4>{props.title}</h4>
            <div className="site-footer-links">
                {props.values.map((item) => (
                    props.pathname === "/projects"
                        ? (
                            <Link key={`${props.pathname}-${item.hash}`} to={`${props.pathname}/${item.hash}`}>
                                {item.title}
                            </Link>
                        )
                        : (
                            <Link key={`${props.pathname}-${item.hash}`} to={{pathname: props.pathname, hash: item.hash}}>
                                {item.title}
                            </Link>
                        )
                ))}
            </div>
        </div>
    );
}
