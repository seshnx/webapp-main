import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Send, ChevronLeft, ChevronRight, Eye, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserAvatar from '../shared/UserAvatar';
export interface SingleStory {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  createdAt: number;
}

export interface StoryGroupItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  userRole?: string;
  hasUnseen: boolean;
  stories: SingleStory[];
}

interface StoryViewerModalProps {
  storyGroup: StoryGroupItem;
  userSettings?: any;
  onClose: () => void;
  onOpenProfile?: (userId: string) => void;
}

export default function StoryViewerModal({ storyGroup, userSettings, onClose, onOpenProfile }: StoryViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef<number>(0);

  const canReply = userSettings?.social?.allowStoryReplies !== 'none';

  const currentStory = storyGroup.stories[currentIndex];

  useEffect(() => {
    if (isPaused) return;

    const duration = currentStory?.duration || 5000; // 5 seconds per slide
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      progressRef.current += step;
      if (progressRef.current >= 100) {
        progressRef.current = 0;
        if (currentIndex < storyGroup.stories.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          onClose();
        }
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, storyGroup.stories.length, onClose, currentStory]);

  const handleNext = () => {
    progressRef.current = 0;
    if (currentIndex < storyGroup.stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    progressRef.current = 0;
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
        onClick={() => setIsPaused(p => !p)}
      >
        <div
          className="relative w-full max-w-sm h-[85vh] bg-gray-900 rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border border-gray-800"
          onClick={e => e.stopPropagation()}
        >
          {/* Progress Indicators */}
          <div className="absolute top-3 left-3 right-3 z-30 flex gap-1.5">
            {storyGroup.stories.map((story, idx) => (
              <div key={story.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{
                    width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progressRef.current}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Top Header Controls */}
          <div className="absolute top-6 left-3 right-3 z-30 flex items-center justify-between text-white">
            <div
              className="flex items-center gap-2 cursor-pointer bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm transition"
              onClick={() => {
                onClose();
                onOpenProfile?.(storyGroup.userId);
              }}
            >
              <UserAvatar src={storyGroup.userAvatar} name={storyGroup.userName} size="xs" />
              <div>
                <h4 className="text-xs font-bold leading-none">{storyGroup.userName}</h4>
                {storyGroup.userRole && (
                  <span className="text-[10px] text-gray-300">{storyGroup.userRole}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Story Content Area */}
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {currentStory?.mediaType === 'video' ? (
              <video
                src={currentStory.mediaUrl}
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={currentStory?.mediaUrl}
                alt="Story"
                className="w-full h-full object-cover"
              />
            )}

            {/* Caption Overlay */}
            {currentStory?.caption && (
              <div className="absolute bottom-20 left-4 right-4 z-20 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white text-sm font-medium text-center">
                {currentStory.caption}
              </div>
            )}

            {/* Tap Navigation Hotspots */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={handlePrev} />
            <div className="absolute inset-y-0 right-0 w-1/3 z-10" onClick={handleNext} />
          </div>

          {/* Bottom Reply & Interactions */}
          <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center gap-2">
            <div className="flex-1 relative">
              {canReply ? (
                <>
                  <input
                    type="text"
                    placeholder={`Reply to ${storyGroup.userName}...`}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onFocus={() => setIsPaused(true)}
                    onBlur={() => setIsPaused(false)}
                    className="w-full bg-black/50 border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-gray-400 backdrop-blur-md focus:outline-none focus:border-brand-blue"
                  />
                  {replyText.trim() && (
                    <button
                      onClick={() => {
                        setReplyText('');
                        setIsPaused(false);
                      }}
                      className="absolute right-2 top-1.2 p-1.5 bg-brand-blue text-white rounded-full hover:scale-105 transition"
                    >
                      <Send size={12} />
                    </button>
                  )}
                </>
              ) : (
                <div className="w-full bg-black/40 border border-white/10 rounded-full px-4 py-2.5 text-xs text-gray-400 backdrop-blur-md text-center">
                  Story replies disabled by creator
                </div>
              )}
            </div>

            <button
              onClick={() => setLiked(!liked)}
              className={`p-2.5 rounded-full backdrop-blur-md border transition ${
                liked
                  ? 'bg-red-500/20 border-red-500 text-red-500'
                  : 'bg-black/50 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
