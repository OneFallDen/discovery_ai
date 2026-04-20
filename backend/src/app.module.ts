import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CommonModule } from "./modules/Common/CommonModule";
import { ImageGenerationModule } from "./modules/ImageGeneration/ImageGenerationModule";
import { BullModule } from "@nestjs/bull";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import Joi from "joi";
import { join } from "path";

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
                DEFAULT_GENERATION_STEPS: Joi.string().required(),
                DEFAULT_GENERATION_CFG: Joi.string().required(),
                DEFAULT_GENERATION_MODEL: Joi.string().required(),
                DEFAULT_GENERATION_SAMPLER: Joi.string().required(),
                DEFAULT_GENERATION_SCHEDULER: Joi.string().required(),
                DEFAULT_GENERATION_WORKFLOW: Joi.string().required(),
                DEFAULT_COMFYUI_URL: Joi.string().required(),
                DEFAULT_COMFYUI_WS: Joi.string().required(),
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
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: "postgres",
                host: configService.get("POSTGRES_HOST"),
                port: configService.get("POSTGRES_PORT"),
                username: configService.get("POSTGRES_USER"),
                password: configService.get("POSTGRES_PASSWORD"),
                database: configService.get("POSTGRES_DB"),
                entities: [join(__dirname, "..", "**", "*.entity.{ts,js}")],
                synchronize: true, //should be false at production!
                autoLoadEntities: true,
            }),
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
