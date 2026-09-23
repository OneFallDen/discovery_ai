export class StoreGenerationJobRequest {
    constructor(
        public readonly positivePrompt: string,
        public readonly negativePrompt: string | null,
        public readonly seed: number | null,
        public readonly width: number,
        public readonly height: number,
        public readonly steps: number | null,
        public readonly cfg: number | null,
        public readonly safeMode: boolean,
        public readonly model: string | null,
        public readonly sampler: string | null,
        public readonly scheduler: string | null,
    ) {}
}
