import { GenerationJobOrmEntity } from "../Entity/TypeORM/GenerationJobOrmEntity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { GenerationJob as Aggregate } from "../../../Domain/Model/Aggregates/GeneratoinJob";
import { Injectable } from "@nestjs/common";
import { IGenerationJobRepository } from "../../../Domain/Factories/Contracts/IGenerationJobRepository";

@Injectable()
export class GenerationJobRepository implements IGenerationJobRepository {
    constructor(
        @InjectRepository(GenerationJobOrmEntity)
        private readonly repository: Repository<GenerationJobOrmEntity>,
    ) {}

    public async store(aggregate: Aggregate): Promise<void> {
        const model = new GenerationJobOrmEntity();

        model.id = aggregate.getId().value();
        model.status = aggregate.getStatus();
        model.params = aggregate.getParams().toJson();
        model.workflowJson = JSON.parse(aggregate.getWorkflow().value());
        model.comfyPromptId = aggregate.getComfyPromptId() ?? null;
        model.errorMessage = aggregate.getErrorMessage() ?? null;
        model.completedAt = aggregate.getCompletedAt() ?? null;

        await this.repository.save(model);
    }
}
