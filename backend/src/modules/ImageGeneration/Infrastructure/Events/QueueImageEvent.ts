import { Injectable } from "@nestjs/common";
import { Job } from "bullmq";
import { QueueGenerationJobDTO as JobDTO } from "../../Application/DTO/QueueGenerationJobDTO";
import { QueueGenerationJobUseCase } from "../../Application/UseCases/QueueGenerationJobUseCase";

@Injectable()
export class QueueImageEvent {
    constructor(private readonly useCase: QueueGenerationJobUseCase) {}

    public async handle(job: Job<JobDTO>): Promise<void> {
        try {
            await this.useCase.execute(job.data);
        } catch (error) {
            console.error(error);
        }
    }
}
