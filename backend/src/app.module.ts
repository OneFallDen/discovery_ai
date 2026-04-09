import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CommonModule } from "./modules/Common/CommonModule";
import { ImageGenerationModule } from "./modules/ImageGeneration/ImageGenerationModule";
import { BullModule } from "@nestjs/bull";

@Module({
    imports: [
        CommonModule,
        ImageGenerationModule,
        BullModule.forRoot({
            redis: { host: "discovery-ai-redis", port: 6379 },
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
