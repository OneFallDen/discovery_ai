import {
    Body,
    Controller,
    HttpCode,
    Post,
    Get,
    Param,
    Req,
    Res,
    NotFoundException,
    Header,
    UseInterceptors,
    UsePipes,
} from "@nestjs/common";
import { NoFilesInterceptor } from "@nestjs/platform-express";
import { StoreGenerationJobRequest } from "../Requests/StoreGenerationJobRequest";
import { StoreGenerationJobMapper } from "../Mappers/StoreGenerationJobMapper";
import { StoreGenerationJobDTO } from "../../../Application/DTO/StoreGenerationJobDTO";
import { StoreGenerationJobUseCase } from "../../../Application/UseCases/StoreGenerationJobUseCase";
import { GenerationJobReadModel } from "../../../Application/Model/GenerationJobReadModel";
import { StoreGenerationJobResponse } from "../Responses/StoreGenerationJobResponse";
import type { Request, Response } from "express";
import { GenerationSessionService } from "../../../Infrastructure/Services/GenerationSessionService";
import { GenerationJobStatusReader } from "../../../Infrastructure/Persistence/Read/GenerationJobStatusReader";
import { StoreGenerationJobValidationPipe } from "../Pipes/StoreGenerationJobValidationPipe";

@Controller()
export class GenerationController {
    constructor(
        private readonly storeGenerationJobMapper: StoreGenerationJobMapper,
        private readonly storeGenerationJobUseCase: StoreGenerationJobUseCase,
        private readonly sessions: GenerationSessionService,
        private readonly statusReader: GenerationJobStatusReader,
    ) {}

    @Get("session")
    @Header("Cache-Control", "no-store")
    public session(@Req() request: Request, @Res() response: Response): void {
        try {
            this.sessions.require(request);
        } catch {
            this.sessions.issue(response, request);
        }
        response.status(204).send();
    }

    @Get("generations/:id")
    @Header("Cache-Control", "no-store")
    public async status(@Req() request: Request, @Param("id") id: string) {
        const sessionId = this.sessions.require(request);
        const job = await this.statusReader.forSession(id, sessionId);
        if (!job) throw new NotFoundException();
        return { success: true, data: job };
    }

    @Post("generate")
    @HttpCode(201)
    @UseInterceptors(NoFilesInterceptor())
    @UsePipes(StoreGenerationJobValidationPipe)
    public async generate(
        @Req() httpRequest: Request,
        @Body() request: StoreGenerationJobRequest,
    ): Promise<StoreGenerationJobResponse> {
        const sessionId = this.sessions.require(httpRequest);
        const dto: StoreGenerationJobDTO =
            this.storeGenerationJobMapper.map(request);
        const readModel: GenerationJobReadModel =
            await this.storeGenerationJobUseCase.execute(dto, sessionId);
        return StoreGenerationJobResponse.from(readModel);
    }
}
