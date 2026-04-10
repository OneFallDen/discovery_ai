export type GenerationParamsJson = {
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
};

export class GenerationParameters {
    constructor(
        private readonly positivePrompt: string,
        private readonly negativePrompt?: string,
        // @ts-ignore
        private readonly seed: number,
        private readonly width: number,
        private readonly height: number,
        private readonly steps: number,
        private readonly cfg: number,
        private readonly nsfwEnabled: boolean,
        private readonly model?: string,
        private readonly sampler?: string,
        private readonly scheduler?: string,
    ) {}

    public getPositivePrompt(): string {
        return this.positivePrompt;
    }

    public getNegativePrompt(): string | undefined {
        return this.negativePrompt;
    }

    public getSeed(): number {
        return this.seed;
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public getSteps(): number {
        return this.steps;
    }

    public getCfg(): number {
        return this.cfg;
    }

    public isNsfwEnabled(): boolean {
        return this.nsfwEnabled;
    }

    public getModel(): string | undefined {
        return this.model;
    }

    public getSampler(): string | undefined {
        return this.sampler;
    }

    public getScheduler(): string | undefined {
        return this.scheduler;
    }

    public toJson(): GenerationParamsJson {
        const json: GenerationParamsJson = {
            positivePrompt: this.positivePrompt,
            seed: this.seed,
            width: this.width,
            height: this.height,
            steps: this.steps,
            cfg: this.cfg,
            nsfwEnabled: this.nsfwEnabled,
        };

        if (this.negativePrompt !== undefined)
            json.negativePrompt = this.negativePrompt;
        if (this.model !== undefined) json.model = this.model;
        if (this.sampler !== undefined) json.sampler = this.sampler;
        if (this.scheduler !== undefined) json.scheduler = this.scheduler;

        return json;
    }
}
