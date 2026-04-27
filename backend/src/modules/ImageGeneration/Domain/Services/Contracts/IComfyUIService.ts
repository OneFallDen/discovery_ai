import { ComfyUIImageDTO } from "../../../Infrastructure/DTO/ComfyUIImageDTO";

export interface IComfyUIService {
    queuePrompt(workflow: string): Promise<string>;
    getGeneratedImages(promptId: string): Promise<ComfyUIImageDTO[]>;
}

export const COMFYUI_SERVICE = Symbol("IComfyUIService");
