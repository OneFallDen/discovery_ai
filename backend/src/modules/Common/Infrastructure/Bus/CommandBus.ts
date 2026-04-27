import { Injectable } from "@nestjs/common";
import { Command } from "../../Application/UseCases/Command";
import { CommandHandler } from "../../Application/Handlers/CommandHandler";

@Injectable()
export class CommandBus {
    private handlers = new Map();

    register(
        command: new (...args: any[]) => Command,
        handler: CommandHandler,
    ) {
        this.handlers.set(command.name, handler);
    }

    async execute(command: Command): Promise<void> {
        const handler = this.handlers.get(command.constructor.name);
        if (!handler) throw new Error("Handler not found");
        await handler.execute(command);
    }
}
