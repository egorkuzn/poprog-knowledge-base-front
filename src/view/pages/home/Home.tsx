import {useMemo, useState} from "react";
import BodyView from "../BodyView";
import "../../../styles/pages/Home.scss";
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
}

const caseCards: CaseCard[] = [
    {
        company: "Автоматизация розлива",
        description: "Управляющие процессы для линий розлива ускоряют выпуск продукции и помогают удерживать качество на каждом этапе производственного цикла.",
        image: caseOneImage,
        logo: caseOneLogo,
        accent: "rgba(128, 245, 104, 0.6)"
    },
    {
        company: "GFmark",
        description: "GFmark переводит разработку для оборудования на poST и гарантирует соответствие своей продукции всем необходимым сертификатам и стандартам безопасности.",
        image: caseTwoImage,
        logo: caseTwoLogo,
        accent: "rgba(255, 192, 160, 0.55)"
    },
    {
        company: "Обь-Иртышводпуть",
        description: "ФБУ «Администрация «Обь-Иртышводпуть» модернизирует процессы Новосибирского шлюза с 50-летней историей.",
        image: caseThreeImage,
        logo: caseThreeLogo,
        accent: "rgba(100, 204, 255, 0.5)"
    }
];

export function Home() {
    const [activeCaseIndex, setActiveCaseIndex] = useState(1);
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

    return BodyView(
        <main className="home-page home-page-main" id="top">
                <section className="home-hero" style={{backgroundImage: `url(${heroBackground})`}}>
                    <div className="home-hero-content">
                        <h1>Процесс-ориентированное программирование -</h1>
                        <p>эффективная технология разработки управляющих программ в виде набора взаимодействующих процессов</p>
                    </div>
                </section>

                <section className="home-cases-section">
                    <div className="home-section-copy">
                        <h2>Внедрение новых решений в каждой отрасли</h2>
                        <p>Узнайте, как Poprog помогает организациям создавать, масштабировать и трансформироваться.</p>
                    </div>

                    <div className="home-cases-track">
                        {visibleCards.map((card) => {
                            const isActive = card.position === 0;
                            const isPreview = card.position === 1 || card.position === 2;

                            return (
                                <article
                                    className={`home-case-card${isActive ? " home-case-card-active" : ""}${isPreview ? " home-case-card-preview" : ""}`}
                                    key={card.company}
                                    style={{boxShadow: `0 24px 36px ${card.accent}`}}
                                >
                                    <img alt={card.company} className="home-case-image" src={card.image}/>
                                    <div className="home-case-overlay">
                                        <img alt={`${card.company} logo`} className="home-case-logo" src={card.logo}/>
                                        <p>{card.description}</p>
                                        <button className="home-case-link" type="button" aria-label={`Открыть кейс ${card.company}`}>
                                            <img alt="" aria-hidden="true" src={arrowRightAltIcon}/>
                                        </button>
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
                        <button type="button">
                            <span>Да</span>
                            <img alt="" aria-hidden="true" src={likeIcon}/>
                        </button>
                        <button type="button">
                            <span>Нет</span>
                            <img alt="" aria-hidden="true" src={dislikeIcon}/>
                        </button>
                    </div>
                </section>
        </main>
    );
}
