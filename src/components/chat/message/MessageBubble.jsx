import React, { useState, useRef, useEffect } from 'react';
import { 
    CornerUpLeft, 
    Pencil, 
    Trash2, 
    Forward, 
    Copy, 
    MoreHorizontal,
    FileText,
    Globe,
    Link as LinkIcon,
    X,
    Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageReactions from './MessageReactions';
import MessageStatus from './MessageStatus';
import AudioWaveform from '../media/AudioWaveform';
import UserAvatar from '../../shared/UserAvatar';

// Reaction emoji set (6 reactions)
export const CHAT_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

/**
 * Enhanced message bubble component with reactions, reply, edit, delete
 */
export default function MessageBubble({
    message,
    isCurrentUser,
    previousMessage,
    currentUserId,
    chatId,
    linkPreviewData,
    messageStatus = 'sent', // 'sending' | 'sent' | 'delivered' | 'read'
    onReaction,
    onReply,
    onEdit,
    onDelete,
    onForward,
    onSeshNxLinkClick,
    onUserClick
}) {
    const [showMenu, setShowMenu] = useState(false);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef(null);
    const bubbleRef = useRef(null);

    // Calculate grouping logic
    const isFirstInGroup = !previousMessage || previousMessage.s !== message.s;
    const isSameDay = previousMessage && 
        new Date(message.t).toDateString() === new Date(previousMessage.t).toDateString();
    const currentMs = message.t || Date.now();
    const prevMs = previousMessage?.t || 0;
    const isFarApart = previousMessage && (currentMs - prevMs > 300000); // 5 min gap

    const shouldShowDate = !isSameDay || !previousMessage;
    const shouldShowTime = isFirstInGroup || isFarApart;
    const shouldShowAvatar = !isCurrentUser && isFirstInGroup;

    const msgDate = new Date(message.t || Date.now());

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
                setShowReactionPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Copy message text
    const handleCopy = () => {
        navigator.clipboard.writeText(message.b || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setShowMenu(false);
    };

    // Handle reaction click
    const handleReaction = (emoji) => {
        onReaction?.(message.id, emoji);
        setShowReactionPicker(false);
        setShowMenu(false);
    };

    // Get reaction counts
    const reactionCounts = message.reactions 
        ? Object.entries(message.reactions).reduce((acc, [emoji, users]) => {
            const count = typeof users === 'object' ? Object.keys(users).length : 0;
            if (count > 0) acc[emoji] = count;
            return acc;
        }, {})
        : {};
    
    const hasReactions = Object.keys(reactionCounts).length > 0;
    const myReaction = message.reactions 
        ? Object.entries(message.reactions).find(([emoji, users]) => 
            typeof users === 'object' && users[currentUserId]
          )?.[0]
        : null;

    // Message styling
    const bubbleClass = isCurrentUser
        ? 'bg-brand-blue text-white rounded-br-sm'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm';

    // Deleted message
    if (message.deleted || message.deletedForAll) {
        return (
            <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-3' : 'mt-0.5'}`}>
                <div className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 italic text-sm">
                    🚫 This message was deleted
                </div>
            </div>
        );
    }

    // Check if deleted for current user only
    if (message.deletedFor && message.deletedFor[currentUserId]) {
        return null;
    }

    // Render link preview
    const renderLinkPreview = () => {
        if (!linkPreviewData) return null;
        const isSeshNxLink = linkPreviewData.url?.includes('app.seshnx.com');

        return (
            <div className="mt-2 block border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 max-w-[280px]">
                {isSeshNxLink ? (
                    <button 
                        onClick={() => onSeshNxLinkClick?.(linkPreviewData)} 
                        className="w-full text-left"
                    >
                        {linkPreviewData.image && (
                            <div 
                                className="h-28 w-full bg-cover bg-center" 
                                style={{ backgroundImage: `url(${linkPreviewData.image})` }}
                            />
                        )}
                        <div className="p-2">
                            <p className="font-semibold text-xs text-brand-blue truncate flex items-center">
                                <LinkIcon className="w-3 h-3 mr-1"/>
                                {linkPreviewData.title || 'SeshNx Link'}
                            </p>
                            {linkPreviewData.description && (
                                <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                                    {linkPreviewData.description}
                                </p>
                            )}
                        </div>
                    </button>
                ) : (
                    <a href={linkPreviewData.url} target="_blank" rel="noopener noreferrer">
                        {linkPreviewData.image && (
                            <div 
                                className="h-28 w-full bg-cover bg-center" 
                                style={{ backgroundImage: `url(${linkPreviewData.image})` }}
                            />
                        )}
                        <div className="p-2">
                            <p className="font-semibold text-xs text-brand-blue truncate">
                                {linkPreviewData.title || linkPreviewData.url}
                            </p>
                            {linkPreviewData.description && (
                                <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                                    {linkPreviewData.description}
                                </p>
                            )}
                            <p className="text-[10px] text-gray-400 mt-1 flex items-center">
                                <Globe className="w-2.5 h-2.5 mr-1"/>
                                {new URL(linkPreviewData.url).hostname}
                            </p>
                        </div>
                    </a>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Date separator */}
            {shouldShowDate && (
                <div className="text-center my-4">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        {msgDate.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </span>
                </div>
            )}

            {/* Message row */}
            <div 
                className={`group flex items-end gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} ${isFirstInGroup ? 'mt-3' : 'mt-0.5'}`}
                ref={bubbleRef}
            >
                {/* Avatar (for others' messages) */}
                {!isCurrentUser && (
                    <div className="w-8 shrink-0">
                        {shouldShowAvatar && (
                            <UserAvatar 
                                src={message.photo}
                                name={message.n}
                                size="xs"
                                className="cursor-pointer"
                                onClick={() => onUserClick?.(message.s)}
                            />
                        )}
                    </div>
                )}

                {/* Message content */}
                <div className={`relative max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    {/* Sender name (for group chats, first in group) */}
                    {!isCurrentUser && isFirstInGroup && message.n && (
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1">
                            {message.n}
                        </p>
                    )}

                    {/* Reply preview */}
                    {message.replyTo && (
                        <div className={`mb-1 px-3 py-1.5 rounded-lg text-xs border-l-2 border-brand-blue ${
                            isCurrentUser 
                                ? 'bg-blue-400/30 text-blue-100' 
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                        }`}>
                            <p className="font-bold text-[10px] mb-0.5">{message.replyTo.sender}</p>
                            <p className="truncate opacity-80">{message.replyTo.text}</p>
                        </div>
                    )}

                    {/* Main bubble */}
                    <div 
                        className={`relative px-3 py-2 rounded-2xl shadow-sm ${bubbleClass} cursor-pointer transition-all hover:shadow-md`}
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        {/* Media content */}
                        {message.media && (
                            <div className="mb-2">
                                {message.media.type === 'image' && (
                                    <div className="relative rounded-lg overflow-hidden">
                                        {message.media.gif && (
                                            <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                                GIF
                                            </span>
                                        )}
                                        <img 
                                            src={message.media.url} 
                                            alt="Shared" 
                                            className="max-w-full h-auto rounded-lg max-h-60 object-cover"
                                        />
                                    </div>
                                )}
                                {message.media.type === 'video' && (
                                    <video 
                                        controls 
                                        src={message.media.url} 
                                        className="max-w-full h-auto rounded-lg max-h-60"
                                    />
                                )}
                                {message.media.type === 'audio' && (
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-w-[280px]">
                                        <AudioWaveform 
                                            audioUrl={message.media.url}
                                            height={50}
                                        />
                                    </div>
                                )}
                                {message.media.type === 'file' && (
                                    <a 
                                        href={message.media.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        download={message.media.name}
                                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition group"
                                    >
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                                            <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold dark:text-white truncate">
                                                {message.media.name || 'File'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Click to download
                                            </p>
                                        </div>
                                        <Download size={18} className="text-gray-400 group-hover:text-brand-blue transition shrink-0" />
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Text content */}
                        {message.b && (
                            <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">
                                {message.b}
                            </p>
                        )}

                        {/* Link preview */}
                        {message.b && renderLinkPreview()}

                        {/* Edited indicator */}
                        {message.edited && (
                            <span className={`text-[9px] ${isCurrentUser ? 'text-blue-200' : 'text-gray-400'} ml-1`}>
                                (edited)
                            </span>
                        )}
                    </div>

                    {/* Reactions display */}
                    {hasReactions && (
                        <div className={`flex flex-wrap gap-1 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            {Object.entries(reactionCounts).map(([emoji, count]) => (
                                <motion.button
                                    key={emoji}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    onClick={() => handleReaction(emoji)}
                                    className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-all ${
                                        myReaction === emoji
                                            ? 'bg-brand-blue/20 border-brand-blue text-brand-blue'
                                            : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    <span>{emoji}</span>
                                    <span className="text-[10px] font-bold">{count}</span>
                                </motion.button>
                            ))}
                        </div>
                    )}

                    {/* Time & status */}
                    {shouldShowTime && (
                        <div className={`flex items-center gap-1 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[10px] text-gray-400">
                                {msgDate.toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit' 
                                })}
                            </span>
                            {isCurrentUser && (
                                <MessageStatus 
                                    status={messageStatus} 
                                    size={10} 
                                    className="ml-0.5"
                                />
                            )}
                        </div>
                    )}

                    {/* Context menu */}
                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                ref={menuRef}
                                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                className={`absolute z-50 ${
                                    isCurrentUser ? 'right-0' : 'left-0'
                                } bottom-full mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 overflow-hidden min-w-[180px]`}
                            >
                                {/* Quick reactions */}
                                <div className="flex justify-center gap-1 p-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                                    {CHAT_REACTIONS.map(emoji => (
                                        <motion.button
                                            key={emoji}
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleReaction(emoji)}
                                            className={`text-lg p-1 rounded-full transition ${
                                                myReaction === emoji 
                                                    ? 'bg-brand-blue/20' 
                                                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            {emoji}
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Action buttons */}
                                <div className="p-1">
                                    <button 
                                        onClick={() => { onReply?.(message); setShowMenu(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                    >
                                        <CornerUpLeft size={16} className="text-gray-400" />
                                        <span className="dark:text-gray-200">Reply</span>
                                    </button>

                                    <button 
                                        onClick={handleCopy}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                    >
                                        <Copy size={16} className="text-gray-400" />
                                        <span className="dark:text-gray-200">
                                            {copied ? 'Copied!' : 'Copy'}
                                        </span>
                                    </button>

                                    <button 
                                        onClick={() => { onForward?.(message); setShowMenu(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                    >
                                        <Forward size={16} className="text-gray-400" />
                                        <span className="dark:text-gray-200">Forward</span>
                                    </button>

                                    {isCurrentUser && (
                                        <>
                                            <button 
                                                onClick={() => { onEdit?.(message); setShowMenu(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                            >
                                                <Pencil size={16} className="text-gray-400" />
                                                <span className="dark:text-gray-200">Edit</span>
                                            </button>

                                            <button 
                                                onClick={() => { onDelete?.(message, 'everyone'); setShowMenu(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition text-red-500"
                                            >
                                                <Trash2 size={16} />
                                                <span>Delete for Everyone</span>
                                            </button>
                                        </>
                                    )}

                                    <button 
                                        onClick={() => { onDelete?.(message, 'me'); setShowMenu(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-500"
                                    >
                                        <Trash2 size={16} />
                                        <span>Delete for Me</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Spacer for current user's messages */}
                {isCurrentUser && <div className="w-8 shrink-0" />}
            </div>
        </>
    );
}

