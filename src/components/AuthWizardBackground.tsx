import React, { useState, useEffect, useRef } from 'react';

/**
 * Interfaces and structure derived from original source
 */
interface ImageData {
    id: string;
    url: string;
    order: number;
}

interface PanDirection {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

export interface AuthWizardBackgroundProps {
    onImagesLoaded?: (loaded: boolean) => void;
}

// 1. UPDATED: Verified active URLs for 2026
const AUDIO_PRO_IMAGES: ImageData[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80', order: 0 }, // Console
  { id: '2', url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&q=80', order: 1 }, // Keys
  { id: '3', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920&q=80', order: 2 }, // DJ
  { id: '4', url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1920&q=80', order: 3 }, // Session
  { id: '5', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&q=80', order: 4 }, // Monitors
  { id: '6', url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1920&q=80', order: 5 }, // Faders
  { id: '7', url: 'https://images.unsplash.com/photo-1525413183858-f8facf07662c?w=1920&q=80', order: 6 }, // Mic (New Verified)
  { id: '8', url: 'https://images.unsplash.com/photo-1551710029-607e06bd45ff?w=1920&q=80', order: 7 }, // Modular
  { id: '9', url: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=1920&q=80', order: 8 }, // Engineer
  { id: '10', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1920&q=80', order: 9 }, // VU Meters
  { id: '11', url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=1920&q=80', order: 10 }, // Vinyl (New Verified)
  { id: '12', url: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=1920&q=80', order: 11 }, // Pedals (New Verified)
];

const RICK_ROLL_IMG: ImageData = { 
  id: 'rick-roll', 
  url: 'https://c.tenor.com/SSY2V0RrU3IAAAAd/tenor.gif', 
  order: 99 
};

export default function AuthWizardBackground({ onImagesLoaded }: AuthWizardBackgroundProps) {
  const [currentImage, setCurrentImage] = useState<ImageData>(() => 
    AUDIO_PRO_IMAGES[Math.floor(Math.random() * AUDIO_PRO_IMAGES.length)]
  );
  const [prevImage, setPrevImage] = useState<ImageData | null>(null);
  const [imagesReady, setImagesReady] = useState<boolean>(false);
  const [panDirection, setPanDirection] = useState<PanDirection>({ startX: 0, startY: 0, endX: 100, endY: 0 });
  const [typedBuffer, setTypedBuffer] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 2. Preloading reveal logic
  useEffect(() => {
    if (!imagesReady) {
      const img = new Image();
      img.onload = () => { setImagesReady(true); onImagesLoaded?.(true); };
      img.onerror = () => { setImagesReady(true); onImagesLoaded?.(true); };
      img.src = currentImage.url;
    }
  }, [imagesReady, onImagesLoaded, currentImage.url]);

  // 3. Keyboard shortcut with Input Protection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTypingInField = 
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable;

      if (isTypingInField) return;

      const key = e.key.toUpperCase();
      setTypedBuffer(prev => {
        const next = (prev + key).slice(-4);
        if (next === 'RICK') {
          setPrevImage(currentImage);
          setCurrentImage(RICK_ROLL_IMG);
        }
        return next;
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentImage]);

  // Rotation and 0.2% probability logic
  useEffect(() => {
    const displayDuration = 15000; 
    intervalRef.current = setInterval(() => {
      setPrevImage(currentImage);
      const isLucky = Math.random() < 0.002; 
      
      if (isLucky && currentImage.id !== 'rick-roll') {
        setCurrentImage(RICK_ROLL_IMG);
      } else {
        const currentIndex = AUDIO_PRO_IMAGES.findIndex(img => img.id === currentImage.id);
        const nextIndex = (currentIndex + 1) % AUDIO_PRO_IMAGES.length;
        setCurrentImage(AUDIO_PRO_IMAGES[nextIndex]);
      }
    }, displayDuration);
    
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [currentImage]);

  // Pan and transform logic
  useEffect(() => {
    const directions: PanDirection[] = [
      { startX: 0, startY: 0, endX: 100, endY: 0 },
      { startX: 100, startY: 0, endX: 0, endY: 0 },
      { startX: 0, startY: 0, endX: 0, endY: 100 },
      { startX: 0, startY: 100, endX: 0, endY: 0 },
    ];
    setPanDirection(directions[Math.floor(Math.random() * directions.length)]);
  }, [currentImage.id]);

  const zoomLevel = 1.8;
  const maxPanPercent = 30;
  const getTransform = (x: number, y: number): string => {
    const translateX = x === 0 ? '0%' : x === 100 ? `-${maxPanPercent}%` : `-${maxPanPercent / 2}%`;
    const translateY = y === 0 ? '0%' : y === 100 ? `-${maxPanPercent}%` : `-${maxPanPercent / 2}%`;
    return `scale(${zoomLevel}) translate(${translateX}, ${translateY})`;
  };

  const startTransform = getTransform(panDirection.startX, panDirection.startY);
  const endTransform = getTransform(panDirection.endX, panDirection.endY);
  const panAnimationName = `pan-${panDirection.startX}-${panDirection.startY}-${panDirection.endX}-${panDirection.endY}`;

  return (
    <>
      <style>{`
        @keyframes ${panAnimationName} { 0% { transform: ${startTransform}; } 100% { transform: ${endTransform}; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <div className="fixed inset-0 bg-black overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
        {prevImage && (
          <div key={`prev-${prevImage.id}`} className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${prevImage.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: endTransform,
                WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 100%)',
                maskImage: 'radial-gradient(circle, black 40%, transparent 100%)',
              }}
            />
          </div>
        )}
        <div key={`curr-${currentImage.id}`} className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${currentImage.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: `fadeIn 2s ease-in-out, ${panAnimationName} 15s linear forwards`,
              WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 100%)',
              maskImage: 'radial-gradient(circle, black 40%, transparent 100%)',
            }}
          />
        </div>
        <div className="absolute inset-0 bg-black/40" />
      </div>
    </>
  );
}
