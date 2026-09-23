import { Inject, Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import WebSocket from "ws";
import { ComfyUIClientId } from "../Services/ComfyUIClientId";
import { GenerationJobStatusReader } from "../Persistence/Read/GenerationJobStatusReader";
import { CompleteGenerationJobUseCase } from "../../Application/UseCases/CompleteGenerationJobUseCase";
import { FailGenerationJobUseCase } from "../../Application/UseCases/FailGenerationJobUseCase";
import { CompleteGenerationJobDTO } from "../../Application/DTO/CompleteGenerationJobDTO";
import { FailGenerationJobDTO } from "../../Application/DTO/FailGenerationJobDTO";
import { COMFYUI_SERVICE, type IComfyUIService } from "../../Domain/Services/Contracts/IComfyUIService";

@Injectable()
export class ComfyUIEventsListener implements OnApplicationBootstrap, OnModuleDestroy {
    private readonly logger = new Logger(ComfyUIEventsListener.name);
    private ws: WebSocket | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private reconcileTimer: ReturnType<typeof setInterval> | null = null;
    private reconnectDelay = 1000;
    private stopped = false;
    private reconciling = false;
    private readonly processing = new Set<string>();

    constructor(
        private readonly config: ConfigService,
        private readonly clientId: ComfyUIClientId,
        private readonly jobs: GenerationJobStatusReader,
        @Inject(COMFYUI_SERVICE) private readonly comfyUI: IComfyUIService,
        private readonly complete: CompleteGenerationJobUseCase,
        private readonly fail: FailGenerationJobUseCase,
    ) {}

    public onApplicationBootstrap(): void {
        this.connect();
        this.reconcileTimer = setInterval(() => void this.reconcile(), 10000);
    }

    public onModuleDestroy(): void {
        this.stopped = true;
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        if (this.reconcileTimer) clearInterval(this.reconcileTimer);
        this.ws?.removeAllListeners();
        this.ws?.terminate();
        this.ws = null;
    }

    private connect(): void {
        if (this.stopped || this.ws) return;
        const url = new URL(this.config.get<string>("DEFAULT_COMFYUI_WS") || "ws://127.0.0.1:8188/ws");
        url.searchParams.set("clientId", this.clientId.value);
        const ws = new WebSocket(url);
        this.ws = ws;
        ws.on("open", () => {
            this.reconnectDelay = 1000;
            void this.reconcile();
        });
        ws.on("message", (data) => void this.onMessage(data.toString()));
        ws.on("error", (error) => {
            this.logger.warn(`ComfyUI WebSocket error: ${error.message}`);
            ws.terminate();
        });
        ws.on("close", () => {
            if (this.ws !== ws) return;
            this.ws = null;
            if (this.stopped) return;
            this.reconnectTimer = setTimeout(() => {
                this.reconnectTimer = null;
                this.connect();
            }, this.reconnectDelay);
            this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
        });
    }

    private async onMessage(raw: string): Promise<void> {
        try {
            const message = JSON.parse(raw);
            const promptId = message.data?.prompt_id;
            if (typeof promptId !== "string") return;
            if (message.type === "execution_success") {
                await this.process(promptId, "success");
            } else if (message.type === "execution_error") {
                await this.process(promptId, { error: String(message.data.exception_message ?? "ComfyUI execution failed") });
            }
        } catch (error) {
            this.logger.warn(`Could not process ComfyUI event: ${String(error)}`);
        }
    }

    private async reconcile(): Promise<void> {
        if (this.stopped || this.reconciling || this.ws?.readyState !== WebSocket.OPEN) return;
        this.reconciling = true;
        try {
            for (const promptId of await this.jobs.queuedPromptIds()) {
                try {
                    const outcome = await this.comfyUI.getPromptOutcome(promptId);
                    if (outcome !== "pending") await this.process(promptId, outcome);
                } catch (error) {
                    this.logger.warn(`Could not reconcile prompt ${promptId}: ${String(error)}`);
                }
            }
        } catch (error) {
            this.logger.warn(`Could not reconcile ComfyUI jobs: ${String(error)}`);
        } finally {
            this.reconciling = false;
        }
    }

    private async process(promptId: string, outcome: "success" | { error: string }): Promise<void> {
        if (this.processing.has(promptId)) return;
        this.processing.add(promptId);
        try {
            if (!await this.jobs.queuedJobIdForPrompt(promptId)) return;
            if (outcome === "success") {
                await this.complete.execute(new CompleteGenerationJobDTO(promptId));
            } else {
                await this.fail.execute(new FailGenerationJobDTO(promptId, outcome.error));
            }
        } finally {
            this.processing.delete(promptId);
        }
    }
}
