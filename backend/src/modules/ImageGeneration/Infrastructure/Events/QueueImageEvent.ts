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
            if (job.attemptsMade + 1 >= (job.opts.attempts ?? 1)) {
                await this.failGenerationJobByIdUseCase.execute(
                    job.data.uuid,
                    error instanceof Error ? error.message : String(error),
                );
            }
            this.logger.error(
                `Failed to queue generation job ${job.data.uuid}`,
                error instanceof Error ? error.stack : String(error),
            );
            throw error;
        }
    }
}
