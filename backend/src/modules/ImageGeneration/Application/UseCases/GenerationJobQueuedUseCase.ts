import {Injectable} from "@nestjs/common";
import {GenerationJobQueuedDTO as DTO} from "../DTO/GenerationJobQueuedDTO";
import {CommandBus} from "../../../Common/Infrastructure/Bus/CommandBus";
import {GenerationJobQueuedMapper} from "../Mappers/GenerationJobQueuedMapper";

@Injectable()
export class GenerationJobQueuedUseCase {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly generationJobQueuedMapper: GenerationJobQueuedMapper
    ) {
    }

    public async execute(dto: DTO): Promise<void> {
        const command = this.generationJobQueuedMapper.map(dto);
        await this.commandBus.execute(command);
    }
}