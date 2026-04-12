import {useCallback, useEffect} from "react";
import {useSearchParams} from "react-router-dom";
import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import "../../../styles/pages/Works.scss";
import {getGroupedStudentWorks} from "../../../api/knowledgeBaseApi";
import type {WorkModel, WorksByProjectTypeDto} from "../../../api/types";
import {useRemoteData} from "../../../hooks/useRemoteData";

export function WorksView() {
    const [searchParams] = useSearchParams();
    const loadWorks = useCallback(() => getGroupedStudentWorks(), []);
    const {data, error, isLoading} = useRemoteData(loadWorks);

    useEffect(() => {
        const focusType = searchParams.get("focusType");
        const focusId = searchParams.get("focusId");
        if (focusType !== "student-work" || !focusId || isLoading || error) {
            return;
        }

        const target = document.getElementById(`student-work-${focusId}`);
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

    return BodyView(page(data, isLoading, error));
}

function page(worksData: WorksByProjectTypeDto[] | null, isLoading: boolean, error: string | null) {
    return (
        <main>
            <div className="works-page">
                <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Студенческие работы"}]}/>
                <h1>Дипломные работы и диссертации</h1>
                {isLoading && <p className="remote-data-state">Загрузка работ...</p>}
                {error && <p className="remote-data-state remote-data-state-error">Не удалось загрузить работы: {error}</p>}
                {!isLoading && !error && worksData?.length === 0 && (
                    <p className="remote-data-state">Работы пока не найдены.</p>
                )}
                {worksData?.map((worksClassModel: WorksByProjectTypeDto) => (
                    <div className="works-class section-spacer" id={worksClassModel.hash} key={worksClassModel.hash}>
                        <h2>{worksClassModel.title}</h2>
                        {worksClassModel.works.map((workModel: WorkModel, index: number) => (
                            <div
                                className="work"
                                id={`student-work-${workModel.id}`}
                                key={`${worksClassModel.hash}-${workModel.id}-${index}`}
                            >
                                <div className="work-authors-titles">
                                    <p>{workModel.authors}</p>
                                    <p>{workModel.theme}</p>
                                </div>
                                <p className="work-published">{workModel.published}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </main>
    );
}
