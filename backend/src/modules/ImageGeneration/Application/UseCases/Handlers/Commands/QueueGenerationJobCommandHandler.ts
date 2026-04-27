import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler } from "../../../../../Common/Application/Handlers/CommandHandler";
import { QueueGenerationJobCommand as Command } from "../../../Input/Commands/QueueGenerationJobCommand";
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from "../../../../Domain/Factories/Contracts/IGenerationJobRepository";
import { GenerationJob as Aggregate } from "../../../../Domain/Model/Aggregates/GeneratoinJob";
import {
    COMFYUI_SERVICE,
    type IComfyUIService,
} from "../../../../Domain/Services/Contracts/IComfyUIService";
import { EventPublisher } from "@nestjs/cqrs";

@Injectable()
export class QueueGenerationJobCommandHandler extends CommandHandler {
    constructor(
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly repository: IGenerationJobRepository,
        @Inject(COMFYUI_SERVICE)
        private readonly comfyUIService: IComfyUIService,
        private readonly publisher: EventPublisher,
    ) {
        super();
    }

    public async execute(command: Command): Promise<void> {
        const loadedAggregate: Aggregate = await this.repository.find(
            command.dto.uuid,
        );

        const aggregate: Aggregate =
            this.publisher.mergeObjectContext(loadedAggregate);

        try {
            aggregate.queue();

            const promptId = await this.comfyUIService.queuePrompt(
                aggregate.getWorkflow().value(),
            );

            aggregate.queued(promptId);

            aggregate.commit();
        } catch (e) {
            console.error(e);
        }
    }
}
