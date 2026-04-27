import {
    Body,
    Controller,
    HttpCode,
    Post,
    UseInterceptors,
} from "@nestjs/common";
import { NoFilesInterceptor } from "@nestjs/platform-express";
import { StoreGenerationJobRequest } from "../Requests/StoreGenerationJobRequest";
import { StoreGenerationJobMapper } from "../Mappers/StoreGenerationJobMapper";
import { StoreGenerationJobDTO } from "../../../Application/DTO/StoreGenerationJobDTO";
import { StoreGenerationJobUseCase } from "../../../Application/UseCases/StoreGenerationJobUseCase";
import { GenerationJobReadModel } from "../../../Application/Model/GenerationJobReadModel";
import { StoreGenerationJobResponse } from "../Responses/StoreGenerationJobResponse";

@Controller()
export class GenerationController {
    constructor(
        private readonly storeGenerationJobMapper: StoreGenerationJobMapper,
        private readonly storeGenerationJobUseCase: StoreGenerationJobUseCase,
    ) {}

    @Post("generate")
    @HttpCode(201)
    @UseInterceptors(NoFilesInterceptor())
    public async generate(
        @Body() request: StoreGenerationJobRequest,
    ): Promise<StoreGenerationJobResponse> {
        const dto: StoreGenerationJobDTO =
            this.storeGenerationJobMapper.map(request);
        const readModel: GenerationJobReadModel =
            await this.storeGenerationJobUseCase.execute(dto);
        return StoreGenerationJobResponse.from(readModel);
    }
}
