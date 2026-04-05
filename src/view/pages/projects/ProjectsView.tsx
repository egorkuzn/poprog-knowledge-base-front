import BodyView from "../BodyView";

export function ProjectsView() {
    return (BodyView(page()))
}

function page() {
    return (
        <main className="projects-page">
            <section className="projects-page-content">
                <h1>Проекты</h1>
            </section>
        </main>
    )
}
