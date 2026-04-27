import { Injectable } from "@nestjs/common";
import { CommandBus } from "../../../Common/Infrastructure/Bus/CommandBus";
import { GenerationJobFailedDTO as DTO } from "../DTO/GenerationjbFailedDTO";
import { GenerationJobFailedMapper } from "../Mappers/GenerationJobFailedMapper";

@Injectable()
export class GenerationJobFailedUseCase {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly generationJobFailedMapper: GenerationJobFailedMapper,
    ) {}

    public async execute(dto: DTO): Promise<void> {
        const command = this.generationJobFailedMapper.map(dto);
        await this.commandBus.execute(command);
    }
}
