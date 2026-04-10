import { Module } from "@nestjs/common";
import { CommonModule } from "../Common/CommonModule";
import { BullModule } from "@nestjs/bull";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GenerationJobOrmEntity } from "./Infrastructure/Persistence/Entity/TypeORM/GenerationJobOrmEntity";
import { GeneratedImageOrmEntity } from "./Infrastructure/Persistence/Entity/TypeORM/GeneratedImageOrmEntity";
import { WorkflowService } from "./Infrastructure/Services/WorkflowService";
import { WORKFLOW_SERVICE } from "./Domain/Services/Contracts/IWorkflowService";
import { GENERATION_JOB_REPOSITORY } from "./Domain/Factories/Contracts/IGenerationJobRepository";
import { GenerationJobRepository } from "./Infrastructure/Persistence/Store/GenerationJobRepository";
import { GenerationController } from "./Presentation/Http/Controllers/GenerationController";
import { StoreGenerationJobUseCase } from "./Application/UseCases/StoreGenerationJobUseCase";
import { StoreGenerationJobMapper } from "./Presentation/Http/Mappers/StoreGenerationJobMapper";
import { StoreGenerationJobCommandMapper } from "./Application/Mappers/StoreGenerationJobCommandMapper";

@Module({
    imports: [
        CommonModule,
        BullModule.registerQueue({
            name: "image_queue",
        }),
        TypeOrmModule.forFeature([
            GenerationJobOrmEntity,
            GeneratedImageOrmEntity,
        ]),
    ],
    providers: [
        {
            provide: WORKFLOW_SERVICE,
            useClass: WorkflowService,
        },
        {
            provide: GENERATION_JOB_REPOSITORY,
            useClass: GenerationJobRepository,
        },
        StoreGenerationJobUseCase,
        StoreGenerationJobMapper,
        StoreGenerationJobCommandMapper,
    ],
    exports: [],
    controllers: [GenerationController],
})
export class ImageGenerationModule {}
