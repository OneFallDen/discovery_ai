export type WorkflowRenderParams = {
    positivePrompt: string;
    negativePrompt?: string | null;
    seed: number;
    width: number;
    height: number;
    steps: number;
    cfg: number;
    model?: string;
    sampler?: string;
    scheduler?: string;
};

export interface IWorkflowService {
    get(workflow: string): string;
    build(workflow: string, params: WorkflowRenderParams): string;
}

export const WORKFLOW_SERVICE = Symbol("IWorkflowService");
