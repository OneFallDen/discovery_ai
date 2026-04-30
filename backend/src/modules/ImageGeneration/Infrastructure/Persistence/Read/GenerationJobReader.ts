import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GenerationJobOrmEntity } from "../Entity/TypeORM/GenerationJobOrmEntity";
import { Repository } from "typeorm";
import { GenerationJobReadModel } from "../../../Application/Model/GenerationJobReadModel";
import { GenerationJobNotFoundException } from "../../Exceptions/GenerationJobNotFoundException";
import { GeneratedImageReadModel } from "../../../Application/Model/GeneratedImageReadModel";
import { IGenerationJobReader } from "../../../Domain/Factories/Contracts/IGenerationJobReader";

@Injectable()
export class GenerationJobReader implements IGenerationJobReader {
    constructor(
        @InjectRepository(GenerationJobOrmEntity)
        private readonly repository: Repository<GenerationJobOrmEntity>,
    ) {}

    public async get(id: string): Promise<GenerationJobReadModel> {
        const model = await this.repository
            .createQueryBuilder("generation_jobs")
            .leftJoinAndSelect("generation_jobs.images", "images")
            .where({ id: id })
            .getOne();

        if (!model) {
            throw new GenerationJobNotFoundException();
        }

        return {
            id: model.id,
            status: model.status.toString(),
            createdAt: model.createdAt,
            images: model.images
                ? model.images.map((image) => {
                      return {
                          id: image.id,
                          filename: image.filename,
                          url: image.url,
                          metadata: image.metadata,
                      } as GeneratedImageReadModel;
                  })
                : [],
        } as GenerationJobReadModel;
    }

    public async getByPromptId(
        promptId: string,
    ): Promise<GenerationJobReadModel> {
        const model = await this.repository
            .createQueryBuilder("generation_jobs")
            .leftJoinAndSelect("generation_jobs.images", "images")
            .where({ comfyPromptId: promptId })
            .getOne();

        if (!model) {
            throw new GenerationJobNotFoundException();
        }

        return {
            id: model.id,
            status: model.status.toString(),
            createdAt: model.createdAt,
            images: model.images
                ? model.images.map((image) => {
                      return {
                          id: image.id,
                          filename: image.filename,
                          url: image.url,
                          metadata: image.metadata,
                      } as GeneratedImageReadModel;
                  })
                : [],
        } as GenerationJobReadModel;
    }

    public async last(): Promise<GenerationJobReadModel> {
        const model = await this.repository
            .createQueryBuilder("generation_jobs")
            .orderBy("id", "DESC")
            .getOne();

        if (!model) {
            throw new GenerationJobNotFoundException();
        }

        return {
            id: model.id,
            status: model.status.toString(),
            createdAt: model.createdAt,
            images: model.images
                ? model.images.map((image) => {
                      return {
                          id: image.id,
                          filename: image.filename,
                          url: image.url,
                          metadata: image.metadata,
                      } as GeneratedImageReadModel;
                  })
                : [],
        } as GenerationJobReadModel;
    }
}
