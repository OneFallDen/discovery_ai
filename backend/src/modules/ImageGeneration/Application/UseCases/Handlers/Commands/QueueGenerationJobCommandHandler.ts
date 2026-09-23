import { Inject, Injectable } from "@nestjs/common";
import { QueueGenerationJobCommand as Command } from "../../../Input/Commands/QueueGenerationJobCommand";
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from "../../../../Domain/Factories/Contracts/IGenerationJobRepository";
import { GenerationJob as Aggregate } from "../../../../Domain/Model/Aggregates/GenerationJob";
import {
    COMFYUI_SERVICE,
    type IComfyUIService,
} from "../../../../Domain/Services/Contracts/IComfyUIService";
import {
    CommandHandler as NestCommandHandler,
    EventPublisher,
    ICommandHandler,
} from "@nestjs/cqrs";

@Injectable()
@NestCommandHandler(Command)
export class QueueGenerationJobCommandHandler
    implements ICommandHandler<Command, void>
{
    constructor(
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly repository: IGenerationJobRepository,
        @Inject(COMFYUI_SERVICE)
        private readonly comfyUIService: IComfyUIService,
        private readonly publisher: EventPublisher,
    ) {}

    public async execute(command: Command): Promise<void> {
        const loadedAggregate: Aggregate = await this.repository.find(
            command.dto.uuid,
        );

        const aggregate: Aggregate =
            this.publisher.mergeObjectContext(loadedAggregate);

        aggregate.queue();

        const promptId = await this.comfyUIService.queuePrompt(
            aggregate.getWorkflow().value(),
        );

        aggregate.queued(promptId);

        await this.repository.queue(aggregate);
        aggregate.commit();
    }
}
