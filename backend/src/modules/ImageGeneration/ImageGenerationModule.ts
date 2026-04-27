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
import { QueueImageEvent } from "./Infrastructure/Events/QueueImageEvent";
import { GenerationJobFailedUseCase } from "./Application/UseCases/GenerationJobFailedUseCase";
import { GenerationJobQueuedUseCase } from "./Application/UseCases/GenerationJobQueuedUseCase";
import { GenerationJobQueuedCommandHandler } from "./Application/UseCases/Handlers/Commands/GenerationJobQueuedCommandHandler";
import { GenerationJobFailedCommandHandler } from "./Application/UseCases/Handlers/Commands/GenerationJobFailedCommandHandler";
import { GenerationJobFailedCommand } from "./Application/Input/Commands/GenerationJobFailedCommand";
import { GenerationJobQueuedCommand } from "./Application/Input/Commands/GenerationJobQueuedCommand";
import { GenerationJobFailedMapper } from "./Application/Mappers/GenerationJobFailedMapper";
import { GenerationJobQueuedMapper } from "./Application/Mappers/GenerationJobQueuedMapper";
import { ConfigService } from "@nestjs/config";
import WebSocket from "ws";
import { GenerationJobCompletedCommandHandler } from "./Application/UseCases/Handlers/Commands/GenerationJobCompletedCommandHandler";
import { GenerationJobCompletedUseCase } from "./Application/UseCases/GenerationJobCompletedUseCase";
import { GenerationJobCompletedCommand } from "./Application/Input/Commands/GenerationJobCompletedCommand";
import { GenerationJobCompletedMapper } from "./Application/Mappers/GenerationJobCompletedMapper";
import { CompleteGenerationJobUseCase } from "./Application/UseCases/CompleteGenerationJobUseCase";
import { CompleteGenerationJobCommand } from "./Application/Input/Commands/CompleteGenerationJobCommand";
import { CompleteGenerationJobCommandHandler } from "./Application/UseCases/Handlers/Commands/CompleteGenerationJobCommandHandler";
import { CompleteGenerationJobMapper } from "./Application/Mappers/CompleteGenerationJobMapper";
import { CompleteGenerationJobDTO } from "./Application/DTO/CompleteGenerationJobDTO";
import { FailGenerationJobMapper } from "./Application/Mappers/FailGenerationJobMapper";
import { FailGenerationJobCommandHandler } from "./Application/UseCases/Handlers/Commands/FailGenerationJobCommandHandler";
import { FailGenerationJobUseCase } from "./Application/UseCases/FailGenerationJobUseCase";
import { FailGenerationJobCommand } from "./Application/Input/Commands/FailGenerationJobCommand";
import { FailGenerationJobDTO } from "./Application/DTO/FailGenerationJobDTO";

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
        QueueImageEvent,
        GenerationJobFailedUseCase,
        GenerationJobQueuedUseCase,
        GenerationJobFailedMapper,
        GenerationJobQueuedMapper,
        GenerationJobQueuedCommandHandler,
        GenerationJobFailedCommandHandler,
        GenerationJobCompletedCommandHandler,
        GenerationJobCompletedUseCase,
        GenerationJobCompletedMapper,
        CompleteGenerationJobUseCase,
        CompleteGenerationJobCommandHandler,
        CompleteGenerationJobMapper,
        FailGenerationJobMapper,
        FailGenerationJobCommandHandler,
        FailGenerationJobUseCase,
    ],
    exports: [],
    controllers: [GenerationController],
})
export class ImageGenerationModule {
    private ws: WebSocket;

    constructor(
        private readonly commandBus: CommandBus,
        private readonly storeGenerationJobCommandHandler: StoreGenerationJobCommandHandler,
        private readonly queueGenerationJobCommandHandler: QueueGenerationJobCommandHandler,
        private readonly generationJobQueuedCommandHandler: GenerationJobQueuedCommandHandler,
        private readonly generationJobFailedCommandHandler: GenerationJobFailedCommandHandler,
        private readonly generationJobCompletedCommandHandler: GenerationJobCompletedCommandHandler,
        private readonly completeGenerationJobCommandHandler: CompleteGenerationJobCommandHandler,
        private readonly failGenerationJobCommandHandler: FailGenerationJobCommandHandler,
        private readonly completeGenerationJobUseCase: CompleteGenerationJobUseCase,
        private readonly failGenerationJobUseCase: FailGenerationJobUseCase,
        private readonly config: ConfigService,
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
        this.commandBus.register(
            GenerationJobQueuedCommand,
            this.generationJobQueuedCommandHandler,
        );
        this.commandBus.register(
            GenerationJobFailedCommand,
            this.generationJobFailedCommandHandler,
        );
        this.commandBus.register(
            GenerationJobCompletedCommand,
            this.generationJobCompletedCommandHandler,
        );
        this.commandBus.register(
            CompleteGenerationJobCommand,
            this.completeGenerationJobCommandHandler,
        );
        this.commandBus.register(
            FailGenerationJobCommand,
            this.failGenerationJobCommandHandler,
        );

        this.ws = new WebSocket(
            this.config.get<string>("DEFAULT_COMFYUI_WS") ||
                "ws://127.0.0.1:8188/ws",
        );

        this.ws.on("message", async (data: Buffer) => {
            const msg = JSON.parse(data.toString());

            if (
                msg.type === "execution_success" ||
                msg.type === "execution_error"
            ) {
                const promptId = msg.data.prompt_id;

                if (msg.type === "execution_success") {
                    await this.completeGenerationJobUseCase.execute(
                        new CompleteGenerationJobDTO(promptId),
                    );
                    // TODO: send to frontend
                } else {
                    const error = msg.data.exception_message;
                    await this.failGenerationJobUseCase.execute(
                        new FailGenerationJobDTO(promptId, error),
                    );
                }
            }
        });
    }

    onModuleDestroy() {
        this.ws?.close();
    }
}
