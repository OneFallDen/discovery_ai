import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IComfyUIService } from "../../Domain/Services/Contracts/IComfyUIService";
import { ComfyUIImageDTO } from "../DTO/ComfyUIImageDTO";
import { ComfyUIClientId } from "./ComfyUIClientId";

@Injectable()
export class ComfyUIService implements IComfyUIService {
    private readonly logger = new Logger(ComfyUIService.name);

    private readonly baseUrl: string;
    constructor(private readonly config: ConfigService, private readonly clientId: ComfyUIClientId) {
        this.baseUrl =
            this.config.get<string>("DEFAULT_COMFYUI_URL") ||
            "http://127.0.0.1:8188";
    }

    public async queuePrompt(workflow: string): Promise<string> {
        const response = await fetch(`${this.baseUrl}/prompt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: JSON.parse(workflow),
                client_id: this.clientId.value,
            }),
        });

        if (!response.ok) {
            const body = await response.text();
            this.logger.error(`ComfyUI error ${response.status}: ${body}`);
            throw new Error(`ComfyUI error ${response.status}: ${body}`);
        }
        const { prompt_id } = await response.json();
        return prompt_id;
    }

    public async getGeneratedImages(
        promptId: string,
    ): Promise<ComfyUIImageDTO[]> {
        const response = await fetch(`${this.baseUrl}/history/${encodeURIComponent(promptId)}`);

        if (!response.ok) {
            throw new Error(
                `Failed to fetch history for prompt ${promptId}: ${response.status}`,
            );
        }

        const history = await response.json();

        const jobHistory = history[promptId];
        if (!jobHistory || !jobHistory.outputs) {
            throw new Error(`No outputs found for prompt ${promptId}`);
        }

        const allImages: ComfyUIImageDTO[] = [];

        for (const nodeId in jobHistory.outputs) {
            const nodeOutput = jobHistory.outputs[nodeId];

            if (nodeOutput.images && Array.isArray(nodeOutput.images)) {
                for (const img of nodeOutput.images) {
                    if (img.filename) {
                        allImages.push({
                            filename: img.filename,
                            subfolder: img.subfolder || "",
                            type: img.type || "output",
                            url: this.getImageUrl(
                                img.filename,
                                img.subfolder,
                                img.type,
                            ),
                        } as ComfyUIImageDTO);
                    }
                }
            }
        }

        if (allImages.length === 0) {
            this.logger.warn(
                `No images found in outputs for prompt ${promptId}`,
            );
        }

        return allImages;
    }

    public async getPromptOutcome(promptId: string): Promise<"pending" | "success" | { error: string }> {
        const response = await fetch(`${this.baseUrl}/history/${encodeURIComponent(promptId)}`);
        if (!response.ok) throw new Error(`ComfyUI history error ${response.status}`);
        const history = await response.json();
        const job = history[promptId];
        if (!job?.status?.completed) return "pending";
        if (job.status.status_str === "success") return "success";
        const failure = job.status.messages?.find((entry: unknown[]) => entry[0] === "execution_error");
        return { error: failure?.[1]?.exception_message ?? "ComfyUI execution failed" };
    }

    private getImageUrl(
        filename: string,
        subfolder: string = "",
        type: string = "output",
    ): string {
        const params = new URLSearchParams({
            filename,
            type,
        });
        if (subfolder) {
            params.append("subfolder", subfolder);
        }

        return `${this.baseUrl}/view?${params.toString()}`;
    }
}
