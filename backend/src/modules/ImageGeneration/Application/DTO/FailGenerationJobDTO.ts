export class FailGenerationJobDTO {
    constructor(
        public readonly promptId: string,
        public readonly error: string,
    ) {}
}
