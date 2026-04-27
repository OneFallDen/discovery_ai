import { GenerationJobReadModel } from "../../../Application/Model/GenerationJobReadModel";

export interface IGenerationJobReader {
    get(id: string): Promise<GenerationJobReadModel>;
    last(): Promise<GenerationJobReadModel>;
}

export const GENERATION_JOB_READER = Symbol("IGenerationJobReader");
