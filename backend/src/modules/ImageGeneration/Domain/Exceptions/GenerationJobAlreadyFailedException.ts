import { HttpException, HttpStatus } from "@nestjs/common";

export class GenerationJobAlreadyFailedException extends HttpException {
    constructor() {
        super("Generation job already failed", HttpStatus.BAD_REQUEST);
    }
}
