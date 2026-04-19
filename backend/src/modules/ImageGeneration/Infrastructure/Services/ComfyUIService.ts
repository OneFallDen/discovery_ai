import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IComfyUIService } from "../../Domain/Services/Contracts/IComfyUIService";

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
}
