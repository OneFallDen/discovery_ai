import { JobId } from "../ValueObjects/JobId";
import { ImageId } from "../ValueObjects/ImageId";
import { GenerationParameters } from "../ValueObjects/GenerationParameters";

export class GeneratedImage {
    constructor(
        private readonly id: ImageId,
        private readonly jobId: JobId,
        private readonly filename: string,
        private readonly url: string,
        private readonly metadata: GenerationParameters,
    ) {}

    public getId(): ImageId {
        return this.id;
    }

    public getJobId(): JobId {
        return this.jobId;
    }

    public getFilename(): string {
        return this.filename;
    }

    public getUrl(): string {
        return this.url;
    }

    public getMetadata(): GenerationParameters {
        return this.metadata;
    }
}
