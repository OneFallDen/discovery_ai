import { Injectable } from "@nestjs/common";
import { CompleteGenerationJobCommand as Command } from "../Input/Commands/CompleteGenerationJobCommand";
import { CompleteGenerationJobDTO as DTO } from "../DTO/CompleteGenerationJobDTO";

@Injectable()
export class CompleteGenerationJobMapper {
    public map(dto: DTO): Command {
        return new Command(dto);
    }
}
