import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { GenerationJobFailedEvent as Event } from "../../Domain/Events/GenerationJobFailedEvent";
import { ImageEventsGateway } from "../../Presentation/Http/WebSocket/ImageEventsGateway";

@EventsHandler(Event)
export class GenerationJobFailedHandler implements IEventHandler<Event> {
    constructor(private readonly imageEventsGateway: ImageEventsGateway) {}

    public async handle(event: Event): Promise<void> {
        this.imageEventsGateway.sendImageFailed(event.id.value(), event.error);
    }
}
