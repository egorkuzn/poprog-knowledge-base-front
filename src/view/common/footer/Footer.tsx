import {useCallback} from "react";
import {ProjectsFooterRow} from "../../../data/footer/ProjectsFooterRow";
import {getGroupedPublications, getGroupedStudentWorks} from "../../../api/knowledgeBaseApi";
import {FooterRawDataElement} from "../../../model/footer/FooterRawDataElement";
import {useRemoteData} from "../../../hooks/useRemoteData";
import {FooterRow} from "./FooterRow";
import {FooterContactsRowView} from "./FooterContactsRowView";

export function Footer(props: any) {
    const loadWorks = useCallback(() => getGroupedStudentWorks(), []);
    const loadPublications = useCallback(() => getGroupedPublications(), []);
    const worksState = useRemoteData(loadWorks);
    const publicationsState = useRemoteData(loadPublications);

    const worksFooterData: FooterRawDataElement[] = worksState.data?.map((item) => ({
        title: item.title,
        hash: item.hash
    })) ?? [];

    const publicationsFooterData: FooterRawDataElement[] = publicationsState.data?.map((item) => ({
        title: item.date,
        hash: item.date
    })) ?? [];

    return (
        <div className="Footer">
            <FooterRow name="Проекты" pathname="/projects" rowData={new ProjectsFooterRow()}/>
            <FooterRow name="Дипломные работы и диссертации" pathname="/works" rowData={{data: worksFooterData}}/>
            <FooterRow name="Публикации" pathname="/publications" rowData={{data: publicationsFooterData}}/>
            <FooterContactsRowView/>
        </div>
    );
}
