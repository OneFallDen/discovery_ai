import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CommonModule } from "./modules/Common/CommonModule";
import { ImageGenerationModule } from "./modules/ImageGeneration/ImageGenerationModule";
import { BullModule } from "@nestjs/bull";
import { ConfigModule, ConfigService } from "@nestjs/config";
import Joi from "joi";

@Module({
    imports: [
        CommonModule,
        ImageGenerationModule,
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                POSTGRES_HOST: Joi.string().required(),
                POSTGRES_PORT: Joi.number().default(5432),
                POSTGRES_USER: Joi.string().required(),
                POSTGRES_PASSWORD: Joi.string().required(),
                POSTGRES_DB: Joi.string().required(),
                JWT_ACCESS_SECRET: Joi.string().required(),
                JWT_REFRESH_SECRET: Joi.string().required(),
                JWT_ACCESS_EXPIRES_IN: Joi.string().default("15m"),
                JWT_REFRESH_EXPIRES_IN: Joi.string().default("7d"),
                REDIS_HOST: Joi.string().required(),
                REDIS_PORT: Joi.string().required(),
            }),
        }),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                redis: {
                    host: config.get<string>("REDIS_HOST") ?? "127.0.0.1",
                    port: config.get<number>("REDIS_PORT") ?? 6379,
                },
            }),
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
