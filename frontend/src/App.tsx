import { useCallback, useRef, useState } from "react";
import ControlsPanel from "./components/ControlsPanel";
import ImageCard from "./components/ImageCard";
import ImageModal from "./components/ImageModal/ImageModal";
import { useGenerationForm } from "./hooks/useGenerationForm";
import { useImageEvents } from "./hooks/useImageEvents";
import { useImageGeneration } from "./hooks/useImageGeneration";
import { useInfiniteGeneration } from "./hooks/useInfiniteGeneration";

function App() {
    const form = useGenerationForm();
    const setPrompt = form.setPrompt;
    const {
        images,
        isGenerating,
        generateOne,
        syncJobs,
        markReady,
        markError,
    } = useImageGeneration();
    const sessionReady = useImageEvents({
        onReady: markReady,
        onError: markError,
        onOpen: syncJobs,
    });
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [autoLoadEnabled, setAutoLoadEnabled] = useState(false);
    const observerRef = useRef<HTMLDivElement | null>(null);

    const generateCurrent = useCallback(() => {
        if (!sessionReady) return;
        void generateOne({
            prompt: form.prompt,
            width: form.width,
            height: form.height,
            ratio: form.ratio,
            isSafe: form.isSafe,
        });
    }, [form.height, form.isSafe, form.prompt, form.ratio, form.width, generateOne, sessionReady]);

    const handleGenerateClick = useCallback(() => {
        setAutoLoadEnabled(true);
        generateCurrent();
    }, [generateCurrent]);

    const handlePromptChange = useCallback((value: string) => {
        setAutoLoadEnabled(false);
        setPrompt(value);
    }, [setPrompt]);

    useInfiniteGeneration({
        triggerRef: observerRef,
        enabled: autoLoadEnabled,
        canGenerate: sessionReady && !isGenerating && Boolean(form.prompt.trim()),
        onIntersect: generateCurrent,
    });

    return (
        <div className="app">
            <ControlsPanel
                prompt={form.prompt}
                onPromptChange={handlePromptChange}
                ratio={form.ratio}
                onRatioChange={form.onRatioChange}
                isSafe={form.isSafe}
                onSafeToggle={form.onSafeToggle}
                onGenerate={handleGenerateClick}
                isGenerating={isGenerating || !sessionReady}
            />
            <main className="gallery-container">
                <div className="gallery-grid">
                    {images.map((item) => (
                        <ImageCard
                            key={item.id}
                            id={item.id}
                            ratio={item.ratio}
                            status={item.status}
                            imageUrl={item.url}
                            error={item.error}
                            onClick={setSelectedImageUrl}
                        />
                    ))}
                </div>
                <div ref={observerRef} className="scroll-trigger" />
            </main>

            {selectedImageUrl && (
                <ImageModal
                    imageUrl={selectedImageUrl}
                    alt="Generated image"
                    onClose={() => setSelectedImageUrl(null)}
                />
            )}
        </div>
    );
}

export default App;
