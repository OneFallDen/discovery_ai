import { GenerationJob } from "./GenerationJob";
import { JobId } from "../ValueObjects/JobId";
import { GenerationParameters } from "../ValueObjects/GenerationParameters";
import { Workflow } from "../ValueObjects/Workflow";
import { JobStatus } from "../ValueObjects/JobStatus";
import { GeneratedImage } from "../Entities/GeneratedImage";
import { ImageId } from "../ValueObjects/ImageId";

const params = new GenerationParameters(
    "positive",
    "negative",
    1,
    512,
    512,
    20,
    7,
    false,
    "model",
    "sampler",
    "scheduler",
);

const workflow = new Workflow("{}");

describe("GenerationJob", () => {
    it("moves from pending to queued", () => {
        const job = GenerationJob.create(new JobId("job-id"), params, workflow);

        job.queued("prompt-id");

        expect(job.getStatus()).toBe(JobStatus.Queued);
        expect(job.getComfyPromptId()).toBe("prompt-id");
        expect(job.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it("moves to ready and stores completion metadata", () => {
        const job = GenerationJob.create(new JobId("job-id"), params, workflow);
        const image = new GeneratedImage(
            new ImageId("image-id"),
            job.getId(),
            "image.png",
            "http://example.test/image.png",
            params,
        );

        job.queued("prompt-id");
        job.complete([image]);

        expect(job.getStatus()).toBe(JobStatus.Ready);
        expect(job.getImages()).toEqual([image]);
        expect(job.getCompletedAt()).toBeInstanceOf(Date);
    });

    it("moves to error with message", () => {
        const job = GenerationJob.create(new JobId("job-id"), params, workflow);

        job.fail("ComfyUI failed");

        expect(job.getStatus()).toBe(JobStatus.Error);
        expect(job.getErrorMessage()).toBe("ComfyUI failed");
        expect(job.getUpdatedAt()).toBeInstanceOf(Date);
    });
});
