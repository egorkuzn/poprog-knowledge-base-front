import {useCallback} from "react";
import App from "../../../App";
import "../../../styles/pages/Works.scss";
import {getGroupedStudentWorks} from "../../../api/knowledgeBaseApi";
import {WorkModel, WorksByProjectTypeDto} from "../../../api/types";
import {useRemoteData} from "../../../hooks/useRemoteData";

export function WorksView(props: any) {
    const loadWorks = useCallback(() => getGroupedStudentWorks(), []);
    const {data, error, isLoading} = useRemoteData(loadWorks);

    return App(page(data, isLoading, error));
}

function page(worksData: WorksByProjectTypeDto[] | null, isLoading: boolean, error: string | null) {
    return (
        <main>
            <div className="works-page">
                <h1>Дипломные работы и диссертации</h1>
                {isLoading && <p className="remote-data-state">Загрузка работ...</p>}
                {error && <p className="remote-data-state remote-data-state-error">Не удалось загрузить работы: {error}</p>}
                {!isLoading && !error && worksData?.length === 0 && (
                    <p className="remote-data-state">Работы пока не найдены.</p>
                )}
                {worksData?.map((worksClassModel: WorksByProjectTypeDto) => (
                    <div className="works-class" id={worksClassModel.hash} key={worksClassModel.hash}>
                        <h2>{worksClassModel.title}</h2>
                        {worksClassModel.works.map((workModel: WorkModel, index: number) => (
                            <div className="work" key={`${worksClassModel.hash}-${index}-${workModel.theme}`}>
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
