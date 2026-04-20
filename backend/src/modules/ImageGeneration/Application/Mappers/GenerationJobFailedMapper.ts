import { Injectable } from "@nestjs/common";
import { GenerationJobFailedDTO as DTO } from "../DTO/GenerationjbFailedDTO";
import { GenerationJobFailedCommand as Command } from "../Input/Commands/GenerationJobFailedCommand";

@Injectable()
export class GenerationJobFailedMapper {
    constructor() {}

    public map(dto: DTO): Command {
        return new Command(dto);
    }
}
