import { QueueImageEvent } from "./QueueImageEvent";

describe("QueueImageEvent", () => {
    const create = () => {
        const error = new Error("ComfyUI unavailable");
        const useCase = { execute: jest.fn().mockRejectedValue(error) };
        const aggregate = { fail: jest.fn(), commit: jest.fn() };
        const repository = { find: jest.fn().mockResolvedValue(aggregate), fail: jest.fn() };
        const publisher = { mergeObjectContext: jest.fn((value) => value) };
        const gateway = { sendImageFailed: jest.fn() };
        return { error, aggregate, repository, gateway, event: new QueueImageEvent(useCase as any, repository as any, publisher as any, gateway as any) };
    };

    it("rethrows an intermediate failure for Bull to retry", async () => {
        const { event, error, repository, gateway } = create();
        await expect(event.handle({ data: { uuid: "job" }, opts: { attempts: 3 }, attemptsMade: 0 } as any)).rejects.toThrow(error);
        expect(repository.fail).not.toHaveBeenCalled();
        expect(gateway.sendImageFailed).not.toHaveBeenCalled();
    });

    it("persists and sends the final failure", async () => {
        const { event, error, aggregate, repository, gateway } = create();
        await expect(event.handle({ data: { uuid: "job" }, opts: { attempts: 3 }, attemptsMade: 2 } as any)).rejects.toThrow(error);
        expect(aggregate.fail).toHaveBeenCalledWith("ComfyUI unavailable");
        expect(repository.fail).toHaveBeenCalledWith(aggregate);
        expect(gateway.sendImageFailed).toHaveBeenCalledWith("job", "ComfyUI unavailable");
    });
});
