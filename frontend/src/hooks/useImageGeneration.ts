import { useCallback, useEffect, useRef, useState } from "react";
import { createGenerationJob } from "../api/generationApi";
import type { ImageItem } from "../types/generation";

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
        } catch (error) {
            console.error("Generation error", error);
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const resetImages = useCallback(() => {
        setImages([]);
    }, []);

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
        resetImages,
        markReady,
        markError,
    };
}
