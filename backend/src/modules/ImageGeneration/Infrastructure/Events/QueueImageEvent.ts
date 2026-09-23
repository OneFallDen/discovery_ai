import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Job } from "bull";
import { QueueGenerationJobDTO as JobDTO } from "../../Application/DTO/QueueGenerationJobDTO";
import { QueueGenerationJobUseCase } from "../../Application/UseCases/QueueGenerationJobUseCase";
import { GENERATION_JOB_REPOSITORY, type IGenerationJobRepository } from "../../Domain/Factories/Contracts/IGenerationJobRepository";
import { EventPublisher } from "@nestjs/cqrs";
import { ImageEventsGateway } from "../../Presentation/Http/WebSocket/ImageEventsGateway";

@Injectable()
export class QueueImageEvent {
    private readonly logger = new Logger(QueueImageEvent.name);

    constructor(
        private readonly useCase: QueueGenerationJobUseCase,
        @Inject(GENERATION_JOB_REPOSITORY) private readonly repository: IGenerationJobRepository,
        private readonly publisher: EventPublisher,
        private readonly gateway: ImageEventsGateway,
    ) {}

    public async handle(job: Job<JobDTO>): Promise<void> {
        try {
            await this.useCase.execute(job.data);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (job.attemptsMade + 1 >= (job.opts.attempts ?? 1)) {
                const aggregate = this.publisher.mergeObjectContext(await this.repository.find(job.data.uuid));
                aggregate.fail(message);
                await this.repository.fail(aggregate);
                aggregate.commit();
                await this.gateway.sendImageFailed(job.data.uuid, message);
            }
            this.logger.error(`Failed to queue generation job ${job.data.uuid}`, message);
            throw error;
        }
    }
}
