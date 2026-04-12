import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import "../../../styles/common/PageShell.scss";

export function DocsView() {
    return (BodyView(page()))
}

function page() {
    return (
        <main className="site-page">
            <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Документация"}]}/>
            <section className="site-page-content">
                <h1>Документация</h1>
                <p className="site-page-muted">Раздел заполняется. Здесь будут инструкции по установке, запуску и работе с инструментами Poprog.</p>
            </section>
        </main>
    )
}
