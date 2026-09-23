export function normalizeGeneratedImageUrl(url: string): string {
    const comfyImageUrl = import.meta.env.VITE_COMFYUI_IMAGE_URL;

    if (!comfyImageUrl) {
        return url;
    }

    return url.replace(comfyImageUrl, `${window.location.origin}/comfyui`);
}
