import { GenerationJobOrmEntity } from "../Entity/TypeORM/GenerationJobOrmEntity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { GenerationJob as Aggregate } from "../../../Domain/Model/Aggregates/GeneratoinJob";
import { Injectable } from "@nestjs/common";
import { IGenerationJobRepository } from "../../../Domain/Factories/Contracts/IGenerationJobRepository";
import { GenerationJobNotFoundException } from "../../Exceptions/GenerationJobNotFoundException";
import { JobId } from "../../../Domain/Model/ValueObjects/JobId";
import { GenerationParameters } from "../../../Domain/Model/ValueObjects/GenerationParameters";
import { Workflow } from "../../../Domain/Model/ValueObjects/Workflow";
import { JobStatus } from "../../../Domain/Model/ValueObjects/JobStatus";

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

    public async find(id: string): Promise<Aggregate> {
        const model = await this.repository
            .createQueryBuilder("generation_jobs")
            .where({ id: id })
            .getOne();

        if (!model) {
            throw new GenerationJobNotFoundException();
        }

        return Aggregate.reconstitute(
            new JobId(model.id),
            model.status,
            GenerationParameters.fromJson(model.params),
            Workflow.fromJson(model.workflowJson),
            model.createdAt,
            model.comfyPromptId ?? null,
            model.errorMessage ?? null,
            [],
            model.updatedAt ?? null,
            model.completedAt ?? null,
        );
    }

    public async queue(id: string, comfyUiId: string): Promise<void> {
        const model = await this.repository
            .createQueryBuilder("generation_jobs")
            .where({ id: id })
            .getOne();

        if (!model) {
            throw new GenerationJobNotFoundException();
        }

        model.status = JobStatus.Queued;
        model.comfyPromptId = comfyUiId;

        await this.repository.save(model);
    }

    public async fail(id: string, error: string): Promise<void> {
        const model = await this.repository
            .createQueryBuilder("generation_jobs")
            .where({ id: id })
            .getOne();

        if (!model) {
            throw new GenerationJobNotFoundException();
        }

        model.status = JobStatus.Error;
        model.errorMessage = error;

        await this.repository.save(model);
    }
}
