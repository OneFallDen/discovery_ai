import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommonModule } from "../Common/CommonModule";
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
import { QueueGenerationJobMapper } from "./Application/Mappers/QueueGenerationJobMapper";
import { COMFYUI_SERVICE } from "./Domain/Services/Contracts/IComfyUIService";
import { ComfyUIService } from "./Infrastructure/Services/ComfyUIService";
import { ImageQueueProcessor } from "./Infrastructure/Processors/ImageQueueProcessor";
import { QueueImageEvent } from "./Infrastructure/Events/QueueImageEvent";
import { CompleteGenerationJobUseCase } from "./Application/UseCases/CompleteGenerationJobUseCase";
import { CompleteGenerationJobCommandHandler } from "./Application/UseCases/Handlers/Commands/CompleteGenerationJobCommandHandler";
import { CompleteGenerationJobMapper } from "./Application/Mappers/CompleteGenerationJobMapper";
import { FailGenerationJobMapper } from "./Application/Mappers/FailGenerationJobMapper";
import { FailGenerationJobCommandHandler } from "./Application/UseCases/Handlers/Commands/FailGenerationJobCommandHandler";
import { FailGenerationJobUseCase } from "./Application/UseCases/FailGenerationJobUseCase";
import { GENERATION_JOB_READER } from "./Domain/Factories/Contracts/IGenerationJobReader";
import { GenerationJobReader } from "./Infrastructure/Persistence/Read/GenerationJobReader";
import { GetLastGenerationJobQueryHandler } from "./Application/UseCases/Handlers/Queries/GetLastGenerationJobQueryHandler";
import { GenerationJobQueuedHandler } from "./Application/EventHandlers/GenerationJobQueuedHandler";
import { GenerationJobFailedHandler } from "./Application/EventHandlers/GenerationJobFailedHandler";
import { GenerationJobCompletedHandler } from "./Application/EventHandlers/GenerationJobCompletedHandler";
import { ImageEventsGateway } from "./Presentation/Http/WebSocket/ImageEventsGateway";
import { GetGenerationJobCompletedMessageQueryHandler } from "./Application/UseCases/Handlers/Queries/GetGenerationJobCompletedMessageQueryHandler";
import { ComfyUIEventsListener } from "./Infrastructure/Events/ComfyUIEventsListener";
import { FailGenerationJobByIdUseCase } from "./Application/UseCases/FailGenerationJobByIdUseCase";
import { StoreGenerationJobValidationPipe } from "./Presentation/Http/Pipes/StoreGenerationJobValidationPipe";
import { ComfyUIClientId } from "./Infrastructure/Services/ComfyUIClientId";
import { GenerationSessionService } from "./Infrastructure/Services/GenerationSessionService";
import { GenerationJobStatusReader } from "./Infrastructure/Persistence/Read/GenerationJobStatusReader";

@Module({
    imports: [
        CommonModule,
        CqrsModule,
        BullModule.registerQueue({ name: "image_queue" }),
        TypeOrmModule.forFeature([GenerationJobOrmEntity, GeneratedImageOrmEntity]),
    ],
    providers: [
        { provide: WORKFLOW_SERVICE, useClass: WorkflowService },
        { provide: GENERATION_JOB_REPOSITORY, useClass: GenerationJobRepository },
        { provide: COMFYUI_SERVICE, useClass: ComfyUIService },
        { provide: GENERATION_JOB_READER, useClass: GenerationJobReader },
        StoreGenerationJobUseCase,
        StoreGenerationJobMapper,
        StoreGenerationJobCommandMapper,
        StoreGenerationJobCommandHandler,
        QueueGenerationJobUseCase,
        QueueGenerationJobCommandHandler,
        QueueGenerationJobMapper,
        ImageQueueProcessor,
        QueueImageEvent,
        CompleteGenerationJobUseCase,
        CompleteGenerationJobCommandHandler,
        CompleteGenerationJobMapper,
        FailGenerationJobMapper,
        FailGenerationJobCommandHandler,
        FailGenerationJobUseCase,
        FailGenerationJobByIdUseCase,
        GetLastGenerationJobQueryHandler,
        GenerationJobQueuedHandler,
        GenerationJobFailedHandler,
        GenerationJobCompletedHandler,
        ImageEventsGateway,
        GetGenerationJobCompletedMessageQueryHandler,
        ComfyUIEventsListener,
        StoreGenerationJobValidationPipe,
        ComfyUIClientId,
        GenerationSessionService,
        GenerationJobStatusReader,
    ],
    controllers: [GenerationController],
})
export class ImageGenerationModule {}
