FROM oven/bun:1.3.13-alpine AS builder

WORKDIR /app

# Copy workspace config for pnpm
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN bun install -g pnpm && pnpm install --frozen-lockfile

COPY frontend ./frontend

# VITE_ vars must be available at build time
ARG VITE_COMFYUI_IMAGE_URL
ENV VITE_COMFYUI_IMAGE_URL=$VITE_COMFYUI_IMAGE_URL

RUN cd frontend && bun run build

FROM nginx:alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY .docker/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8081
