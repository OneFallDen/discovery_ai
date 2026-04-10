export class Workflow {
    constructor(private readonly workflow: string) {}

    public value(): string {
        return this.workflow;
    }
}
