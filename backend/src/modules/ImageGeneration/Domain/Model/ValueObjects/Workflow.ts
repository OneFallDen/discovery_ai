export class Workflow {
    constructor(private readonly workflow: string) {}

    public value(): string {
        return this.workflow;
    }

    public static fromJson(json: Record<string, any>): Workflow {
        return new Workflow(JSON.stringify(json));
    }
}
