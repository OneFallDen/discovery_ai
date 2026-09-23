import { QueueImageEvent } from "./QueueImageEvent";

describe("QueueImageEvent", () => {
    it("rethrows non-final attempt errors without failing the job", async () => {
        const error = new Error("ComfyUI unavailable");
        const useCase = { execute: jest.fn().mockRejectedValue(error) };
        const failUseCase = { execute: jest.fn() };
        const event = new QueueImageEvent(useCase as any, failUseCase as any);
        const job = {
            data: { uuid: "job-id" },
            opts: { attempts: 3 },
            attemptsMade: 0,
        };

        await expect(event.handle(job as any)).rejects.toThrow(error);

        expect(failUseCase.execute).not.toHaveBeenCalled();
    });

    it("fails the generation job on the final attempt and rethrows", async () => {
        const error = new Error("ComfyUI unavailable");
        const useCase = { execute: jest.fn().mockRejectedValue(error) };
        const failUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
        const event = new QueueImageEvent(useCase as any, failUseCase as any);
        const job = {
            data: { uuid: "job-id" },
            opts: { attempts: 3 },
            attemptsMade: 2,
        };

        await expect(event.handle(job as any)).rejects.toThrow(error);

        expect(failUseCase.execute).toHaveBeenCalledWith(
            "job-id",
            "ComfyUI unavailable",
        );
    });

    it("fails the generation job when retries are not configured", async () => {
        const error = new Error("ComfyUI unavailable");
        const useCase = { execute: jest.fn().mockRejectedValue(error) };
        const failUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
        const event = new QueueImageEvent(useCase as any, failUseCase as any);
        const job = {
            data: { uuid: "job-id" },
            opts: {},
            attemptsMade: 0,
        };

        await expect(event.handle(job as any)).rejects.toThrow(error);

        expect(failUseCase.execute).toHaveBeenCalledWith(
            "job-id",
            "ComfyUI unavailable",
        );
    });
});
