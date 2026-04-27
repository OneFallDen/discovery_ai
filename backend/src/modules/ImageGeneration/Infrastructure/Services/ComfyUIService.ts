import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IComfyUIService } from "../../Domain/Services/Contracts/IComfyUIService";
import { ComfyUIImageDTO } from "../DTO/ComfyUIImageDTO";

@Injectable()
export class ComfyUIService implements IComfyUIService {
    private readonly baseUrl: string;

    constructor(private readonly config: ConfigService) {
        this.baseUrl =
            this.config.get<string>("DEFAULT_COMFYUI_URL") ||
            "http://127.0.0.1:8188";
    }

    public async queuePrompt(workflow: string): Promise<string> {
        const response = await fetch(`${this.baseUrl}/prompt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: JSON.parse(workflow) }),
        });

        console.error(new Error("ComfyUI error"));

        if (!response.ok) throw new Error("ComfyUI error");
        const { prompt_id } = await response.json();
        return prompt_id;
    }

    public async getGeneratedImages(
        promptId: string,
    ): Promise<ComfyUIImageDTO[]> {
        const response = await fetch(`${this.baseUrl}/history/${promptId}`);

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
            console.warn(`No images found in outputs for prompt ${promptId}`);
        }

        return allImages;
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
