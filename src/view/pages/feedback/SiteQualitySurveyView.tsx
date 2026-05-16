import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import {submitDetailedSiteFeedback, type DetailedSiteFeedbackRequest} from "../../../api/siteFeedbackApi";
import "../../../styles/pages/SiteQualitySurvey.scss";

type QuestionMode = "scale" | "choice";

type SurveyOption = {
    value: string
    label: string
    score: number
};

type SurveyItem = {
    id: string
    label: string
    mode: QuestionMode
    options?: SurveyOption[]
};

type SurveySection = {
    id: string
    title: string
    items: SurveyItem[]
};

type ItemAnswer = {
    score: number
    choice: string
    comment: string
};

type SectionAnswers = Record<string, ItemAnswer>;

const agreementOptions: SurveyOption[] = [
    {value: "excellent", label: "Отлично", score: 5},
    {value: "good", label: "Хорошо", score: 4},
    {value: "ok", label: "Нормально", score: 3},
    {value: "bad", label: "Есть проблемы", score: 2},
    {value: "critical", label: "Критично", score: 1}
];

const speedOptions: SurveyOption[] = [
    {value: "fast", label: "Быстро", score: 5},
    {value: "medium", label: "Средне", score: 3},
    {value: "slow", label: "Медленно", score: 1}
];

const transitionOptions: SurveyOption[] = [
    {value: "clear", label: "Понятно куда переходит", score: 5},
    {value: "partly", label: "Иногда неочевидно", score: 3},
    {value: "confusing", label: "Часто неочевидно", score: 1}
];

const surveySections: SurveySection[] = [
    {
        id: "navigation",
        title: "Раздел A. Навигация",
        items: [
            {id: "menu-clarity", label: "Понятность структуры меню", mode: "choice", options: agreementOptions},
            {id: "find-speed", label: "Скорость нахождения нужного раздела", mode: "choice", options: speedOptions},
            {id: "cross-device", label: "Удобство работы в desktop/compact/mobile режимах", mode: "scale"}
        ]
    },
    {
        id: "search",
        title: "Раздел B. Поиск",
        items: [
            {id: "search-clarity", label: "Понятность строки поиска", mode: "choice", options: agreementOptions},
            {id: "search-relevance", label: "Релевантность результатов", mode: "scale"},
            {id: "search-transitions", label: "Понятность переходов на внешние ресурсы", mode: "choice", options: transitionOptions}
        ]
    },
    {
        id: "content",
        title: "Раздел C. Контент",
        items: [
            {id: "text-readability", label: "Читаемость текстов", mode: "choice", options: agreementOptions},
            {id: "cards-clarity", label: "Понятность карточек публикаций/кейсов", mode: "choice", options: agreementOptions},
            {id: "mobile-view", label: "Удобство просмотра на мобильных устройствах", mode: "scale"}
        ]
    },
    {
        id: "ai-chat",
        title: "Раздел D. Чат с ИИ",
        items: [
            {id: "chat-flow", label: "Понятность сценария отправки сообщений", mode: "choice", options: agreementOptions},
            {id: "chat-speed", label: "Скорость ответа интерфейса", mode: "choice", options: speedOptions},
            {id: "chat-long-dialog", label: "Удобство длинного диалога", mode: "scale"}
        ]
    }
];

const likedSuggestions = [
    "Понятная навигация",
    "Удобный поиск",
    "Хорошая мобильная версия",
    "Полезный ИИ-чат",
    "Понятные карточки контента"
];

const improveSuggestions = [
    "Повысить скорость отклика",
    "Упростить подменю",
    "Улучшить релевантность поиска",
    "Добавить больше подсказок",
    "Сделать тексты короче"
];

function autoResizeTextarea(textarea: HTMLTextAreaElement): void {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
}

function getDefaultOption(item: SurveyItem): SurveyOption | null {
    if (item.mode !== "choice" || !item.options || item.options.length === 0) {
        return null;
    }
    return item.options[0];
}

function createInitialAnswers(): Record<string, SectionAnswers> {
    const sectionMap: Record<string, SectionAnswers> = {};
    for (const section of surveySections) {
        sectionMap[section.id] = {};
        for (const item of section.items) {
            const defaultOption = getDefaultOption(item);
            sectionMap[section.id][item.id] = {
                score: defaultOption ? defaultOption.score : 0,
                choice: defaultOption ? defaultOption.value : "",
                comment: ""
            };
        }
    }
    return sectionMap;
}

function appendSuggestion(currentText: string, suggestion: string): string {
    if (currentText.trim().length === 0) {
        return suggestion;
    }

    const normalized = currentText.toLowerCase();
    if (normalized.includes(suggestion.toLowerCase())) {
        return currentText;
    }

    return `${currentText.trim()}\n• ${suggestion}`;
}

