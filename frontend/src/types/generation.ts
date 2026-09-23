export type GenerationStatus =
    | "pending"
    | "queued"
    | "processing"
    | "ready"
    | "error";

export type ImageItem = {
    id: string;
    status: GenerationStatus;
    url?: string;
    error?: string;
    ratio: number;
};

export type GenerationRequest = {
    positivePrompt: string;
    width: number;
    height: number;
    safeMode: boolean;
};

export type GenerationJobResponse = {
    data: {
        id: string;
        status: GenerationStatus;
    };
    success: boolean;
};

export type ImageEventMessage = {
    type?: "generation.ready" | "generation.failed";
    id?: string;
    url?: string;
    status?: GenerationStatus;
    error?: string;
};
