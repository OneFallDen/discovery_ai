import { CommandHandler } from "../../../../../Common/Application/Handlers/CommandHandler";
import { Injectable } from "@nestjs/common";
import { GenerationJobQueuedCommand as Command } from "../../../Input/Commands/GenerationJobQueuedCommand";

@Injectable()
export class GenerationJobQueuedCommandHandler extends CommandHandler {
    constructor() {
        super();
    }

    public async execute(command: Command): Promise<void> {
        // TODO: command handler for side effects
    }
}
