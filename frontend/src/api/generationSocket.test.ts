import assert from "node:assert/strict";
import { test } from "node:test";
import { connectGenerationSocket } from "./generationSocket.ts";

test("reconnects with backoff, resets on open and stops after cleanup", () => {
    const sockets: Array<{ close: () => void; onopen?: () => void; onclose?: () => void; onerror?: () => void; onmessage?: (event: { data: string }) => void }> = [];
    const scheduled: Array<{ callback: () => void; delay: number; cancelled?: boolean }> = [];
    const messages: string[] = [];
    let opened = 0;
    const stop = connectGenerationSocket({
        create: () => {
            const socket: (typeof sockets)[number] = { close: () => { socket.onclose?.(); } };
            sockets.push(socket);
            return socket as any;
        },
        onOpen: () => { opened++; },
        onMessage: (message) => messages.push(message),
        schedule: (callback, delay) => {
            const timer = { callback, delay };
            scheduled.push(timer);
            return timer as any;
        },
        cancel: (timer) => { (timer as any).cancelled = true; },
    });

    assert.equal(sockets.length, 1);
    sockets[0].onclose?.();
    assert.equal(scheduled[0].delay, 1000);
    scheduled[0].callback();
    sockets[1].onclose?.();
    assert.equal(scheduled[1].delay, 2000);
    scheduled[1].callback();
    sockets[2].onopen?.();
    sockets[2].onmessage?.({ data: "ready" });
    assert.equal(opened, 1);
    assert.deepEqual(messages, ["ready"]);
    sockets[2].onclose?.();
    assert.equal(scheduled[2].delay, 1000);
    stop();
    assert.equal(scheduled[2].cancelled, true);
    assert.equal(sockets.length, 3);
});
