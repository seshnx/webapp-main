import React, { useState, useEffect } from 'react';
import { pitchSyncManager } from './pitchSyncManager';

interface FloatingParticle {
  id: string;
  emoji: string;
  x: number; // percentage across right side (0 to 100)
}

const REACTION_EMOJIS = [
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🚀', label: 'Rocket' },
  { emoji: '👏', label: 'Applause' },
  { emoji: '💡', label: 'Idea' },
  { emoji: '👍', label: 'Thumbs Up' }
];

export default function LiveReactionsOverlay({ isLive }: { isLive: boolean }): JSX.Element | null {
  const [particles, setParticles] = useState<FloatingParticle[]>([]);

  useEffect(() => {
    if (!isLive) return;

    // Listen for incoming reactions from anyone in the broadcast room
    const unsubscribe = pitchSyncManager.onReaction((reaction) => {
      const newParticle: FloatingParticle = {
        id: reaction.id,
        emoji: reaction.emoji,
        x: Math.floor(Math.random() * 80) + 10 // 10% to 90%
      };

      setParticles((prev) => [...prev.slice(-25), newParticle]);

      // Remove particle after animation completes
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 2400);
    });

    return () => unsubscribe();
  }, [isLive]);

  const handleSendReaction = (emoji: string) => {
    pitchSyncManager.sendReaction(emoji);
  };

  if (!isLive) return null;

  return (
    <>
      {/* Floating Ascending Particles Container */}
      <div className="fixed inset-y-0 right-0 w-44 pointer-events-none z-50 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute bottom-16 text-3xl sm:text-4xl animate-float-up select-none"
            style={{
              right: `${particle.x}px`,
              animation: 'reactionRise 2.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
            }}
          >
            {particle.emoji}
          </div>
        ))}
      </div>

      {/* Floating Reaction Pill Dock */}
      <aside 
        aria-label="Live Reactions Dock"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-[#2c2e36]/95 backdrop-blur-md border border-gray-700/80 rounded-full px-3 py-1.5 shadow-2xl flex items-center gap-1 sm:gap-1.5 transition-all hover:border-brand-blue/60"
      >
        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1 hidden sm:inline">
          React:
        </span>
        {REACTION_EMOJIS.map(({ emoji, label }) => (
          <button
            key={emoji}
            onClick={() => handleSendReaction(emoji)}
            title={`Send ${label}`}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-lg sm:text-xl hover:scale-125 active:scale-95 transition-transform duration-150 hover:bg-white/10"
          >
            {emoji}
          </button>
        ))}
      </aside>

      {/* Custom CSS for Floating Particles */}
      <style>{`
        @keyframes reactionRise {
          0% {
            transform: translateY(0) scale(0.6) rotate(0deg);
            opacity: 0;
          }
          15% {
            transform: translateY(-40px) scale(1.2) rotate(-8deg);
            opacity: 1;
          }
          50% {
            transform: translateY(-160px) scale(1.1) rotate(6deg);
            opacity: 0.9;
          }
          100% {
            transform: translateY(-380px) scale(0.9) rotate(-12deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
