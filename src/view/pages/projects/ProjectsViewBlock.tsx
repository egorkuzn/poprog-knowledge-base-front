import {Component, type ReactElement} from "react";
import {ProjectsListView} from "./ProjectsListView";
import type {ProjectViewBlockState} from "../../../model/pages/projects/ProjectViewBlockState";

export class ProjectsViewBlock extends Component<{}, ProjectViewBlockState> {
    state: ProjectViewBlockState = {
        id: "reflex"
    }

    render(): ReactElement {
        return(

                <ProjectsListView onChange={
                    (newState) => {
                        console.log(newState.activeElem)
                        this.setState({id: newState.activeElem}
                        )}}
                    initialState={this.state.id}
                />
        )
    }
}
