import { GenerationJob as Aggregate } from "../../Model/Aggregates/GeneratoinJob";

export interface IGenerationJobRepository {
    store(aggregate: Aggregate): Promise<void>;
    find(id: string): Promise<Aggregate>;
    queue(id: string, comfyUiId: string): Promise<void>;
    fail(id: string, error: string): Promise<void>;
    complete(id: string): Promise<void>;
}

export const GENERATION_JOB_REPOSITORY = Symbol("IGenerationJobRepository");
