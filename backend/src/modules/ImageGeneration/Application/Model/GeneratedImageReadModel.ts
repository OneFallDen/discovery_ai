export class GeneratedImageReadModel {
    constructor(
        public readonly id: string,
        public readonly filename: string,
        public readonly url: string,
        public readonly metadata: {
            positivePrompt: string;
            negativePrompt?: string;
            seed: number;
            width: number;
            height: number;
            steps: number;
            cfg: number;
            nsfwEnabled: boolean;
            model?: string;
            sampler?: string;
            scheduler?: string;
        },
    ) {}
}
