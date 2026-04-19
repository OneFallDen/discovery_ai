import { Command } from "../../../../Common/Application/UseCases/Command";
import { QueueGenerationJobDTO as DTO } from "../../DTO/QueueGenerationJobDTO";

export class QueueGenerationJobCommand extends Command {
    constructor(public readonly dto: DTO) {
        super();
    }
}
