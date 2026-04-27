import { CommandHandler } from "../../../../../Common/Application/Handlers/CommandHandler";
import { Inject, Injectable } from "@nestjs/common";
import { GenerationJobQueuedCommand as Command } from "../../../Input/Commands/GenerationJobQueuedCommand";
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from "../../../../Domain/Factories/Contracts/IGenerationJobRepository";

@Injectable()
export class GenerationJobQueuedCommandHandler extends CommandHandler {
    constructor(
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly repository: IGenerationJobRepository,
    ) {
        super();
    }

    public async execute(command: Command): Promise<void> {
        await this.repository.queue(command.dto.id, command.dto.comfyUiId);
    }
}
