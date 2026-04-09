import { JobId } from "../ValueObjects/JobId";
import { JobStatus } from "../ValueObjects/JobStatus";
import { GeneratedImage } from "../Entities/GeneratedImage";
import { GenerationParameters } from "../ValueObjects/GenerationParameters";

export class GenerationJob {
    private constructor(
        private readonly id: JobId,
        private status: JobStatus,
        private readonly params: GenerationParameters,
        private readonly workflow: string,
        private readonly comfyPromptId: string | null = null,
        private readonly errorMessage: string | null = null,
        private images: GeneratedImage[],
        private readonly createdAt: Date,
        private updatedAt: Date | null = null,
        private completedAt: Date | null = null,
    ) {}

    // Domain methods
    // queue(): void {
    // ...
    // }
    //
    // markAsProcessing(): void {
    // ...
    // }
    //
    // complete(images: GeneratedImage[]): void {
    // ...
    // }
    //
    // fail(error: string): void {
    // ...
    // }
    //
    // regenerate(newParams: Partial<GenerationParameters>): GenerationJob {
    // ...
    // }
}
