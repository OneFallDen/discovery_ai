import { IEvent } from "@nestjs/cqrs";
import { JobId } from "../Model/ValueObjects/JobId";
import { GeneratedImage } from "../Model/Entities/GeneratedImage";

export class GenerationJobCompletedEvent implements IEvent {
    public readonly occurredOn: Date = new Date();

    constructor(
        public readonly id: JobId,
        public readonly images: GeneratedImage[],
    ) {}
}
