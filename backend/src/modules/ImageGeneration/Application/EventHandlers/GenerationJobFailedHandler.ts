import { IEventHandler } from "@nestjs/cqrs";
import { GenerationJobFailedEvent } from "../../Domain/Events/GenerationJobFailedEvent";
import { GenerationJobFailedUseCase } from "../UseCases/GenerationJobFailedUseCase";
import { GenerationJobFailedDTO as DTO } from "../DTO/GenerationjbFailedDTO";

export class GenerationJobFailedHandler implements IEventHandler<GenerationJobFailedEvent> {
    constructor(private readonly useCase: GenerationJobFailedUseCase) {}

    public async handle(event: GenerationJobFailedEvent): Promise<void> {
        await this.useCase.execute(new DTO(event.id.value(), event.error));
    }
}
