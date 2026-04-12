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
- `/donate` — публичная страница доната
- `/support` — поддержка
- `/contact` — контакты
- `/docs`, `/video` — разделы в наполнении

## Тестовый вход в личный кабинет

В режиме локальной разработки используется dev header auth.

`.env.local` (пример):

```env
VITE_API_BASE_URL=http://localhost:18080
VITE_DEBUG_HEADERS_ENABLED=true
VITE_DEBUG_USER_SUB=test-user-1
VITE_DEBUG_USER_EMAIL=test@example.com
VITE_DEBUG_USER_NAME=Test User
VITE_DEBUG_USER_ROLES=USER
```

## Экспорт в личном кабинете

В разделе донатов доступны:

- экспорт в `CSV`
- экспорт в `PDF` (через печать окна)

## Страницы в работе

- `/docs`
- `/video`
- часть `projects/:itemSlug` (кроме Reflex/poST/IndustrialC)

По этим разделам созданы отдельные GitHub issues.
