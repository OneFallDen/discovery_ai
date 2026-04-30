import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, WebSocket } from "ws";
import { Logger } from "@nestjs/common";

@WebSocketGateway({
    path: "/ws",
    cors: { origin: "*" },
})
export class ImageEventsGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    private readonly logger = new Logger(ImageEventsGateway.name);
    @WebSocketServer() server: Server;

    public handleConnection(client: WebSocket) {
        this.logger.log(`Frontend client connected: ${client}`);
    }

    public handleDisconnect(client: WebSocket) {
        this.logger.log(`Frontend client disconnected: ${client}`);
    }

    public sendImageReady(id: string, url: string) {
        const message = JSON.stringify({ id, url });
        this.server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
        this.logger.log(`Sent image ready: ${id} -> ${url}`);
    }

    public sendImageFailed(id: string, error: string) {
        const message = JSON.stringify({ id, error, status: "failed" });
        this.server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
        this.logger.warn(`Sent image failed: ${id} - ${error}`);
    }
}
