import { BadRequestException } from "@nestjs/common";
import { StoreGenerationJobValidationPipe } from "./StoreGenerationJobValidationPipe";

describe("StoreGenerationJobValidationPipe", () => {
    it("parses form-data strings into a typed request", () => {
        const pipe = new StoreGenerationJobValidationPipe();

        const request = pipe.transform({
            positivePrompt: "forest",
            width: "512",
            height: "768",
            safeMode: "true",
            steps: "20",
            cfg: "7.5",
        });

        expect(request.width).toBe(512);
        expect(request.height).toBe(768);
        expect(request.safeMode).toBe(true);
        expect(request.steps).toBe(20);
        expect(request.cfg).toBe(7.5);
    });

    it("rejects unknown fields", () => {
        const pipe = new StoreGenerationJobValidationPipe();

        expect(() =>
            pipe.transform({
                positivePrompt: "forest",
                width: "512",
                height: "768",
                safeMode: "true",
                extra: "nope",
            }),
        ).toThrow(BadRequestException);
    });
});
