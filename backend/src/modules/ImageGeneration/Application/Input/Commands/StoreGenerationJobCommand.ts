import { Command } from "../../../../Common/Application/UseCases/Command";
import { StoreGenerationJobDTO as DTO } from "../../DTO/StoreGenerationJobDTO";

export class StoreGenerationJobCommand extends Command {
    constructor(public readonly dto: DTO) {
        super();
    }
}
