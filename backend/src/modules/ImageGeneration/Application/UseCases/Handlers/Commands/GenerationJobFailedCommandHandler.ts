import { CommandHandler } from "../../../../../Common/Application/Handlers/CommandHandler";
import { Injectable } from "@nestjs/common";
import { GenerationJobFailedCommand as Command } from "../../../Input/Commands/GenerationJobFailedCommand";

@Injectable()
export class GenerationJobFailedCommandHandler extends CommandHandler {
    constructor() {
        super();
    }

    public async execute(command: Command): Promise<void> {
        // TODO: command handler for side effects
    }
}
