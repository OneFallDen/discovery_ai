import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { GenerationJobQueuedEvent as Event } from "../../Domain/Events/GenerationJobQueuedEvent";

@EventsHandler(Event)
export class GenerationJobQueuedHandler implements IEventHandler<Event> {
    public async handle(event: Event): Promise<void> {
        void event;
    }
}
