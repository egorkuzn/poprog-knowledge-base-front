import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import {Link} from "react-router-dom";
import "../../../styles/common/PageShell.scss";

export function DocsView() {
    return (BodyView(page()))
}

function page() {
    return (
        <main className="site-page">
            <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Что такое Poprog"}]}/>
            <section className="site-page-content site-intro-page">
                <section className="site-intro-hero">
                    <span>Откройте для себя Poprog</span>
                    <h1>Процесс-ориентированное программирование без лишней сложности</h1>
                    <p>
                        Poprog помогает смотреть на управляющую программу не как на запутанный набор условий,
                        а как на понятную систему процессов: что должно происходить, в какой момент и как части
                        системы взаимодействуют друг с другом.
                    </p>
                    <div className="site-intro-actions">
                        <Link to="/projects">Посмотреть инструменты</Link>
                        <Link to="/chat">Спросить ИИ-чат</Link>
                    </div>
                </section>

                <section className="site-intro-section">
                    <h2>К чему это всё?</h2>
                    <p>
                        В промышленной автоматизации, embedded-системах и учебных проектах логика быстро становится
                        сложной: есть датчики, события, состояния, аварийные сценарии и действия оператора. Poprog
                        предлагает описывать такую логику через отдельные процессы. Каждый процесс отвечает за свою
                        часть поведения, поэтому программу легче понимать, обсуждать, проверять и развивать.
                    </p>
                </section>

                <section className="site-intro-grid" aria-label="Польза процесс-ориентированного подхода">
                    <article>
                        <strong>Понятнее для команды</strong>
                        <p>Инженеры, разработчики и исследователи видят одну модель поведения, а не набор разрозненных фрагментов кода.</p>
                    </article>
                    <article>
                        <strong>Проще проверять</strong>
                        <p>Когда логика разделена на процессы, легче найти ошибку, проверить сценарий и объяснить, почему система ведёт себя именно так.</p>
                    </article>
                    <article>
                        <strong>Ближе к реальным задачам</strong>
                        <p>Подход подходит для контроллеров, микроконтроллеров, промышленных установок и учебных стендов.</p>
                    </article>
                </section>

                <section className="site-intro-section">
                    <h2>Что находится внутри портала</h2>
                    <p>
                        Портал объединяет материалы и инструменты вокруг процесс-ориентированного подхода: языки Reflex,
                        poST и IndustrialC, облачную среду RIDE, публикации, студенческие работы, примеры внедрения и
                        Poprog Market с полезными утилитами.
                    </p>
                </section>

                <section className="site-intro-links" aria-label="Куда перейти дальше">
                    <Link to="/projects/reflex">
                        <strong>Reflex</strong>
                        <span>Язык для микроконтроллеров и embedded-задач.</span>
                    </Link>
                    <Link to="/projects/post">
                        <strong>poST</strong>
                        <span>Процесс-ориентированное расширение Structured Text для ПЛК.</span>
                    </Link>
                    <Link to="/projects/ride-overview">
                        <strong>RIDE</strong>
                        <span>Среда, где можно работать с проектами и инструментами Poprog.</span>
                    </Link>
                    <Link to="/publications">
                        <strong>Публикации</strong>
                        <span>Научные и учебные материалы для более глубокого знакомства.</span>
                    </Link>
                </section>
            </section>
        </main>
    )
}
