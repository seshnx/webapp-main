import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, X, Mic, Sparkles, Volume2, ShieldCheck, Loader2 } from 'lucide-react';
import { useCreateLiveRoom } from '../../hooks/useConvex';
import type { Id } from '../../../convex/_generated/dataModel';

interface CreateLiveSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onRoomCreated: (roomId: Id<'liveRooms'>, title: string, category: string) => void;
}

const CATEGORIES = [
  { id: 'Mixing & Mastering', label: '🎛️ Mixing & Mastering' },
  { id: 'Beat Battle', label: '🔥 Beat Battle' },
  { id: 'Music Production', label: '🎹 Music Production' },
  { id: 'Vocal Coaching', label: '🎤 Vocal Coaching' },
  { id: 'Producer Q&A', label: '💡 Producer Q&A' },
  { id: 'Song Feedback', label: '🎧 Song Feedback' },
  { id: 'Gear & Tech Talk', label: '⚡ Gear & Tech Talk' },
  { id: 'Jam Session', label: '🎸 Jam Session' },
];

export default function CreateLiveSpaceModal({
  isOpen,
  onClose,
  user,
  onRoomCreated,
}: CreateLiveSpaceModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Music Production');
  const [description, setDescription] = useState('');
  const [allowHandRaising, setAllowHandRaising] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoomMutation = useCreateLiveRoom();

  if (!isOpen || typeof document === 'undefined') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for your Live Space');
      return;
    }

    const clerkId = user?.id || user?.uid;
    if (!clerkId) {
      setError('You must be logged in to host a Live Space');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await createRoomMutation({
        clerkId,
        title: title.trim(),
        category,
        description: description.trim() || undefined,
        allowHandRaising,
      });

      if (res?.roomId) {
        onRoomCreated(res.roomId, title.trim(), category);
        onClose();
      }
    } catch (err: any) {
      console.error('Failed to create live space:', err);
      setError(err.message || 'Failed to start Live Space. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-gray-900 border border-purple-500/20 text-white rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7"
        >
          {/* Glowing Background Accents */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-tr from-red-500 to-purple-600 rounded-xl text-white shadow-lg shadow-red-500/20">
                <Radio size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Start Live Audio Space
                </h3>
                <p className="text-xs text-gray-400">
                  Host live creator voice discussions, critiques & jam sessions
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-white rounded-full bg-gray-800 hover:bg-gray-700 transition"
            >
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Title Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Space Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Late Night Mix Critique & Production Talk"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={90}
                required
                className="w-full bg-gray-950/80 border border-gray-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition"
              />
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Topic & Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition border ${
                      category === cat.id
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-sm'
                        : 'bg-gray-950/40 border-gray-800 text-gray-400 hover:bg-gray-800/60'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                placeholder="What topics or tracks are you discussing?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                maxLength={200}
                className="w-full bg-gray-950/80 border border-gray-800 focus:border-purple-500 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 outline-none resize-none transition"
              />
            </div>

            {/* Permissions & Controls */}
            <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 size={16} className="text-purple-400" />
                <span className="text-xs text-gray-300 font-medium">
                  Allow Audience Hand-Raising
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowHandRaising}
                onChange={(e) => setAllowHandRaising(e.target.checked)}
                className="w-4 h-4 rounded accent-purple-600 bg-gray-900 border-gray-700 cursor-pointer"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="w-full py-3 px-4 bg-gradient-to-r from-red-500 via-purple-600 to-blue-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Starting Space...</span>
                  </>
                ) : (
                  <>
                    <Mic size={16} />
                    <span>Go Live Now</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
