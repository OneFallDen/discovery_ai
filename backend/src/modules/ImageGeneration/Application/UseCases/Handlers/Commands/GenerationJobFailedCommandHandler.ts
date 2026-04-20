import { CommandHandler } from "../../../../../Common/Application/Handlers/CommandHandler";
import { Inject, Injectable } from "@nestjs/common";
import { GenerationJobFailedCommand as Command } from "../../../Input/Commands/GenerationJobFailedCommand";
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from "../../../../Domain/Factories/Contracts/IGenerationJobRepository";

@Injectable()
export class GenerationJobFailedCommandHandler extends CommandHandler {
    constructor(
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly repository: IGenerationJobRepository,
    ) {
        super();
    }

    public async execute(command: Command): Promise<void> {
        await this.repository.fail(command.dto.id, command.dto.error);
    }
}
