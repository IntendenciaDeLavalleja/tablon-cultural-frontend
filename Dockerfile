FROM node:22-alpine AS build
WORKDIR /app
ARG SITE_URL
ENV SITE_URL=$SITE_URL ASTRO_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY astro.config.mjs tsconfig.json ./
COPY src ./src
COPY public ./public
RUN npm run check && npm run build

FROM nginx:1.30.5-alpine
RUN apk upgrade --no-cache
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
