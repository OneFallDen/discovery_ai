import { useState } from 'react';

interface ImageCardProps {
    id: string;
    ratio: number;
    status: 'pending' | 'queued' | 'processing' | 'ready' | 'error';
    imageUrl?: string;
    error?: string;
    onClick?: (imageUrl: string) => void;
}

function ImageCard({ ratio, status, imageUrl, error, onClick }: ImageCardProps) {
    const [imgLoaded, setImgLoaded] = useState(false);

    const handleClick = () => {
        if (status === 'ready' && imageUrl && onClick) {
            onClick(imageUrl);
        }
    };

    if (status !== 'ready') {
        return (
            <div className="card" style={{ aspectRatio: `${ratio}` }}>
                <div className="card-image" style={{ aspectRatio: `${ratio}` }}>
                    {status === 'error' ? (
                        <div className="card-error">
                            {error || 'Generation failed'}
                        </div>
                    ) : (
                        <div className="skeleton" style={{ height: `calc(250px / ${ratio})` }} />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="card" style={{ aspectRatio: `${ratio}` }} onClick={handleClick} role="button" tabIndex={0}>
            <div className="card-image" style={{ aspectRatio: `${ratio}` }}>
                {!imgLoaded && (
                    <div className="skeleton" style={{ height: `calc(250px / ${ratio})` }} />
                )}
                <img
                    src={imageUrl}
                    alt="Generated"
                    style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 1s ease' }}
                    onLoad={() => setImgLoaded(true)}
                />
            </div>
        </div>
    );
}

export default ImageCard;
