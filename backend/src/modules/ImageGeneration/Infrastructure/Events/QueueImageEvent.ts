import { Injectable, Logger } from "@nestjs/common";
import type { Job } from "bull";
import { QueueGenerationJobDTO as JobDTO } from "../../Application/DTO/QueueGenerationJobDTO";
import { QueueGenerationJobUseCase } from "../../Application/UseCases/QueueGenerationJobUseCase";
import { FailGenerationJobByIdUseCase } from "../../Application/UseCases/FailGenerationJobByIdUseCase";

@Injectable()
export class QueueImageEvent {
    private readonly logger = new Logger(QueueImageEvent.name);

    constructor(
        private readonly useCase: QueueGenerationJobUseCase,
        private readonly failGenerationJobByIdUseCase: FailGenerationJobByIdUseCase,
    ) {}

    public async handle(job: Job<JobDTO>): Promise<void> {
        try {
            await this.useCase.execute(job.data);
        } catch (error) {
            if (this.isFinalAttempt(job)) {
                await this.failGenerationJobByIdUseCase.execute(
                    job.data.uuid,
                    this.getErrorMessage(error),
                );
            }

            this.logger.error(
                `Failed to queue generation job ${job.data.uuid}`,
                error instanceof Error ? error.stack : String(error),
            );
            throw error;
        }
    }

    private isFinalAttempt(job: Job<JobDTO>): boolean {
        const attempts = job.opts.attempts ?? 1;
        return job.attemptsMade + 1 >= attempts;
    }

    private getErrorMessage(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }
}
