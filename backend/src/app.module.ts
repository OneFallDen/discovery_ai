import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CommonModule } from "./modules/Common/CommonModule";
import { ImageGenerationModule } from "./modules/ImageGeneration/ImageGenerationModule";

@Module({
    imports: [CommonModule, ImageGenerationModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
