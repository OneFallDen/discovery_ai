export class JobId {
    constructor(
        private readonly id: string
    ) {
    }

    public value(): string
    {
        return this.id;
    }
}