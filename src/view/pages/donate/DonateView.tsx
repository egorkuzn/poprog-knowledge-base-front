import {useMemo, useState} from "react";
import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import {submitPublicDonation} from "../../../api/donationApi";
import "../../../styles/pages/Donate.scss";

const presets = [300, 700, 1500, 3000];

export function DonateView() {
    const [amount, setAmount] = useState(700);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("Хочу поддержать развитие Poprog.");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState("");

    const returnUrl = useMemo(() => `${window.location.origin}/donate`, []);

    const onSubmit = async () => {
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setStatus("");

        try {
            const donation = await submitPublicDonation({
                amount,
                currency: "RUB",
                source: "public-donate-page",
                message,
                returnUrl,
                userName: name,
                userEmail: email
            });

            setStatus("Спасибо! Платёж создан. Открываем страницу подтверждения...");
            if (donation.confirmationUrl) {
                window.open(donation.confirmationUrl, "_blank");
            }
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Не удалось создать пожертвование.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return BodyView(
        <main className="donate-page">
            <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Помочь проекту"}]}/>

            <section className="donate-hero">
                <h1>Поддержите развитие Poprog</h1>
                <p>
                    Ваш донат помогает команде делать современные инженерные технологии доступнее: развивать языки
                    программирования для промышленной автоматизации, улучшать инструменты верификации и обучать новое
                    поколение инженеров.
                </p>
                <p>
                    Каждый вклад, даже небольшой, ускоряет выпуск новых функций, публикацию практических материалов и
                    запуск открытых инициатив для университетов и производственных команд.
                </p>
            </section>

            <section className="donate-form-card">
                <h2>Отправить донат</h2>

                <div className="donate-presets">
                    {presets.map((value) => (
                        <button
                            className={amount === value ? "donate-preset-active" : ""}
                            key={value}
                            onClick={() => setAmount(value)}
                            type="button"
                        >
                            {value} ₽
                        </button>
                    ))}
                </div>

                <label>
                    Сумма (₽)
                    <input min={1} onChange={(e) => setAmount(Number(e.target.value || 0))} type="number" value={amount}/>
                </label>

                <label>
                    Имя (необязательно)
                    <input onChange={(e) => setName(e.target.value)} type="text" value={name}/>
                </label>

                <label>
                    Email (необязательно)
                    <input onChange={(e) => setEmail(e.target.value)} type="email" value={email}/>
                </label>

                <label>
                    Сообщение
                    <textarea onChange={(e) => setMessage(e.target.value)} rows={4} value={message}/>
                </label>

                <button className="donate-submit" disabled={isSubmitting || amount <= 0} onClick={onSubmit} type="button">
                    {isSubmitting ? "Создаем платеж..." : "Поддержать проект"}
                </button>

                {status.length > 0 && <p className="donate-status">{status}</p>}
            </section>
        </main>
    );
}
