import {useCallback} from "react";
import type {MouseEvent as ReactMouseEvent} from "react";
import {Link} from "react-router-dom";
import {ProjectsFooterRow} from "../../../data/footer/ProjectsFooterRow";
import {getGroupedPublications, getGroupedStudentWorks} from "../../../api/knowledgeBaseApi";
import {useRemoteData} from "../../../hooks/useRemoteData";
import type {FooterRawDataElement} from "../../../model/footer/FooterRawDataElement";
import {requestExternalNavigation} from "../../../utils/externalNavigation";
import searchIcon from "../../../assets/home/icons/search.svg";
import arrowTopIcon from "../../../assets/home/icons/arrow-top.svg";

export function Footer() {
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

    return (
        <footer className="site-footer">
            <div className="site-footer-top">
                <button className="site-footer-ride-button" type="button">Создать аккаунт RIDE</button>

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
                    <a href="#about">О нас</a>
                    <a href="#support">Помочь проекту</a>
                    <p>© poprog 2026</p>
                </div>
            </div>

            <div className="site-footer-bottom">
                <a className="site-footer-to-top" href="#top">
                    <span>В начало</span>
                    <img alt="" aria-hidden="true" src={arrowTopIcon}/>
                </a>

                <div className="site-footer-legal">
                    <a href="#privacy">Конфиденциальность</a>
                    <a href="#terms">Условия пользования сайтом</a>
                    <a href="#cookies">Параметры файлов cookie</a>
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
                    <Link key={`${props.pathname}-${item.hash}`} to={{pathname: props.pathname, hash: item.hash}}>
                        {item.title}
                    </Link>
                ))}
            </div>
        </div>
    );
}
