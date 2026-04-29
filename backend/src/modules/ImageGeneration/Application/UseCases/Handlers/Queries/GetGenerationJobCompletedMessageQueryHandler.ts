import { Inject, Injectable } from "@nestjs/common";
import { QueryHandler } from "../../../../../Common/Application/Handlers/QueryHandler";
import { GetGenerationJobCompletedMessage as Message } from "../../../Messages/GetGenerationJobCompletedMessage";
import { GetGenerationJobCompletedMessageQuery as Query } from "../../../Input/Queries/GetGenerationJobCompletedMessageQuery";
import {
    GENERATION_JOB_READER,
    type IGenerationJobReader,
} from "../../../../Domain/Factories/Contracts/IGenerationJobReader";
import { GenerationJobReadModel } from "../../../Model/GenerationJobReadModel";

@Injectable()
export class GetGenerationJobCompletedMessageQueryHandler extends QueryHandler {
    constructor(
        @Inject(GENERATION_JOB_READER)
        private readonly reader: IGenerationJobReader,
    ) {
        super();
    }

    public async handle(query: Query): Promise<Message> {
        let model: GenerationJobReadModel | null = null;
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
            model = await this.reader.getByPromptId(query.dto.promptId);
            if (model.images && model.images.length > 0) {
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
            attempts++;
        }

        if (!model || model.images.length === 0) {
            throw new Error("Images not found after completion");
        }

        const firstImage = model.images[0];

        return {
            id: model.id,
            url: firstImage.url,
        } as Message;
    }
}
