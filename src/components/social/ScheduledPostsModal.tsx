import React, { useState } from 'react';
import { Calendar, Clock, Trash2, Edit3, Send, X, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ScheduledPostItem {
  id: string;
  text: string;
  isDraft: boolean;
  scheduledTime?: string;
  createdAt: number;
}

interface ScheduledPostsModalProps {
  onClose: () => void;
  onPublishNow: (post: ScheduledPostItem) => void;
}

export default function ScheduledPostsModal({ onClose, onPublishNow }: ScheduledPostsModalProps) {
  const [items, setItems] = useState<ScheduledPostItem[]>(() => {
    try {
      const stored = localStorage.getItem('seshnx_scheduled_posts');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const handleDelete = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    localStorage.setItem('seshnx_scheduled_posts', JSON.stringify(updated));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-lg bg-white dark:bg-dark-card rounded-3xl p-6 shadow-2xl border dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
            <Calendar className="text-brand-blue" size={20} />
            Scheduled Posts & Drafts
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No drafts or scheduled posts.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {items.map(item => (
              <div
                key={item.id}
                className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border dark:border-gray-700 flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium dark:text-white line-clamp-2">{item.text}</p>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                    item.isDraft
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-brand-blue'
                  }`}>
                    {item.isDraft ? 'Draft' : 'Scheduled'}
                  </span>
                </div>

                {!item.isDraft && item.scheduledTime && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-mono">
                    <Clock size={14} />
                    <span>Publishes: {item.scheduledTime}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t dark:border-gray-700">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-xs flex items-center gap-1 font-semibold"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                  <button
                    onClick={() => {
                      onPublishNow(item);
                      handleDelete(item.id);
                    }}
                    className="px-3 py-1.5 bg-brand-blue text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-blue-600"
                  >
                    <Send size={12} /> Publish Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
