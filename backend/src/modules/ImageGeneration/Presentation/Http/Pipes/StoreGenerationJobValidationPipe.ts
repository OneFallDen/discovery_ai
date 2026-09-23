import {
    BadRequestException,
    Injectable,
    PipeTransform,
} from "@nestjs/common";
import { StoreGenerationJobRequest } from "../Requests/StoreGenerationJobRequest";

type RawGenerateRequest = Record<string, unknown>;

@Injectable()
export class StoreGenerationJobValidationPipe
    implements PipeTransform<RawGenerateRequest, StoreGenerationJobRequest>
{
    private readonly allowedFields = new Set([
        "positivePrompt",
        "negativePrompt",
        "seed",
        "width",
        "height",
        "steps",
        "cfg",
        "safeMode",
        "model",
        "sampler",
        "scheduler",
    ]);

    public transform(value: RawGenerateRequest): StoreGenerationJobRequest {
        if (!value || typeof value !== "object") {
            throw new BadRequestException("Request body is required");
        }

        this.rejectUnknownFields(value);

        const positivePrompt = this.requiredString(value, "positivePrompt");
        const width = this.requiredInt(value, "width", 64, 4096);
        const height = this.requiredInt(value, "height", 64, 4096);

        return new StoreGenerationJobRequest(
            positivePrompt,
            this.optionalString(value, "negativePrompt"),
            this.optionalInt(value, "seed", 0),
            width,
            height,
            this.optionalInt(value, "steps", 1, 150),
            this.optionalNumber(value, "cfg", 0, 30),
            this.requiredBoolean(value, "safeMode"),
            this.optionalString(value, "model"),
            this.optionalString(value, "sampler"),
            this.optionalString(value, "scheduler"),
        );
    }

    private rejectUnknownFields(value: RawGenerateRequest): void {
        for (const key of Object.keys(value)) {
            if (!this.allowedFields.has(key)) {
                throw new BadRequestException(`Unknown field: ${key}`);
            }
        }
    }

    private requiredString(value: RawGenerateRequest, key: string): string {
        const parsed = this.optionalString(value, key);

        if (!parsed) {
            throw new BadRequestException(`${key} is required`);
        }

        return parsed;
    }

    private optionalString(
        value: RawGenerateRequest,
        key: string,
    ): string | null {
        const raw = value[key];

        if (raw === undefined || raw === null || raw === "") {
            return null;
        }

        if (typeof raw !== "string") {
            throw new BadRequestException(`${key} must be a string`);
        }

        return raw;
    }

    private requiredInt(
        value: RawGenerateRequest,
        key: string,
        min: number,
        max: number,
    ): number {
        const parsed = this.optionalInt(value, key, min, max);

        if (parsed === null) {
            throw new BadRequestException(`${key} is required`);
        }

        return parsed;
    }

    private optionalInt(
        value: RawGenerateRequest,
        key: string,
        min: number,
        max: number = Number.MAX_SAFE_INTEGER,
    ): number | null {
        const parsed = this.optionalNumber(value, key, min, max);

        if (parsed === null) {
            return null;
        }

        if (!Number.isInteger(parsed)) {
            throw new BadRequestException(`${key} must be an integer`);
        }

        return parsed;
    }

    private optionalNumber(
        value: RawGenerateRequest,
        key: string,
        min: number,
        max: number,
    ): number | null {
        const raw = value[key];

        if (raw === undefined || raw === null || raw === "") {
            return null;
        }

        const parsed = Number(raw);

        if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
            throw new BadRequestException(
                `${key} must be a number between ${min} and ${max}`,
            );
        }

        return parsed;
    }

    private requiredBoolean(value: RawGenerateRequest, key: string): boolean {
        const raw = value[key];

        if (raw === true || raw === "true") {
            return true;
        }

        if (raw === false || raw === "false") {
            return false;
        }

        throw new BadRequestException(`${key} must be a boolean`);
    }
}
