import React, { useState, useEffect, useRef } from 'react';

interface ImageData { id: string; url: string; order: number; }
interface PanDirection { startX: number; startY: number; endX: number; endY: number; }
interface FallingNote { id: number; left: number; delay: number; duration: number; emoji: string; }

export interface AuthWizardBackgroundProps { onImagesLoaded?: (loaded: boolean) => void; }

const AUDIO_PRO_IMAGES: ImageData[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80', order: 0 },
  { id: '2', url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&q=80', order: 1 },
  { id: '3', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920&q=80', order: 2 },
  { id: '4', url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1920&q=80', order: 3 },
  { id: '5', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&q=80', order: 4 },
  { id: '6', url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1920&q=80', order: 5 },
  { id: '7', url: 'https://images.unsplash.com/photo-1525413183858-f8facf07662c?w=1920&q=80', order: 6 },
  { id: '8', url: 'https://images.unsplash.com/photo-1551710029-607e06bd45ff?w=1920&q=80', order: 7 },
  { id: '9', url: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=1920&q=80', order: 8 },
  { id: '10', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1920&q=80', order: 9 },
  { id: '11', url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=1920&q=80', order: 10 },
  { id: '12', url: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=1920&q=80', order: 11 },
];

const RICK_ROLL_IMG: ImageData = { id: 'rick-roll', url: 'https://c.tenor.com/SSY2V0RrU3IAAAAd/tenor.gif', order: 99 };
const PURE_NOTES = ['🎵', '🎶'];

export default function AuthWizardBackground({ onImagesLoaded }: AuthWizardBackgroundProps) {
  const [currentImage, setCurrentImage] = useState<ImageData>(() => AUDIO_PRO_IMAGES[Math.floor(Math.random() * AUDIO_PRO_IMAGES.length)]);
  const [prevImage, setPrevImage] = useState<ImageData | null>(null);
  const [imagesReady, setImagesReady] = useState<boolean>(false);
  const [panDirection, setPanDirection] = useState<PanDirection>({ startX: 0, startY: 0, endX: 100, endY: 0 });
  const [typedBuffer, setTypedBuffer] = useState<string>('');
  const [notes, setNotes] = useState<FallingNote[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger Fast Note Rain
  const triggerNoteRain = () => {
    const rainCount = 1000; // Denser rain for faster movement
    const newNotes = Array.from({ length: rainCount }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      delay: Math.random() * 2, // 2s spread for the start
      duration: 1 + Math.random() * 1.5, // High speed: 1s to 2.5s fall time
      emoji: PURE_NOTES[Math.floor(Math.random() * PURE_NOTES.length)]
    }));
    setNotes(prev => [...prev, ...newNotes]);
    
    // Cleanup state after 5 seconds
    setTimeout(() => {
      setNotes(prev => prev.filter(n => !newNotes.find(nn => nn.id === n.id)));
    }, 5000);
  };

  useEffect(() => {
    if (!imagesReady) {
      const img = new Image();
      img.onload = () => { setImagesReady(true); onImagesLoaded?.(true); };
      img.onerror = () => { setImagesReady(true); onImagesLoaded?.(true); };
      img.src = currentImage.url;
    }
  }, [imagesReady, onImagesLoaded, currentImage.url]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable) return;
      
      const key = e.key.toUpperCase();
      setTypedBuffer(prev => {
        const next = (prev + key).slice(-4);
        if (next === 'RICK') {
          setPrevImage(currentImage);
          setCurrentImage(RICK_ROLL_IMG);
          return "";
        } else if (next === 'NOTE') {
          triggerNoteRain();
          return "";
        }
        return next;
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentImage]);

  // Image rotation
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPrevImage(currentImage);
      if (Math.random() < 0.002 && currentImage.id !== 'rick-roll') {
        setCurrentImage(RICK_ROLL_IMG);
      } else {
        const currentIndex = AUDIO_PRO_IMAGES.findIndex(img => img.id === currentImage.id);
        setCurrentImage(AUDIO_PRO_IMAGES[(currentIndex + 1) % AUDIO_PRO_IMAGES.length]);
      }
    }, 15000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [currentImage]);

  // Pan logic
  useEffect(() => {
    const directions: PanDirection[] = [
      { startX: 0, startY: 0, endX: 100, endY: 0 },
      { startX: 100, startY: 0, endX: 0, endY: 0 },
      { startX: 0, startY: 0, endX: 0, endY: 100 },
      { startX: 0, startY: 100, endX: 0, endY: 0 },
    ];
    setPanDirection(directions[Math.floor(Math.random() * directions.length)]);
  }, [currentImage.id]);

  const endTransform = `scale(1.8) translate(${panDirection.endX === 100 ? '-30%' : '0%'}, ${panDirection.endY === 100 ? '-30%' : '0%'})`;
  const startTransform = `scale(1.8) translate(${panDirection.startX === 100 ? '-30%' : '0%'}, ${panDirection.startY === 100 ? '-30%' : '0%'})`;
  const panAnimation = `pan-${panDirection.startX}-${panDirection.startY}-${panDirection.endX}-${panDirection.endY}`;

  return (
    <>
      <style>{`
        @keyframes ${panAnimation} { 0% { transform: ${startTransform}; } 100% { transform: ${endTransform}; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes noteFall { 
          0% { transform: translateY(-20vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>

      <div className="fixed inset-0 bg-black overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
        {prevImage && (
          <div key={`prev-${prevImage.id}`} className="absolute inset-0">
            <div className="absolute inset-0" style={{ backgroundImage: `url(${prevImage.url})`, backgroundSize: 'cover', backgroundPosition: 'center', transform: endTransform, animation: 'fadeOut 2s ease-in-out forwards', WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 100%)', maskImage: 'radial-gradient(circle, black 40%, transparent 100%)' }} />
          </div>
        )}
        <div key={`curr-${currentImage.id}`} className="absolute inset-0">
          <div className="absolute inset-0" style={{ backgroundImage: `url(${currentImage.url})`, backgroundSize: 'cover', backgroundPosition: 'center', animation: `fadeIn 2s ease-in-out, ${panAnimation} 15s linear forwards`, WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 100%)', maskImage: 'radial-gradient(circle, black 40%, transparent 100%)' }} />
        </div>
        <div className="absolute inset-0 bg-black/40" />

        {/* High-Speed Note Rain Layer */}
        {notes.map(note => (
          <div
            key={note.id}
            className="absolute top-0 text-3xl opacity-0"
            style={{
              left: `${note.left}%`,
              animation: `noteFall ${note.duration}s linear ${note.delay}s forwards`,
              zIndex: 10
            }}
          >
            {note.emoji}
          </div>
        ))}
      </div>
    </>
  );
}
