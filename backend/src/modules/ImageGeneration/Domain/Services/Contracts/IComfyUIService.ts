import { ComfyUIImageDTO } from "../../../Infrastructure/DTO/ComfyUIImageDTO";

export interface IComfyUIService {
    queuePrompt(workflow: string): Promise<string>;
    getGeneratedImages(promptId: string): Promise<ComfyUIImageDTO[]>;
    getPromptOutcome(promptId: string): Promise<"pending" | "success" | { error: string }>;
}

export const COMFYUI_SERVICE = Symbol("IComfyUIService");
