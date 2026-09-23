import { ComfyUIClientId } from "./ComfyUIClientId";
import { ComfyUIService } from "./ComfyUIService";

describe("ComfyUIClientId", () => {
    it("generates one ID when config is empty and uses it in prompt requests", async () => {
        const config = { get: (key: string) => key === "DEFAULT_COMFYUI_CLIENT_ID" ? "" : undefined };
        const clientId = new ComfyUIClientId(config as any);
        const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
            ok: true,
            json: async () => ({ prompt_id: "prompt-1" }),
        } as any);
        try {
            const service = new ComfyUIService(config as any, clientId);
            await service.queuePrompt("{}");
            const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
            expect(clientId.value).toMatch(/^[0-9a-f-]{36}$/);
            expect(body.client_id).toBe(clientId.value);
        } finally {
            fetchMock.mockRestore();
        }
    });

    it("uses an explicitly configured ID", () => {
        const clientId = new ComfyUIClientId({ get: () => " configured-id " } as any);
        expect(clientId.value).toBe("configured-id");
    });

    it("reads success and failure from ComfyUI history for missed events", async () => {
        const service = new ComfyUIService({ get: () => undefined } as any, { value: "client" } as any);
        const fetchMock = jest.spyOn(global, "fetch")
            .mockResolvedValueOnce({ ok: true, json: async () => ({}) } as any)
            .mockResolvedValueOnce({ ok: true, json: async () => ({ prompt: { status: { completed: true, status_str: "success" } } }) } as any)
            .mockResolvedValueOnce({ ok: true, json: async () => ({ prompt: { status: { completed: true, status_str: "error", messages: [["execution_error", { exception_message: "model missing" }]] } } }) } as any);
        try {
            expect(await service.getPromptOutcome("prompt")).toBe("pending");
            expect(await service.getPromptOutcome("prompt")).toBe("success");
            expect(await service.getPromptOutcome("prompt")).toEqual({ error: "model missing" });
        } finally {
            fetchMock.mockRestore();
        }
    });
});
