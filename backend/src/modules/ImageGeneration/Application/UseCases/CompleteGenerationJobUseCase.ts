import { CompleteGenerationJobDTO as DTO } from "../DTO/CompleteGenerationJobDTO";
import { Injectable } from "@nestjs/common";
import { CompleteGenerationJobMapper as Mapper } from "../Mappers/CompleteGenerationJobMapper";
import { CommandBus } from "../../../Common/Infrastructure/Bus/CommandBus";
import { GetGenerationJobCompletedMessageMapper as QueryMapper } from "../Mappers/GetGenerationJobCompletedMessageMapper";
import { QueryBus } from "../../../Common/Infrastructure/Bus/QueryBus";
import { GetGenerationJobCompletedMessage as Message } from "../Messages/GetGenerationJobCompletedMessage";

@Injectable()
export class CompleteGenerationJobUseCase {
    constructor(
        private readonly mapper: Mapper,
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly queryMapper: QueryMapper,
    ) {}

    public async execute(dto: DTO): Promise<Message> {
        const command = this.mapper.map(dto);
        await this.commandBus.execute(command);
        const query = this.queryMapper.map(dto.promptId);
        return await this.queryBus.handle(query);
    }
}
