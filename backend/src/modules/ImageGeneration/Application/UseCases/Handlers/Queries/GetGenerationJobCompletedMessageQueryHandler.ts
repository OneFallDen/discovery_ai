import { Inject, Injectable } from "@nestjs/common";
import { GetGenerationJobCompletedMessage as Message } from "../../../Messages/GetGenerationJobCompletedMessage";
import { GetGenerationJobCompletedMessageQuery as Query } from "../../../Input/Queries/GetGenerationJobCompletedMessageQuery";
import {
    GENERATION_JOB_READER,
    type IGenerationJobReader,
} from "../../../../Domain/Factories/Contracts/IGenerationJobReader";
import {
    IQueryHandler,
    QueryHandler as NestQueryHandler,
} from "@nestjs/cqrs";

@Injectable()
@NestQueryHandler(Query)
export class GetGenerationJobCompletedMessageQueryHandler
    implements IQueryHandler<Query, Message>
{
    constructor(
        @Inject(GENERATION_JOB_READER)
        private readonly reader: IGenerationJobReader,
    ) {}

    public async execute(query: Query): Promise<Message> {
        const model = await this.reader.getByPromptId(query.dto.promptId);

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
