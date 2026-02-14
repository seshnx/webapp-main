import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Repeat2 } from 'lucide-react';
import { repostPost, hasUserReposted } from '../../config/neonQueries';
import toast from 'react-hot-toast';

/**
 * Post data interface
 */
interface Post {
  id: string;
  userId: string;
  displayName?: string;
  text?: string;
  content?: string;
  [key: string]: any;
}

/**
 * RepostModal Props
 */
interface RepostModalProps {
  post: Post;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (repostPostId: string) => void;
}

/**
 * RepostModal Component
 *
 * Modal for reposting with optional comment
 */
const RepostModal: React.FC<RepostModalProps> = ({
  post,
  userId,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReposted, setHasReposted] = useState(false);

  // Check if user already reposted
  React.useEffect(() => {
    const checkReposted = async () => {
      if (isOpen && userId && post?.id) {
        const reposted = await hasUserReposted(userId, post.id);
        setHasReposted(reposted);
      }
    };
    checkReposted();
  }, [isOpen, userId, post?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error('Please log in to repost');
      return;
    }

    if (hasReposted) {
      toast.error('You have already reposted this post');
      return;
    }

    setIsSubmitting(true);

    try {
      const newPost = await repostPost(post.id, userId, comment || undefined);

      toast.success('Reposted successfully!');
      setComment('');

      // Call success callback
      if (onSuccess) {
        onSuccess(newPost.id);
      }

      // Close modal
      onClose();
    } catch (error: any) {
      console.error('Repost failed:', error);
      if (error.message === 'You have already reposted this post') {
        toast.error('You have already reposted this post');
        setHasReposted(true);
      } else {
        toast.error(error.message || 'Failed to repost');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="bg-surface border border-border rounded-xl w-full max-w-lg shadow-2xl"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Repeat2 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Repost</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original Post Preview */}
            <div className="p-4 border-b border-border">
              <div className="bg-surface-secondary rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">{post.displayName || 'User'}</span>
                  <span className="text-xs text-text-secondary">
                    {new Date(post.created_at || post.timestamp || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-text-secondary line-clamp-3">
                  {post.text || post.content || 'No content'}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4">
              <div className="mb-4">
                <label htmlFor="repost-comment" className="block text-sm font-medium mb-2">
                  Add a comment (optional)
                </label>
                <textarea
                  id="repost-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What do you think?"
                  className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-text-secondary">
                    {comment.length}/500
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || hasReposted}
                  className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Posting...
                    </>
                  ) : hasReposted ? (
                    <>
                      <Repeat2 className="w-4 h-4" />
                      Already Reposted
                    </>
                  ) : (
                    <>
                      <Repeat2 className="w-4 h-4" />
                      Repost
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RepostModal;
