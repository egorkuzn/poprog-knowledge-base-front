import {useMemo} from "react";
import {useParams} from "react-router-dom";
import BodyView from "../BodyView";

const projectItemTitles: Record<string, string> = {
    "reflex": "Reflex",
    "post": "poST",
    "industrial-c": "IndustrialC",
    "languages-whats-new": "Что нового?",
    "success-stories": "Истории успеха",
    "ride-overview": "Обзор RIDE",
    "ride-cloud-launch": "Запуск в облаке",
    "ride-debug": "Инструменты отладки",
    "ride-whats-new": "Что нового?",
    "requirements": "Требования",
    "traceability": "Трассировка",
    "edtl-spec": "EDTL-спецификации",
    "edtl-whats-new": "Что нового?",
    "architecture-templates": "Шаблоны архитектур",
    "communication-modules": "Модули связи",
    "typical-solutions": "Типовые решения",
    "distributed-whats-new": "Что нового?",
    "code-checks": "Проверки кода",
    "quality-metrics": "Метрики качества",
    "analysis-reports": "Отчеты анализа",
    "analysis-whats-new": "Что нового?"
};

export function ProjectItemView() {
    const {itemSlug = ""} = useParams();

    const title = useMemo(() => {
        return projectItemTitles[itemSlug] ?? "Элемент проекта";
    }, [itemSlug]);

    return BodyView(
        <main className="projects-page">
            <section className="projects-page-content">
                <h1>{title}</h1>
            </section>
        </main>
    );
}
