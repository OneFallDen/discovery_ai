import { ComfyUIEventsListener } from "./ComfyUIEventsListener";

describe("ComfyUIEventsListener", () => {
    it("routes execution_success to completion use case", async () => {
        const completeUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
        const failUseCase = { execute: jest.fn() };
        const listener = new ComfyUIEventsListener(
            {} as any,
            completeUseCase as any,
            failUseCase as any,
        );

        await (listener as any).handleMessage(
            Buffer.from(
                JSON.stringify({
                    type: "execution_success",
                    data: { prompt_id: "prompt-id" },
                }),
            ),
        );

        expect(completeUseCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({ promptId: "prompt-id" }),
        );
        expect(failUseCase.execute).not.toHaveBeenCalled();
    });

    it("routes execution_error to failure use case", async () => {
        const completeUseCase = { execute: jest.fn() };
        const failUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
        const listener = new ComfyUIEventsListener(
            {} as any,
            completeUseCase as any,
            failUseCase as any,
        );

        await (listener as any).handleMessage(
            Buffer.from(
                JSON.stringify({
                    type: "execution_error",
                    data: {
                        prompt_id: "prompt-id",
                        exception_message: "boom",
                    },
                }),
            ),
        );

        expect(failUseCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                promptId: "prompt-id",
                error: "boom",
            }),
        );
        expect(completeUseCase.execute).not.toHaveBeenCalled();
    });
});
