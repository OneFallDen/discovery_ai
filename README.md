# Discovery AI

A self-hosted AI image generation platform with infinite scroll built on top of [ComfyUI](https://github.com/comfyanonymous/ComfyUI). Submit a prompt — get back generated images in real time via WebSocket.

## Architecture Overview

```
Client (React + Vite)
    │
    ├── REST POST /generate      → NestJS Backend
    │                                  │
    │                            BullMQ Queue (Redis)
    │                                  │
    │                            ImageQueueProcessor
    │                                  │
    │                            ComfyUI (local GPU)
    │
    └── WebSocket /ws            ← Backend pushes image-ready events
```

The backend follows **Domain-Driven Design** with a clean layered structure:

- **Presentation** — HTTP controllers, WebSocket gateway, request/response DTOs
- **Application** — Use cases, CQRS command/query handlers, mappers
- **Domain** — `GenerationJob` aggregate, value objects, domain events, repository contracts
- **Infrastructure** — TypeORM persistence, BullMQ processors, ComfyUI HTTP client

## Tech Stack

|Layer|Technology|
|---|---|
|Backend|NestJS 11, TypeScript|
|Architecture|DDD, CQRS (custom Command/Query bus)|
|Queue|BullMQ + Redis|
|Database|PostgreSQL + TypeORM|
|Real-time|WebSocket (`@nestjs/websockets`, `ws`)|
|AI Engine|ComfyUI (local, GPU)|
|Frontend|React + Vite + TypeScript|
|Infrastructure|Docker Compose, Nginx|

## Features

- **Async image generation** — job is queued immediately, result arrives via WebSocket
- **Infinite scroll** — generated images load continuously as you scroll
- **Job lifecycle tracking** — `pending → queued → ready / error`
- **ComfyUI workflow support** — configurable via JSON workflow templates
- **Safe mode** — configurable prompt injection to filter explicit content
- **Aspect ratio selection** — via frontend controls panel
- **Dockerised** — single `docker-compose up` to run everything including ComfyUI

## Prerequisites

- Docker & Docker Compose
- NVIDIA GPU with CUDA drivers (for ComfyUI)
- `nvidia-container-toolkit` installed on the host

## Getting Started

```bash
git clone <repo-url>
cd discovery_ai
cp .env.example .env # fill in your values
cd backend
cp .env.example .env # fill in your values
cd ../frontend
cp .env.example .env # fill in your values
cd ..
docker compose up --build
```

Once the containers are running, the application will be available:

On the same machine: http://localhost:8081

On your local network: http://<host-ip>:8081

Important: After the build completes, place your model checkpoint files (.safetensors) into the following directory:
/comfyui/workspace/ComfyUI/models/checkpoints
This directory is mounted into the ComfyUI container and is where the platform expects to find the models.

### Environment Variables

|Variable|Description|Example|
|---|---|---|
|`POSTGRES_HOST`|PostgreSQL host|`discovery-ai-postgres`|
|`POSTGRES_PORT`|PostgreSQL port|`5432`|
|`POSTGRES_USER`|DB username|`postgres`|
|`POSTGRES_PASSWORD`|DB password|`secret`|
|`POSTGRES_DB`|Database name|`discovery_ai`|
|`REDIS_HOST`|Redis host|`discovery-ai-redis`|
|`REDIS_PORT`|Redis port|`6379`|
|`DEFAULT_COMFYUI_URL`|ComfyUI HTTP endpoint|`http://discovery-ai-comfyui:8188`|
|`DEFAULT_COMFYUI_WS`|ComfyUI WebSocket endpoint|`ws://discovery-ai-comfyui:8188/ws`|
|`DEFAULT_COMFYUI_CLIENT_ID`|Client ID for ComfyUI|`my-client-id`|
|`DEFAULT_GENERATION_MODEL`|Checkpoint model name|`v1-5-pruned`|
|`DEFAULT_GENERATION_WORKFLOW`|Workflow template to use|`base_workflow`|
|`DEFAULT_GENERATION_STEPS`|Sampling steps|`20`|
|`DEFAULT_GENERATION_CFG`|CFG scale|`7`|
|`DEFAULT_GENERATION_SAMPLER`|Sampler name|`euler`|
|`DEFAULT_GENERATION_SCHEDULER`|Scheduler|`normal`|
|`DEFAULT_SAFE_MODE_PROMPT`|Injected negative prompt for safe mode|`nsfw, explicit, ...`|
|`JWT_ACCESS_SECRET`|JWT access token secret|_(random string)_|
|`JWT_REFRESH_SECRET`|JWT refresh token secret|_(random string)_|
|`JWT_ACCESS_EXPIRES_IN`|Access token TTL|`15m`|
|`JWT_REFRESH_EXPIRES_IN`|Refresh token TTL|`7d`|
|`PROXY_PORT`|Nginx proxy port|`8081`|
|`BACKEND_PORT`|Backend port|`3000`|
|`FRONTEND_PORT`|Frontend dev server port|`5173`|
|`COMFYUI_PORT`|ComfyUI port|`8188`|

## Project Structure

```
discovery_ai/
├── backend/
│   └── src/
│       └── modules/
│           ├── Common/               # Shared CQRS buses, base interfaces
│           └── ImageGeneration/
│               ├── Domain/           # Aggregate, value objects, events, contracts
│               ├── Application/      # Use cases, handlers, DTOs, mappers
│               ├── Infrastructure/   # TypeORM, BullMQ, ComfyUI service
│               └── Presentation/     # HTTP controller, WebSocket gateway
├── frontend/                         # React + Vite UI
├── .docker/                          # Dockerfiles for each service
├── comfyui/workspace/                # ComfyUI model/workflow storage (gitignored)
└── docker-compose.yml
```

## How it Works

1. Client sends `POST /generate` with a prompt and generation parameters.
2. Backend creates a `GenerationJob` aggregate in `pending` state and persists it.
3. A BullMQ job is enqueued; the API returns the job ID immediately.
4. `ImageQueueProcessor` picks up the job, calls ComfyUI via HTTP, and transitions the aggregate to `queued`.
5. When ComfyUI finishes, the job transitions to `ready`; the backend pushes an event over WebSocket with the image URL.
6. If anything fails, the job transitions to `error` and a failure event is sent to the client.

### Hardware
Tested on:
- Ryzen 5 5600 + RTX 5070 Ti 16GB + 32GB RAM

Expected generation time (SDXL, 20 steps):
- ~2-3 seconds for image

## Roadmap

- [ ] Authentication (JWT scaffolding already in place)
- [ ] Multiple workflow templates selectable from the UI
- [ ] Image download
- [ ] Unit and integration tests