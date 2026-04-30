import { useState } from 'react';

interface ImageCardProps {
    id: string;
    ratio: number;
    status: 'pending' | 'completed';
    imageUrl?: string;
    onClick?: (imageUrl: string) => void;
}

function ImageCard({ id: _id, ratio, status, imageUrl, onClick }: ImageCardProps) {
    const [imgLoaded, setImgLoaded] = useState(false);

    const handleClick = () => {
        if (status === 'completed' && imageUrl && onClick) {
            onClick(imageUrl);
        }
    };

    if (status === 'pending') {
        return (
            <div className="card" style={{ aspectRatio: `${ratio}` }}>
                <div className="card-image" style={{ aspectRatio: `${ratio}` }}>
                    <div className="skeleton" style={{ height: `calc(250px / ${ratio})` }} />
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