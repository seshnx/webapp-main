import React, { useState, useEffect, useRef } from 'react';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

export default function AuthWizardBackground() {
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [panDirection, setPanDirection] = useState({ x: 0, y: 0, startX: 0, startY: 0 });
  const intervalRef = useRef(null);

  useEffect(() => {
    const loadBackgroundImages = async () => {
      try {
        // Fetch images from Firestore collection
        // Path: artifacts/{appId}/auth_backgrounds (subcollection)
        const q = query(
          collection(db, `artifacts/${appId}/auth_backgrounds`),
          orderBy('order', 'asc'),
          limit(20) // Limit to 20 images for variety
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const imageData = snapshot.docs.map(doc => ({
            id: doc.id,
            url: doc.data().url,
            order: doc.data().order || 0
          }));
          setImages(imageData);
        } else {
          // Fallback: Use placeholder images if no images in Firestore
          setImages([
            { id: '1', url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80', order: 0 },
            { id: '2', url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&q=80', order: 1 },
            { id: '3', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920&q=80', order: 2 },
            { id: '4', url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80', order: 3 },
          ]);
        }
      } catch (error) {
        console.error('Error loading background images:', error);
        // Fallback images on error
        setImages([
          { id: '1', url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80', order: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadBackgroundImages();
  }, []);

  // Generate random pan direction for each image
  useEffect(() => {
    if (images.length === 0) return;

    // Random pan directions: left-to-right, right-to-left, top-to-bottom, bottom-to-top, diagonal
    const directions = [
      { startX: 0, startY: 0, endX: 100, endY: 0 }, // Left to Right
      { startX: 100, startY: 0, endX: 0, endY: 0 }, // Right to Left
      { startX: 0, startY: 0, endX: 0, endY: 100 }, // Top to Bottom
      { startX: 0, startY: 100, endX: 0, endY: 0 }, // Bottom to Top
      { startX: 0, startY: 0, endX: 100, endY: 100 }, // Top-left to Bottom-right
      { startX: 100, startY: 0, endX: 0, endY: 100 }, // Top-right to Bottom-left
      { startX: 0, startY: 100, endX: 100, endY: 0 }, // Bottom-left to Top-right
      { startX: 100, startY: 100, endX: 0, endY: 0 }, // Bottom-right to Top-left
    ];

    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    setPanDirection(randomDirection);
  }, [currentImageIndex, images.length]);

  // Cycle through images with fade transition
  useEffect(() => {
    if (images.length === 0 || loading) return;

    // Each image displays for 15-20 seconds (pan animation duration)
    const displayDuration = 18000; // 18 seconds

    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => {
        // Select random next image (not the same as current)
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * images.length);
        } while (nextIndex === prev && images.length > 1);
        return nextIndex;
      });
    }, displayDuration);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images.length, loading]);

  if (loading || images.length === 0) {
    return null;
  }

  const currentImage = images[currentImageIndex];
  
  // Generate unique animation name for this specific pan direction
  const animationName = `pan-${panDirection.startX}-${panDirection.startY}-${panDirection.endX}-${panDirection.endY}`;

  return (
    <>
      <style>{`
        @keyframes ${animationName} {
          0% {
            background-position: ${panDirection.startX}% ${panDirection.startY}%;
          }
          100% {
            background-position: ${panDirection.endX}% ${panDirection.endY}%;
          }
        }
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          key={currentImage.id}
          className="absolute inset-0 background-pan-container"
        >
          <div
            className="absolute inset-0 background-pan-image"
            style={{
              backgroundImage: `url(${currentImage.url})`,
              backgroundSize: 'cover',
              transform: 'scale(1.5)',
              animation: `${animationName} 18s ease-in-out forwards`,
            }}
          />
          {/* Vignette overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.7) 100%)',
            }}
          />
          {/* Blur overlay */}
          <div 
            className="absolute inset-0 backdrop-blur-sm"
            style={{
              opacity: 0.3,
            }}
          />
        </div>
        {/* Additional dark overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20" />
      </div>
    </>
  );
}

