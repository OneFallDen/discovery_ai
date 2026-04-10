export interface IWorkflowService {
    get(workflow: string): string;
}

export const WORKFLOW_SERVICE = Symbol("IWorkflowService");
