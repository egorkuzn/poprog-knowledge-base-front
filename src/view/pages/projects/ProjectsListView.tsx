import {Component} from "react";
import {PROJECTS_DATA} from "../../../data/pages/projects/ProjectsProperties";
import {ProjectsListElem} from "./ProjectsListElem";
import '../../../styles/pages/Projects.scss';
import type {ProjectsListViewProps} from "../../../model/pages/projects/ProjectsListViewProps";

export class ProjectsListView extends Component<ProjectsListViewProps> {
    render() {
        return (
            <div className="projects-list">
                {PROJECTS_DATA.map((it) => {
                    return (<ProjectsListElem
                        name={it.name}
                        link={it.link}
                        onChange={(newState) => {
                            console.log(newState)
                            if (newState) {
                                this.props.onChange({activeElem: it.link})
                            }
                        }}
                    />)
                })}
            </div>
        );
    }
}