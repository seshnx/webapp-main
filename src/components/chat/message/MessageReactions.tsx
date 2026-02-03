import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 6 reaction emojis for chat
export const CHAT_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'] as const;

/**
 * Reaction picker position
 */
export type ReactionPickerPosition = 'top' | 'bottom';

/**
 * Reaction alignment
 */
export type ReactionAlignment = 'left' | 'right';

/**
 * Props for ReactionPicker component
 */
export interface ReactionPickerProps {
    onSelect: (emoji: string) => void;
    currentReaction?: string;
    position?: ReactionPickerPosition;
}

/**
 * Floating reaction picker that appears on hover/click
 */
export function ReactionPicker({
    onSelect,
    currentReaction,
    position = 'top'
}: ReactionPickerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: position === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: position === 'top' ? 10 : -10 }}
            className={`
                absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
                left-1/2 -translate-x-1/2
                bg-white dark:bg-gray-800
                shadow-xl rounded-full
                p-1.5 flex gap-1
                border dark:border-gray-700
                z-50
            `}
        >
            {CHAT_REACTIONS.map(emoji => (
                <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.3, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onSelect(emoji)}
                    className={`
                        text-xl p-1.5 rounded-full transition-colors
                        ${currentReaction === emoji
                            ? 'bg-brand-blue/20 ring-2 ring-brand-blue'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                    `}
                >
                    {emoji}
                </motion.button>
            ))}
        </motion.div>
    );
}

/**
 * Reactions type
 */
export type ReactionsType = Record<string, Record<string, boolean> | string[]>;

/**
 * Props for ReactionDisplay component
 */
export interface ReactionDisplayProps {
    reactions: ReactionsType;
    currentUserId: string;
    onReactionClick: (emoji: string) => void;
    alignment?: ReactionAlignment;
}

/**
 * Display reactions on a message
 */
export function ReactionDisplay({
    reactions,
    currentUserId,
    onReactionClick,
    alignment = 'left'
}: ReactionDisplayProps) {
    if (!reactions || Object.keys(reactions).length === 0) return null;

    // Calculate counts
    interface ReactionCount {
        emoji: string;
        count: number;
        hasMyReaction: boolean;
    }

    const reactionCounts: ReactionCount[] = Object.entries(reactions).reduce((acc: ReactionCount[], [emoji, users]) => {
        const usersObj = users as Record<string, boolean>;
        const count = typeof users === 'object' ? Object.keys(usersObj).length : 0;
        if (count > 0) {
            acc.push({
                emoji,
                count,
                hasMyReaction: typeof users === 'object' && usersObj[currentUserId]
            });
        }
        return acc;
    }, []);

    if (reactionCounts.length === 0) return null;

    return (
        <div className={`flex flex-wrap gap-1 mt-1 ${alignment === 'right' ? 'justify-end' : 'justify-start'}`}>
            {reactionCounts.map(({ emoji, count, hasMyReaction }) => (
                <motion.button
                    key={emoji}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onReactionClick(emoji)}
                    className={`
                        flex items-center gap-0.5 px-1.5 py-0.5
                        rounded-full text-xs border transition-all
                        ${hasMyReaction
                            ? 'bg-brand-blue/20 border-brand-blue text-brand-blue dark:text-blue-400'
                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }
                    `}
                >
                    <span>{emoji}</span>
                    <span className="text-[10px] font-bold">{count}</span>
                </motion.button>
            ))}
        </div>
    );
}

/**
 * Props for QuickReactionBar component
 */
export interface QuickReactionBarProps {
    onSelect: (emoji: string) => void;
    currentReaction?: string;
    show: boolean;
    isRight?: boolean;
}

/**
 * Inline reaction bar for quick access
 */
export function QuickReactionBar({
    onSelect,
    currentReaction,
    show,
    isRight = false
}: QuickReactionBarProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, x: isRight ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRight ? 10 : -10 }}
                    className={`
                        absolute top-1/2 -translate-y-1/2
                        ${isRight ? 'right-full mr-2' : 'left-full ml-2'}
                        bg-white dark:bg-gray-800
                        shadow-lg rounded-full
                        px-2 py-1 flex gap-0.5
                        border dark:border-gray-700
                    `}
                >
                    {CHAT_REACTIONS.slice(0, 4).map(emoji => (
                        <motion.button
                            key={emoji}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onSelect(emoji)}
                            className={`
                                text-sm p-1 rounded-full
                                ${currentReaction === emoji
                                    ? 'bg-brand-blue/20'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                }
                            `}
                        >
                            {emoji}
                        </motion.button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default ReactionPicker;
