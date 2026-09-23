import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GenerationJobOrmEntity } from "../Entity/TypeORM/GenerationJobOrmEntity";
import { JobStatus } from "../../../Domain/Model/ValueObjects/JobStatus";

@Injectable()
export class GenerationJobStatusReader {
    constructor(
        @InjectRepository(GenerationJobOrmEntity)
        private readonly repository: Repository<GenerationJobOrmEntity>,
    ) {}

    public async forSession(id: string, sessionId: string) {
        const job = await this.repository.findOne({
            where: { id, sessionId },
            relations: { images: true },
        });
        if (!job) return null;
        return {
            id: job.id,
            status: job.status,
            url: job.images?.[0]?.url ?? null,
            error: job.errorMessage,
        };
    }

    public async sessionForJob(id: string): Promise<string | null> {
        const job = await this.repository.findOne({ where: { id } });
        return job?.sessionId ?? null;
    }

    public async queuedJobIdForPrompt(promptId: string): Promise<string | null> {
        const job = await this.repository.findOne({ where: { comfyPromptId: promptId } });
        return job?.status === JobStatus.Queued ? job.id : null;
    }

    public async queuedPromptIds(): Promise<string[]> {
        const jobs = await this.repository.find({ where: { status: JobStatus.Queued } });
        return jobs.map((job) => job.comfyPromptId).filter((id): id is string => !!id);
    }
}
