import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { IncomingMessage } from "node:http";
import type { Response } from "express";

@Injectable()
export class GenerationSessionService {
    private readonly cookieName = "generation_session";
    private readonly secret: string;

    constructor(config: ConfigService) {
        this.secret = config.getOrThrow<string>("JWT_ACCESS_SECRET");
    }

    public issue(response: Response, request: IncomingMessage): string {
        const id = randomUUID();
        const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
        const token = `${id}.${expiresAt}.${this.sign(`${id}.${expiresAt}`)}`;
        response.cookie(this.cookieName, token, {
            httpOnly: true,
            sameSite: "strict",
            secure: request.headers["x-forwarded-proto"] === "https" ||
                Boolean((request.socket as { encrypted?: boolean } | undefined)?.encrypted),
            path: "/",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        return id;
    }

    public require(request: IncomingMessage): string {
        const cookies = request.headers.cookie?.split(";") ?? [];
        const raw = cookies
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith(`${this.cookieName}=`))
            ?.slice(this.cookieName.length + 1);
        const [id, expiresAt, signature, extra] = raw?.split(".") ?? [];
        if (!id || !expiresAt || !signature || extra || !/^[0-9a-f-]{36}$/.test(id) ||
            !/^[0-9a-f]{64}$/.test(signature) ||
            !/^\d{13}$/.test(expiresAt) || Number(expiresAt) <= Date.now()) {
            throw new UnauthorizedException("Generation session required");
        }
        const expected = Buffer.from(this.sign(`${id}.${expiresAt}`), "hex");
        const actual = Buffer.from(signature, "hex");
        if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
            throw new UnauthorizedException("Invalid generation session");
        }
        return id;
    }

    private sign(id: string): string {
        return createHmac("sha256", this.secret).update(id).digest("hex");
    }
}
