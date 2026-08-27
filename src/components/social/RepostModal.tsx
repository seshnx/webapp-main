import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Repeat2, Loader2, MessageSquare, Music, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import UserAvatar from '../shared/UserAvatar';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  userId?: string;
  authorId?: string;
  authorPhoto?: string;
  displayName?: string;
  authorName?: string;
  username?: string;
  authorUsername?: string;
  role?: string;
  text?: string;
  content?: string;
  attachments?: Array<{ url: string; type: 'image' | 'video' | 'audio'; name?: string }>;
  mediaAttachments?: Array<{ url: string; type: string; name?: string }>;
  imageUrl?: string;
  audioUrl?: string;
  [key: string]: any;
}

interface RepostModalProps {
  post: Post;
  userId?: string; // Clerk ID
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (repostId: string) => void;
}

export default function RepostModal({
  post,
  userId,
  isOpen,
  onClose,
  onSuccess,
}: RepostModalProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const repostMutation = useMutation(api.social.repostPost);

  if (!isOpen) return null;

  const originalAuthorName = post.displayName || post.authorName || 'Creator';
  const originalUsername = post.username || post.authorUsername || 'user';
  const originalText = post.content || post.text || '';
  const hasAudio = Boolean(post.audioUrl || post.attachments?.some((a) => a.type === 'audio') || post.mediaAttachments?.some((a) => a.type === 'audio'));
  const hasImage = Boolean(post.imageUrl || post.attachments?.some((a) => a.type === 'image') || post.mediaAttachments?.some((a) => a.type === 'image'));
  const hasVideo = Boolean(post.attachments?.some((a) => a.type === 'video') || post.mediaAttachments?.some((a) => a.type === 'video'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error('Please log in to repost');
      return;
    }

    setIsSubmitting(true);

    try {
      const newPostId = await repostMutation({
        originalPostId: post.id as Id<'posts'>,
        authorId: userId,
        comment: comment.trim() ? comment.trim() : undefined,
      });

      toast.success('Reposted to your feed!');
      setComment('');
      onSuccess?.(newPostId);
      onClose();
    } catch (error: any) {
      console.error('Repost failed:', error);
      toast.error(error.message || 'Failed to repost');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                <Repeat2 size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Repost to Feed</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Share this creation with your followers
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form & Original Post Preview */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            {/* Optional Comment Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-brand-blue" />
                Add your thoughts (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment to this repost..."
                rows={3}
                maxLength={500}
                className="w-full p-3.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
              />
              <div className="flex justify-end">
                <span className="text-[11px] text-gray-400">{comment.length}/500</span>
              </div>
            </div>

            {/* Original Post Preview Box */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/60 flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <UserAvatar src={post.authorPhoto} name={originalAuthorName} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {originalAuthorName}
                    </span>
                    {post.role && (
                      <span className="text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 px-1.5 py-0.2 rounded-md">
                        {post.role}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400">@{originalUsername}</span>
                </div>
              </div>

              {originalText && (
                <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
                  {originalText}
                </p>
              )}

              {/* Media indicator badges */}
              {(hasAudio || hasImage || hasVideo) && (
                <div className="flex items-center gap-2 pt-1">
                  {hasAudio && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-blue bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/40">
                      <Music size={11} /> Audio Track
                    </span>
                  )}
                  {hasImage && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                      <ImageIcon size={11} /> Image
                    </span>
                  )}
                  {hasVideo && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/40">
                      <VideoIcon size={11} /> Video
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Reposting...</span>
                  </>
                ) : (
                  <>
                    <Repeat2 size={15} />
                    <span>Repost</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
