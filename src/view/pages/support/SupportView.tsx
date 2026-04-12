import {useState} from "react";
import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import "../../../styles/pages/SupportContact.scss";

export function SupportView() {
    const [message, setMessage] = useState("");

    const sendSupportEmail = () => {
        const subject = encodeURIComponent("Запрос в поддержку Poprog");
        const body = encodeURIComponent(message || "Опишите вашу проблему: шаги, что ожидали и что увидели.");
        window.location.href = `mailto:poprog.industrial@gmail.com?subject=${subject}&body=${body}`;
    };

    return BodyView(
        <main className="support-contact-page">
            <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Поддержка"}]}/>
            <section className="support-contact-card">
                <h1>Поддержка</h1>
                <p>Если у вас возникла проблема с порталом или инструментами Poprog, опишите её максимально подробно.</p>
                <textarea
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Что произошло, на какой странице, какие шаги воспроизведения?"
                    rows={8}
                    value={message}
                />
                <button onClick={sendSupportEmail} type="button">Отправить запрос в поддержку</button>
            </section>
        </main>
    );
}
