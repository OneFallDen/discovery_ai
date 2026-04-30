# Changelog

## v0.1.0 (Initial MVP) - 2026-04-30
### Added
- Backend service built with NestJS, following DDD and CQRS patterns.
- REST endpoint `POST /generate` to submit image generation requests.
- BullMQ job queue (powered by Redis) for asynchronous processing.
- Integration with ComfyUI HTTP API to execute generation workflows on a local GPU.
- WebSocket gateway that pushes real-time job status updates and image-ready events.
- Job lifecycle tracking: `pending → queued → ready` (or `error`).
- React + Vite frontend with infinite scroll gallery of generated images.
- Aspect ratio selection control panel in the UI.
- Configurable safe mode injecting a negative prompt to filter explicit content.
- Workflow templates defined via JSON files (default `base_workflow` provided).
- PostgreSQL database with TypeORM for persisting generation jobs.
- Docker Compose environment including backend, frontend, PostgreSQL, Redis, ComfyUI, and Nginx.
- Nginx reverse proxy exposing the application on port 8081.
- Environment variable configuration (`.env` files) for backend and frontend.
- JWT authentication module scaffolding (not yet active, reserved for future use).
- Infrastructure setup: Dockerfiles in `.docker/`, ComfyUI workspace mount, model placement instructions.