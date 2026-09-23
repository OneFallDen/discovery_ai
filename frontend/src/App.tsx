import { useCallback, useEffect, useRef, useState } from "react";
import ControlsPanel from "./components/ControlsPanel";
import ImageCard from "./components/ImageCard";
import ImageModal from "./components/ImageModal/ImageModal";
import { useGenerationForm } from "./hooks/useGenerationForm";
import { useImageEvents } from "./hooks/useImageEvents";
import { useImageGeneration } from "./hooks/useImageGeneration";
import { useInfiniteGeneration } from "./hooks/useInfiniteGeneration";

function App() {
    const form = useGenerationForm();
    const {
        images,
        isGenerating,
        isGeneratingRef,
        generateOne,
        resetImages,
        markReady,
        markError,
    } = useImageGeneration();
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
        null,
    );
    const [autoLoadEnabled, setAutoLoadEnabled] = useState(false);
    const observerRef = useRef<HTMLDivElement | null>(null);

    useImageEvents({
        onReady: markReady,
        onError: markError,
    });

    const generateCurrent = useCallback(() => {
        void generateOne({
            prompt: form.prompt,
            width: form.width,
            height: form.height,
            ratio: form.ratio,
            isSafe: form.isSafe,
        });
    }, [form.height, form.isSafe, form.prompt, form.ratio, form.width, generateOne]);

    const handleGenerateClick = useCallback(() => {
        resetImages();
        setAutoLoadEnabled(true);
        generateCurrent();
    }, [generateCurrent, resetImages]);

    useEffect(() => {
        if (autoLoadEnabled) {
            setAutoLoadEnabled(false);
        }
    }, [form.prompt]);

    useInfiniteGeneration({
        triggerRef: observerRef,
        enabled: autoLoadEnabled,
        canGenerate: !isGeneratingRef.current && Boolean(form.prompt.trim()),
        onIntersect: generateCurrent,
    });

    const handleImageClick = useCallback((imageUrl: string) => {
        setSelectedImageUrl(imageUrl);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedImageUrl(null);
    }, []);

    return (
        <div className="app">
            <ControlsPanel
                prompt={form.prompt}
                onPromptChange={form.setPrompt}
                ratio={form.ratio}
                onRatioChange={form.onRatioChange}
                isSafe={form.isSafe}
                onSafeToggle={form.onSafeToggle}
                onGenerate={handleGenerateClick}
                isGenerating={isGenerating}
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
                            onClick={handleImageClick}
                        />
                    ))}
                </div>
                <div ref={observerRef} className="scroll-trigger" />
            </main>

            {selectedImageUrl && (
                <ImageModal
                    imageUrl={selectedImageUrl}
                    alt="Generated image"
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}

export default App;
