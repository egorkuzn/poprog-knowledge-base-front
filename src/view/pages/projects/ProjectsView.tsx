import {Link} from "react-router-dom";
import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import "../../../styles/pages/Projects.scss";

const languageCards = [
    {
        slug: "reflex",
        title: "Reflex",
        tagline: "Процесс-ориентированный язык для ПЛК и систем управления",
        accentClass: "projects-language-card-reflex"
    },
    {
        slug: "post",
        title: "poST",
        tagline: "Расширение Structured Text для сложных алгоритмов управления",
        accentClass: "projects-language-card-post"
    },
    {
        slug: "industrial-c",
        title: "IndustrialC",
        tagline: "Инженерный язык для производственных и real-time сценариев",
        accentClass: "projects-language-card-industrial-c"
    }
];

export function ProjectsView() {
    return BodyView(
        <main className="projects-page">
            <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Проекты"}]}/>

            <section className="projects-hero">
                <h1>Проекты и технологические центры Poprog</h1>
                <p>Выберите направление: языки программирования, инженерия требований, облачная среда RIDE и инструментальные цепочки.</p>
            </section>

            <section className="projects-languages">
                <div className="projects-languages-header">
                    <h2>Языки программирования</h2>
                    <span>Презентационные страницы и сценарии внедрения</span>
                </div>

                <div className="projects-languages-grid">
                    {languageCards.map((card) => (
                        <Link className={`projects-language-card ${card.accentClass}`} key={card.slug} to={`/projects/${card.slug}`}>
                            <h3>{card.title}</h3>
                            <p>{card.tagline}</p>
                            <span>Открыть презентацию</span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="projects-secondary-grid">
                <Link className="projects-secondary-card" to="/projects/ride-overview">
                    <h3>Облачная среда RIDE</h3>
                    <p>Набор инструментов для совместной разработки и отладки промышленных программ.</p>
                </Link>

                <Link className="projects-secondary-card" to="/projects/edtl-spec">
                    <h3>EDTL и инженерия требований</h3>
                    <p>Формализация требований, трассировка и проверка на ранних этапах.</p>
                </Link>

                <Link className="projects-secondary-card" to="/market">
                    <h3>Poprog Market</h3>
                    <p>Каталог утилит: фильтрация, поиск и карточки программных инструментов.</p>
                </Link>
            </section>
        </main>
    );
}
