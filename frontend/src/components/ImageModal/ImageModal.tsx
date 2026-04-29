import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import "./ImageModal.css";

interface ImageModalProps {
    imageUrl: string;
    alt?: string;
    onClose: () => void;
}

function ImageModal({ imageUrl, alt = "", onClose }: ImageModalProps) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        // Запрещаем скролл страницы под модалкой
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [handleKeyDown]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return createPortal(
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                <button className="modal-close" onClick={onClose} aria-label="Закрыть">
                    ✕
                </button>
                <img src={imageUrl} alt={alt} className="modal-image" />
            </div>
        </div>,
        document.body
    );
}

export default ImageModal;