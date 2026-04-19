export interface IComfyUIService {
    queuePrompt(workflow: string): Promise<string>;
}

export const COMFYUI_SERVICE = Symbol("IComfyUIService");
