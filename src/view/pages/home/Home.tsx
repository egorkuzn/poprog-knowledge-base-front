import {useMemo, useState} from "react";
import {Link} from "react-router-dom";
import BodyView from "../BodyView";
import "../../../styles/pages/Home.scss";
import {submitSiteFeedback, type SiteFeedbackChoice} from "../../../api/siteFeedbackApi";
import heroBackground from "../../../assets/home/hero/hero-bg.png";
import caseOneImage from "../../../assets/home/cases/case-1.png";
import caseTwoImage from "../../../assets/home/cases/case-2.png";
import caseThreeImage from "../../../assets/home/cases/case-3.png";
import caseOneLogo from "../../../assets/home/logos/case-1-logo.png";
import caseTwoLogo from "../../../assets/home/logos/case-2-logo.png";
import caseThreeLogo from "../../../assets/home/logos/case-3-logo.png";
import likeIcon from "../../../assets/home/icons/like.svg";
import dislikeIcon from "../../../assets/home/icons/dislike.svg";
import arrowLeftIcon from "../../../assets/home/icons/arrow-left.svg";
import arrowRightIcon from "../../../assets/home/icons/arrow-right.svg";
import arrowRightAltIcon from "../../../assets/home/icons/arrow-right-alt.svg";

interface CaseCard {
    company: string
    description: string
    image: string
    logo: string
    accent: string
    link: string
}

const caseCards: CaseCard[] = [
    {
        company: "Автоматизация розлива",
        description: "Управляющие процессы для линий розлива ускоряют выпуск продукции и помогают удерживать качество на каждом этапе производственного цикла.",
        image: caseOneImage,
        logo: caseOneLogo,
        accent: "rgba(128, 245, 104, 0.6)",
        link: "/projects/success-stories"
    },
    {
        company: "GFmark",
        description: "GFmark переводит разработку для оборудования на poST и гарантирует соответствие своей продукции всем необходимым сертификатам и стандартам безопасности.",
        image: caseTwoImage,
        logo: caseTwoLogo,
        accent: "rgba(255, 192, 160, 0.55)",
        link: "/projects/post"
    },
    {
        company: "Обь-Иртышводпуть",
        description: "ФБУ «Администрация «Обь-Иртышводпуть» модернизирует процессы Новосибирского шлюза с 50-летней историей.",
        image: caseThreeImage,
        logo: caseThreeLogo,
        accent: "rgba(100, 204, 255, 0.5)",
        link: "/projects/industrial-c"
    }
];

const feedbackStorageKey = "home_feedback_choice";
const feedbackMessages: Record<SiteFeedbackChoice, string> = {
    yes: "Отлично, спасибо за положительную оценку.",
    no: "Спасибо за честный ответ. Мы учтём это и улучшим портал."
};
const siteQualityTestDraftPath = "/tests/site-quality-test-draft.md";

