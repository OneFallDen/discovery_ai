import { Command } from "../../../../Common/Application/UseCases/Command";
import { FailGenerationJobDTO as DTO } from "../../DTO/FailGenerationJobDTO";

export class FailGenerationJobCommand extends Command {
    constructor(public readonly dto: DTO) {
        super();
    }
}
