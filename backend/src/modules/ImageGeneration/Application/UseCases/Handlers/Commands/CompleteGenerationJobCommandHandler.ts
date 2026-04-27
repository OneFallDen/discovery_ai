import { CommandHandler } from "../../../../../Common/Application/Handlers/CommandHandler";
import { CompleteGenerationJobCommand as Command } from "../../../Input/Commands/CompleteGenerationJobCommand";
import { Inject, Injectable } from "@nestjs/common";
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from "../../../../Domain/Factories/Contracts/IGenerationJobRepository";
import { GenerationJob as Aggregate } from "../../../../Domain/Model/Aggregates/GeneratoinJob";
import {
    COMFYUI_SERVICE,
    type IComfyUIService,
} from "../../../../Domain/Services/Contracts/IComfyUIService";
import { GeneratedImage as Image } from "../../../../Domain/Model/Entities/GeneratedImage";
import { ImageId } from "../../../../Domain/Model/ValueObjects/ImageId";
import {
    type IUuidService,
    UUID_SERVICE,
} from "../../../../../Common/Domain/Services/Contracts/IUuidService";

@Injectable()
export class CompleteGenerationJobCommandHandler extends CommandHandler {
    constructor(
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly repository: IGenerationJobRepository,
        @Inject(COMFYUI_SERVICE)
        private readonly comfyUIService: IComfyUIService,
        @Inject(UUID_SERVICE)
        private readonly uuidService: IUuidService,
    ) {
        super();
    }

    public async execute(command: Command): Promise<void> {
        const aggregate: Aggregate = await this.repository.findByPromptId(
            command.dto.promptId,
        );

        const images = await this.comfyUIService.getGeneratedImages(
            command.dto.promptId,
        );

        const generatedImages: Image[] = [];

        for (const image of images) {
            generatedImages.push(
                new Image(
                    new ImageId(this.uuidService.generate()),
                    aggregate.getId(),
                    image.filename,
                    image.url,
                    aggregate.getParams(),
                ),
            );
        }

        aggregate.complete(generatedImages);
        aggregate.commit();
    }
}
