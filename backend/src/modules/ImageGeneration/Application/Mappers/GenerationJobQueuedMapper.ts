import { Injectable } from "@nestjs/common";
import { GenerationJobQueuedDTO as DTO } from "../DTO/GenerationJobQueuedDTO";
import { GenerationJobQueuedCommand as Command } from "../Input/Commands/GenerationJobQueuedCommand";

@Injectable()
export class GenerationJobQueuedMapper {
    constructor() {}

    public map(dto: DTO): Command {
        return new Command(dto);
    }
}
