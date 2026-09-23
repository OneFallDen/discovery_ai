import "./App.css";
import ControlsPanel from "./components/ControlsPanel";
import ImageCard from "./components/ImageCard";
import { useCallback, useState, useEffect, useRef } from "react";
import ImageModal from "./components/ImageModal/ImageModal.tsx";
import { connectGenerationSocket } from "./api/generationSocket.ts";

interface ImageItem {
    id: string;
    status: "pending" | "completed" | "error";
    url?: string;
    error?: string;
    ratio: number;
}

const STORAGE_KEY = "generationJobs";

function savedJobs(): Pick<ImageItem, "id" | "ratio">[] {
    try {
        const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(value)
            ? value.filter((job) => typeof job.id === "string" && typeof job.ratio === "number")
            : [];
    } catch {
        return [];
    }
}

function displayUrl(url: string): string {
    const base = import.meta.env.VITE_COMFYUI_IMAGE_URL;
    return base ? url.replace(base, `${window.location.origin}/comfyui`) : url;
}

function App() {
    const [prompt, setPrompt] = useState("");
    const [ratio, setRatio] = useState(1);
    const [width, setWidth] = useState(665);
    const [height, setHeight] = useState(665);
    const [isSafe, setIsSafe] = useState(true);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

    const [images, setImages] = useState<ImageItem[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    const [autoLoadEnabled, setAutoLoadEnabled] = useState(false);

    const onRatioChange = (ratio: number, width: number, height: number) => {
        setRatio(ratio);
        setWidth(width);
        setHeight(height);
    };

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
                    id: job.id,
                    ratio: job.ratio,
                    status: data.status === "ready" ? "completed" : data.status === "error" ? "error" : "pending",
                    url: data.url ? displayUrl(data.url) : undefined,
                    error: data.error || undefined,
                } as ImageItem;
            } catch (error) {
                console.error(`Could not load generation ${job.id}`, error);
                return { ...job, status: "pending" } as ImageItem;
            }
        }));
        const valid = responses.filter((job): job is ImageItem => job !== null);
        const checkedIds = new Set(jobs.map(({ id }) => id));
        const latest = savedJobs();
        const retained = latest.filter(({ id }) => !checkedIds.has(id));
        const nextSaved = [...valid.map(({ id, ratio }) => ({ id, ratio })), ...retained];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSaved));
        setImages((current) => {
            const byId = new Map(current.map((job) => [job.id, job]));
            valid.forEach((job) => {
                const previous = byId.get(job.id);
                if (job.status === "pending" && previous && previous.status !== "pending") return;
                byId.set(job.id, job);
            });
            return [...byId.values()];
        });
    }, []);

    useEffect(() => {
        let stopped = false;
        let stopSocket = () => {};
        let timer: ReturnType<typeof setTimeout> | null = null;
        let delay = 1000;
        const onMessage = (raw: string) => {
                try {
                    const data = JSON.parse(raw);
                    if (typeof data.id !== "string") return;
                    setImages((current) => current.map((job) => {
                        if (job.id !== data.id) return job;
                        if (data.type === "generation.ready" && typeof data.url === "string") {
                            return { ...job, status: "completed", url: displayUrl(data.url) };
                        }
                        if (data.type === "generation.failed") {
                            return { ...job, status: "error", error: String(data.error || "Generation failed") };
                        }
                        return job;
                    }));
                } catch (error) {
                    console.error("Invalid generation event", error);
                }
        };
        const start = async () => {
            try {
                const response = await fetch("/api/session");
                if (!response.ok) throw new Error(`Session error: ${response.status}`);
                if (stopped) return;
                setSessionReady(true);
                await syncJobs();
                if (stopped) return;
                stopSocket = connectGenerationSocket({
                    create: () => new WebSocket("/ws"),
                    onOpen: () => void syncJobs(),
                    onMessage,
                });
            } catch (error) {
                console.error("Generation session unavailable", error);
                if (!stopped) {
                    timer = setTimeout(() => void start(), delay);
                    delay = Math.min(delay * 2, 30000);
                }
            }
        };
        void start();
        return () => {
            stopped = true;
            if (timer) clearTimeout(timer);
            stopSocket();
        };
    }, [syncJobs]);

    const generateOne = useCallback(async () => {
        if (!prompt.trim() || isGeneratingRef.current || !sessionReady) return;

        setIsGenerating(true);
        try {
            const formData = new FormData();
            formData.append("positivePrompt", prompt);
            formData.append("height", String(height));
            formData.append("width", String(width));
            formData.append("safeMode", String(isSafe));

            const response = await fetch("/api/generate", {
                method: "POST",
                body: formData,
            });
            if (!response.ok) throw new Error(`Generation error: ${response.status}`);
            const result = await response.json();
            const { id, status } = result.data;

            setImages(prev => [...prev, { id, status, ratio, url: undefined }]);
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...savedJobs(), { id, ratio }]));
            void syncJobs();
        } catch (error) {
            console.error("Generation error", error);
        } finally {
            setIsGenerating(false);
        }
    }, [prompt, ratio, width, height, isSafe, sessionReady, syncJobs]);

    const handleGenerateClick = useCallback(() => {
        setAutoLoadEnabled(true);
        generateOne();
    }, [generateOne]);

    useEffect(() => {
        if (autoLoadEnabled) {
            setAutoLoadEnabled(false);
        }
    }, [prompt]);

    const observerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!observerRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    !isGeneratingRef.current &&
                    autoLoadEnabled &&
                    prompt.trim()
                ) {
                    generateOne();
                }
            },
            { rootMargin: "100px", threshold: 0.1 }
        );
        observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [generateOne, autoLoadEnabled, prompt, images.length]);

    const handleImageClick = useCallback((imageUrl: string) => {
        setSelectedImageUrl(imageUrl);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedImageUrl(null);
    }, []);

    return (
        <div className="app">
            <ControlsPanel
                prompt={prompt}
                onPromptChange={setPrompt}
                ratio={ratio}
                onRatioChange={onRatioChange}
                isSafe={isSafe}
                onSafeToggle={() => setIsSafe(prev => !prev)}
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
