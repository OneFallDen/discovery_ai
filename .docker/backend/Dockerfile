FROM oven/bun:1.3.13-alpine AS builder

WORKDIR /app

# Copy workspace config and root package.json first for layer caching
COPY pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install pnpm and dependencies
RUN bun install -g pnpm && pnpm install --frozen-lockfile

# Copy backend source
COPY backend ./backend

# Build (nest build produces dist/)
RUN cd backend && bun run build

FROM oven/bun:1.3.13-alpine

WORKDIR /app

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules

EXPOSE 3000

CMD ["bun", "dist/main.js"]
