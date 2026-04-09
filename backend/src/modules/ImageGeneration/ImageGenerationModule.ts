import { Module } from "@nestjs/common";
import { CommonModule } from "../Common/CommonModule";
import { BullModule } from "@nestjs/bull";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GenerationJobOrmEntity } from "./Infrastructure/Persistence/Entity/TypeORM/GenerationJobOrmEntity";
import { GeneratedImageOrmEntity } from "./Infrastructure/Persistence/Entity/TypeORM/GeneratedImageOrmEntity";

@Module({
    imports: [
        CommonModule,
        BullModule.registerQueue({
            name: "image_queue",
        }),
        TypeOrmModule.forFeature([
            GenerationJobOrmEntity,
            GeneratedImageOrmEntity,
        ]),
    ],
    providers: [],
    exports: [],
})
export class ImageGenerationModule {}
