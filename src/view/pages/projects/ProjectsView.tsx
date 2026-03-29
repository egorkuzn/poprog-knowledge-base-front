import BodyView from "../BodyView";
import {ProjectsViewBlock} from "./ProjectsViewBlock";

export function ProjectsView() {
    return (BodyView(page()))
}

function page() {
    return (
        <main>
            <div className="projects">
                <h1>Проекты</h1>
                <ProjectsViewBlock/>
            </div>
        </main>
    )
}

