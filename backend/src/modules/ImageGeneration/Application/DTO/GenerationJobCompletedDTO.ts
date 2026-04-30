import { GeneratedImage } from "../../Domain/Model/Entities/GeneratedImage";

export class GenerationJobCompletedDTO {
    constructor(
        public readonly id: string,
        public readonly images: GeneratedImage[],
    ) {}
}
