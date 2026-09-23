import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { StoreGenerationJobRequest as Request } from "../Requests/StoreGenerationJobRequest";
import { StoreGenerationJobDTO as DTO } from "../../../Application/DTO/StoreGenerationJobDTO";

@Injectable()
export class StoreGenerationJobMapper {
    constructor(private readonly config: ConfigService) {}

    private generateSeed(): number {
        return Math.floor(Math.random() * 2147483647);
    }

    public map(request: Request): DTO {
        const isSafeMode = request.safeMode;

        return new DTO(
            request.positivePrompt,
            isSafeMode
                ? this.config.get<string>("DEFAULT_SAFE_MODE_PROMPT") ?? null
                : request.negativePrompt || null,
            request.seed ?? this.generateSeed(),
            request.width,
            request.height,
            request.steps ??
                this.config.get<number>("DEFAULT_GENERATION_STEPS") ??
                20,
            request.cfg ?? this.config.get<number>("DEFAULT_GENERATION_CFG") ?? 7,
            !isSafeMode,
            request.model ??
                this.config.get<string>("DEFAULT_GENERATION_MODEL"),
            request.sampler ??
                this.config.get<string>("DEFAULT_GENERATION_SAMPLER"),
            request.scheduler ??
                this.config.get<string>("DEFAULT_GENERATION_SCHEDULER"),
        );
    }
}
