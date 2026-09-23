import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGenerationSession1760000000001 implements MigrationInterface {
    name = "AddGenerationSession1760000000001";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "generation_jobs" ADD "sessionId" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_generation_jobs_session_id" ON "generation_jobs" ("sessionId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_generation_jobs_session_id"`);
        await queryRunner.query(`ALTER TABLE "generation_jobs" DROP COLUMN "sessionId"`);
    }
}
