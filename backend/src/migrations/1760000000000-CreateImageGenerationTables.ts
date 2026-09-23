import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateImageGenerationTables1760000000000
    implements MigrationInterface
{
    name = "CreateImageGenerationTables1760000000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
        await queryRunner.query(
            `CREATE TYPE "public"."generation_jobs_status_enum" AS ENUM ('pending', 'queued', 'processing', 'ready', 'error', 'cancelled')`,
        );
        await queryRunner.query(`
            CREATE TABLE "generation_jobs" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "status" "public"."generation_jobs_status_enum" NOT NULL,
                "params" jsonb NOT NULL,
                "workflowJson" jsonb NOT NULL,
                "comfyPromptId" character varying(100),
                "errorMessage" text,
                "completedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_generation_jobs_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "generated_images" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "job_id" uuid NOT NULL,
                "filename" character varying NOT NULL,
                "url" text NOT NULL,
                "metadata" jsonb,
                "isNsfw" boolean NOT NULL DEFAULT false,
                "isFavorite" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_generated_images_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(
            `CREATE INDEX "IDX_generation_jobs_status" ON "generation_jobs" ("status")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_generation_jobs_comfy_prompt_id" ON "generation_jobs" ("comfyPromptId")`,
        );
        await queryRunner.query(`
            ALTER TABLE "generated_images"
            ADD CONSTRAINT "FK_generated_images_generation_jobs"
            FOREIGN KEY ("job_id") REFERENCES "generation_jobs"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "generated_images" DROP CONSTRAINT "FK_generated_images_generation_jobs"`,
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_generation_jobs_comfy_prompt_id"`,
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_generation_jobs_status"`,
        );
        await queryRunner.query(`DROP TABLE "generated_images"`);
        await queryRunner.query(`DROP TABLE "generation_jobs"`);
        await queryRunner.query(
            `DROP TYPE "public"."generation_jobs_status_enum"`,
        );
    }
}
