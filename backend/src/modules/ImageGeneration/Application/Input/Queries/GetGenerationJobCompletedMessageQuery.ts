import { Query } from "../../../../Common/Application/UseCases/Query";
import { GetGenerationJobCompletedMessageDTO as DTO } from "../../DTO/GetGenerationJobCompletedMessageDTO";

export class GetGenerationJobCompletedMessageQuery extends Query {
    constructor(public readonly dto: DTO) {
        super();
    }
}
