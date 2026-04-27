import { Injectable } from "@nestjs/common";
import { CommandBus } from "../../../Common/Infrastructure/Bus/CommandBus";
import { QueryBus } from "../../../Common/Infrastructure/Bus/QueryBus";
import { StoreGenerationJobDTO as DTO } from "../DTO/StoreGenerationJobDTO";
import { StoreGenerationJobCommandMapper } from "../Mappers/StoreGenerationJobCommandMapper";
import { GetLastGenerationJobMapper } from "../Mappers/GetLastGenerationJobMapper";
import { GenerationJobReadModel as ReadModel } from "../Model/GenerationJobReadModel";

@Injectable()
export class StoreGenerationJobUseCase {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly storeGenerationJobCommandMapper: StoreGenerationJobCommandMapper,
        private readonly getLastGenerationJobMapper: GetLastGenerationJobMapper,
    ) {}

    public async execute(dto: DTO): Promise<ReadModel> {
        const command = this.storeGenerationJobCommandMapper.map(dto);
        await this.commandBus.execute(command);
        const query = this.getLastGenerationJobMapper.map();
        return await this.queryBus.handle(query);
    }
}
