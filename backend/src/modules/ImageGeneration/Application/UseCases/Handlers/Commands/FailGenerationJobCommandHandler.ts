import { Inject, Injectable } from "@nestjs/common";
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from "../../../../Domain/Factories/Contracts/IGenerationJobRepository";
import { FailGenerationJobCommand as Command } from "../../../Input/Commands/FailGenerationJobCommand";
import { GenerationJob as Aggregate } from "../../../../Domain/Model/Aggregates/GenerationJob";
import {
    CommandHandler as NestCommandHandler,
    EventPublisher,
    ICommandHandler,
} from "@nestjs/cqrs";

@Injectable()
@NestCommandHandler(Command)
export class FailGenerationJobCommandHandler
    implements ICommandHandler<Command, void>
{
    constructor(
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly repository: IGenerationJobRepository,
        private readonly publisher: EventPublisher,
    ) {}

    public async execute(command: Command): Promise<void> {
        let aggregate: Aggregate = await this.repository.findByPromptId(
            command.dto.promptId,
        );

        aggregate = this.publisher.mergeObjectContext(aggregate);
        aggregate.fail(command.dto.error);

        await this.repository.fail(aggregate);
        aggregate.commit();
    }
}
