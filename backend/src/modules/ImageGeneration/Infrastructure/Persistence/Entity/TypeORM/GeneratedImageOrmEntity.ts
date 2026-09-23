import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    type Relation,
} from "typeorm";
import type { GenerationJobOrmEntity } from "./GenerationJobOrmEntity";

@Entity("generated_images")
export class GeneratedImageOrmEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne("GenerationJobOrmEntity", {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "job_id" })
    job: Relation<GenerationJobOrmEntity>;

    @Column({ name: "job_id", type: "uuid" })
    jobId: string;

    @Column()
    filename: string;

    @Column({ type: "text" })
    url: string;

    @Column({ type: "jsonb", nullable: true })
    metadata: {
        positivePrompt: string;
        negativePrompt?: string | null;
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
