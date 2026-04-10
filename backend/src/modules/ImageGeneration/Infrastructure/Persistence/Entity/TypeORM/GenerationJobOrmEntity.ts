import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Index,
} from "typeorm";
import { JobStatus } from "../../../../Domain/Model/ValueObjects/JobStatus";
import { GeneratedImageOrmEntity } from "./GeneratedImageOrmEntity";
import * as GenerationParameters from "../../../../Domain/Model/ValueObjects/GenerationParameters";

@Entity("generation_jobs")
@Index(["status"]) // TODO: add "userId" on auth complete
@Index(["comfyPromptId"])
export class GenerationJobOrmEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    // @Column({ type: "uuid", nullable: true }) // TODO: uncomment on auth complete
    // userId: string | null;

    @Column({
        type: "enum",
        enum: JobStatus,
    })
    status: JobStatus;

    @Column({ type: "jsonb", nullable: false })
    params: GenerationParameters.GenerationParamsJson;

    @Column({ type: "jsonb", nullable: false })
    workflowJson: Record<string, any>;

    @Column({ type: "varchar", length: 100, nullable: true })
    comfyPromptId: string | null;

    @Column({ type: "text", nullable: true })
    errorMessage: string | null;

    @Column({ type: "timestamp", nullable: true })
    completedAt: Date | null;

    @OneToMany(() => GeneratedImageOrmEntity, (image) => image.job, {
        cascade: true,
        eager: false,
    })
    images: GeneratedImageOrmEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    isCompleted(): boolean {
        return this.status === JobStatus.Ready;
    }

    hasError(): boolean {
        return this.status === JobStatus.Error;
    }
}
