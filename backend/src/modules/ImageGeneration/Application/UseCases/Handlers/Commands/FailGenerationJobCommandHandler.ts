import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler } from "../../../../../Common/Application/Handlers/CommandHandler";
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from "../../../../Domain/Factories/Contracts/IGenerationJobRepository";
import { FailGenerationJobCommand as Command } from "../../../Input/Commands/FailGenerationJobCommand";
import { GenerationJob as Aggregate } from "../../../../Domain/Model/Aggregates/GenerationJob";
import { EventPublisher } from "@nestjs/cqrs";

@Injectable()
export class FailGenerationJobCommandHandler extends CommandHandler {
    constructor(
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly repository: IGenerationJobRepository,
        private readonly publisher: EventPublisher,
    ) {
        super();
    }

    public async execute(command: Command): Promise<void> {
        let aggregate: Aggregate = await this.repository.findByPromptId(
            command.dto.promptId,
        );

        aggregate = this.publisher.mergeObjectContext(aggregate);
        aggregate.fail(command.dto.error);
        aggregate.commit();

        await this.repository.fail(aggregate);
    }
}
