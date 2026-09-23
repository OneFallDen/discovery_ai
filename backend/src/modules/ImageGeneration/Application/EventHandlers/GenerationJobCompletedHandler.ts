import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { GenerationJobCompletedEvent as Event } from "../../Domain/Events/GenerationJobCompletedEvent";
import { ImageEventsGateway } from "../../Presentation/Http/WebSocket/ImageEventsGateway";

@EventsHandler(Event)
export class GenerationJobCompletedHandler implements IEventHandler<Event> {
    constructor(private readonly imageEventsGateway: ImageEventsGateway) {}

    public async handle(event: Event): Promise<void> {
        const firstImage = event.images[0];

        if (!firstImage) {
            return;
        }

        await this.imageEventsGateway.sendImageReady(
            event.id.value(),
            firstImage.getUrl(),
        );
    }
}
