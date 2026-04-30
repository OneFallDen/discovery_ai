import { Injectable } from "@nestjs/common";
import { GenerationJobCompletedDTO as DTO } from "../DTO/GenerationJobCompletedDTO";
import { CommandBus } from "../../../Common/Infrastructure/Bus/CommandBus";
import { GenerationJobCompletedMapper as Mapper } from "../Mappers/GenerationJobCompletedMapper";

@Injectable()
export class GenerationJobCompletedUseCase {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly mapper: Mapper,
    ) {}

    public async execute(dto: DTO): Promise<void> {
        const command = this.mapper.map(dto);
        await this.commandBus.execute(command);
    }
}
