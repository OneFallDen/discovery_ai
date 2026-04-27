import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { GenerationJobFailedEvent as Event } from "../../Domain/Events/GenerationJobFailedEvent";
import { GenerationJobFailedUseCase } from "../UseCases/GenerationJobFailedUseCase";
import { GenerationJobFailedDTO as DTO } from "../DTO/GenerationjbFailedDTO";

@EventsHandler(Event)
export class GenerationJobFailedHandler implements IEventHandler<Event> {
    constructor(private readonly useCase: GenerationJobFailedUseCase) {}

    public async handle(event: Event): Promise<void> {
        await this.useCase.execute(new DTO(event.id.value(), event.error));
    }
}
