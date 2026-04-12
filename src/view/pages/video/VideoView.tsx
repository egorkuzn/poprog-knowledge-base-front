import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import "../../../styles/common/PageShell.scss";

export function VideoView() {
    return (BodyView(page()))
}

function page() {
    return (
        <main className="site-page">
            <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Видео"}]}/>
            <section className="site-page-content">
                <h1>Видео</h1>
                <p className="site-page-muted">Раздел в подготовке. Здесь будут выступления, лекции и демонстрации технологий Poprog.</p>
            </section>
        </main>
    )
}
