import { Injectable } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";
import { Job } from "bullmq";
import { QueueGenerationJobDTO } from "../../Application/DTO/QueueGenerationJobDTO";
import { QueueImageEvent } from "../Events/QueueImageEvent";

@Processor("image_queue")
@Injectable()
export class ImageQueueProcessor {
    constructor(private readonly queueImageEvent: QueueImageEvent) {}

    @Process("queue_image")
    public async queueImage(job: Job<QueueGenerationJobDTO>) {
        await this.queueImageEvent.handle(job);
    }
}
