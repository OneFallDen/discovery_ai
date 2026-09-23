import { useEffect } from "react";
import type { RefObject } from "react";

type UseInfiniteGenerationOptions = {
    triggerRef: RefObject<HTMLDivElement | null>;
    enabled: boolean;
    canGenerate: boolean;
    onIntersect: () => void;
};

export function useInfiniteGeneration({
    triggerRef,
    enabled,
    canGenerate,
    onIntersect,
}: UseInfiniteGenerationOptions) {
    useEffect(() => {
        if (!triggerRef.current) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && enabled && canGenerate) {
                    onIntersect();
                }
            },
            { rootMargin: "100px", threshold: 0.1 },
        );

        observer.observe(triggerRef.current);
        return () => observer.disconnect();
    }, [canGenerate, enabled, onIntersect, triggerRef]);
}
