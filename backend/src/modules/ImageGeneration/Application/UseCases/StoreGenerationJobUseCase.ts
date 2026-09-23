import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { StoreGenerationJobDTO as DTO } from "../DTO/StoreGenerationJobDTO";
import { StoreGenerationJobCommandMapper } from "../Mappers/StoreGenerationJobCommandMapper";
import { GenerationJobReadModel as ReadModel } from "../Model/GenerationJobReadModel";

@Injectable()
export class StoreGenerationJobUseCase {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly storeGenerationJobCommandMapper: StoreGenerationJobCommandMapper,
    ) {}

    public async execute(dto: DTO, sessionId: string): Promise<ReadModel> {
        const command = this.storeGenerationJobCommandMapper.map(dto, sessionId);
        return await this.commandBus.execute(command);
    }
}
