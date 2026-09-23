import { StoreGenerationJobMapper } from "./StoreGenerationJobMapper";
import { StoreGenerationJobRequest } from "../Requests/StoreGenerationJobRequest";

describe("StoreGenerationJobMapper", () => {
    const config = {
        get: jest.fn((key: string) => {
            const values: Record<string, string | number> = {
                DEFAULT_SAFE_MODE_PROMPT: "safe negative prompt",
                DEFAULT_GENERATION_STEPS: 20,
                DEFAULT_GENERATION_CFG: 7,
                DEFAULT_GENERATION_MODEL: "base-model",
                DEFAULT_GENERATION_SAMPLER: "euler",
                DEFAULT_GENERATION_SCHEDULER: "normal",
            };

            return values[key];
        }),
    };

    it("injects the safe prompt when safe mode is enabled", () => {
        const mapper = new StoreGenerationJobMapper(config as any);
        const request = {
            positivePrompt: "forest",
            width: 512,
            height: 512,
            safeMode: true,
        } as StoreGenerationJobRequest;

        const dto = mapper.map(request);

        expect(dto.negativePrompt).toBe("safe negative prompt");
        expect(dto.nsfwEnabled).toBe(false);
    });

    it("keeps user negative prompt when safe mode is disabled", () => {
        const mapper = new StoreGenerationJobMapper(config as any);
        const request = {
            positivePrompt: "forest",
            negativePrompt: "watermark",
            width: 512,
            height: 512,
            safeMode: false,
        } as StoreGenerationJobRequest;

        const dto = mapper.map(request);

        expect(dto.negativePrompt).toBe("watermark");
        expect(dto.nsfwEnabled).toBe(true);
    });
});
