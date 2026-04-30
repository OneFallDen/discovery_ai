import { Injectable } from "@nestjs/common";
import { CommandHandler } from "../../../../../Common/Application/Handlers/CommandHandler";
import { GenerationJobCompletedCommand as Command } from "../../../Input/Commands/GenerationJobCompletedCommand";

@Injectable()
export class GenerationJobCompletedCommandHandler extends CommandHandler {
    constructor() {
        super();
    }

    public async execute(command: Command): Promise<void> {
        // TODO: command handler for side effects
    }
}
