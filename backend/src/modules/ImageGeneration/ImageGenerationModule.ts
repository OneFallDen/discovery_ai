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
import { StoreGenerationJobCommandHandler } from "./Application/UseCases/Handlers/Commands/StoreGenerationJobCommandHandler";
import { QueueGenerationJobUseCase } from "./Application/UseCases/QueueGenerationJobUseCase";
import { QueueGenerationJobCommandHandler } from "./Application/UseCases/Handlers/Commands/QueueGenerationJobCommandHandler";
import { CommandBus } from "../Common/Infrastructure/Bus/CommandBus";
import { StoreGenerationJobCommand } from "./Application/Input/Commands/StoreGenerationJobCommand";
import { QueueGenerationJobCommand } from "./Application/Input/Commands/QueueGenerationJobCommand";
import { QueueGenerationJobMapper } from "./Application/Mappers/QueueGenerationJobMapper";
import { COMFYUI_SERVICE } from "./Domain/Services/Contracts/IComfyUIService";
import { ComfyUIService } from "./Infrastructure/Services/ComfyUIService";
import { ImageQueueProcessor } from "./Infrastructure/Processors/ImageQueueProcessor";
import {QueueImageEvent} from "./Infrastructure/Events/QueueImageEvent";

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
        {
            provide: COMFYUI_SERVICE,
            useClass: ComfyUIService,
        },
        StoreGenerationJobUseCase,
        StoreGenerationJobMapper,
        StoreGenerationJobCommandMapper,
        StoreGenerationJobCommandHandler,
        QueueGenerationJobUseCase,
        QueueGenerationJobCommandHandler,
        QueueGenerationJobMapper,
        ImageQueueProcessor,
        QueueImageEvent
    ],
    exports: [],
    controllers: [GenerationController],
})
export class ImageGenerationModule {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly storeGenerationJobCommandHandler: StoreGenerationJobCommandHandler,
        private readonly queueGenerationJobCommandHandler: QueueGenerationJobCommandHandler,
    ) {}

    onModuleInit(): void {
        this.commandBus.register(
            StoreGenerationJobCommand,
            this.storeGenerationJobCommandHandler,
        );
        this.commandBus.register(
            QueueGenerationJobCommand,
            this.queueGenerationJobCommandHandler,
        );
    }
}
