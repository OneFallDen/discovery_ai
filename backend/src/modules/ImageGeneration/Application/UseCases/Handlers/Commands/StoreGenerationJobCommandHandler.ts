import { Inject, Injectable } from "@nestjs/common";
import {
    CommandHandler as NestCommandHandler,
    ICommandHandler,
} from "@nestjs/cqrs";
import { InjectQueue } from "@nestjs/bull";
import type { Queue } from "bull";
import { ConfigService } from "@nestjs/config";
import { StoreGenerationJobCommand as Command } from "../../../Input/Commands/StoreGenerationJobCommand";
import { GenerationJob as Aggregate } from "../../../../Domain/Model/Aggregates/GenerationJob";
import {
    type IUuidService,
    UUID_SERVICE,
} from "../../../../../Common/Domain/Services/Contracts/IUuidService";
import { JobId } from "../../../../Domain/Model/ValueObjects/JobId";
import { GenerationParameters } from "../../../../Domain/Model/ValueObjects/GenerationParameters";
import { Workflow } from "../../../../Domain/Model/ValueObjects/Workflow";
import {
    type IWorkflowService,
    WORKFLOW_SERVICE,
} from "../../../../Domain/Services/Contracts/IWorkflowService";
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from "../../../../Domain/Factories/Contracts/IGenerationJobRepository";
import { QueueGenerationJobDTO as JobDTO } from "../../../DTO/QueueGenerationJobDTO";
import { GenerationJobReadModel as ReadModel } from "../../../Model/GenerationJobReadModel";

@Injectable()
@NestCommandHandler(Command)
export class StoreGenerationJobCommandHandler
    implements ICommandHandler<Command, ReadModel>
{
    constructor(
        @Inject(UUID_SERVICE)
        private readonly uuidService: IUuidService,
        @Inject(WORKFLOW_SERVICE)
        private readonly workflowService: IWorkflowService,
        private readonly config: ConfigService,
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly repository: IGenerationJobRepository,
        @InjectQueue("image_queue") private queue: Queue,
    ) {}

    public async execute(command: Command): Promise<ReadModel> {
        const workflow = this.workflowService.build(
            this.config.get<string>("DEFAULT_GENERATION_WORKFLOW") ||
                "base.json",
            command.dto,
        );

        const aggregate = Aggregate.create(
            new JobId(this.uuidService.generate()),
            new GenerationParameters(
                command.dto.positivePrompt,
                command.dto.negativePrompt,
                command.dto.seed,
                command.dto.width,
                command.dto.height,
                command.dto.steps,
                command.dto.cfg,
                command.dto.nsfwEnabled,
                command.dto.model,
                command.dto.sampler,
                command.dto.scheduler,
            ),
            new Workflow(workflow),
        );

        await this.repository.store(aggregate, command.sessionId);

        await this.queue.add(
            "queue_image",
            new JobDTO(aggregate.getId().value()),
            {
                attempts: 3,
                backoff: { type: "exponential", delay: 1000 },
            },
        );

        return new ReadModel(
            aggregate.getId().value(),
            aggregate.getStatus().toString(),
            aggregate.getCreatedAt(),
            [],
        );
    }
}