function developerMoodComment(score: number): string {
    if (score >= 5) {
        return "«Вот это да, спасибо! Похоже, мы на верном пути.»";
    }
    if (score >= 4) {
        return "«Класс! Еще чуть-чуть полировки и будет идеально.»";
    }
    if (score >= 3) {
        return "«Хороший сигнал, давайте докрутим детали вместе.»";
    }
    if (score >= 2) {
        return "«Понял, спасибо за честность. Берем в ближайший фикс.»";
    }
    if (score >= 1) {
        return "«Ой, это больно, но очень полезно. Исправим приоритетно.»";
    }
    return "Наведите курсор и выберите оценку";
}

function StarRating(props: {value: number, onChange: (nextValue: number) => void, label: string}) {
    const [hoverValue, setHoverValue] = useState(0);
    const previewValue = hoverValue > 0 ? hoverValue : props.value;

    return (
        <div className="site-quality-survey-stars-block">
            <p className="site-quality-survey-stars-comment">{developerMoodComment(previewValue)}</p>
            <div
                aria-label={props.label}
                className="site-quality-survey-stars"
                onMouseLeave={() => setHoverValue(0)}
                role="radiogroup"
            >
                {[1, 2, 3, 4, 5].map((starValue) => (
                    <button
                        aria-checked={starValue === props.value}
                        aria-label={`${starValue} из 5`}
                        className={`site-quality-survey-star${starValue <= previewValue ? " site-quality-survey-star-preview" : ""}${starValue <= props.value ? " site-quality-survey-star-active" : ""}`}
                        key={starValue}
                        onClick={() => props.onChange(starValue)}
                        onMouseEnter={() => setHoverValue(starValue)}
                        role="radio"
                        type="button"
                    >
                        ★
                    </button>
                ))}
            </div>
        </div>
    );
}

