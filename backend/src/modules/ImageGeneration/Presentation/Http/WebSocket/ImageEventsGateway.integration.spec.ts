import { Test } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { WsAdapter } from "@nestjs/platform-ws";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import WebSocket from "ws";
import { ImageEventsGateway } from "./ImageEventsGateway";
import { GenerationController } from "../Controllers/GenerationController";
import { StoreGenerationJobMapper } from "../Mappers/StoreGenerationJobMapper";
import { StoreGenerationJobUseCase } from "../../../Application/UseCases/StoreGenerationJobUseCase";
import { GenerationSessionService } from "../../../Infrastructure/Services/GenerationSessionService";
import { GenerationJobStatusReader } from "../../../Infrastructure/Persistence/Read/GenerationJobStatusReader";

describe("generation session HTTP and WebSocket", () => {
    let app: INestApplication;
    const sockets: WebSocket[] = [];
    const jobs = {
        forSession: jest.fn(),
        sessionForJob: jest.fn(),
    };

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            controllers: [GenerationController],
            providers: [
                ImageEventsGateway,
                GenerationSessionService,
                { provide: ConfigService, useValue: { getOrThrow: () => "test-secret" } },
                { provide: GenerationJobStatusReader, useValue: jobs },
                { provide: StoreGenerationJobMapper, useValue: {} },
                { provide: StoreGenerationJobUseCase, useValue: {} },
            ],
        }).compile();
        app = module.createNestApplication();
        app.useWebSocketAdapter(new WsAdapter(app));
        await app.listen(0, "127.0.0.1");
    });

    afterAll(async () => {
        sockets.forEach((socket) => socket.terminate());
        await app.close();
    });

    it("keeps another session out of job status and WS events", async () => {
        const first = await request(app.getHttpServer()).get("/session").expect(204);
        const second = await request(app.getHttpServer()).get("/session").expect(204);
        const ownerCookie = first.headers["set-cookie"][0].split(";")[0];
        const otherCookie = second.headers["set-cookie"][0].split(";")[0];
        const ownerId = ownerCookie.split("=")[1].split(".")[0];
        jobs.sessionForJob.mockResolvedValue(ownerId);
        jobs.forSession.mockImplementation(async (_id, session) =>
            session === ownerId ? { id: "job-1", status: "ready", url: "image", error: null } : null,
        );

        await request(app.getHttpServer()).get("/generations/job-1").set("Cookie", ownerCookie).expect(200);
        await request(app.getHttpServer()).get("/generations/job-1").set("Cookie", otherCookie).expect(404);

        const address = app.getHttpServer().address();
        const origin = `http://127.0.0.1:${address.port}`;
        const connect = async (cookie: string) => {
            const socket = new WebSocket(`${origin.replace("http", "ws")}/ws`, {
                headers: { Origin: origin, Cookie: cookie },
            });
            sockets.push(socket);
            await new Promise<void>((resolve, reject) => {
                socket.once("open", resolve);
                socket.once("error", reject);
            });
            return socket;
        };
        const owner = await connect(ownerCookie);
        const other = await connect(otherCookie);
        const otherMessages: string[] = [];
        other.on("message", (message) => otherMessages.push(message.toString()));
        const received = new Promise<string>((resolve) => owner.once("message", (message) => resolve(message.toString())));
        await app.get(ImageEventsGateway).sendImageReady("job-1", "image");
        expect(JSON.parse(await received)).toMatchObject({ id: "job-1", type: "generation.ready" });
        await new Promise((resolve) => setTimeout(resolve, 30));
        expect(otherMessages).toHaveLength(0);
    });
});
