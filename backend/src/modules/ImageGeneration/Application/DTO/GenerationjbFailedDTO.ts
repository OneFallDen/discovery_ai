export class GenerationJobFailedDTO {
    constructor(
        public readonly id: string,
        public readonly error: string,
    ) {
    }
}