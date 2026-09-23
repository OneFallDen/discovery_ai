import { useCallback, useEffect, useRef, useState } from "react";
import { createGenerationJob } from "../api/generationApi";
import { normalizeGeneratedImageUrl } from "../api/imageUrl";
import type { ImageItem } from "../types/generation";

const STORAGE_KEY = "generationJobs";
type SavedJob = Pick<ImageItem, "id" | "ratio">;

function savedJobs(): SavedJob[] {
    try {
        const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(value)
            ? value.filter((job): job is SavedJob =>
                typeof job?.id === "string" && typeof job?.ratio === "number")
            : [];
    } catch {
        return [];
    }
}

type GenerateParams = {
    prompt: string;
    width: number;
    height: number;
    ratio: number;
    isSafe: boolean;
};

export function useImageGeneration() {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const isGeneratingRef = useRef(false);

    useEffect(() => {
        isGeneratingRef.current = isGenerating;
    }, [isGenerating]);

    const syncJobs = useCallback(async () => {
        const jobs = savedJobs();
        const responses = await Promise.all(jobs.map(async (job) => {
            try {
                const response = await fetch(`/api/generations/${encodeURIComponent(job.id)}`);
                if (response.status === 404) return null;
                if (!response.ok) throw new Error(`Status error: ${response.status}`);
                const { data } = await response.json();
                return {
                    ...job,
                    status: data.status,
                    url: data.url ? normalizeGeneratedImageUrl(data.url) : undefined,
                    error: data.error || undefined,
                } as ImageItem;
            } catch (error) {
                console.error(`Could not load generation ${job.id}`, error);
                return { ...job, status: "pending" } as ImageItem;
            }
        }));
        const valid = responses.filter((job): job is ImageItem => job !== null);
        const checkedIds = new Set(jobs.map(({ id }) => id));
        const retained = savedJobs().filter(({ id }) => !checkedIds.has(id));
        localStorage.setItem(STORAGE_KEY, JSON.stringify([
            ...valid.map(({ id, ratio }) => ({ id, ratio })), ...retained,
        ]));
        setImages((current) => {
            const byId = new Map(current.map((job) => [job.id, job]));
            for (const job of valid) {
                const previous = byId.get(job.id);
                if (previous && (previous.status === "ready" || previous.status === "error") &&
                    job.status !== "ready" && job.status !== "error") continue;
                byId.set(job.id, job);
            }
            return [...byId.values()];
        });
    }, []);

    const generateOne = useCallback(async (params: GenerateParams) => {
        if (!params.prompt.trim() || isGeneratingRef.current) {
            return;
        }

        setIsGenerating(true);
        try {
            const result = await createGenerationJob({
                positivePrompt: params.prompt,
                height: params.height,
                width: params.width,
                safeMode: params.isSafe,
            });
            const { id, status } = result.data;

            setImages((current) => [
                ...current,
                { id, status, ratio: params.ratio, url: undefined },
            ]);
            localStorage.setItem(STORAGE_KEY, JSON.stringify([
                ...savedJobs(), { id, ratio: params.ratio },
            ]));
            void syncJobs();
        } catch (error) {
            console.error("Generation error", error);
        } finally {
            setIsGenerating(false);
        }
    }, [syncJobs]);

    const markReady = useCallback((id: string, url: string) => {
        setImages((current) =>
            current.map((item) =>
                item.id === id ? { ...item, status: "ready", url } : item,
            ),
        );
    }, []);

    const markError = useCallback((id: string, error?: string) => {
        setImages((current) =>
            current.map((item) =>
                item.id === id ? { ...item, status: "error", error } : item,
            ),
        );
    }, []);

    return {
        images,
        isGenerating,
        isGeneratingRef,
        generateOne,
        syncJobs,
        markReady,
        markError,
    };
}
