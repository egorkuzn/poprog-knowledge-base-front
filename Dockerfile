FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY scripts/fix-bufbuild-protobuf-cjs.cjs ./scripts/
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=/portal-api
ARG VITE_DEBUG_HEADERS_ENABLED=false
ARG VITE_RIDE_CONSOLE_URL=/admin/master/console/
ARG VITE_RIDE_SIGNUP_URL=/account

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_DEBUG_HEADERS_ENABLED=$VITE_DEBUG_HEADERS_ENABLED
ENV VITE_RIDE_CONSOLE_URL=$VITE_RIDE_CONSOLE_URL
ENV VITE_RIDE_SIGNUP_URL=$VITE_RIDE_SIGNUP_URL

RUN npm run build -- --base=/

FROM nginx:1.27-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/
