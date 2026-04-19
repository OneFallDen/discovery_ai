import { HttpException, HttpStatus } from "@nestjs/common";

export class GenerationJobNotFoundException extends HttpException {
    constructor() {
        super("Generation jbo not found", HttpStatus.NOT_FOUND);
    }
}
