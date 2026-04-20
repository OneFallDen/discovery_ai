import { JobId } from "../ValueObjects/JobId";
import { JobStatus } from "../ValueObjects/JobStatus";
import { GeneratedImage } from "../Entities/GeneratedImage";
import { GenerationParameters } from "../ValueObjects/GenerationParameters";
import { Workflow } from "../ValueObjects/Workflow";
import { GenerationJobAlreadyHandlingException } from "../../Exceptions/GenerationJobAlreadyHandlingException";
import { AggregateRoot } from "@nestjs/cqrs";
import { GenerationJobQueuedEvent } from "../../Events/GenerationJobQueuedEvent";
import { GenerationJobFailedEvent } from "../../Events/GenerationJobFailedEvent";
import { GenerationJobAlreadyCompletedException } from "../../Exceptions/GenerationJobAlreadyCompletedException";
import { GenerationJobAlreadyFailedException } from "../../Exceptions/GenerationJobAlreadyFailedException";
import { GenerationJobCompletedEvent } from "../../Events/GenerationJobCompletedEvent";

export class GenerationJob extends AggregateRoot {
    private constructor(
        private readonly id: JobId,
        private status: JobStatus,
        private readonly params: GenerationParameters,
        private readonly workflow: Workflow,
        private readonly createdAt: Date,
        private comfyPromptId: string | null = null,
        private readonly errorMessage: string | null = null,
        private images: GeneratedImage[] = [],
        private updatedAt: Date | null = null,
        private completedAt: Date | null = null,
    ) {
        super();
    }

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

    public static reconstitute(
        id: JobId,
        status: JobStatus,
        params: GenerationParameters,
        workflow: Workflow,
        createdAt: Date,
        comfyPromptId: string | null = null,
        errorMessage: string | null = null,
        images: GeneratedImage[] = [],
        updatedAt: Date | null = null,
        completedAt: Date | null = null,
    ): GenerationJob {
        return new GenerationJob(
            id,
            status,
            params,
            workflow,
            createdAt,
            comfyPromptId,
            errorMessage,
            images,
            updatedAt,
            completedAt,
        );
    }

    // Domain methods
    public queue(): void {
        if (this.status === JobStatus.Ready) {
            throw new GenerationJobAlreadyCompletedException();
        }

        if (this.status !== JobStatus.Pending) {
            throw new GenerationJobAlreadyHandlingException();
        }
    }

    public queued(comfyPromptId: string): void {
        this.queue();
        this.apply(new GenerationJobQueuedEvent(this.id, comfyPromptId));
    }

    // markAsProcessing(): void {
    // ...
    // }

    public complete() // images: GeneratedImage[]
    : void {
        if (this.status === JobStatus.Error) {
            throw new GenerationJobAlreadyFailedException();
        }

        this.status = JobStatus.Ready;

        this.apply(new GenerationJobCompletedEvent(this.id));
    }

    public fail(error: string): void {
        if (this.status === JobStatus.Ready) {
            throw new GenerationJobAlreadyCompletedException();
        }

        this.apply(new GenerationJobFailedEvent(this.id, error));
    }

    // regenerate(newParams: Partial<GenerationParameters>): GenerationJob {
    // ...
    // }
}
