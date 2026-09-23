import { ComfyUIEventsListener } from "./ComfyUIEventsListener";
import WebSocket from "ws";

jest.mock("ws", () => {
    const { EventEmitter } = require("node:events");
    class FakeWebSocket extends EventEmitter {
        static OPEN = 1;
        static instances: FakeWebSocket[] = [];
        readyState = 0;
        constructor(public readonly url: URL) {
            super();
            FakeWebSocket.instances.push(this);
        }
        terminate() {
            this.readyState = 3;
            this.emit("close");
        }
    }
    return { __esModule: true, default: FakeWebSocket };
});

describe("ComfyUIEventsListener", () => {
    const sockets = () => (WebSocket as any).instances as any[];
    const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

    beforeEach(() => {
        jest.useFakeTimers();
        sockets().length = 0;
    });
    afterEach(() => jest.useRealTimers());

    const create = () => {
        const jobs = {
            queuedPromptIds: jest.fn().mockResolvedValue([]),
            queuedJobIdForPrompt: jest.fn().mockResolvedValue("job-1"),
        };
        const comfyUI = { getPromptOutcome: jest.fn().mockResolvedValue("pending") };
        const complete = { execute: jest.fn().mockResolvedValue(undefined) };
        const fail = { execute: jest.fn().mockResolvedValue(undefined) };
        const listener = new ComfyUIEventsListener(
            { get: () => "ws://localhost:8188/ws" } as any,
            { value: "shared-client" } as any,
            jobs as any,
            comfyUI as any,
            complete as any,
            fail as any,
        );
        return { listener, jobs, comfyUI, complete, fail };
    };

    it("reconnects with the same client ID, reconciles jobs, and stops on shutdown", async () => {
        const { listener, jobs, comfyUI, complete } = create();
        jobs.queuedPromptIds.mockResolvedValue(["prompt-1"]);
        comfyUI.getPromptOutcome.mockResolvedValue("success");
        listener.onApplicationBootstrap();
        const first = sockets()[0];
        expect(first.url.searchParams.get("clientId")).toBe("shared-client");
        first.emit("close");
        expect(sockets()).toHaveLength(1);
        jest.advanceTimersByTime(1000);
        const second = sockets()[1];
        expect(second.url.searchParams.get("clientId")).toBe("shared-client");
        second.readyState = WebSocket.OPEN;
        second.emit("open");
        await flush();
        expect(complete.execute).toHaveBeenCalledTimes(1);
        listener.onModuleDestroy();
        jest.advanceTimersByTime(60000);
        expect(sockets()).toHaveLength(2);
    });

    it("routes success and failure events and ignores malformed messages", async () => {
        const { listener, complete, fail } = create();
        listener.onApplicationBootstrap();
        const socket = sockets()[0];
        socket.emit("message", Buffer.from("not json"));
        socket.emit("message", Buffer.from(JSON.stringify({ type: "execution_success", data: { prompt_id: "prompt-1" } })));
        await flush();
        expect(complete.execute).toHaveBeenCalledWith(expect.objectContaining({ promptId: "prompt-1" }));
        socket.emit("message", Buffer.from(JSON.stringify({ type: "execution_error", data: { prompt_id: "prompt-2", exception_message: "failed" } })));
        await flush();
        expect(fail.execute).toHaveBeenCalledWith(expect.objectContaining({ promptId: "prompt-2", error: "failed" }));
        listener.onModuleDestroy();
    });
});
