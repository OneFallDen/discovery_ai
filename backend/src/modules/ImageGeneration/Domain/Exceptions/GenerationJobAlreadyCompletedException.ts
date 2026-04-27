import { HttpException, HttpStatus } from "@nestjs/common";

export class GenerationJobAlreadyCompletedException extends HttpException {
    constructor() {
        super("Generation job already completed", HttpStatus.BAD_REQUEST);
    }
}
