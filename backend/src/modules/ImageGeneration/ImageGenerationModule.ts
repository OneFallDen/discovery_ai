import { Module } from "@nestjs/common";
import { CommonModule } from "../Common/CommonModule";
import { BullModule } from "@nestjs/bull";

@Module({
    imports: [
        CommonModule,
        BullModule.registerQueue({
            name: "image_queue",
        }),
    ],
    providers: [],
    exports: [],
})
export class ImageGenerationModule {}
