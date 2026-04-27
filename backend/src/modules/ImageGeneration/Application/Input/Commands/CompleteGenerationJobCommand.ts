import { Command } from "../../../../Common/Application/UseCases/Command";
import { CompleteGenerationJobDTO as DTO } from "../../DTO/CompleteGenerationJobDTO";

export class CompleteGenerationJobCommand extends Command {
    constructor(public readonly dto: DTO) {
        super();
    }
}
