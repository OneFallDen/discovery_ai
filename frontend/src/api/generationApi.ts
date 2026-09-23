import type { GenerationJobResponse, GenerationRequest } from "../types/generation";

export async function createGenerationJob(
    request: GenerationRequest,
): Promise<GenerationJobResponse> {
    const formData = new FormData();
    formData.append("positivePrompt", request.positivePrompt);
    formData.append("height", String(request.height));
    formData.append("width", String(request.width));
    formData.append("safeMode", String(request.safeMode));

    const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Generation request failed: ${response.status}`);
    }

    return await response.json();
}
