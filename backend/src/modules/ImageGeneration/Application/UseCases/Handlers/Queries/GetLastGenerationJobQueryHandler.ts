import { Inject, Injectable } from "@nestjs/common";
import { QueryHandler } from "../../../../../Common/Application/Handlers/QueryHandler";
import {
    GENERATION_JOB_READER,
    type IGenerationJobReader,
} from "../../../../Domain/Factories/Contracts/IGenerationJobReader";
import { GetLastGenerationJobQuery } from "../../../Input/Queries/GetLastGenerationJobQuery";
import { GenerationJobReadModel as ReadModel } from "../../../Model/GenerationJobReadModel";

@Injectable()
export class GetLastGenerationJobQueryHandler extends QueryHandler {
    constructor(
        @Inject(GENERATION_JOB_READER)
        private readonly reader: IGenerationJobReader,
    ) {
        super();
    }

    public async handle(query: GetLastGenerationJobQuery): Promise<ReadModel> {
        return await this.reader.last();
    }
}
