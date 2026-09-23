import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import WebSocket from "ws";
import { CompleteGenerationJobUseCase } from "../../Application/UseCases/CompleteGenerationJobUseCase";
import { FailGenerationJobUseCase } from "../../Application/UseCases/FailGenerationJobUseCase";
import { CompleteGenerationJobDTO } from "../../Application/DTO/CompleteGenerationJobDTO";
import { FailGenerationJobDTO } from "../../Application/DTO/FailGenerationJobDTO";

type ComfyUIExecutionMessage = {
    type: "execution_success" | "execution_error";
    data: {
        prompt_id: string;
        exception_message?: string;
    };
};

@Injectable()
export class ComfyUIEventsListener implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(ComfyUIEventsListener.name);
    private ws: WebSocket | null = null;

    constructor(
        private readonly config: ConfigService,
        private readonly completeGenerationJobUseCase: CompleteGenerationJobUseCase,
        private readonly failGenerationJobUseCase: FailGenerationJobUseCase,
    ) {}

    public onModuleInit(): void {
        const base =
            this.config.get<string>("DEFAULT_COMFYUI_WS") ||
            "ws://127.0.0.1:8188/ws";
        const clientId =
            this.config.get<string>("DEFAULT_COMFYUI_CLIENT_ID") ||
            crypto.randomUUID();

        this.ws = new WebSocket(`${base}?clientId=${clientId}`);
        this.ws.on("message", (data: Buffer) => {
            void this.handleMessage(data);
        });
        this.ws.on("error", (error) => {
            this.logger.error("ComfyUI WebSocket error", error.stack);
        });
        this.ws.on("close", () => {
            this.logger.warn("ComfyUI WebSocket connection closed");
        });
    }

    public onModuleDestroy(): void {
        this.ws?.close();
    }

    private async handleMessage(data: Buffer): Promise<void> {
        const msg = this.parseMessage(data);

        if (!msg) {
            return;
        }

        const promptId = msg.data.prompt_id;

        try {
            if (msg.type === "execution_success") {
                await this.completeGenerationJobUseCase.execute(
                    new CompleteGenerationJobDTO(promptId),
                );
                return;
            }

            await this.failGenerationJobUseCase.execute(
                new FailGenerationJobDTO(
                    promptId,
                    msg.data.exception_message || "ComfyUI execution failed",
                ),
            );
        } catch (error) {
            this.logger.error(
                `Failed to handle ComfyUI message for prompt ${promptId}`,
                error instanceof Error ? error.stack : String(error),
            );
        }
    }

    private parseMessage(data: Buffer): ComfyUIExecutionMessage | null {
        try {
            const msg = JSON.parse(data.toString());

            if (
                msg.type !== "execution_success" &&
                msg.type !== "execution_error"
            ) {
                return null;
            }

            if (!msg.data?.prompt_id) {
                this.logger.warn("ComfyUI execution message without prompt_id");
                return null;
            }

            return msg;
        } catch (error) {
            this.logger.warn(
                `Failed to parse ComfyUI message: ${this.getErrorMessage(error)}`,
            );
            return null;
        }
    }

    private getErrorMessage(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }
}
