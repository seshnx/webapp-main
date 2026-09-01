import React, { useState, useRef } from 'react';
import { Heart, MessageCircle, Share2, Disc, Play, Pause, Volume2, VolumeX, Music, Bookmark, DollarSign, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserAvatar from '../shared/UserAvatar';
import CommentSection from './CommentSection';
import TipModal from './TipModal';
import { useTrendingPosts, useFeed } from '../../hooks/useConvex';

interface ReelItem {
  id: string;
  videoUrl: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  authorRole?: string;
  caption: string;
  audioTrackName?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
}

interface ReelsFeedProps {
  user: any;
  userData: any;
  onOpenProfile?: (userId: string) => void;
}

export default function ReelsFeed({ user, userData, onOpenProfile }: ReelsFeedProps) {
  const [activeCommentReelId, setActiveCommentReelId] = useState<string | null>(null);
  const [tipReel, setTipReel] = useState<ReelItem | null>(null);

  const feedPosts = useFeed(50);
  const dbPosts = feedPosts || [];

  // Extract real video posts from Convex database
  const realVideoPosts: ReelItem[] = (dbPosts || [])
    .filter((p: any) => p.mediaType === 'video' || p.mediaUrls?.some((u: string) => u?.includes('.mp4') || u?.includes('.webm') || u?.includes('video')))
    .map((p: any) => ({
      id: p.id || p._id,
      videoUrl: p.mediaUrls?.[0] || '',
      authorId: p.userId || p.authorId,
      authorName: p.displayName || p.authorName || 'Creator',
      authorAvatar: p.authorPhoto || null,
      authorRole: p.role || 'Creator',
      caption: p.text || p.content || '',
      audioTrackName: `${p.displayName || 'Creator'} • Audio Stem`,
      likesCount: p.likesCount || 0,
      commentsCount: p.commentsCount || 0,
      sharesCount: p.sharesCount || 0,
      isLiked: p.isLikedByCurrentUser || false,
    }));

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {realVideoPosts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-dark-card rounded-2xl border dark:border-gray-700 p-6">
          <Film size={36} className="mx-auto mb-3 text-brand-blue opacity-50" />
          <h4 className="font-bold text-base dark:text-white mb-1">No Video Shorts Yet</h4>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mb-4">
            Be the first creator to share a video reel or session highlight with the community!
          </p>
        </div>
      ) : (
        realVideoPosts.map(reel => (
          <ReelCard
            key={reel.id}
            reel={reel}
            user={user}
            onToggleLike={() => {}}
            onOpenComments={() => setActiveCommentReelId(reel.id)}
            onOpenTip={() => setTipReel(reel)}
            onOpenProfile={onOpenProfile}
          />
        ))
      )}

      {/* Comments Drawer / Sheet */}
      {activeCommentReelId && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-dark-card rounded-t-3xl p-4 shadow-2xl border-t dark:border-gray-700 max-h-[70vh] overflow-y-auto max-w-xl mx-auto"
        >
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4" />
          <CommentSection
            post={{ id: activeCommentReelId, userId: user?.id || user?.uid || '' }}
            currentUser={user}
            currentUserData={userData}
          />
          <button
            onClick={() => setActiveCommentReelId(null)}
            className="w-full py-2.5 mt-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-center"
          >
            Close Comments
          </button>
        </motion.div>
      )}

      {/* Tip Creator Modal */}
      {tipReel && (
        <TipModal
          creatorName={tipReel.authorName}
          creatorPhoto={tipReel.authorAvatar}
          onClose={() => setTipReel(null)}
        />
      )}
    </div>
  );
}

function ReelCard({
  reel,
  user,
  onToggleLike,
  onOpenComments,
  onOpenTip,
  onOpenProfile
}: {
  reel: ReelItem;
  user: any;
  onToggleLike: () => void;
  onOpenComments: () => void;
  onOpenTip: () => void;
  onOpenProfile?: (userId: string) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative w-full h-[75vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800 flex items-center justify-center">
      <video
        ref={videoRef}
        src={reel.videoUrl}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover cursor-pointer"
        onClick={togglePlay}
      />

      {/* Play/Pause Overlay Indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
          <div className="p-4 rounded-full bg-black/60 text-white backdrop-blur-md">
            <Play size={36} fill="white" />
          </div>
        </div>
      )}

      {/* Top Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Right Side Action Bar */}
      <div className="absolute right-3 bottom-16 z-20 flex flex-col items-center gap-4">
        {/* Author Avatar */}
        <div
          className="relative cursor-pointer"
          onClick={() => onOpenProfile?.(reel.authorId)}
        >
          <div className="p-0.5 bg-gradient-to-tr from-brand-blue to-purple-500 rounded-full">
            <UserAvatar src={reel.authorAvatar} name={reel.authorName} size="md" />
          </div>
        </div>

        {/* Like Button */}
        <button
          onClick={onToggleLike}
          className="flex flex-col items-center group"
        >
          <div className={`p-3 rounded-full backdrop-blur-md transition ${
            reel.isLiked ? 'bg-red-500/20 text-red-500' : 'bg-black/40 text-white group-hover:bg-black/60'
          }`}>
            <Heart size={22} fill={reel.isLiked ? 'currentColor' : 'none'} />
          </div>
          <span className="text-xs font-bold text-white mt-1 drop-shadow">{reel.likesCount}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={onOpenComments}
          className="flex flex-col items-center group"
        >
          <div className="p-3 rounded-full bg-black/40 text-white backdrop-blur-md group-hover:bg-black/60 transition">
            <MessageCircle size={22} />
          </div>
          <span className="text-xs font-bold text-white mt-1 drop-shadow">{reel.commentsCount}</span>
        </button>

        {/* Tip Button */}
        <button
          onClick={onOpenTip}
          className="flex flex-col items-center group"
        >
          <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 backdrop-blur-md group-hover:scale-110 transition">
            <DollarSign size={22} />
          </div>
          <span className="text-xs font-bold text-emerald-400 mt-1 drop-shadow">Tip</span>
        </button>

        {/* Rotating Disc Audio Visual */}
        <div className="mt-2 w-9 h-9 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 border-2 border-white/20 flex items-center justify-center animate-spin">
          <Disc size={18} className="text-brand-blue" />
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-4 left-4 right-16 z-20 text-white space-y-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <h3
            className="font-bold text-sm hover:underline cursor-pointer"
            onClick={() => onOpenProfile?.(reel.authorId)}
          >
            {reel.authorName}
          </h3>
          {reel.authorRole && (
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium backdrop-blur-sm">
              {reel.authorRole}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-200 line-clamp-2">{reel.caption}</p>

        {reel.audioTrackName && (
          <div className="flex items-center gap-2 text-[11px] text-gray-300">
            <Music size={12} className="text-brand-blue" />
            <span className="truncate">{reel.audioTrackName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
