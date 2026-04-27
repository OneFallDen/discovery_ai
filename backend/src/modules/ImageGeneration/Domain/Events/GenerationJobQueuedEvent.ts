import { IEvent } from "@nestjs/cqrs";
import { JobId } from "../Model/ValueObjects/JobId";

export class GenerationJobQueuedEvent implements IEvent {
    public readonly occurredOn: Date = new Date();

    constructor(
        public readonly id: JobId,
        public readonly comfyPromptId: string,
    ) {}
}
