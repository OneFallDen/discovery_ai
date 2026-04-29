export class StoreGenerationJobRequest {
    constructor(
        public readonly positivePrompt: string,
        public readonly negativePrompt?: string,
        // @ts-ignore
        public readonly seed: number,
        public readonly width: number,
        public readonly height: number,
        public readonly steps: number,
        public readonly cfg: number,
        public readonly safeMode: boolean,
        public readonly model?: string,
        public readonly sampler?: string,
        public readonly scheduler?: string,
    ) {}
}
