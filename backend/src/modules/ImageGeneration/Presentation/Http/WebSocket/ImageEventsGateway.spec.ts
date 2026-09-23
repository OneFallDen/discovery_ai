import { ImageEventsGateway } from "./ImageEventsGateway";
import { WebSocket } from "ws";

describe("ImageEventsGateway", () => {
    const socket = () => ({ readyState: WebSocket.OPEN, send: jest.fn(), close: jest.fn() });
    const request = (session: string, origin = "http://localhost:5173") => ({
        headers: { host: "localhost:5173", origin, cookie: session },
    });

    it("delivers only to the owner session, including its other tabs", async () => {
        const sessions = { require: jest.fn((req) => req.headers.cookie) };
        const jobs = { sessionForJob: jest.fn().mockResolvedValue("owner") };
        const gateway = new ImageEventsGateway(sessions as any, jobs as any);
        const first = socket();
        const second = socket();
        const other = socket();
        gateway.handleConnection(first as any, request("owner") as any);
        gateway.handleConnection(second as any, request("owner") as any);
        gateway.handleConnection(other as any, request("other") as any);

        await gateway.sendImageReady("job-1", "https://example.test/image");
        expect(first.send).toHaveBeenCalledTimes(1);
        expect(second.send).toHaveBeenCalledTimes(1);
        expect(other.send).not.toHaveBeenCalled();
        expect(JSON.parse(first.send.mock.calls[0][0])).toMatchObject({ id: "job-1", type: "generation.ready" });

        gateway.handleDisconnect(first as any);
        await gateway.sendImageFailed("job-1", "failed");
        expect(first.send).toHaveBeenCalledTimes(1);
        expect(second.send).toHaveBeenCalledTimes(2);
        expect(other.send).not.toHaveBeenCalled();
    });

    it("rejects another origin or an invalid session", () => {
        const sessions = { require: jest.fn().mockImplementation(() => { throw new Error("invalid"); }) };
        const gateway = new ImageEventsGateway(sessions as any, {} as any);
        const crossOrigin = socket();
        gateway.handleConnection(crossOrigin as any, request("owner", "https://other.test") as any);
        expect(crossOrigin.close).toHaveBeenCalledWith(1008, "Invalid origin");
        const invalid = socket();
        gateway.handleConnection(invalid as any, request("owner") as any);
        expect(invalid.close).toHaveBeenCalledWith(1008, "Invalid session");
    });
});
