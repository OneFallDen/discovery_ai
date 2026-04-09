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
    params: {
        positivePrompt: string;
        negativePrompt?: string;
        seed: number;
        width: number;
        height: number;
        steps: number;
        cfg: number;
        nsfwEnabled: boolean;
        model?: string;
        sampler?: string;
        scheduler?: string;
    };

    @Column({ type: "jsonb", nullable: false })
    workflowJson: Record<string, any>; // полный workflow для ComfyUI

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
