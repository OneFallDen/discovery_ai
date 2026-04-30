import { GenerationJob as Aggregate } from "../../Model/Aggregates/GenerationJob";
import { GeneratedImage } from "../../Model/Entities/GeneratedImage";

export interface IGenerationJobRepository {
    store(aggregate: Aggregate): Promise<void>;
    find(id: string): Promise<Aggregate>;
    queue(aggregate: Aggregate): Promise<void>;
    fail(aggregate: Aggregate): Promise<void>;
    complete(aggregate: Aggregate): Promise<void>;
    findByPromptId(promptId: string): Promise<Aggregate>;
}

export const GENERATION_JOB_REPOSITORY = Symbol("IGenerationJobRepository");
