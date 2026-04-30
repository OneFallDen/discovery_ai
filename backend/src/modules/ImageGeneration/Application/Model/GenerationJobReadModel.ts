import { GeneratedImageReadModel } from "./GeneratedImageReadModel";

export class GenerationJobReadModel {
    constructor(
        public readonly id: string,
        public readonly status: string,
        public readonly createdAt: Date,
        public readonly images: GeneratedImageReadModel[],
    ) {}
}
