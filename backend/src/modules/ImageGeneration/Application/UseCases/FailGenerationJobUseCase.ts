import { Injectable } from "@nestjs/common";
import { FailGenerationJobMapper as Mapper } from "../Mappers/FailGenerationJobMapper";
import { CommandBus } from "@nestjs/cqrs";
import { FailGenerationJobDTO as DTO } from "../DTO/FailGenerationJobDTO";

@Injectable()
export class FailGenerationJobUseCase {
    constructor(
        private readonly mapper: Mapper,
        private readonly commandBus: CommandBus,
    ) {}

    public async execute(dto: DTO): Promise<void> {
        const command = this.mapper.map(dto);
        await this.commandBus.execute(command);
    }
}
