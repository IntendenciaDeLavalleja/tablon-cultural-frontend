# =======================================================
# Stage 1: Build
# Astro/Vite bakes PUBLIC_* env vars at compile time.
# Pass PUBLIC_API_URL as a build arg in Coolify/Docker.
# =======================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (cache layer)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# PUBLIC_API_URL is required at build time.
# Coolify: add it as a Build Variable before deploying.
# Docker manual: --build-arg PUBLIC_API_URL=https://api.example.com/api
ARG PUBLIC_API_URL
ENV PUBLIC_API_URL=$PUBLIC_API_URL

RUN npm run build

# =======================================================
# Stage 2: Serve (nginx:alpine — no Node in runtime)
# =======================================================
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our nginx config (gzip + cache-control)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Coolify / Docker Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
