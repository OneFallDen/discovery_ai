import { GenerationJob as Aggregate } from "../../Model/Aggregates/GeneratoinJob";
import { GeneratedImage } from "../../Model/Entities/GeneratedImage";

export interface IGenerationJobRepository {
    store(aggregate: Aggregate): Promise<void>;
    find(id: string): Promise<Aggregate>;
    queue(id: string, comfyUiId: string): Promise<void>;
    fail(id: string, error: string): Promise<void>;
    complete(id: string, images: GeneratedImage[]): Promise<void>;
    findByPromptId(promptId: string): Promise<Aggregate>;
}

export const GENERATION_JOB_REPOSITORY = Symbol("IGenerationJobRepository");
