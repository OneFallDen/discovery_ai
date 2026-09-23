import { useEffect, useState } from "react";
import { connectGenerationSocket } from "../api/generationSocket";
import { normalizeGeneratedImageUrl } from "../api/imageUrl";
import type { ImageEventMessage } from "../types/generation";

type UseImageEventsOptions = {
    onReady: (id: string, url: string) => void;
    onError: (id: string, error?: string) => void;
    onOpen: () => void | Promise<void>;
};

export function useImageEvents({ onReady, onError, onOpen }: UseImageEventsOptions): boolean {
    const [sessionReady, setSessionReady] = useState(false);

    useEffect(() => {
        let stopped = false;
        let stopSocket: (() => void) | undefined;
        let retryTimer: ReturnType<typeof setTimeout> | undefined;
        let delay = 1000;

        const bootstrap = async () => {
            try {
                const response = await fetch("/api/session");
                if (!response.ok) throw new Error(`Session error: ${response.status}`);
                if (stopped) return;
                setSessionReady(true);
                void onOpen();
                stopSocket = connectGenerationSocket({
                    create: () => new WebSocket("/ws"),
                    onOpen: () => void onOpen(),
                    onMessage: (raw) => {
                        try {
                            const data = JSON.parse(raw) as ImageEventMessage;
                            if (!data.id) return;
                            if (data.type === "generation.ready" && data.url) {
                                onReady(data.id, normalizeGeneratedImageUrl(data.url));
                            } else if (data.type === "generation.failed") {
                                onError(data.id, data.error);
                            }
                        } catch (error) {
                            console.error("Invalid generation event", error);
                        }
                    },
                });
            } catch (error) {
                console.error("Generation session unavailable", error);
                if (!stopped) {
                    retryTimer = setTimeout(() => void bootstrap(), delay);
                    delay = Math.min(delay * 2, 30000);
                }
            }
        };

        void bootstrap();
        return () => {
            stopped = true;
            if (retryTimer) clearTimeout(retryTimer);
            stopSocket?.();
        };
    }, [onError, onOpen, onReady]);

    return sessionReady;
}
