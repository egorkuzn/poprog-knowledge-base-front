import {useCallback, useEffect, useState} from "react";
import type {JSX, MouseEvent as ReactMouseEvent} from "react";
import {useSearchParams} from "react-router-dom";
import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import "../../../styles/pages/Publications.scss";
import {getGroupedPublications} from "../../../api/knowledgeBaseApi";
import type {PublicationModel, PublicationsByDateDto} from "../../../api/types";
import {useRemoteData} from "../../../hooks/useRemoteData";
import {isExternalResourceUrl, requestExternalNavigation} from "../../../utils/externalNavigation";
import {apiBaseUrl} from "../../../api/config";

export function PublicationsView() {
    const [searchParams] = useSearchParams();
    const loadPublications = useCallback(() => getGroupedPublications(), []);
    const {data, error, isLoading} = useRemoteData(loadPublications);
    const [doiChoice, setDoiChoice] = useState<null | {pdfUrl: string, doiUrl: string}>(null);

    const handlePublicationLinkClick = (publication: PublicationModel) => (event: ReactMouseEvent<HTMLAnchorElement>) => {
        const normalized = resolvePublicationLink(publication.link);

        const doiUrl = extractDoiUrl(publication.published);
        // If we have BOTH an internal PDF and a DOI, show a chooser instead of opening directly.
        if (doiUrl && normalized.startsWith(`${apiBaseUrl}/api/files/`)) {
            event.preventDefault();
            setDoiChoice({pdfUrl: normalized, doiUrl});
            return;
        }

        // PDF files served by our backend should open directly without external-navigation flow.
        if (normalized.startsWith(`${apiBaseUrl}/api/files/`)) {
            return;
        }

        if (!isExternalResourceUrl(normalized)) {
            return;
        }

        event.preventDefault();
        void requestExternalNavigation(normalized);
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

    return BodyView(page(data, isLoading, error, handlePublicationLinkClick, doiChoice, setDoiChoice));
}

type PublicationLinkClickHandler = (publication: PublicationModel) => (event: ReactMouseEvent<HTMLAnchorElement>) => void;

function renderPublicationLink(publication: PublicationModel, element: JSX.Element, onPublicationLinkClick: PublicationLinkClickHandler) {
    return publication.link === "" ? element : (
        <a
            href={resolvePublicationLink(publication.link)}
            onClick={onPublicationLinkClick(publication)}
            rel="noopener noreferrer"
            target="_blank"
        >
            {element}
        </a>
    );
}

function resolvePublicationLink(link: string): string {
    const trimmed = link.trim();
    if (trimmed.startsWith("/api/")) {
        return `${apiBaseUrl}${trimmed}`;
    }
    return trimmed;
}

function page(
    publications: PublicationsByDateDto[] | null,
    isLoading: boolean,
    error: string | null,
    onPublicationLinkClick: PublicationLinkClickHandler,
    doiChoice: null | {pdfUrl: string, doiUrl: string},
    setDoiChoice: (value: null | {pdfUrl: string, doiUrl: string}) => void
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

            {doiChoice && (
                <>
                    <button
                        aria-label="Закрыть выбор источника"
                        className="site-external-resource-backdrop"
                        onClick={() => setDoiChoice(null)}
                        type="button"
                    />
                    <div aria-label="Выбор источника публикации" className="site-external-resource-modal" role="dialog">
                        <h3>Открыть публикацию</h3>
                        <p>Выберите источник:</p>
                        <div className="site-external-resource-actions">
                            <button
                                className="site-external-resource-cancel"
                                onClick={() => {
                                    const url = doiChoice.pdfUrl;
                                    setDoiChoice(null);
                                    window.open(url, "_blank");
                                }}
                                type="button"
                            >
                                Открыть PDF
                            </button>
                            <button
                                className="site-external-resource-confirm"
                                onClick={() => {
                                    const url = doiChoice.doiUrl;
                                    setDoiChoice(null);
                                    void requestExternalNavigation(url);
                                }}
                                type="button"
                            >
                                Открыть по DOI
                            </button>
                        </div>
                        <p className="site-external-resource-url">{doiChoice.doiUrl}</p>
                    </div>
                </>
            )}
        </main>
    );
}

function extractDoiUrl(text: string): string | null {
    const s = (text ?? "").trim();
    const doiOrg = s.match(/doi\.org\/(10\.\d{4,9}\/[^\s)\]}>\"']+)/i);
    if (doiOrg?.[1]) return `https://doi.org/${doiOrg[1].replace(/[.,;:]+$/, "")}`;
    const doi = s.match(/\b10\.\d{4,9}\/[^\s)\]}>\"']+/);
    if (doi?.[0]) return `https://doi.org/${doi[0].replace(/[.,;:]+$/, "")}`;
    return null;
}
