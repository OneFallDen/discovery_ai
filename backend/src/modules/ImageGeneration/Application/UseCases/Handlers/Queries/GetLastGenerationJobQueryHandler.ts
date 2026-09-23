import { Inject, Injectable } from "@nestjs/common";
import {
    GENERATION_JOB_READER,
    type IGenerationJobReader,
} from "../../../../Domain/Factories/Contracts/IGenerationJobReader";
import { GetLastGenerationJobQuery } from "../../../Input/Queries/GetLastGenerationJobQuery";
import { GenerationJobReadModel as ReadModel } from "../../../Model/GenerationJobReadModel";
import {
    IQueryHandler,
    QueryHandler as NestQueryHandler,
} from "@nestjs/cqrs";

@Injectable()
@NestQueryHandler(GetLastGenerationJobQuery)
export class GetLastGenerationJobQueryHandler
    implements IQueryHandler<GetLastGenerationJobQuery, ReadModel>
{
    constructor(
        @Inject(GENERATION_JOB_READER)
        private readonly reader: IGenerationJobReader,
    ) {}

    public async execute(query: GetLastGenerationJobQuery): Promise<ReadModel> {
        void query;
        return await this.reader.last();
    }
}
