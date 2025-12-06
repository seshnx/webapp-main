import React, { useState } from 'react';
import { X, Search, Forward, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserAvatar from '../../shared/UserAvatar';

/**
 * Modal for forwarding a message to other conversations
 */
export default function ForwardMessageModal({
    message,
    conversations,
    currentUserId,
    onForward,
    onClose
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChats, setSelectedChats] = useState([]);
    const [forwarding, setForwarding] = useState(false);

    // Filter conversations by search
    const filteredConversations = searchQuery.trim()
        ? conversations.filter(c => 
            c.n?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : conversations;

    const toggleSelect = (chatId) => {
        setSelectedChats(prev => 
            prev.includes(chatId)
                ? prev.filter(id => id !== chatId)
                : [...prev, chatId]
        );
    };

    const handleForward = async () => {
        if (selectedChats.length === 0) return;
        
        setForwarding(true);
        try {
            await onForward(message, selectedChats);
            onClose();
        } catch (error) {
            console.error('Forward error:', error);
            alert('Failed to forward message');
        }
        setForwarding(false);
    };

    // Message preview
    const getMessagePreview = () => {
        if (message.media) {
            if (message.media.type === 'image') return '📷 Image';
            if (message.media.type === 'video') return '🎥 Video';
            if (message.media.type === 'audio') return '🎵 Audio';
            return '📎 File';
        }
        return message.b?.substring(0, 100) || 'Message';
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-[#2c2e36] rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <Forward className="text-brand-blue" size={20} />
                        <h3 className="font-bold text-lg dark:text-white">Forward Message</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Message preview */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 shrink-0">
                    <p className="text-xs text-gray-500 mb-1">Forwarding:</p>
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600">
                        <p className="text-sm dark:text-gray-200 line-clamp-2">
                            {getMessagePreview()}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="px-4 py-3 border-b dark:border-gray-700 shrink-0">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-blue dark:text-white transition"
                        />
                    </div>
                </div>

                {/* Conversation list */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <p className="text-sm">No conversations found</p>
                        </div>
                    ) : (
                        filteredConversations.map(convo => {
                            const isSelected = selectedChats.includes(convo.id);
                            return (
                                <motion.div
                                    key={convo.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => toggleSelect(convo.id)}
                                    className={`
                                        flex items-center gap-3 p-4 cursor-pointer transition
                                        border-b dark:border-gray-700/50
                                        ${isSelected 
                                            ? 'bg-brand-blue/10 dark:bg-brand-blue/20' 
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }
                                    `}
                                >
                                    <div className="relative">
                                        <UserAvatar
                                            src={convo.photo}
                                            name={convo.n}
                                            size="md"
                                            isGroup={convo.type === 'group'}
                                        />
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -bottom-1 -right-1 w-5 h-5 bg-brand-blue rounded-full flex items-center justify-center"
                                            >
                                                <Check size={12} className="text-white" />
                                            </motion.div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm dark:text-white truncate">
                                            {convo.n}
                                        </h4>
                                        <p className="text-xs text-gray-500 truncate">
                                            {convo.type === 'group' ? 'Group' : 'Direct message'}
                                        </p>
                                    </div>
                                    <div className={`
                                        w-5 h-5 rounded-full border-2 transition
                                        ${isSelected 
                                            ? 'border-brand-blue bg-brand-blue' 
                                            : 'border-gray-300 dark:border-gray-600'
                                        }
                                    `}>
                                        {isSelected && <Check size={12} className="text-white m-auto" />}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-[#23262f] shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500">
                            {selectedChats.length} conversation{selectedChats.length !== 1 ? 's' : ''} selected
                        </span>
                        {selectedChats.length > 0 && (
                            <button 
                                onClick={() => setSelectedChats([])}
                                className="text-xs text-brand-blue hover:underline"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleForward}
                        disabled={selectedChats.length === 0 || forwarding}
                        className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                        {forwarding ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Forwarding...
                            </>
                        ) : (
                            <>
                                <Forward size={18} />
                                Forward
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

