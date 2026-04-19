import {IEventHandler} from "@nestjs/cqrs";
import {GenerationJobFailedEvent} from "../../Domain/Events/GenerationJobFailedEvent";

export class GenerationJobFailedHandler implements IEventHandler<GenerationJobFailedEvent> {
    constructor() {
    }

    public async handle(event:GenerationJobFailedEvent): Promise<void> {

    }
}