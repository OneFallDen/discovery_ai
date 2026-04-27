import { Command } from "../../../../Common/Application/UseCases/Command";
import { GenerationJobFailedDTO as DTO } from "../../DTO/GenerationjbFailedDTO";

export class GenerationJobFailedCommand extends Command {
    constructor(public readonly dto: DTO) {
        super();
    }
}
