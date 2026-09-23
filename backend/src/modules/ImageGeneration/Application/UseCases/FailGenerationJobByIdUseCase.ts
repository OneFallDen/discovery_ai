import { Inject, Injectable } from "@nestjs/common";
import { EventPublisher } from "@nestjs/cqrs";
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from "../../Domain/Factories/Contracts/IGenerationJobRepository";
import { GenerationJob as Aggregate } from "../../Domain/Model/Aggregates/GenerationJob";

@Injectable()
export class FailGenerationJobByIdUseCase {
    constructor(
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly repository: IGenerationJobRepository,
        private readonly publisher: EventPublisher,
    ) {}

    public async execute(jobId: string, error: string): Promise<void> {
        let aggregate: Aggregate = await this.repository.find(jobId);

        aggregate = this.publisher.mergeObjectContext(aggregate);
        aggregate.fail(error);

        await this.repository.fail(aggregate);
        aggregate.commit();
    }
}
