# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Backend API

Локально фронтенд ожидает backend на `http://localhost:8080` и в dev-режиме проксирует `/api` через Vite `server.proxy`, поэтому для обычного запуска переменная окружения не нужна.

Пример:

```bash
npm run dev
```

Если нужен другой backend-адрес, можно переопределить его через `VITE_API_BASE_URL`.

## Deployment

Production-сборка frontend выполняется через GitHub Actions и публикуется в GitHub Container Registry как Docker-образ:

```text
ghcr.io/egorkuzn/poprog-knowledge-base-front:<commit-sha>
ghcr.io/egorkuzn/poprog-knowledge-base-front:latest
```

При сборке используется `npm ci`, `npm run test` и `npm run build -- --base=/`. В production frontend работает от корня сайта, без префикса `/portal`.

Runtime-маршрутизация выполняется nginx на `poprog-edge`:

- `/` и пользовательские страницы проксируются на frontend-контейнер `127.0.0.1:18083`;
- `/portal-api/`, `/api/`, `/files/`, `/actuator/`, `/swagger-ui/`, `/v3/` проксируются на backend;
- `/admin`, `/realms`, `/resources` проксируются на Keycloak;
- `/portal` и `/portal/...` перенаправляются на корневые маршруты для совместимости со старыми ссылками.

Подробное описание deployment-контура, требований и текст для дипломного отчета находится в backend-репозитории:

- [deployment-production-report.md](https://github.com/egorkuzn/poprog-knowledge-base-back/blob/main/docs/deployment-production-report.md)

## Проекты
скопировать с https://aws.amazon.com/ru/products/?nc2=h_prod_fs_prod&aws-products-all.sort-by=item.additionalFields.productNameLowercase&aws-products-all.sort-order=asc&awsf.re%3AInvent=*all&awsf.Free%20Tier%20Type=*all&awsf.tech-category=*all
