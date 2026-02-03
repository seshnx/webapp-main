import React, { useState, useEffect, useRef } from 'react';

/**
 * Image data interface
 */
interface ImageData {
    id: string;
    url: string;
    order: number;
}

/**
 * Pan direction interface
 */
interface PanDirection {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

/**
 * Props for AuthWizardBackground component
 */
export interface AuthWizardBackgroundProps {
    onImagesLoaded?: (loaded: boolean) => void;
}

export default function AuthWizardBackground({ onImagesLoaded }: AuthWizardBackgroundProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [imagesReady, setImagesReady] = useState<boolean>(false);
  const [panDirection, setPanDirection] = useState<PanDirection>({ startX: 0, startY: 0, endX: 0, endY: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Static curated images to replace Firestore dependency
    const staticImages: ImageData[] = [
      { id: '1', url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80', order: 0 },
      { id: '2', url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&q=80', order: 1 },
      { id: '3', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920&q=80', order: 2 },
      { id: '4', url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1920&q=80', order: 3 },
    ];
    setImages(staticImages);
  }, []);

  useEffect(() => {
    if (images.length === 0) return;
    const directions: PanDirection[] = [
      { startX: 0, startY: 0, endX: 100, endY: 0 }, // Left to Right
      { startX: 100, startY: 0, endX: 0, endY: 0 }, // Right to Left
      { startX: 0, startY: 0, endX: 0, endY: 100 }, // Top to Bottom
      { startX: 0, startY: 100, endX: 0, endY: 0 }, // Bottom to Top
    ];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    setPanDirection(randomDirection);
  }, [currentImageIndex, images.length]);

  useEffect(() => {
    if (images.length === 0) return;
    const displayDuration = 30000;
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, displayDuration);
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [images.length]);

  useEffect(() => {
    if (images.length > 0 && !imagesReady) {
      const img = new Image();
      img.onload = () => { setImagesReady(true); if (onImagesLoaded) onImagesLoaded(true); };
      img.onerror = () => { setImagesReady(true); if (onImagesLoaded) onImagesLoaded(true); };
      img.src = images[0].url;
    }
  }, [images, imagesReady, onImagesLoaded]);

  if (images.length === 0) return null;

  const currentImage = images[currentImageIndex];
  const zoomLevel = 1.8;
  const maxPanPercent = 30;

  const getTransform = (x: number, y: number): string => {
    const translateX = x === 0 ? '0%' : x === 100 ? `-${maxPanPercent}%` : `-${maxPanPercent / 2}%`;
    const translateY = y === 0 ? '0%' : y === 100 ? `-${maxPanPercent}%` : `-${maxPanPercent / 2}%`;
    return `scale(${zoomLevel}) translate(${translateX}, ${translateY})`;
  };

  const startTransform = getTransform(panDirection.startX, panDirection.startY);
  const endTransform = getTransform(panDirection.endX, panDirection.endY);
  const animationName = `pan-${panDirection.startX}-${panDirection.startY}-${panDirection.endX}-${panDirection.endY}`;

  return (
    <>
      <style>{`
        @keyframes ${animationName} {
          0% { transform: ${startTransform}; }
          100% { transform: ${endTransform}; }
        }
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
        <div key={currentImage.id} className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${currentImage.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: `${animationName} 30s linear forwards`,
              willChange: 'transform',
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      </div>
    </>
  );
}
