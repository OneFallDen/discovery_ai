import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { GenerationJobOrmEntity } from "./GenerationJobOrmEntity";

@Entity("generated_images")
export class GeneratedImageOrmEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => GenerationJobOrmEntity, (job) => job.images, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "job_id" })
    job: GenerationJobOrmEntity;

    @Column()
    jobId: string;

    @Column()
    filename: string;

    @Column()
    url: string;

    @Column({ type: "jsonb", nullable: true })
    metadata: {
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
    } | null;

    @Column({ default: false })
    isNsfw: boolean;

    @Column({ default: false })
    isFavorite: boolean;
}
