import {useCallback} from "react";
import type {JSX} from "react";
import BodyView from "../BodyView";
import "../../../styles/pages/Publications.scss";
import {getGroupedPublications} from "../../../api/knowledgeBaseApi";
import type {PublicationModel, PublicationsByDateDto} from "../../../api/types";
import {useRemoteData} from "../../../hooks/useRemoteData";

export function PublicationsView() {
    const loadPublications = useCallback(() => getGroupedPublications(), []);
    const {data, error, isLoading} = useRemoteData(loadPublications);

    return BodyView(page(data, isLoading, error));
}

function renderPublicationLink(publication: PublicationModel, element: JSX.Element) {
    return publication.link === "" ? element : (
        <a href={publication.link} target="_blank" rel="noopener noreferrer">
            {element}
        </a>
    );
}

function page(publications: PublicationsByDateDto[] | null, isLoading: boolean, error: string | null) {
    return (
        <main>
            <div className="publications-page">
                <h1>Публикации</h1>
                {isLoading && <p className="remote-data-state">Загрузка публикаций...</p>}
                {error && <p className="remote-data-state remote-data-state-error">Не удалось загрузить публикации: {error}</p>}
                {!isLoading && !error && publications?.length === 0 && (
                    <p className="remote-data-state">Публикации пока не найдены.</p>
                )}
                {publications?.map((publicationsByDate) => (
                    <div id={publicationsByDate.date} key={publicationsByDate.date}>
                        <h2>{publicationsByDate.date}</h2>
                        {publicationsByDate.publications.map((publication, index) => (
                            <div className="publication" key={`${publicationsByDate.date}-${index}-${publication.theme}`}>
                                <div className="publication-authors-titles">
                                    {renderPublicationLink(publication, <p>{publication.authors}</p>)}
                                    {renderPublicationLink(publication, <p>{publication.theme}</p>)}
                                </div>
                                {renderPublicationLink(
                                    publication,
                                    <p className="publication-published">{publication.published}</p>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </main>
    );
}
