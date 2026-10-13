FROM node:22-alpine AS build
WORKDIR /app
ARG SITE_URL
ARG PUBLIC_BACKEND_URL=""
ENV SITE_URL=$SITE_URL PUBLIC_BACKEND_URL=$PUBLIC_BACKEND_URL ASTRO_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY astro.config.mjs tsconfig.json ./
COPY src ./src
COPY public ./public
RUN npm run check && npm run build

FROM nginx:1.30.5-alpine
RUN apk upgrade --no-cache
ENV BACKEND_URL=http://backend:8000 NGINX_ENVSUBST_FILTER="^BACKEND_URL$"
COPY deploy/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -q --spider http://127.0.0.1/healthz || exit 1
