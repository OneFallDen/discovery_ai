import { useCallback, useState } from "react";

export function useGenerationForm() {
    const [prompt, setPrompt] = useState("");
    const [ratio, setRatio] = useState(1);
    const [width, setWidth] = useState(665);
    const [height, setHeight] = useState(665);
    const [isSafe, setIsSafe] = useState(true);

    const onRatioChange = useCallback(
        (nextRatio: number, nextWidth: number, nextHeight: number) => {
            setRatio(nextRatio);
            setWidth(nextWidth);
            setHeight(nextHeight);
        },
        [],
    );

    const onSafeToggle = useCallback(() => {
        setIsSafe((current) => !current);
    }, []);

    return {
        prompt,
        setPrompt,
        ratio,
        width,
        height,
        isSafe,
        onRatioChange,
        onSafeToggle,
    };
}
