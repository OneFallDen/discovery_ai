import { Injectable } from "@nestjs/common";
import { GetGenerationJobCompletedMessageQuery as Query } from "../Input/Queries/GetGenerationJobCompletedMessageQuery";
import { GetGenerationJobCompletedMessageDTO as DTO } from "../DTO/GetGenerationJobCompletedMessageDTO";

@Injectable()
export class GetGenerationJobCompletedMessageMapper {
    public map(promptId: string): Query {
        return new Query(new DTO(promptId));
    }
}
