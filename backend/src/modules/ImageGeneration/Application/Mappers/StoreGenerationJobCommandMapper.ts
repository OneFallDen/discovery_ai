import { Injectable } from "@nestjs/common";
import { StoreGenerationJobDTO as DTO } from "../DTO/StoreGenerationJobDTO";
import { StoreGenerationJobCommand as Command } from "../Input/Commands/StoreGenerationJobCommand";

@Injectable()
export class StoreGenerationJobCommandMapper {
    public map(dto: DTO, sessionId: string): Command {
        return new Command(dto, sessionId);
    }
}
