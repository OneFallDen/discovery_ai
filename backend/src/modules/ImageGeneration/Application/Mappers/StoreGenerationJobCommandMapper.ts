import { Injectable } from "@nestjs/common";
import { StoreGenerationJobDTO as DTO } from "../DTO/StoreGenerationJobDTO";
import { StoreGenerationJobCommand as Command } from "../Input/Commands/StoreGenerationJobCommand";

@Injectable()
export class StoreGenerationJobCommandMapper {
    public map(dto: DTO): Command {
        return new Command(dto);
    }
}
