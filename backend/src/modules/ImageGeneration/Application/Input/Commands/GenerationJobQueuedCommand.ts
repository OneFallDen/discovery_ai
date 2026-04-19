import {Command} from "../../../../Common/Application/UseCases/Command";
import {GenerationJobQueuedDTO as DTO} from "../../DTO/GenerationJobQueuedDTO";

export class GenerationJobQueuedCommand extends Command {
    constructor(
        public readonly dto: DTO
    ) {
        super();
    }
}