export function Home() {
    const [activeCaseIndex, setActiveCaseIndex] = useState(1);
    const [feedbackChoice, setFeedbackChoice] = useState<SiteFeedbackChoice | null>(() => {
        if (typeof window === "undefined") {
            return null;
        }

        const storedChoice = window.localStorage.getItem(feedbackStorageKey);
        return storedChoice === "yes" || storedChoice === "no" ? storedChoice : null;
    });
    const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
    const [feedbackError, setFeedbackError] = useState("");
    const [isFeedbackTestModalOpen, setIsFeedbackTestModalOpen] = useState(false);
    const visibleCards = useMemo(() => (
        caseCards
            .map((card, index) => ({
                ...card,
                position: (index - activeCaseIndex + caseCards.length) % caseCards.length
            }))
            .sort((leftCard, rightCard) => leftCard.position - rightCard.position)
    ), [activeCaseIndex]);

    const showPreviousCase = () => {
        setActiveCaseIndex((currentIndex) => (currentIndex - 1 + caseCards.length) % caseCards.length);
    };

    const showNextCase = () => {
        setActiveCaseIndex((currentIndex) => (currentIndex + 1) % caseCards.length);
    };

    const handleFeedbackChoice = async (choice: SiteFeedbackChoice) => {
        if (isFeedbackSubmitting) {
            return;
        }

        setIsFeedbackSubmitting(true);
        setFeedbackError("");

        try {
            await submitSiteFeedback({
                choice,
                sentAt: new Date().toISOString()
            });

            setFeedbackChoice(choice);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(feedbackStorageKey, choice);
            }
            setIsFeedbackTestModalOpen(true);
        } catch (error) {
            setFeedbackError(error instanceof Error ? error.message : "Не удалось отправить обратную связь.");
        } finally {
            setIsFeedbackSubmitting(false);
        }
    };

    return BodyView(
        <main className="home-page home-page-main" id="top">
                <section className="home-hero" style={{backgroundImage: `url(${heroBackground})`}}>
                    <div className="home-hero-content">
                        <h1>Процесс-ориентированное программирование -</h1>
                        <p>эффективная технология разработки управляющих программ в виде набора взаимодействующих процессов</p>
                        <Link className="home-hero-cta" to="/chat">
                            Обсудить задачу в ИИ-чате
                        </Link>
                    </div>
                </section>

                <section className="home-cases-section" id="about">
                    <div className="home-section-copy">
                        <h2>Внедрение новых решений в каждой отрасли</h2>
                        <p>Узнайте, как Poprog помогает организациям создавать, масштабировать и трансформироваться.</p>
                    </div>

                    <div className="home-cases-track">
                        {visibleCards.map((card) => {
                            const isActive = card.position === 0;
                            const isPreview = card.position === 1 || card.position === 2;
                            const previewSideClass = card.position === 1
                                ? " home-case-card-right"
                                : card.position === 2
                                    ? " home-case-card-left"
                                    : "";

                            return (
                                <article
                                    className={`home-case-card${isActive ? " home-case-card-active" : ""}${isPreview ? " home-case-card-preview" : ""}${previewSideClass}`}
                                    key={card.company}
                                    style={{boxShadow: `0 24px 36px ${card.accent}`}}
                                >
                                    <img alt={card.company} className="home-case-image" src={card.image}/>
                                    <div className="home-case-overlay">
                                        <img alt={`${card.company} logo`} className="home-case-logo" src={card.logo}/>
                                        <p>{card.description}</p>
                                        <Link className="home-case-link" to={card.link} aria-label={`Открыть кейс ${card.company}`}>
                                            <img alt="" aria-hidden="true" src={arrowRightAltIcon}/>
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    <div className="home-cases-controls">
                        <button onClick={showPreviousCase} type="button">
                            <img alt="Предыдущий кейс" src={arrowLeftIcon}/>
                        </button>
                        <span>{activeCaseIndex + 1}/{caseCards.length}</span>
                        <button onClick={showNextCase} type="button">
                            <img alt="Следующий кейс" src={arrowRightIcon}/>
                        </button>
                    </div>
                </section>

                <section className="home-feedback-section" id="support">
                    <div>
                        <h3>Открыли для себя что-то новое?</h3>
                        <p>Поделитесь, что мы могли бы улучшить портал</p>
                    </div>

                    <div className="home-feedback-actions">
                        <button
                            aria-pressed={feedbackChoice === "yes"}
                            className={feedbackChoice === "yes" ? "home-feedback-choice-active" : ""}
                            onClick={() => handleFeedbackChoice("yes")}
                            disabled={isFeedbackSubmitting}
                            type="button"
                        >
                            <span>Да</span>
                            <img alt="" aria-hidden="true" src={likeIcon}/>
                        </button>
                        <button
                            aria-pressed={feedbackChoice === "no"}
                            className={feedbackChoice === "no" ? "home-feedback-choice-active" : ""}
                            onClick={() => handleFeedbackChoice("no")}
                            disabled={isFeedbackSubmitting}
                            type="button"
                        >
                            <span>Нет</span>
                            <img alt="" aria-hidden="true" src={dislikeIcon}/>
                        </button>
                    </div>
                    {isFeedbackSubmitting && <p className="home-feedback-status">Отправляем ответ...</p>}
                    {feedbackChoice && <p className="home-feedback-status">{feedbackMessages[feedbackChoice]}</p>}
                    {feedbackError.length > 0 && <p className="home-feedback-status home-feedback-status-error">{feedbackError}</p>}
                </section>

                {isFeedbackTestModalOpen && (
                    <div className="home-feedback-modal-backdrop">
                        <div className="home-feedback-modal" role="dialog" aria-label="Подробный тест качества сайта">
                            <h4>Спасибо за ответ</h4>
                            <p>Хотите пройти подробный тест по качеству сайта?</p>
                            <div className="home-feedback-modal-actions">
                                <button
                                    onClick={() => setIsFeedbackTestModalOpen(false)}
                                    type="button"
                                >
                                    Позже
                                </button>
                                <button
                                    onClick={() => {
                                        window.open(siteQualityTestDraftPath, "_blank");
                                        setIsFeedbackTestModalOpen(false);
                                    }}
                                    type="button"
                                >
                                    Пройти тест
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </main>
    );
}
