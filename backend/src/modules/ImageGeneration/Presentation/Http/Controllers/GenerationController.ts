import { Body, Controller, Post, UseInterceptors } from "@nestjs/common";
import { NoFilesInterceptor } from "@nestjs/platform-express";
import { StoreGenerationJobRequest } from "../Requests/StoreGenerationJobRequest";
import { StoreGenerationJobMapper } from "../Mappers/StoreGenerationJobMapper";
import { StoreGenerationJobDTO } from "../../../Application/DTO/StoreGenerationJobDTO";
import { StoreGenerationJobUseCase } from "../../../Application/UseCases/StoreGenerationJobUseCase";

@Controller()
export class GenerationController {
    constructor(
        private readonly storeGenerationJobMapper: StoreGenerationJobMapper,
        private readonly storeGenerationJobUseCase: StoreGenerationJobUseCase,
    ) {}

    @Post("generate")
    @UseInterceptors(NoFilesInterceptor())
    public async generate(
        @Body() request: StoreGenerationJobRequest,
    ): Promise<void> {
        const dto: StoreGenerationJobDTO =
            this.storeGenerationJobMapper.map(request);
        return this.storeGenerationJobUseCase.execute(dto);
    }
}
