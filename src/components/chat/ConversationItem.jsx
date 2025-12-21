import React from 'react';
import { Trash2 } from 'lucide-react';
import UserAvatar from '../shared/UserAvatar';
import PresenceIndicator from './PresenceIndicator';
import { useUserPresence } from '../../hooks/usePresence';

/**
 * Individual conversation item in sidebar with presence indicator
 */
export default function ConversationItem({ 
    conversation, 
    activeChat, 
    currentUserId, 
    onSelect, 
    onDelete 
}) {
    // Get other user's UID for direct chats
    const otherUserId = conversation.type === 'direct' 
        ? (conversation.uid || (conversation.id.includes('_') 
            ? conversation.id.split('_').find(id => id !== currentUserId) 
            : null))
        : null;

    // Get presence for direct chats
    const { online, lastSeen } = useUserPresence(otherUserId || '');

    return (
        <div 
            onClick={() => onSelect(conversation)} 
            className={`group relative flex gap-3 p-4 cursor-pointer transition border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 ${
                activeChat?.id === conversation.id 
                    ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-brand-blue' 
                    : ''
            }`}
        >
            <div className="relative shrink-0">
                <UserAvatar 
                    src={conversation.photo} 
                    name={conversation.n} 
                    size="lg" 
                    isGroup={conversation.type === 'group'} 
                />
                {/* Online indicator for direct chats */}
                {conversation.type === 'direct' && otherUserId && (
                    <div className="absolute -bottom-0.5 -right-0.5">
                        <PresenceIndicator 
                            online={online} 
                            lastSeen={lastSeen}
                            size="xs"
                        />
                    </div>
                )}
                {/* Unread count badge */}
                {conversation.uc > 0 && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-brand-blue text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-[#2c2e36]">
                        {conversation.uc > 99 ? '99+' : conversation.uc}
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                    <h4 className={`text-sm truncate ${
                        conversation.uc > 0 
                            ? 'font-extrabold text-gray-900 dark:text-white' 
                            : 'font-bold text-gray-700 dark:text-gray-300'
                    }`}>
                        {conversation.n}
                    </h4>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                        {conversation.lmt ? new Date(conversation.lmt).toLocaleDateString() : ''}
                    </span>
                </div>
                <p className={`text-xs truncate ${
                    conversation.uc > 0 
                        ? 'text-gray-800 dark:text-gray-200 font-medium' 
                        : 'text-gray-500'
                }`}>
                    {conversation.ls === currentUserId ? 'You: ' : ''}{conversation.lm}
                </p>
            </div>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(conversation.id);
                }} 
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-gray-800 shadow-md rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}

