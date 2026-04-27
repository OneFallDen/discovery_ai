import { CompleteGenerationJobDTO as DTO } from "../DTO/CompleteGenerationJobDTO";
import { Injectable } from "@nestjs/common";
import { CompleteGenerationJobMapper as Mapper } from "../Mappers/CompleteGenerationJobMapper";
import { CommandBus } from "../../../Common/Infrastructure/Bus/CommandBus";

@Injectable()
export class CompleteGenerationJobUseCase {
    constructor(
        private readonly mapper: Mapper,
        private readonly commandBus: CommandBus,
    ) {}

    public async execute(dto: DTO): Promise<void> {
        const command = this.mapper.map(dto);
        await this.commandBus.execute(command);
    }
}