export function SiteQualitySurveyView() {
    const navigate = useNavigate();
    const [answers, setAnswers] = useState<Record<string, SectionAnswers>>(() => createInitialAnswers());
    const [overallRating, setOverallRating] = useState(0);
    const [whatLiked, setWhatLiked] = useState("");
    const [whatImproveFirst, setWhatImproveFirst] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const lowRatingWithoutCommentCount = useMemo(() => {
        let count = 0;

        for (const section of surveySections) {
            for (const item of section.items) {
                const answer = answers[section.id][item.id];
                if (answer.score > 0 && answer.score < 4 && answer.comment.trim().length === 0) {
                    count += 1;
                }
            }
        }

        return count;
    }, [answers]);

    useEffect(() => {
        if (!isSubmitted) {
            return;
        }

        const timerId = window.setTimeout(() => {
            navigate("/home");
        }, 2400);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [isSubmitted, navigate]);

    const handleScaleChange = (sectionId: string, itemId: string, score: number) => {
        setAnswers((current) => ({
            ...current,
            [sectionId]: {
                ...current[sectionId],
                [itemId]: {
                    ...current[sectionId][itemId],
                    score,
                    choice: ""
                }
            }
        }));
    };

    const handleChoiceChange = (sectionId: string, itemId: string, selectedValue: string) => {
        const section = surveySections.find((entry) => entry.id === sectionId);
        const item = section?.items.find((entry) => entry.id === itemId);
        const option = item?.options?.find((entry) => entry.value === selectedValue);
        if (!option) {
            return;
        }

        setAnswers((current) => ({
            ...current,
            [sectionId]: {
                ...current[sectionId],
                [itemId]: {
                    ...current[sectionId][itemId],
                    choice: option.value,
                    score: option.score
                }
            }
        }));
    };

    const handleCommentChange = (sectionId: string, itemId: string, comment: string) => {
        setAnswers((current) => ({
            ...current,
            [sectionId]: {
                ...current[sectionId],
                [itemId]: {
                    ...current[sectionId][itemId],
                    comment
                }
            }
        }));
    };

    const handleSubmit = async () => {
        if (isSubmitting) {
            return;
        }

        const unratedScaleQuestions = surveySections.reduce((sum, section) => (
            sum + section.items.filter((item) => item.mode === "scale" && answers[section.id][item.id].score <= 0).length
        ), 0);

        if (unratedScaleQuestions > 0 || overallRating <= 0) {
            setSubmitError("Поставьте оценку звездами для всех шкальных пунктов и общей оценки.");
            return;
        }

        if (lowRatingWithoutCommentCount > 0) {
            setSubmitError(`Добавьте комментарии к ${lowRatingWithoutCommentCount} пунктам с низкой оценкой.`);
            return;
        }

        setSubmitError("");
        setIsSubmitting(true);

        const payload: DetailedSiteFeedbackRequest = {
            sentAt: new Date().toISOString(),
            answers: Object.fromEntries(
                Object.entries(answers).map(([sectionId, sectionAnswers]) => (
                    [
                        sectionId,
                        Object.fromEntries(
                            Object.entries(sectionAnswers).map(([itemId, answer]) => (
                                [
                                    itemId,
                                    {
                                        rating: answer.score,
                                        comment: answer.comment.trim().length > 0
                                            ? answer.comment
                                            : (answer.choice ? `Выбранный вариант: ${answer.choice}` : "")
                                    }
                                ]
                            ))
                        )
                    ]
                ))
            ),
            summary: {
                overallRating,
                whatLiked,
                whatImproveFirst
            }
        };

        try {
            await submitDetailedSiteFeedback(payload);
            setIsSubmitted(true);
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "Не удалось отправить подробный тест.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return BodyView(
        <main className="site-quality-survey-page">
            <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Подробный тест качества"}]}/>

            <section className="site-quality-survey-card">
                <h1>Подробный тест по качеству сайта</h1>
                <p className="site-quality-survey-intro">Ответьте на вопросы и нажмите «Отправить». Для низких оценок комментарий обязателен.</p>

                {surveySections.map((section) => (
                    <section className="site-quality-survey-section" key={section.id}>
                        <h2>{section.title}</h2>
                        <div className="site-quality-survey-grid">
                            {section.items.map((item) => {
                                const answer = answers[section.id][item.id];
                                return (
                                    <article className="site-quality-survey-item" key={item.id}>
                                        <h3>{item.label}</h3>

                                        {item.mode === "scale" ? (
                                            <StarRating
                                                label={`${item.label}: оценка`}
                                                onChange={(nextValue) => handleScaleChange(section.id, item.id, nextValue)}
                                                value={answer.score}
                                            />
                                        ) : (
                                            <label>
                                                Готовый вариант ответа
                                                <select
                                                    onChange={(event) => handleChoiceChange(section.id, item.id, event.target.value)}
                                                    value={answer.choice}
                                                >
                                                    {(item.options ?? []).map((option) => (
                                                        <option key={option.value} value={option.value}>{option.label}</option>
                                                    ))}
                                                </select>
                                            </label>
                                        )}

                                        <label>
                                            Комментарий
                                            <textarea
                                                onChange={(event) => handleCommentChange(section.id, item.id, event.target.value)}
                                                onInput={(event) => autoResizeTextarea(event.currentTarget)}
                                                placeholder={answer.score < 4 ? "Комментарий обязателен для низкой оценки" : "Дополнение (по желанию)"}
                                                rows={3}
                                                value={answer.comment}
                                            />
                                        </label>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                ))}

                <section className="site-quality-survey-section">
                    <h2>Раздел E. Итоговая оценка</h2>
                    <div className="site-quality-survey-summary">
                        <StarRating
                            label="Общая оценка сайта"
                            onChange={setOverallRating}
                            value={overallRating}
                        />

                        <label>
                            Что понравилось
                            <textarea
                                onChange={(event) => setWhatLiked(event.target.value)}
                                onInput={(event) => autoResizeTextarea(event.currentTarget)}
                                placeholder="Выберите варианты ниже или впишите свой ответ"
                                rows={4}
                                value={whatLiked}
                            />
                        </label>
                        <div className="site-quality-survey-chips">
                            {likedSuggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => setWhatLiked((current) => appendSuggestion(current, suggestion))}
                                    type="button"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>

                        <label>
                            Что нужно улучшить в первую очередь
                            <textarea
                                onChange={(event) => setWhatImproveFirst(event.target.value)}
                                onInput={(event) => autoResizeTextarea(event.currentTarget)}
                                placeholder="Выберите варианты ниже или впишите свой ответ"
                                rows={4}
                                value={whatImproveFirst}
                            />
                        </label>
                        <div className="site-quality-survey-chips">
                            {improveSuggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => setWhatImproveFirst((current) => appendSuggestion(current, suggestion))}
                                    type="button"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {submitError.length > 0 && <p className="site-quality-survey-error">{submitError}</p>}
                {isSubmitted && <p className="site-quality-survey-success">Спасибо, подробный тест отправлен.</p>}

                <div className="site-quality-survey-actions">
                    <button disabled={isSubmitting} onClick={handleSubmit} type="button">
                        {isSubmitting ? "Отправляем..." : "Отправить"}
                    </button>
                </div>
            </section>

            {isSubmitted && (
                <div className="site-quality-survey-modal-backdrop">
                    <div className="site-quality-survey-modal" role="dialog" aria-label="Спасибо за обратную связь">
                        <div className="site-quality-survey-checkmark" aria-hidden="true">
                            <svg viewBox="0 0 52 52">
                                <circle className="site-quality-survey-checkmark-circle" cx="26" cy="26" r="24"/>
                                <path className="site-quality-survey-checkmark-path" d="M14 27l8 8 16-16"/>
                            </svg>
                        </div>
                        <p className="site-quality-survey-modal-title">Спасибо за ваш отклик!</p>
                        <p className="site-quality-survey-modal-text">Вы помогаете нам делать Poprog удобнее и полезнее для всех.</p>
                    </div>
                </div>
            )}
        </main>
    );
}
