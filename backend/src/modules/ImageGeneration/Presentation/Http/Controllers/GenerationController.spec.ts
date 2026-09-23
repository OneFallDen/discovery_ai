import { GenerationController } from "./GenerationController";

describe("GenerationController", () => {
    it("does not reveal another session's job", async () => {
        const sessions = { require: jest.fn().mockReturnValue("session-a") };
        const jobs = { forSession: jest.fn().mockResolvedValue(null) };
        const controller = new GenerationController({} as any, {} as any, sessions as any, jobs as any);
        await expect(controller.status({ headers: {} } as any, "job-b")).rejects.toThrow();
        expect(jobs.forSession).toHaveBeenCalledWith("job-b", "session-a");
    });
});
