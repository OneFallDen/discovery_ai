import { GenerationSessionService } from "./GenerationSessionService";

describe("GenerationSessionService", () => {
    const service = new GenerationSessionService({ getOrThrow: () => "test-secret" } as any);

    it("issues and validates a signed session cookie", () => {
        const response = { cookie: jest.fn() };
        const id = service.issue(response as any, { headers: {} } as any);
        const [name, token, options] = response.cookie.mock.calls[0];

        expect(name).toBe("generation_session");
        expect(options.httpOnly).toBe(true);
        expect(service.require({ headers: { cookie: `${name}=${token}` } } as any)).toBe(id);
    });

    it("rejects forged, expired and missing cookies", () => {
        const response = { cookie: jest.fn() };
        service.issue(response as any, { headers: {} } as any);
        const token: string = response.cookie.mock.calls[0][1];
        expect(() => service.require({ headers: { cookie: `generation_session=${token}0` } } as any)).toThrow();
        expect(() => service.require({ headers: {} } as any)).toThrow();
        const now = jest.spyOn(Date, "now").mockReturnValue(Number(token.split(".")[1]) + 1);
        expect(() => service.require({ headers: { cookie: `generation_session=${token}` } } as any)).toThrow();
        now.mockRestore();
    });
});
