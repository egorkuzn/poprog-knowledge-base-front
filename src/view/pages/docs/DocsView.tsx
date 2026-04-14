import BodyView from "../BodyView";
import {Breadcrumbs} from "../../common/navigation/Breadcrumbs";
import "../../../styles/common/PageShell.scss";

export function DocsView() {
    return (BodyView(page()))
}

function page() {
    return (
        <main className="site-page">
            <Breadcrumbs items={[{label: "Главная", to: "/home"}, {label: "Документация"}]}/>
            <section className="site-page-content">
                <h1>Документация</h1>
                <p className="site-page-muted">
                    Быстрые инструкции по запуску платформы, работе с API и практикам безопасной настройки окружения.
                </p>

                <h2>Быстрый старт</h2>
                <ol>
                    <li>Поднимите backend и frontend из рабочих директорий проекта.</li>
                    <li>Проверьте доступность API `/api/publications/grouped` и `/api/student-works/grouped`.</li>
                    <li>Откройте `/chat` и `/account` для проверки основных пользовательских сценариев.</li>
                </ol>

                <h2>Документация по разделам</h2>
                <ul>
                    <li><strong>API и контракты:</strong> структура ответов, форматы ошибок, особенности поиска и фильтрации.</li>
                    <li><strong>Контент:</strong> как публиковать материалы в разделах «Публикации», «Работы», «Проекты».</li>
                    <li><strong>Личный кабинет:</strong> сценарии входа, профиль, история донатов и экспорт данных.</li>
                    <li><strong>Интеграции:</strong> подключение внешних ссылок и безопасная обработка переходов.</li>
                </ul>

                <h2>Интеграции и API</h2>
                <ul>
                    <li><strong>OpenAPI backend:</strong> используйте `/swagger-ui/index.html` для просмотра актуальных контрактов.</li>
                    <li><strong>Поиск:</strong> проверьте ручки `/api/search`, `/api/publications/grouped`, `/api/student-works/grouped`.</li>
                    <li><strong>Личный кабинет:</strong> блок `/api/account/*` покрывает профиль, чаты, избранное и историю донатов.</li>
                    <li><strong>Пожертвования:</strong> публичный flow работает через `/api/donations`, а служебная аналитика через `/api/admin/donations/*`.</li>
                </ul>

                <h2>Требования к среде</h2>
                <ul>
                    <li><strong>Node.js:</strong> рекомендуется 20.19+ или 22.12+.</li>
                    <li><strong>Java:</strong> 21 для backend-сервиса.</li>
                    <li><strong>Инфраструктура:</strong> PostgreSQL и Elasticsearch для полной функциональности.</li>
                </ul>

                <h2>Безопасность и эксплуатация</h2>
                <ul>
                    <li>Debug-header auth режим допускается только в local/dev окружениях.</li>
                    <li>Перед релизом проверьте отсутствие dev-флагов в production-конфигурации.</li>
                    <li>Для публичных релизов включайте аудит логов по входам и операциям в аккаунте.</li>
                </ul>

                <h2>Частые вопросы</h2>
                <ul>
                    <li><strong>Почему кабинет не открывается?</strong> Убедитесь, что backend запущен и фронтенд отправляет debug headers или локальную сессию.</li>
                    <li><strong>Почему файл не открывается по ссылке?</strong> Проверьте, что PDF находится в актуальном хранилище и backend отдает `inline` для просмотра.</li>
                    <li><strong>Где искать админские функции?</strong> После входа под служебной ролью откройте «Мой аккаунт» и перейдите в админ-раздел донатов.</li>
                </ul>

                <h2>Устранение неполадок</h2>
                <ul>
                    <li><strong>`Failed to fetch`:</strong> обычно означает, что фронтенд смотрит не в тот `VITE_API_BASE_URL` или backend не запущен.</li>
                    <li><strong>Пустые данные в кабинете:</strong> проверьте, что локальный вход выполнен и dev-headers разрешены в local-профиле backend.</li>
                    <li><strong>Экспорт не скачивается:</strong> убедитесь, что браузер не блокирует загрузки и ответ backend не завершился ошибкой `401/403`.</li>
                </ul>
            </section>
        </main>
    )
}
