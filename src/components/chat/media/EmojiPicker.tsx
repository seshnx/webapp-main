import React, { useState, useMemo } from 'react';
import { Search, X, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Picker position type
 */
export type EmojiPickerPosition = 'top' | 'bottom';

/**
 * Emoji categories with popular emojis
 */
const EMOJI_CATEGORIES: Record<string, string[]> = {
    'Recent': ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '👏'],
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮'],
    'Gestures': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
    'Objects': ['💎', '🔔', '🔕', '🎵', '🎶', '🎤', '🎧', '📻', '🎷', '🎺', '🎸', '🎹', '🎮', '🕹️', '🎯', '🎲', '🎳', '🎴', '🃏', '🀄', '🎰', '📱', '📞', '☎️', '📟', '📠', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '🕹️', '🗜️', '💾', '💿', '📀'],
    'Flags': ['🏳️', '🏴', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇯🇵', '🇰🇷', '🇨🇳', '🇮🇳', '🇧🇷', '🇲🇽'],
    'Music': ['🎵', '🎶', '🎤', '🎧', '📻', '🎷', '🎺', '🎸', '🎹', '🥁', '🪘', '🎻', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹'],
    'Reactions': ['👍', '👎', '❤️', '🔥', '😂', '😮', '😢', '👏', '🙌', '🤝', '🤗', '🤔', '🤦', '🤷', '🙏', '👀', '💪', '🤘', '✌️', '🤞']
};

// Get all emojis for search
const ALL_EMOJIS = Object.values(EMOJI_CATEGORIES).flat();

/**
 * Props for EmojiPicker component
 */
export interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose?: () => void;
    position?: EmojiPickerPosition;
}

/**
 * Full-featured emoji picker with categories, search, and recent emojis
 */
export default function EmojiPicker({
    onSelect,
    onClose,
    position = 'bottom'
}: EmojiPickerProps) {
    const [activeCategory, setActiveCategory] = useState<string>('Recent');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [recentEmojis, setRecentEmojis] = useState<string[]>(() => {
        // Load from localStorage
        const stored = localStorage.getItem('recentEmojis');
        return stored ? JSON.parse(stored) : EMOJI_CATEGORIES['Recent'];
    });

    // Filter emojis by search
    const filteredEmojis = useMemo(() => {
        if (!searchQuery.trim()) {
            return activeCategory === 'Recent'
                ? recentEmojis
                : EMOJI_CATEGORIES[activeCategory] || [];
        }

        // Simple search - in production you'd want emoji keywords
        return ALL_EMOJIS.filter(emoji =>
            emoji.includes(searchQuery) || searchQuery.includes(emoji)
        );
    }, [searchQuery, activeCategory, recentEmojis]);

    const handleEmojiSelect = (emoji: string) => {
        // Add to recent (max 8)
        const updatedRecent = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 8);
        setRecentEmojis(updatedRecent);
        localStorage.setItem('recentEmojis', JSON.stringify(updatedRecent));

        onSelect(emoji);
        if (onClose) onClose();
    };

    const categories = Object.keys(EMOJI_CATEGORIES);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === 'bottom' ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
                absolute ${position === 'bottom' ? 'bottom-full mb-2' : 'top-full mt-2'}
                left-0
                w-[340px] bg-white dark:bg-gray-800
                rounded-2xl shadow-2xl border dark:border-gray-700
                z-50 overflow-hidden
            `}
        >
            {/* Header with search */}
            <div className="p-3 border-b dark:border-gray-700">
                <div className="relative mb-3">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search emojis..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-blue dark:text-white"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Category tabs */}
                <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`
                                px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition
                                ${activeCategory === category
                                    ? 'bg-brand-blue text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }
                            `}
                        >
                            {category === 'Recent' ? (
                                <Clock size={12} className="inline mr-1" />
                            ) : null}
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Emoji grid */}
            <div className="h-[280px] overflow-y-auto custom-scrollbar p-3">
                {filteredEmojis.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <p className="text-sm">No emojis found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-8 gap-1">
                        {filteredEmojis.map((emoji, index) => (
                            <motion.button
                                key={`${emoji}-${index}`}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEmojiSelect(emoji)}
                                className="w-10 h-10 flex items-center justify-center text-xl rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                                {emoji}
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
