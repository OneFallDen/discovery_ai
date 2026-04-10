import { Injectable } from "@nestjs/common";
import { CommandBus } from "../../../Common/Infrastructure/Bus/CommandBus";
import { QueryBus } from "../../../Common/Infrastructure/Bus/QueryBus";
import { StoreGenerationJobDTO as DTO } from "../DTO/StoreGenerationJobDTO";
import { StoreGenerationJobCommandMapper } from "../Mappers/StoreGenerationJobCommandMapper";

@Injectable()
export class StoreGenerationJobUseCase {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly storeGenerationJobCommandMapper: StoreGenerationJobCommandMapper,
    ) {}

    public async execute(dto: DTO): Promise<void> {
        const command = this.storeGenerationJobCommandMapper.map(dto);
        await this.commandBus.execute(command);
    }
}
