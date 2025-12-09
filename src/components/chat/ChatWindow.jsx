import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ArrowLeft, Info, MessageSquare } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { isConvexAvailable } from '../../config/convex';
import ChatInput from './ChatInput';
import SeshNxEmbedModal from '../SeshNxEmbedModal'; 
import MessageBubble from './message/MessageBubble';
import ForwardMessageModal from './message/ForwardMessageModal';
import PresenceIndicator, { StatusBadge } from './PresenceIndicator';
import { useUserPresence } from '../../hooks/usePresence';
import { useReadReceipts } from '../../hooks/useReadReceipts';
import getLinkPreview from '../../utils/linkPreview'; 
import UserAvatar from '../shared/UserAvatar';

export default function ChatWindow({ user, userData, activeChat, conversations, onBack, toggleDetails, openPublicProfile }) {
    const [linkPreviewData, setLinkPreviewData] = useState({});
    const [embedModal, setEmbedModal] = useState({ isOpen: false, url: '', previewData: null }); 
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [forwardingMessage, setForwardingMessage] = useState(null);
    const messagesEndRef = useRef(null);

    const chatId = activeChat?.id;
    const chatName = activeChat?.name || activeChat?.n || 'Unknown User';

    // Get other user's UID for direct chats (for presence and read receipts)
    const otherUserId = useMemo(() => {
        if (activeChat?.type === 'group') return null;
        if (activeChat?.uid) return activeChat.uid;
        if (chatId && chatId.includes('_')) {
            const parts = chatId.split('_');
            return parts.find(id => id !== user?.uid);
        }
        return null;
    }, [activeChat, chatId, user?.uid]);

    // Presence tracking
    const { online, lastSeen, loading: presenceLoading } = useUserPresence(otherUserId);

    // Read receipts tracking
    const { 
        markAsRead, 
        hasCurrentUserRead, 
        isMessageRead,
        myLastRead 
    } = useReadReceipts(chatId, user?.uid);

    // FIX: Determine Convex availability directly. 
    // Removing useMemo prevents the "Cannot access before initialization" error.
    const convexAvailable = isConvexAvailable();

    const messagesQuery = useMemo(() => {
        return chatId && convexAvailable ? { chatId, limit: 100 } : "skip";
    }, [chatId, convexAvailable]);

    // Fetch messages from Convex (automatically reactive)
    // Hook must always be called, but we skip if Convex not available
    const messagesData = useQuery(
        api.messages.getMessages,
        messagesQuery
    );

    // Transform Convex messages to match existing format
    const messages = useMemo(() => {
        if (!messagesData) return [];
        
        return messagesData.map(msg => ({
            id: msg._id,
            b: msg.content || '',
            s: msg.senderId,
            n: msg.senderName,
            photo: msg.senderPhoto || '',
            t: msg.timestamp,
            edited: msg.edited || false,
            editedAt: msg.editedAt,
            deleted: msg.deleted || false,
            deletedForAll: msg.deletedForAll || false,
            media: msg.media,
            replyTo: msg.replyTo,
            reactions: msg.reactions || {},
        }));
    }, [messagesData]);

    // Mutations - hooks must be called unconditionally (React rules)
    const sendMessageMutation = useMutation(api.messages.sendMessage);
    const editMessageMutation = useMutation(api.messages.editMessage);
    const deleteMessageMutation = useMutation(api.messages.deleteMessage);
    const addReactionMutation = useMutation(api.messages.addReaction);
    const removeReactionMutation = useMutation(api.messages.removeReaction);
    const updateConversationMutation = useMutation(api.conversations.updateConversation);
    const updateUnreadCountMutation = useMutation(api.conversations.updateUnreadCount);

    // Auto-scroll to bottom and mark messages as read
    useEffect(() => { 
        if (messagesEndRef.current && messages.length > 0) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Mark messages as read when viewing
    // Use a ref to track the last message count to prevent infinite loops
    const lastMarkedCountRef = useRef(0);
    
    useEffect(() => {
        if (chatId && user?.uid && messages.length > 0) {
            // Only mark as read if the message count actually changed
            // This prevents infinite loops from markAsRead triggering re-renders
            const currentMessageIds = messages.map(m => m.id);
            const currentCount = currentMessageIds.length;
            
            if (currentCount !== lastMarkedCountRef.current) {
                lastMarkedCountRef.current = currentCount;
                markAsRead(currentMessageIds);
            }
        }
    }, [chatId, user?.uid, messages.length, markAsRead]);

    // Fetch link previews for messages
    useEffect(() => {
        messages.forEach(msg => {
            if (msg.b) {
                const urlMatch = msg.b.match(/(https?:\/\/[^\s]+)/);
                if (urlMatch) {
                    const url = urlMatch[0];
                    if (!linkPreviewData[msg.id]) {
                        getLinkPreview(url)
                            .then(data => setLinkPreviewData(prev => ({ ...prev, [msg.id]: data })))
                            .catch(e => console.error(e));
                    }
                }
            }
        });
    }, [messages]);

    // --- REACTION HANDLER ---
    const handleReaction = async (messageId, emoji) => {
        if (!chatId || !user?.uid || !isConvexAvailable()) return;

        try {
            // Check if user already has this reaction
            const message = messages.find(m => m.id === messageId);
            if (!message) return;

            const hasReaction = message.reactions?.[emoji]?.includes(user.uid);
            
            if (hasReaction) {
                await removeReactionMutation({ messageId, userId: user.uid, emoji });
            } else {
                await addReactionMutation({ messageId, userId: user.uid, emoji });
            }
        } catch (error) {
            console.error('Reaction error:', error);
        }
    };

    // --- FORWARD HANDLER ---
    const handleForward = async (message, targetChatIds) => {
        if (!isConvexAvailable() || !sendMessageMutation || !updateConversationMutation) {
            alert("Chat functionality is not available. Convex is not configured.");
            return;
        }

        const forwardText = message.b || '';
        const forwardMedia = message.media || null;

        for (const targetChatId of targetChatIds) {
            try {
                await sendMessageMutation({
                    chatId: targetChatId,
                    senderId: user.uid,
                    senderName: userData.firstName || 'User',
                    senderPhoto: userData.photoURL || null,
                    content: `竊ｪ Forwarded: ${forwardText}`,
                    media: forwardMedia,
                });

                // Update conversation
                const targetConvo = conversations?.find(c => c.id === targetChatId);
                const summary = forwardText || (forwardMedia ? `Forwarded ${forwardMedia.type}` : 'Forwarded message');
                
                await updateConversationMutation({
                    userId: user.uid,
                    chatId: targetChatId,
                    lastMessage: `竊ｪ ${summary}`,
                    lastMessageTime: Date.now(),
                    lastSenderId: user.uid,
                    chatName: targetConvo?.name || targetConvo?.n,
                    chatPhoto: targetConvo?.photo || '',
                    chatType: targetConvo?.type || 'direct',
                    otherUserId: targetConvo?.uid,
                });
            } catch (error) {
                console.error('Forward error for chat:', targetChatId, error);
            }
        }
    };

    // --- SEND LOGIC ---
    const sendMessage = async (text, mediaData) => {
        if (!chatId || (!text?.trim() && !mediaData) || !isConvexAvailable() || !sendMessageMutation || !editMessageMutation || !updateConversationMutation || !updateUnreadCountMutation) return;
        
        let msgText = text ? text.trim() : '';
        if (msgText.length === 0 && mediaData) {
            msgText = mediaData.type === 'image' ? '胴 Image' : 
                      mediaData.type === 'video' ? '磁 Video' : 
                      mediaData.type === 'audio' ? '七 Audio' : '梼 File';
        }

        // Handle edit mode
        if (editingMessage) {
            try {
                await editMessageMutation({
                    messageId: editingMessage.id,
                    content: msgText,
                    senderId: user.uid,
                });
                setEditingMessage(null);
                return;
            } catch (error) {
                console.error('Edit error:', error);
                return;
            }
        }

        try {
            // Send message
            await sendMessageMutation({
                chatId,
                senderId: user.uid,
                senderName: userData.firstName || 'User',
                senderPhoto: userData.photoURL || null,
                content: msgText,
                media: mediaData,
                replyTo: replyingTo ? {
                    messageId: replyingTo.id,
                    text: replyingTo.b?.substring(0, 100) || 'Media',
                    sender: replyingTo.n || 'User',
                } : undefined,
            });

            // Update conversation for all recipients
            const summary = msgText || (mediaData ? `Sent ${mediaData.type}` : 'Message');
            let recipientIds = [];
            let otherUid = activeChat.uid;
            
            if (!otherUid && activeChat.type !== 'group' && chatId && chatId.includes('_')) {
                const parts = chatId.split('_');
                otherUid = parts.find(id => id !== user.uid);
            }
            
            if (activeChat.type === 'group') {
                // For group chats, get members from conversations or chat_members table
                recipientIds = [user.uid]; // TODO: Get actual group members
            } else if (otherUid) {
                recipientIds = [user.uid, otherUid];
            } else {
                recipientIds = [user.uid];
            }

            // Update conversations for all recipients
            for (const recipientUid of recipientIds) {
                await updateConversationMutation({
                    userId: recipientUid,
                    chatId,
                    lastMessage: summary,
                    lastMessageTime: Date.now(),
                    lastSenderId: user.uid,
                    chatName: activeChat.type === 'group' ? chatName : (activeChat.name || activeChat.n),
                    chatPhoto: activeChat.photo || '',
                    chatType: activeChat.type || 'direct',
                    otherUserId: activeChat.type === 'direct' ? (recipientUid === user.uid ? otherUid : user.uid) : undefined,
                });

                // Update unread count (increment for others, reset for sender)
                if (recipientUid === user.uid) {
                    await updateUnreadCountMutation({
                        userId: recipientUid,
                        chatId,
                        setTo: 0,
                    });
                } else {
                    await updateUnreadCountMutation({
                        userId: recipientUid,
                        chatId,
                        increment: 1,
                    });
                }
            }

            setReplyingTo(null);
        } catch (error) {
            console.error('Send message error:', error);
        }
    };

    // --- DELETE HANDLER ---
    const handleDelete = async (messageId, forEveryone = false) => {
        if (!chatId || !user?.uid || !isConvexAvailable() || !deleteMessageMutation) return;

        try {
            await deleteMessageMutation({
                messageId,
                senderId: user.uid,
                forEveryone,
            });
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    // --- HEADER ---
    const ChatHeader = useMemo(() => (
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-800 bg-white dark:bg-[#1f2128]">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                    onClick={onBack}
                    className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div 
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    onClick={() => openPublicProfile?.(otherUserId ? { uid: otherUserId } : null)}
                >
                    <UserAvatar 
                        src={activeChat?.photo || activeChat?.n?.photo || ''} 
                        name={chatName}
                        size="md"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {chatName}
                            </h3>
                            {activeChat?.type !== 'group' && (
                                <PresenceIndicator 
                                    online={online} 
                                    lastSeen={lastSeen} 
                                    loading={presenceLoading}
                                />
                            )}
                        </div>
                        {activeChat?.type !== 'group' && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {online ? 'Online' : lastSeen ? `Last seen ${formatLastSeen(lastSeen)}` : 'Offline'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={toggleDetails}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
                <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
        </div>
    ), [activeChat, chatName, online, lastSeen, presenceLoading, otherUserId, onBack, toggleDetails, openPublicProfile]);

    // Format last seen helper
    const formatLastSeen = (timestamp) => {
        if (!timestamp) return 'Never';
        const lastSeenMs = typeof timestamp === 'number' ? timestamp : timestamp;
        const now = Date.now();
        const diffMs = now - lastSeenMs;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return new Date(lastSeenMs).toLocaleDateString();
    };

    // Early return for no active chat (after all hooks are called to maintain hook count)
    if (!activeChat || !chatId) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-[#1f2128] items-center justify-center text-gray-400">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">町</span>
                </div>
                <p>Select a conversation to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#1f2128]">
            {ChatHeader}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message, index) => {
                        const previousMessage = index > 0 ? messages[index - 1] : null;
                        const isCurrentUser = message.s === user?.uid;
                        const isRead = isMessageRead(message.id);
                        const hasRead = hasCurrentUserRead(message.id);

                        return (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                isCurrentUser={isCurrentUser}
                                previousMessage={previousMessage}
                                currentUserId={user?.uid}
                                chatId={chatId}
                                linkPreviewData={linkPreviewData[message.id]}
                                messageStatus={isRead ? 'read' : hasRead ? 'delivered' : 'sent'}
                                onReaction={(emoji) => handleReaction(message.id, emoji)}
                                onReply={() => setReplyingTo(message)}
                                onEdit={() => setEditingMessage(message)}
                                onDelete={(forEveryone) => handleDelete(message.id, forEveryone)}
                                onForward={() => setForwardingMessage(message)}
                                onSeshNxLinkClick={(url) => setEmbedModal({ isOpen: true, url, previewData: null })}
                                onUserClick={() => openPublicProfile?.({ uid: message.s })}
                            />
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <ChatInput
                onSend={sendMessage}
                replyingTo={replyingTo}
                editingMessage={editingMessage}
                onCancelReply={() => setReplyingTo(null)}
                onCancelEdit={() => setEditingMessage(null)}
            />

            {/* Forward Modal */}
            {forwardingMessage && (
                <ForwardMessageModal
                    message={forwardingMessage}
                    conversations={conversations}
                    onClose={() => setForwardingMessage(null)}
                    onForward={handleForward}
                />
            )}

            {/* Embed Modal */}
            {embedModal.isOpen && (
                <SeshNxEmbedModal
                    url={embedModal.url}
                    previewData={embedModal.previewData}
                    onClose={() => setEmbedModal({ isOpen: false, url: '', previewData: null })}
                />
            )}
        </div>
    );
}
