import { GenerationJobReadModel } from "../../../Application/Model/GenerationJobReadModel";

export class StoreGenerationJobResponse {
    public readonly data: {
        id: string;
        status: string;
    };
    public readonly success: boolean = true;

    private constructor(model: GenerationJobReadModel) {
        this.data = {
            id: model.id,
            status: model.status,
        };
    }

    static from(model: GenerationJobReadModel): StoreGenerationJobResponse {
        return new StoreGenerationJobResponse(model);
    }
}
