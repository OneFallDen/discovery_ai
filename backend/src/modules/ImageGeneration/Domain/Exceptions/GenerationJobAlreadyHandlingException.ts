import { HttpException, HttpStatus } from "@nestjs/common";

export class GenerationJobAlreadyHandlingException extends HttpException {
    constructor() {
        super(
            "Can`t queue generation job: It`s already handling",
            HttpStatus.BAD_REQUEST,
        );
    }
}
