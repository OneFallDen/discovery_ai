export class ImageId {
    constructor(
        private readonly id: string
    ) {
    }

    public value(): string
    {
        return this.id;
    }
}