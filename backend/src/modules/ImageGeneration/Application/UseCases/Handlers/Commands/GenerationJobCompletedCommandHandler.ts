import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler } from "../../../../../Common/Application/Handlers/CommandHandler";
import { GenerationJobCompletedCommand as Command } from "../../../Input/Commands/GenerationJobCompletedCommand";
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from "../../../../Domain/Factories/Contracts/IGenerationJobRepository";

@Injectable()
export class GenerationJobCompletedCommandHandler extends CommandHandler {
    constructor(
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly repository: IGenerationJobRepository,
    ) {
        super();
    }

    public async execute(command: Command): Promise<void> {
        await this.repository.complete(command.dto.id, command.dto.images);
    }
}
