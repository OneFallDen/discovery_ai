export class ComfyUIImageDTO {
    constructor(
        public readonly filename: string,
        public readonly subfolder: string = "",
        public readonly type: string = "output",
        public readonly url: string,
    ) {}
}
