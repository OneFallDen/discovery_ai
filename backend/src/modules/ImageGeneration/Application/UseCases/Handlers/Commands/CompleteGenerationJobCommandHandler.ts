import { CommandHandler } from "../../../../../Common/Application/Handlers/CommandHandler";
import { CompleteGenerationJobCommand as Command } from "../../../Input/Commands/CompleteGenerationJobCommand";
import { Inject, Injectable } from "@nestjs/common";
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from "../../../../Domain/Factories/Contracts/IGenerationJobRepository";
import { GenerationJob as Aggregate } from "../../../../Domain/Model/Aggregates/GeneratoinJob";

@Injectable()
export class CompleteGenerationJobCommandHandler extends CommandHandler {
    constructor(
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly repository: IGenerationJobRepository,
    ) {
        super();
    }

    public async execute(command: Command): Promise<void> {
        const aggregate: Aggregate = await this.repository.findByPromptId(
            command.dto.promptId,
        );
        aggregate.complete();
        aggregate.commit();
    }
}
