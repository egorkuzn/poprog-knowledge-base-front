import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import "../../../styles/pages/SupportContact.scss";

export function ContactView() {
    return BodyView(
        <main className="support-contact-page">
            <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Свяжитесь с нами"}]}/>
            <section className="support-contact-card">
                <h1>Свяжитесь с нами</h1>
                <p>Мы открыты к партнерствам, предложениям по развитию и совместным исследованиям.</p>

                <div className="support-contact-list">
                    <p><strong>Email:</strong> poprog.industrial@gmail.com</p>
                    <p><strong>Telegram:</strong> @poprog</p>
                    <p><strong>GitHub:</strong> github.com/egorkuzn</p>
                </div>

                <p className="support-contact-muted">Обычно отвечаем в течение 1-2 рабочих дней.</p>
            </section>
        </main>
    );
}
