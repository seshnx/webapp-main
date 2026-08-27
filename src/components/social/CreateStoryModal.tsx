import React, { useState } from 'react';
import { X, Image as ImageIcon, Video, Sparkles, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUpload } from '../../hooks/useUpload';
import { useCreateStory } from '../../hooks/useConvex';

interface CreateStoryModalProps {
  user: any;
  userData: any;
  onClose: () => void;
  onAddStory: (story: { mediaUrl: string; mediaType: 'image' | 'video'; caption?: string }) => void;
}

export default function CreateStoryModal({ user, userData, onClose, onAddStory }: CreateStoryModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { uploadMedia } = useUpload('story-media');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setMediaType(selected.type.startsWith('video') ? 'video' : 'image');
    }
  };

  const createStoryMutation = useCreateStory();

  const handleSubmit = async () => {
    if (!file && !previewUrl) return;
    setIsUploading(true);

    try {
      let finalUrl = previewUrl || '';
      if (file) {
        const res = await uploadMedia(file);
        if (res?.url) finalUrl = res.url;
      }

      const clerkId = user?.id || user?.uid;
      if (clerkId && finalUrl) {
        await createStoryMutation({
          clerkId,
          mediaUrl: finalUrl,
          mediaType,
          caption: caption.trim() || undefined,
        });
      }

      onAddStory({
        mediaUrl: finalUrl,
        mediaType,
        caption: caption.trim() || undefined,
      });

      onClose();
    } catch (e) {
      console.error("Failed to upload story:", e);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-3xl p-6 shadow-2xl border dark:border-gray-700 relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
            <Sparkles className="text-yellow-500" size={20} />
            Create 24h Story
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Media Preview / Selection */}
        <div className="relative w-full h-72 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 mb-4">
          {previewUrl ? (
            mediaType === 'video' ? (
              <video src={previewUrl} autoPlay loop playsInline className="w-full h-full object-cover" />
            ) : (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            )
          ) : (
            <label className="flex flex-col items-center justify-center cursor-pointer p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-2">
                <ImageIcon size={28} />
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Upload Photo or Video
              </span>
              <span className="text-xs text-gray-400 mt-1">PNG, JPG, MP4, MOV up to 50MB</span>
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          )}

          {previewUrl && (
            <button
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
              }}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Caption Input */}
        <div className="mb-5">
          <textarea
            placeholder="Add a caption or music gear tag..."
            value={caption}
            onChange={e => setCaption(e.target.value)}
            rows={2}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!previewUrl || isUploading}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue hover:bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-50 transition"
          >
            {isUploading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Send size={16} />
            )}
            <span>Share Story</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
