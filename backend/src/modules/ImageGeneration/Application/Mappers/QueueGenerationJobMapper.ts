import { Injectable } from "@nestjs/common";
import { QueueGenerationJobDTO as DTO } from "../DTO/QueueGenerationJobDTO";
import { QueueGenerationJobCommand as Command } from "../Input/Commands/QueueGenerationJobCommand";

@Injectable()
export class QueueGenerationJobMapper {
    constructor() {}

    public map(dto: DTO): Command {
        return new Command(dto);
    }
}
