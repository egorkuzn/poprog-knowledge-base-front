# POPROG Front Docs

Документация фронтенда по состоянию на 2026-04-12.

## Основные маршруты

- `/home` — главная
- `/projects` — проекты
- `/projects/:itemSlug` — презентационные страницы направлений
- `/market` — Poprog Market (карточки, фильтры, поиск)
- `/publications` — публикации
- `/works` — дипломные работы и диссертации
- `/chat` — чат с ИИ
- `/account` — личный кабинет
- `/account/admin/donations` — служебный экран по донатам
- `/donate` — публичная страница доната
- `/support` — поддержка
- `/contact` — контакты
- `/docs` — документационный landing
- `/video` — каталог видео с поиском и фильтрами

## Тестовый вход в личный кабинет

В режиме локальной разработки вход остается внутри интерфейса фронтенда. Форма на `/account` сохраняет локальную сессию и отправляет debug headers в backend.

`.env.local` (пример):

```env
VITE_API_BASE_URL=http://localhost:18080
VITE_DEBUG_HEADERS_ENABLED=true
VITE_DEBUG_USER_SUB=test-user-1
VITE_DEBUG_USER_EMAIL=test@example.com
VITE_DEBUG_USER_NAME=Test User
VITE_DEBUG_USER_ROLES=USER
```

Для служебной локальной проверки доступен выбор роли во внутренней форме входа на `localhost`.

## Экспорт в личном кабинете

В разделе донатов доступны:

- экспорт в `CSV`
- экспорт в `PDF`
- повтор доната из строки истории операций

Для служебных ролей доступен отдельный маршрут `/account/admin/donations` с фильтрами, таблицей событий и административным экспортом.

## Smoke runbook

Проверочный сценарий по основным маршрутам и ролям лежит в [docs/smoke-runbook.md](./smoke-runbook.md).

## Контентные разделы

- `/docs` — содержит quick start, интеграции, FAQ и troubleshooting
- `/video` — содержит каталог видео по категориям
- `projects/:itemSlug` — промо-страницы поддерживаемых направлений без placeholder-текста
