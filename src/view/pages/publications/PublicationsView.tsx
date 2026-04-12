import {useCallback, useEffect} from "react";
import type {JSX, MouseEvent as ReactMouseEvent} from "react";
import {useSearchParams} from "react-router-dom";
import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import "../../../styles/pages/Publications.scss";
import {getGroupedPublications} from "../../../api/knowledgeBaseApi";
import type {PublicationModel, PublicationsByDateDto} from "../../../api/types";
import {useRemoteData} from "../../../hooks/useRemoteData";
import {isExternalResourceUrl, requestExternalNavigation} from "../../../utils/externalNavigation";

export function PublicationsView() {
    const [searchParams] = useSearchParams();
    const loadPublications = useCallback(() => getGroupedPublications(), []);
    const {data, error, isLoading} = useRemoteData(loadPublications);
    const handlePublicationLinkClick = (publicationLink: string) => (event: ReactMouseEvent<HTMLAnchorElement>) => {
        if (!isExternalResourceUrl(publicationLink)) {
            return;
        }

        event.preventDefault();
        void requestExternalNavigation(publicationLink);
    };

    useEffect(() => {
        const focusType = searchParams.get("focusType");
        const focusId = searchParams.get("focusId");
        if (focusType !== "publication" || !focusId || isLoading || error) {
            return;
        }

        const target = document.getElementById(`publication-${focusId}`);
        if (!target) {
            return;
        }

        target.scrollIntoView({behavior: "smooth", block: "center"});
        target.classList.add("search-focus-highlight");
        const timeoutId = window.setTimeout(() => {
            target.classList.remove("search-focus-highlight");
        }, 3000);

        return () => window.clearTimeout(timeoutId);
    }, [searchParams, isLoading, error, data]);

    return BodyView(page(data, isLoading, error, handlePublicationLinkClick));
}

type PublicationLinkClickHandler = (publicationLink: string) => (event: ReactMouseEvent<HTMLAnchorElement>) => void;

function renderPublicationLink(publication: PublicationModel, element: JSX.Element, onPublicationLinkClick: PublicationLinkClickHandler) {
    return publication.link === "" ? element : (
        <a href={publication.link} onClick={onPublicationLinkClick(publication.link)} rel="noopener noreferrer" target="_blank">
            {element}
        </a>
    );
}

function page(
    publications: PublicationsByDateDto[] | null,
    isLoading: boolean,
    error: string | null,
    onPublicationLinkClick: PublicationLinkClickHandler
) {
    return (
        <main>
            <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Публикации"}]}/>
            <div className="publications-page">
                <h1>Публикации</h1>
                {isLoading && <p className="remote-data-state">Загрузка публикаций...</p>}
                {error && <p className="remote-data-state remote-data-state-error">Не удалось загрузить публикации: {error}</p>}
                {!isLoading && !error && publications?.length === 0 && (
                    <p className="remote-data-state">Публикации пока не найдены.</p>
                )}
                {publications?.map((publicationsByDate) => (
                    <div className="section-spacer" id={publicationsByDate.date} key={publicationsByDate.date}>
                        <h2>{publicationsByDate.date}</h2>
                        {publicationsByDate.publications.map((publication, index) => (
                            <div
                                className="publication"
                                id={`publication-${publication.id}`}
                                key={`${publicationsByDate.date}-${publication.id}-${index}`}
                            >
                                <div className="publication-authors-titles">
                                    {renderPublicationLink(publication, <p>{publication.authors}</p>, onPublicationLinkClick)}
                                    {renderPublicationLink(publication, <p>{publication.theme}</p>, onPublicationLinkClick)}
                                </div>
                                {renderPublicationLink(
                                    publication,
                                    <p className="publication-published">{publication.published}</p>,
                                    onPublicationLinkClick
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </main>
    );
}
