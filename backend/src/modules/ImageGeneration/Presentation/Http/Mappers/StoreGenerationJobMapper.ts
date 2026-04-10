import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { StoreGenerationJobRequest as Request } from "../Requests/StoreGenerationJobRequest";
import { StoreGenerationJobDTO as DTO } from "../../../Application/DTO/StoreGenerationJobDTO";

@Injectable()
export class StoreGenerationJobMapper {
    constructor(private readonly config: ConfigService) {}

    public map(request: Request): DTO {
        return {
            positivePrompt: request.positivePrompt,
            negativePrompt: request.negativePrompt
                ? request.negativePrompt
                : null,
            seed: request.seed ? request.seed : null,
            width: request.width,
            height: request.height,
            steps: request.steps
                ? request.steps
                : this.config.get<string>("DEFAULT_GENERATION_STEPS"),
            cfg: request.cfg
                ? request.cfg
                : this.config.get<string>("DEFAULT_GENERATION_CFG"),
            nsfwEnabled: request.nsfwEnabled,
            model: request.model
                ? request.model
                : this.config.get<string>("DEFAULT_GENERATION_MODEL"),
            sampler: request.sampler
                ? request.sampler
                : this.config.get<string>("DEFAULT_GENERATION_SAMPLER"),
            scheduler: request.scheduler
                ? request.scheduler
                : this.config.get<string>("DEFAULT_GENERATION_SCHEDULER"),
        } as DTO;
    }
}
