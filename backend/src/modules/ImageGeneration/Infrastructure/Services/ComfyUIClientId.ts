import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";

@Injectable()
export class ComfyUIClientId {
    public readonly value: string;

    constructor(config: ConfigService) {
        this.value = config.get<string>("DEFAULT_COMFYUI_CLIENT_ID")?.trim() || randomUUID();
    }
}
