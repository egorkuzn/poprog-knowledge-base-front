import type {ProjectsListViewState} from "./ProjectsListViewState";

export interface ProjectsListViewProps {
    initialState: string
    onChange: (state: ProjectsListViewState) => void
}
