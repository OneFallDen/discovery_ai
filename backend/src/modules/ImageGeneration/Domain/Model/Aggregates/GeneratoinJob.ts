import { JobId } from "../ValueObjects/JobId";
import { JobStatus } from "../ValueObjects/JobStatus";
import { GeneratedImage } from "../Entities/GeneratedImage";
import { GenerationParameters } from "../ValueObjects/GenerationParameters";
import { Workflow } from "../ValueObjects/Workflow";

export class GenerationJob {
    private constructor(
        private readonly id: JobId,
        private status: JobStatus,
        private readonly params: GenerationParameters,
        private readonly workflow: Workflow,
        private readonly createdAt: Date,
        private readonly comfyPromptId: string | null = null,
        private readonly errorMessage: string | null = null,
        private images: GeneratedImage[] = [],
        private updatedAt: Date | null = null,
        private completedAt: Date | null = null,
    ) {}

    public getId(): JobId {
        return this.id;
    }

    public getStatus(): JobStatus {
        return this.status;
    }

    public getParams(): GenerationParameters {
        return this.params;
    }

    public getWorkflow(): Workflow {
        return this.workflow;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public getComfyPromptId(): string | null {
        return this.comfyPromptId;
    }

    public getErrorMessage(): string | null {
        return this.errorMessage;
    }

    public getImages(): GeneratedImage[] {
        return [...this.images];
    }

    public getUpdatedAt(): Date | null {
        return this.updatedAt;
    }

    public getCompletedAt(): Date | null {
        return this.completedAt;
    }

    public static create(
        id: JobId,
        params: GenerationParameters,
        workflow: Workflow,
    ): GenerationJob {
        return new GenerationJob(
            id,
            JobStatus.Pending,
            params,
            workflow,
            new Date(),
        );
    }

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
