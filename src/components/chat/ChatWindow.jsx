import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ArrowLeft, Info, MessageSquare } from 'lucide-react';
import { ref, onValue, push, update, set, remove, serverTimestamp, query, limitToLast, get } from 'firebase/database';
import ChatInput from './ChatInput';
import SeshNxEmbedModal from '../SeshNxEmbedModal'; 
import MessageBubble from './message/MessageBubble';
import ForwardMessageModal from './message/ForwardMessageModal';
import PresenceIndicator, { StatusBadge } from './PresenceIndicator';
import { useUserPresence } from '../../hooks/usePresence';
import { useReadReceipts } from '../../hooks/useReadReceipts';
import getLinkPreview from '../../utils/linkPreview'; 
import { rtdb } from '../../config/firebase'; 
import UserAvatar from '../shared/UserAvatar';

export default function ChatWindow({ user, userData, activeChat, conversations, onBack, toggleDetails, openPublicProfile }) {
    const [messages, setMessages] = useState([]);
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

    // Auto-scroll to bottom and mark messages as read
    useEffect(() => { 
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
        
        // Mark latest message as read when viewing chat
        if (messages.length > 0 && chatId) {
            const latestMessage = messages[messages.length - 1];
            // Only mark as read if it's not from current user and not already read
            if (latestMessage.s !== user?.uid && !hasCurrentUserRead(latestMessage.id)) {
                markAsRead(latestMessage.id);
            }
        }
    }, [messages, chatId, markAsRead, hasCurrentUserRead, user?.uid]);

    // Mark messages as read when scrolling (intersection observer for better UX)
    const messageObserverRef = useRef(null);
    
    useEffect(() => {
        if (!chatId || !messages.length) return;

        // Create intersection observer to mark messages as read when in view
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        messageObserverRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const messageId = entry.target.dataset.messageId;
                    if (messageId) {
                        const message = messages.find(m => m.id === messageId);
                        // Mark as read if message is from other user
                        if (message && message.s !== user?.uid && !hasCurrentUserRead(messageId)) {
                            markAsRead(messageId);
                        }
                    }
                }
            });
        }, observerOptions);

        // Observe all messages from other users
        messages.forEach(msg => {
            if (msg.s !== user?.uid) {
                const element = document.querySelector(`[data-message-id="${msg.id}"]`);
                if (element) {
                    messageObserverRef.current.observe(element);
                }
            }
        });

        return () => {
            if (messageObserverRef.current) {
                messageObserverRef.current.disconnect();
            }
        };
    }, [messages, chatId, user?.uid, markAsRead, hasCurrentUserRead]);

    const handleSeshNxLinkClick = (previewData) => { 
        setEmbedModal({ isOpen: true, url: previewData.url, previewData: previewData }); 
    };

    // --- RTDB LISTENER ---
    useEffect(() => {
        if (!chatId || !rtdb) {
            if (!rtdb) {
                console.warn('Realtime Database is not available. Chat messages cannot be loaded.');
            }
            return;
        }
        const messagesRef = query(ref(rtdb, `messages/${chatId}`), limitToLast(100));
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loadedMessages = Object.entries(data).map(([key, val]) => ({ id: key, ...val }));
                loadedMessages.sort((a, b) => a.t - b.t);
                setMessages(loadedMessages);
                
                // Fetch link previews
                loadedMessages.forEach(msg => {
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
            } else { 
                setMessages([]); 
            }
        });
        return () => unsubscribe();
    }, [chatId, rtdb]); 

    // --- REACTION HANDLER ---
    const handleReaction = async (messageId, emoji) => {
        if (!chatId || !user?.uid || !rtdb) return;

        const reactionPath = `messages/${chatId}/${messageId}/reactions/${emoji}/${user.uid}`;
        const currentReactionRef = ref(rtdb, reactionPath);

        try {
            // Check if user already has this reaction
            const snapshot = await get(currentReactionRef);
            
            if (snapshot.exists()) {
                // Remove reaction
                await remove(currentReactionRef);
            } else {
                // First, remove any existing reaction from this user
                const allReactionsRef = ref(rtdb, `messages/${chatId}/${messageId}/reactions`);
                const reactionsSnap = await get(allReactionsRef);
                
                if (reactionsSnap.exists()) {
                    const reactions = reactionsSnap.val();
                    for (const [existingEmoji, users] of Object.entries(reactions)) {
                        if (users[user.uid]) {
                            await remove(ref(rtdb, `messages/${chatId}/${messageId}/reactions/${existingEmoji}/${user.uid}`));
                        }
                    }
                }
                
                // Add new reaction
                await set(currentReactionRef, true);
            }
        } catch (error) {
            console.error('Reaction error:', error);
        }
    };

    // --- DELETE HANDLER ---
    const handleDelete = async (message, deleteType) => {
        if (!chatId || !rtdb) return;

        const confirmMsg = deleteType === 'everyone' 
            ? 'Delete this message for everyone? This cannot be undone.'
            : 'Delete this message for yourself?';
        
        if (!window.confirm(confirmMsg)) return;

        try {
            const msgRef = ref(rtdb, `messages/${chatId}/${message.id}`);
            
            if (deleteType === 'everyone') {
                // Mark as deleted for everyone
                await update(msgRef, { 
                    deletedForAll: true, 
                    deleted: true,
                    deletedAt: serverTimestamp() 
                });
            } else {
                // Mark as deleted for current user only
                await update(msgRef, { 
                    [`deletedFor/${user.uid}`]: true 
                });
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete message');
        }
    };

    // --- FORWARD HANDLER ---
    const handleForward = async (message, targetChatIds) => {
        if (!rtdb) {
            alert("Chat functionality is not available. Realtime Database is not configured.");
            return;
        }
        const timestamp = serverTimestamp();
        const forwardText = message.b || '';
        const forwardMedia = message.media || null;

        for (const targetChatId of targetChatIds) {
            try {
                const newMsgKey = push(ref(rtdb, `messages/${targetChatId}`)).key;
                const updates = {};
                
                updates[`messages/${targetChatId}/${newMsgKey}`] = {
                    b: forwardText,
                    s: user.uid,
                    t: timestamp,
                    n: userData.firstName || 'User',
                    forwarded: true,
                    forwardedFrom: chatName,
                    ...(forwardMedia && { media: forwardMedia })
                };

                // Update conversation metadata
                const targetConvo = conversations?.find(c => c.id === targetChatId);
                const summary = forwardText || (forwardMedia ? `Forwarded ${forwardMedia.type}` : 'Forwarded message');
                
                // Get recipients
                let recipientIds = [user.uid];
                if (targetConvo?.type === 'group') {
                    const membersSnap = await get(ref(rtdb, `chats/${targetChatId}/members`));
                    if (membersSnap.exists()) {
                        recipientIds = Object.keys(membersSnap.val());
                    }
                } else if (targetConvo?.uid) {
                    recipientIds = [user.uid, targetConvo.uid];
                }

                recipientIds.forEach(recipientUid => {
                    const userPath = `conversations/${recipientUid}/${targetChatId}`;
                    updates[`${userPath}/lm`] = `↪ ${summary}`;
                    updates[`${userPath}/lmt`] = timestamp;
                    updates[`${userPath}/ls`] = user.uid;
                });

                await update(ref(rtdb), updates);
            } catch (error) {
                console.error('Forward error for chat:', targetChatId, error);
            }
        }
    };

    // --- SEND LOGIC ---
    const sendMessage = async (text, mediaData) => {
        if (!chatId || (!text?.trim() && !mediaData) || !rtdb) return;
        
        const timestamp = serverTimestamp();
        let msgText = text ? text.trim() : '';
        if (msgText.length === 0 && mediaData) {
            msgText = mediaData.type === 'image' ? '📷 Image' : 
                      mediaData.type === 'video' ? '🎥 Video' : 
                      mediaData.type === 'audio' ? '🎵 Audio' : '📎 File';
        }

        // Handle edit mode
        if (editingMessage) {
            try {
                await update(ref(rtdb, `messages/${chatId}/${editingMessage.id}`), {
                    b: msgText,
                    edited: true,
                    editedAt: serverTimestamp()
                });
                setEditingMessage(null);
                return;
            } catch (error) {
                console.error('Edit error:', error);
                return;
            }
        }

        const newMsgKey = push(ref(rtdb, `messages/${chatId}`)).key;
        const updates = {};
        
        // Build message object
        const messageData = {
            b: msgText,
            s: user.uid,
            t: timestamp,
            n: userData.firstName || 'User',
            photo: userData.photoURL || null,
            ...(mediaData && { media: mediaData })
        };

        // Add reply reference if replying
        if (replyingTo) {
            messageData.replyTo = {
                id: replyingTo.id,
                text: replyingTo.b?.substring(0, 100) || 'Media',
                sender: replyingTo.n || 'User'
            };
        }

        updates[`messages/${chatId}/${newMsgKey}`] = messageData;

        const summary = msgText || (mediaData ? `Sent ${mediaData.type}` : 'Message');
        
        // Determine recipients
        let recipientIds = [];
        let otherUid = activeChat.uid;
        
        if (!otherUid && activeChat.type !== 'group' && chatId && chatId.includes('_')) {
            const parts = chatId.split('_');
            otherUid = parts.find(id => id !== user.uid);
        }
        
        if (activeChat.type === 'group') {
            try {
                const membersSnap = await get(ref(rtdb, `chats/${chatId}/members`));
                if (membersSnap.exists()) recipientIds = Object.keys(membersSnap.val());
            } catch (e) { 
                console.error(e); 
                recipientIds = [user.uid]; 
            }
        } else if (otherUid) {
            recipientIds = [user.uid, otherUid];
        } else {
            recipientIds = [user.uid];
        }

        // Update conversation metadata for all recipients
        recipientIds.forEach(recipientUid => {
            const userPath = `conversations/${recipientUid}/${chatId}`;
            updates[`${userPath}/lm`] = summary;
            updates[`${userPath}/lmt`] = timestamp;
            updates[`${userPath}/ls`] = user.uid;
            if (recipientUid === user.uid) updates[`${userPath}/uc`] = 0; 
            
            if (activeChat.type === 'group') {
                updates[`${userPath}/n`] = chatName;
                updates[`${userPath}/type`] = 'group';
                updates[`${userPath}/uid`] = chatId;
            } else {
                const isMe = recipientUid === user.uid;
                const otherName = activeChat.name || activeChat.n;
                const myName = userData.displayName || `${userData.firstName} ${userData.lastName}`;
                updates[`${userPath}/n`] = isMe ? otherName : myName;
                updates[`${userPath}/photo`] = isMe ? (activeChat.photo || '') : (userData.photoURL || '');
                updates[`${userPath}/uid`] = isMe ? (otherUid || chatId) : user.uid;
                updates[`${userPath}/type`] = 'direct';
            }
        });

        try { 
            await update(ref(rtdb), updates);
            setReplyingTo(null);
        } catch (error) { 
            console.error(error); 
        }
    };

    // --- HEADER ---
    const ChatHeader = useMemo(() => (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f2128] sticky top-0 z-10 shadow-sm">
            <div className="flex items-center">
                <button 
                    onClick={onBack} 
                    className="p-2 mr-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition md:hidden"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => {
                        // For group chats, don't open profile (or use chatId if needed)
                        // For direct chats, use activeChat.uid with fallback to otherUserId
                        if (activeChat.type === 'group') {
                            // Groups don't have a single profile to open
                            return;
                        }
                        openPublicProfile?.(activeChat.uid || otherUserId);
                    }}
                >
                    <UserAvatar 
                        src={activeChat.photo} 
                        name={chatName} 
                        size="md" 
                        isGroup={activeChat.type === 'group'} 
                    />
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white truncate max-w-[150px] md:max-w-xs text-sm">
                            {chatName}
                        </span>
                        {activeChat.type !== 'group' && !presenceLoading && (
                            <StatusBadge 
                                online={online} 
                                lastSeen={lastSeen}
                                showLastSeen={!online}
                            />
                        )}
                        {activeChat.type === 'group' && (
                            <span className="text-xs text-gray-500">
                                Group chat
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <button 
                onClick={toggleDetails} 
                className="p-2 text-gray-500 hover:text-brand-blue dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
                <Info className="w-5 h-5" />
            </button>
        </div>
    ), [activeChat, chatName, onBack, toggleDetails, openPublicProfile, otherUserId, online, lastSeen, presenceLoading]);

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-[#1f2128]">
            {ChatHeader}
            
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar bg-gray-50 dark:bg-[#1f2128]">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                        </div>
                        <p className="font-bold text-gray-600 dark:text-gray-300">No messages yet</p>
                        <p className="text-sm">Say hello to start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        // Determine message status for current user's messages
                        let messageStatus = 'sent';
                        if (msg.s === user.uid) {
                            // Check if message has been read by recipient
                            // Pass messages array for accurate timestamp comparison
                            if (otherUserId && isMessageRead(msg.id, otherUserId, messages)) {
                                messageStatus = 'read';
                            } else {
                                messageStatus = 'delivered';
                            }
                        }
                        
                        return (
                            <MessageBubble
                                key={msg.id}
                                data-message-id={msg.id}
                                message={msg}
                                isCurrentUser={msg.s === user.uid}
                                previousMessage={messages[index - 1]}
                                currentUserId={user.uid}
                                chatId={chatId}
                                linkPreviewData={linkPreviewData[msg.id]}
                                messageStatus={messageStatus}
                                onReaction={handleReaction}
                                onReply={(msg) => setReplyingTo(msg)}
                                onEdit={(msg) => setEditingMessage(msg)}
                                onDelete={handleDelete}
                                onForward={(msg) => setForwardingMessage(msg)}
                                onSeshNxLinkClick={handleSeshNxLinkClick}
                                onUserClick={openPublicProfile}
                            />
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>
            
            {/* Input area */}
            <div className="sticky bottom-0 z-20">
                <ChatInput 
                    activeChatId={chatId} 
                    uid={user.uid} 
                    onSend={sendMessage} 
                    typingUsers={[]}
                    replyingTo={replyingTo}
                    editingMessage={editingMessage}
                    onCancelReply={() => {
                        setReplyingTo(null);
                        setEditingMessage(null);
                    }}
                />
            </div>
            
            {/* Modals */}
            <SeshNxEmbedModal 
                url={embedModal.url} 
                isOpen={embedModal.isOpen} 
                onClose={() => setEmbedModal({ isOpen: false, url: '', previewData: null })} 
                previewData={embedModal.previewData} 
            />
            
            {forwardingMessage && (
                <ForwardMessageModal
                    message={forwardingMessage}
                    conversations={conversations || []}
                    currentUserId={user.uid}
                    onForward={handleForward}
                    onClose={() => setForwardingMessage(null)}
                />
            )}
        </div>
    );
}