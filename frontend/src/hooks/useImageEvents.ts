import { useEffect } from "react";
import { normalizeGeneratedImageUrl } from "../api/imageUrl";
import type { ImageEventMessage } from "../types/generation";

type UseImageEventsOptions = {
    onReady: (id: string, url: string) => void;
    onError: (id: string, error?: string) => void;
};

export function useImageEvents({ onReady, onError }: UseImageEventsOptions) {
    useEffect(() => {
        const ws = new WebSocket("/ws");

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data) as ImageEventMessage;

                if (data.id && data.url) {
                    onReady(data.id, normalizeGeneratedImageUrl(data.url));
                    return;
                }

                if (data.id && data.status === "error") {
                    onError(data.id, data.error);
                }
            } catch (err) {
                console.error("WebSocket error", err);
            }
        };

        return () => ws.close();
    }, [onError, onReady]);
}
