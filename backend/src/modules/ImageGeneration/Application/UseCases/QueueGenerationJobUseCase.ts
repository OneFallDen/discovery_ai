import { Injectable } from "@nestjs/common";
import { CommandBus } from "../../../Common/Infrastructure/Bus/CommandBus";
import { QueueGenerationJobDTO as DTO } from "../DTO/QueueGenerationJobDTO";
import { QueueGenerationJobMapper } from "../Mappers/QueueGenerationJobMapper";

@Injectable()
export class QueueGenerationJobUseCase {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queueGenerationJobMapper: QueueGenerationJobMapper,
    ) {}

    public async execute(dto: DTO): Promise<void> {
        const command = this.queueGenerationJobMapper.map(dto);
        await this.commandBus.execute(command);

        // TODO: add job for status change
    }
}
