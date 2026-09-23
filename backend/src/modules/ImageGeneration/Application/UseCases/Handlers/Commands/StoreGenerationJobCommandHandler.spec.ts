import { StoreGenerationJobCommandHandler } from "./StoreGenerationJobCommandHandler";
import { StoreGenerationJobCommand } from "../../../Input/Commands/StoreGenerationJobCommand";

describe("StoreGenerationJobCommandHandler", () => {
    it("returns each newly created job ID even for concurrent requests", async () => {
        const ids = ["job-a", "job-b"];
        const uuid = { generate: jest.fn(() => ids.shift()) };
        const workflow = { build: jest.fn().mockReturnValue("{}") };
        const repository = { store: jest.fn().mockResolvedValue(undefined) };
        const queue = { add: jest.fn().mockResolvedValue(undefined) };
        const handler = new StoreGenerationJobCommandHandler(
            uuid as any, workflow as any, { get: () => undefined } as any,
            repository as any, queue as any,
        );
        const dto = {
            positivePrompt: "test", negativePrompt: "", seed: 1,
            width: 512, height: 512, steps: 20, cfg: 5,
            nsfwEnabled: false, model: "model", sampler: "euler", scheduler: "normal",
        };
        const [first, second] = await Promise.all([
            handler.execute(new StoreGenerationJobCommand(dto as any, "session-a")),
            handler.execute(new StoreGenerationJobCommand(dto as any, "session-b")),
        ]);
        expect(first.id).toBe("job-a");
        expect(second.id).toBe("job-b");
        expect(repository.store.mock.calls.map(([job, session]) => [job.getId().value(), session])).toEqual([
            ["job-a", "session-a"], ["job-b", "session-b"],
        ]);
    });
});
