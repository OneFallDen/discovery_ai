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
}
