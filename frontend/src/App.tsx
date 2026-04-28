import './App.css';
import ControlsPanel from './components/ControlsPanel';
import ImageCard from './components/ImageCard';
import { useCallback, useState, useEffect, useRef } from 'react';

interface ImageItem {
    id: string;
    status: 'pending' | 'completed';
    url?: string;
    ratio: number;
}

function App() {
    const [prompt, setPrompt] = useState('');
    const [ratio, setRatio] = useState(1);
    const [isSafe, setIsSafe] = useState(true);

    const [images, setImages] = useState<ImageItem[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [autoLoadEnabled, setAutoLoadEnabled] = useState(false);

    const isGeneratingRef = useRef(false);

    useEffect(() => {
        isGeneratingRef.current = isGenerating;
    }, [isGenerating]);

    useEffect(() => {
        const ws = new WebSocket('ws://discovery-ai-backend:3000/ws');
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.id && data.url) {
                    setImages(prev =>
                        prev.map(item =>
                            item.id === data.id
                                ? { ...item, status: 'completed', url: data.url }
                                : item
                        )
                    );
                }
            } catch (err) {
                console.error('WebSocket error', err);
            }
        };
        return () => ws.close();
    }, []);

    const generateOne = useCallback(async () => {
        if (!prompt.trim() || isGeneratingRef.current) return;

        setIsGenerating(true);
        try {
            const formData = new FormData();
            formData.append('positivePrompt', prompt);
            formData.append('height', "512");
            formData.append('width', "512");
            formData.append('nsfwEnabled', String(!isSafe));

            const response = await fetch('/api/generate', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            const { id, status } = result.data;

            setImages(prev => [...prev, { id, status, ratio, url: undefined }]);
        } catch (error) {
            console.error('Generation error', error);
        } finally {
            setIsGenerating(false);
        }
    }, [prompt, ratio, isSafe]);

    const handleGenerateClick = useCallback(() => {
        setImages([]);
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
            { rootMargin: '100px', threshold: 0.1 }
        );
        observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [generateOne, autoLoadEnabled, prompt, images.length]);

    return (
        <div className="app">
            <ControlsPanel
                prompt={prompt}
                onPromptChange={setPrompt}
                ratio={ratio}
                onRatioChange={setRatio}
                isSafe={isSafe}
                onSafeToggle={() => setIsSafe(prev => !prev)}
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
                        />
                    ))}
                </div>
                <div ref={observerRef} className="scroll-trigger" />
            </main>
        </div>
    );
}

export default App;