import { Injectable } from "@nestjs/common";
import {
    IWorkflowService,
    WorkflowRenderParams,
} from "../../Domain/Services/Contracts/IWorkflowService";
import { existsSync, readFileSync } from "fs";
import { join, parse } from "path";

type WorkflowNode = {
    inputs?: Record<string, unknown>;
    class_type?: string;
};

type WorkflowJson = Record<string, WorkflowNode>;

type WorkflowMapping = {
    samplerNodeId: string;
    checkpointNodeId: string;
    latentImageNodeId: string;
    positivePromptNodeId: string;
    negativePromptNodeId: string;
};

@Injectable()
export class WorkflowService implements IWorkflowService {
    private readonly workflowsDir = join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "..",
        "workflows",
    );

    public get(workflow: string): string {
        return readFileSync(this.resolveWorkflowPath(workflow), "utf-8");
    }

    public build(workflow: string, params: WorkflowRenderParams): string {
        const workflowJson = JSON.parse(this.get(workflow)) as WorkflowJson;
        const mapping = this.getMapping(workflow);

        this.ensureNodeInputs(workflowJson, mapping.samplerNodeId);
        this.ensureNodeInputs(workflowJson, mapping.checkpointNodeId);
        this.ensureNodeInputs(workflowJson, mapping.latentImageNodeId);
        this.ensureNodeInputs(workflowJson, mapping.positivePromptNodeId);
        this.ensureNodeInputs(workflowJson, mapping.negativePromptNodeId);

        const samplerInputs = workflowJson[mapping.samplerNodeId].inputs!;
        samplerInputs.seed = params.seed;
        samplerInputs.steps = params.steps;
        samplerInputs.cfg = params.cfg;
        samplerInputs.sampler_name = params.sampler;
        samplerInputs.scheduler = params.scheduler;

        workflowJson[mapping.checkpointNodeId].inputs!.ckpt_name =
            this.normalizeModelName(params.model);

        const latentInputs = workflowJson[mapping.latentImageNodeId].inputs!;
        latentInputs.width = params.width;
        latentInputs.height = params.height;
        latentInputs.batch_size = 1;

        workflowJson[mapping.positivePromptNodeId].inputs!.text =
            params.positivePrompt;
        workflowJson[mapping.negativePromptNodeId].inputs!.text =
            params.negativePrompt ?? "";

        return JSON.stringify(workflowJson);
    }

    private getMapping(workflow: string): WorkflowMapping {
        const filePath = this.resolveMappingPath(workflow);
        const mapping = JSON.parse(readFileSync(filePath, "utf-8"));

        for (const key of [
            "samplerNodeId",
            "checkpointNodeId",
            "latentImageNodeId",
            "positivePromptNodeId",
            "negativePromptNodeId",
        ] as const) {
            if (!mapping[key]) {
                throw new Error(`Workflow mapping ${filePath} misses ${key}`);
            }
        }

        return mapping as WorkflowMapping;
    }

    private ensureNodeInputs(workflow: WorkflowJson, nodeId: string): void {
        if (!workflow[nodeId]?.inputs) {
            throw new Error(`Workflow node ${nodeId} is missing inputs`);
        }
    }

    private normalizeModelName(model?: string): string {
        const modelName = model ?? "";
        return modelName.endsWith(".safetensors")
            ? modelName
            : `${modelName}.safetensors`;
    }

    private resolveWorkflowPath(workflow: string): string {
        const filePath = this.resolveExistingPath([
            this.toWorkflowPath(workflow),
            this.toLegacyWorkflowPath(workflow),
        ]);

        if (!filePath) {
            throw new Error(`Workflow file not found: ${workflow}`);
        }

        return filePath;
    }

    private resolveMappingPath(workflow: string): string {
        const parsed = parse(this.resolveWorkflowPath(workflow));
        const filePath = join(parsed.dir, `${parsed.name}.mapping.json`);

        if (!existsSync(filePath)) {
            throw new Error(`Workflow mapping file not found: ${filePath}`);
        }

        return filePath;
    }

    private toWorkflowPath(workflow: string): string {
        const safeName = this.safeFileName(workflow);
        const filename = safeName.endsWith(".json") ? safeName : `${safeName}.json`;
        return join(this.workflowsDir, filename);
    }

    private toLegacyWorkflowPath(workflow: string): string {
        const safeName = this.safeFileName(workflow).replace(/\.json$/, "");
        return join(this.workflowsDir, `${safeName}_workflow.json`);
    }

    private resolveExistingPath(candidates: string[]): string | null {
        return candidates.find((candidate) => existsSync(candidate)) ?? null;
    }

    private safeFileName(workflow: string): string {
        return workflow.replace(/\\/g, "/").split("/").pop() || workflow;
    }
}
