import { Injectable } from "@nestjs/common";
import { FailGenerationJobDTO as DTO } from "../DTO/FailGenerationJobDTO";
import { FailGenerationJobCommand as Command } from "../Input/Commands/FailGenerationJobCommand";

@Injectable()
export class FailGenerationJobMapper {
    public map(dto: DTO): Command {
        return new Command(dto);
    }
}
