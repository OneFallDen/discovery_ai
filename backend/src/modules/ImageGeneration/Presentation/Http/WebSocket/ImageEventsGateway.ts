import {
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from "@nestjs/websockets";
import { WebSocket } from "ws";
import { Logger } from "@nestjs/common";
import type { IncomingMessage } from "node:http";
import { GenerationSessionService } from "../../../Infrastructure/Services/GenerationSessionService";
import { GenerationJobStatusReader } from "../../../Infrastructure/Persistence/Read/GenerationJobStatusReader";

@WebSocketGateway({ path: "/ws" })
export class ImageEventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(ImageEventsGateway.name);
    private readonly clients = new Map<string, Set<WebSocket>>();
    private readonly sessionsByClient = new Map<WebSocket, string>();

    constructor(
        private readonly sessions: GenerationSessionService,
        private readonly jobs: GenerationJobStatusReader,
    ) {}

    public handleConnection(client: WebSocket, request: IncomingMessage): void {
        try {
            const origin = request.headers.origin;
            if (!origin || new URL(origin).host !== request.headers.host) {
                client.close(1008, "Invalid origin");
                return;
            }
            const sessionId = this.sessions.require(request);
            const clients = this.clients.get(sessionId) ?? new Set<WebSocket>();
            clients.add(client);
            this.clients.set(sessionId, clients);
            this.sessionsByClient.set(client, sessionId);
        } catch {
            client.close(1008, "Invalid session");
        }
    }

    public handleDisconnect(client: WebSocket): void {
        const sessionId = this.sessionsByClient.get(client);
        if (!sessionId) return;
        this.sessionsByClient.delete(client);
        const clients = this.clients.get(sessionId);
        clients?.delete(client);
        if (clients?.size === 0) this.clients.delete(sessionId);
    }

    public async sendImageReady(id: string, url: string): Promise<void> {
        await this.sendToOwner(id, { type: "generation.ready", id, url, status: "ready" });
    }

    public async sendImageFailed(id: string, error: string): Promise<void> {
        await this.sendToOwner(id, { type: "generation.failed", id, error, status: "error" });
    }

    private async sendToOwner(id: string, event: object): Promise<void> {
        const sessionId = await this.jobs.sessionForJob(id);
        if (!sessionId) return;
        const message = JSON.stringify(event);
        for (const client of this.clients.get(sessionId) ?? []) {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(message);
                } catch (error) {
                    this.logger.warn(`Failed to send event for job ${id}: ${String(error)}`);
                }
            }
        }
    }
}
