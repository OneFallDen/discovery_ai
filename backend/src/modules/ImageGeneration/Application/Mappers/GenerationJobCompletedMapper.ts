import { Injectable } from "@nestjs/common";
import { GenerationJobCompletedDTO as DTO } from "../DTO/GenerationJobCompletedDTO";
import { GenerationJobCompletedCommand as Command } from "../Input/Commands/GenerationJobCompletedCommand";

@Injectable()
export class GenerationJobCompletedMapper {
    public map(dto: DTO): Command {
        return new Command(dto);
    }
}
