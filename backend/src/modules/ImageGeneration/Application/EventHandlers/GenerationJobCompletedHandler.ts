import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { GenerationJobCompletedEvent as Event } from "../../Domain/Events/GenerationJobCompletedEvent";
import { GenerationJobCompletedUseCase as UseCase } from "../UseCases/GenerationJobCompletedUseCase";
import { GenerationJobCompletedDTO as DTO } from "../DTO/GenerationJobCompletedDTO";

@EventsHandler(Event)
export class GenerationJobCompletedHandler implements IEventHandler<Event> {
    constructor(private readonly useCase: UseCase) {}

    public async handle(event: Event): Promise<void> {
        await this.useCase.execute(new DTO(event.id.value(), event.images));
    }
}
