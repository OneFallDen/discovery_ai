import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { GenerationJobQueuedEvent as Event } from "../../Domain/Events/GenerationJobQueuedEvent";
import { GenerationJobQueuedUseCase as UseCase } from "../UseCases/GenerationJobQueuedUseCase";
import { GenerationJobQueuedDTO as DTO } from "../DTO/GenerationJobQueuedDTO";

@EventsHandler(Event)
export class GenerationJobQueuedHandler implements IEventHandler<Event> {
    constructor(private readonly useCase: UseCase) {}

    public async handle(event: Event): Promise<void> {
        await this.useCase.execute(
            new DTO(event.id.value(), event.comfyPromptId),
        );
    }
}
