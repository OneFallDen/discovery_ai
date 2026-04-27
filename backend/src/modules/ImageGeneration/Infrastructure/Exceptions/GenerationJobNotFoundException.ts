import { HttpException, HttpStatus } from "@nestjs/common";

export class GenerationJobNotFoundException extends HttpException {
    constructor() {
        super("Generation job not found", HttpStatus.NOT_FOUND);
    }
}
