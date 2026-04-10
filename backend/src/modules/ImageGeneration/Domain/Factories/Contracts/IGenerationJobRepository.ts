import { GenerationJob as Aggregate } from "../../Model/Aggregates/GeneratoinJob";

export interface IGenerationJobRepository {
    store(aggregate: Aggregate): Promise<void>;
}

export const GENERATION_JOB_REPOSITORY = Symbol("IGenerationJobRepository");
