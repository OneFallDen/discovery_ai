import { GenerationJobStatusReader } from "./GenerationJobStatusReader";

describe("GenerationJobStatusReader", () => {
    it("filters status by both job and owner session", async () => {
        const repository = { findOne: jest.fn().mockResolvedValue(null) };
        const reader = new GenerationJobStatusReader(repository as any);
        expect(await reader.forSession("job-a", "session-a")).toBeNull();
        expect(repository.findOne).toHaveBeenCalledWith({
            where: { id: "job-a", sessionId: "session-a" },
            relations: { images: true },
        });
    });
});
