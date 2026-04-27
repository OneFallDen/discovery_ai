import { Command } from "../../../../Common/Application/UseCases/Command";
import { GenerationJobCompletedDTO as DTO } from "../../DTO/GenerationJobCompletedDTO";

export class GenerationJobCompletedCommand extends Command {
    constructor(public readonly dto: DTO) {
        super();
    }
}
