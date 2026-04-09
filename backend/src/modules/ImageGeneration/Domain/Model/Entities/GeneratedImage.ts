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
}
