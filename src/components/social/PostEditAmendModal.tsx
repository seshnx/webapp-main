import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, FileEdit, Clock, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import toast from 'react-hot-toast';

interface PostEditAmendModalProps {
  isOpen: boolean;
  mode: 'edit' | 'amend';
  postId: string;
  authorId: string; // Clerk ID
  initialContent?: string;
  postCreatedAt?: number | string | Date;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PostEditAmendModal({
  isOpen,
  mode,
  postId,
  authorId,
  initialContent = '',
  postCreatedAt,
  onClose,
  onSuccess,
}: PostEditAmendModalProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePostMutation = useMutation(api.social.updatePost);
  const amendPostMutation = useMutation(api.social.amendPost);

  // Calculate remaining edit time if in edit mode
  const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setContent(mode === 'edit' ? initialContent : '');
      setError(null);
    }
  }, [isOpen, mode, initialContent]);

  useEffect(() => {
    if (mode !== 'edit' || !postCreatedAt) return;

    const calculateRemaining = () => {
      const createdTime = new Date(postCreatedAt).getTime();
      const elapsedMs = Date.now() - createdTime;
      const thirtyMinsMs = 30 * 60 * 1000;
      const leftMs = thirtyMinsMs - elapsedMs;
      if (leftMs <= 0) {
        setRemainingMinutes(0);
      } else {
        setRemainingMinutes(Math.ceil(leftMs / (60 * 1000)));
      }
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 10000);
    return () => clearInterval(interval);
  }, [mode, postCreatedAt]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError(mode === 'edit' ? 'Post content cannot be empty' : 'Amendment text cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'edit') {
        if (remainingMinutes === 0) {
          throw new Error('Editing original post is only allowed within 30 minutes. Please add an amendment instead.');
        }
        await updatePostMutation({
          postId: postId as Id<'posts'>,
          authorId,
          content: content.trim(),
        });
        toast.success('Post updated successfully!');
      } else {
        await amendPostMutation({
          postId: postId as Id<'posts'>,
          authorId,
          text: content.trim(),
        });
        toast.success('Amendment added successfully!');
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Post action failed:', err);
      setError(err?.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${
                mode === 'edit'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-brand-blue'
                  : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500'
              }`}>
                {mode === 'edit' ? <Edit3 size={18} /> : <FileEdit size={18} />}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {mode === 'edit' ? 'Edit Original Post' : 'Add Post Amendment'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {mode === 'edit'
                    ? 'Modify the main body of your post'
                    : 'Append an update while keeping original content intact'}
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

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            {/* 30-minute timer notification */}
            {mode === 'edit' && (
              <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium border ${
                remainingMinutes !== null && remainingMinutes > 5
                  ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40 text-brand-blue'
                  : remainingMinutes !== null && remainingMinutes > 0
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40 text-amber-600 dark:text-amber-400'
                  : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400'
              }`}>
                <Clock size={15} className="shrink-0" />
                {remainingMinutes !== null && remainingMinutes > 0 ? (
                  <span>
                    Editing window closes in <strong>{remainingMinutes} minute{remainingMinutes === 1 ? '' : 's'}</strong> (30 min limit).
                  </span>
                ) : (
                  <span>
                    Editing window has expired. Please use <strong>Amend</strong> to attach an update.
                  </span>
                )}
              </div>
            )}

            {mode === 'amend' && (
              <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl text-xs bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300">
                <Sparkles size={16} className="shrink-0 mt-0.5" />
                <span>
                  Amendments are timestamped and displayed directly beneath your original post without modifying the original text.
                </span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {mode === 'edit' ? 'Post Content' : 'Amendment Text'}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                disabled={isSubmitting || (mode === 'edit' && remainingMinutes === 0)}
                placeholder={
                  mode === 'edit'
                    ? 'Update your post...'
                    : 'Add an update, correction, or extra details...'
                }
                className="w-full p-3.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue transition resize-none disabled:opacity-50"
              />
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
                disabled={isSubmitting || (mode === 'edit' && remainingMinutes === 0)}
                className={`px-5 py-2 text-xs sm:text-sm font-semibold text-white rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50 ${
                  mode === 'edit'
                    ? 'bg-brand-blue hover:bg-blue-600'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                <span>{mode === 'edit' ? 'Save Changes' : 'Post Amendment'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
