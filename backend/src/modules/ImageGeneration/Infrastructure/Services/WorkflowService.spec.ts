import { WorkflowService } from "./WorkflowService";

describe("WorkflowService", () => {
    it("builds a workflow from template and mapping", () => {
        const service = new WorkflowService();

        const workflow = JSON.parse(
            service.build("base.json", {
                positivePrompt: "sunlit mountains",
                negativePrompt: "watermark",
                seed: 123,
                width: 768,
                height: 512,
                steps: 30,
                cfg: 6,
                model: "dream",
                sampler: "euler",
                scheduler: "normal",
            }),
        );

        expect(workflow["3"].inputs.seed).toBe(123);
        expect(workflow["3"].inputs.steps).toBe(30);
        expect(workflow["3"].inputs.cfg).toBe(6);
        expect(workflow["3"].inputs.sampler_name).toBe("euler");
        expect(workflow["3"].inputs.scheduler).toBe("normal");
        expect(workflow["4"].inputs.ckpt_name).toBe("dream.safetensors");
        expect(workflow["5"].inputs.width).toBe(768);
        expect(workflow["5"].inputs.height).toBe(512);
        expect(workflow["6"].inputs.text).toBe("sunlit mountains");
        expect(workflow["7"].inputs.text).toBe("watermark");
    });

    it("throws when a workflow is missing", () => {
        const service = new WorkflowService();

        expect(() => service.get("missing")).toThrow("Workflow file not found");
    });
});
