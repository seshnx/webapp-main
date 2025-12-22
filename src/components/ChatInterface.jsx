import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isConvexAvailable } from '../config/convex';
import ChatSidebar from './chat/ChatSidebar';
import ChatWindow from './chat/ChatWindow';
import ChatDetailsPane from './chat/ChatDetailsPane';
import { usePresence } from '../hooks/usePresence';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInterface({ user, userData, openPublicProfile, pendingChatTarget, clearPendingChatTarget }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeChat, setActiveChat] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    // Initialize presence tracking for current user
    usePresence(user?.uid);

    // Handle pending chat target - auto-open conversation when navigating from another page
    useEffect(() => {
        if (pendingChatTarget && user?.uid) {
            const chatId = [user.uid, pendingChatTarget.uid].sort().join('_');
            handleChatSelect({
                id: chatId,
                uid: pendingChatTarget.uid,
                name: pendingChatTarget.name,
                type: 'direct'
            });
            // Clear the pending target so it doesn't re-trigger
            clearPendingChatTarget?.();
        }
    }, [pendingChatTarget, user?.uid, clearPendingChatTarget]);

    // FIX: Calculate Convex availability directly. 
    // Do NOT use useMemo here, as it causes the "Cannot access before initialization" error.
    const convexAvailable = isConvexAvailable();

    const conversationsQuery = useMemo(() => {
        return user?.uid && convexAvailable ? { userId: user.uid } : "skip";
    }, [user?.uid, convexAvailable]);

    // Fetch Conversations from Convex (automatically reactive)
    // Hook must always be called (React rules), but we skip if Convex not available
    const conversationsData = useQuery(
        api.conversations.getConversations,
        conversationsQuery
    );

    // Transform Convex data to match existing format
    const conversations = useMemo(() => {
        if (!conversationsData) return [];
        
        return conversationsData.map(conv => ({
            id: conv.chatId,
            uid: conv.otherUserId || conv.chatId,
            name: conv.chatName || 'Unknown',
            n: conv.chatName || 'Unknown',
            photo: conv.chatPhoto || '',
            type: conv.chatType || 'direct',
            lm: conv.lastMessage || '',
            lmt: conv.lastMessageTime || 0,
            ls: conv.lastSenderId || '',
            uc: conv.unreadCount || 0,
        })).sort((a, b) => (b.lmt || 0) - (a.lmt || 0));
    }, [conversationsData]);
    
    // Update URL when chat changes
    const handleChatSelect = (chat) => {
        setActiveChat(chat);
        if (chat?.id) {
            navigate(`/messages/chat/${chat.id}`, { replace: true });
        } else {
            navigate('/messages', { replace: true });
        }
    };
    
    // Sync activeChat with URL (e.g., /messages/chat/chatId)
    useEffect(() => {
        const pathParts = location.pathname.split('/').filter(Boolean);
        if (pathParts[0] === 'messages' && pathParts[1] === 'chat' && pathParts[2]) {
            const chatIdFromUrl = pathParts[2];
            // Find conversation matching the chat ID
            const conversation = conversations.find(c => c.id === chatIdFromUrl);
            if (conversation) {
                // Only update if different from current
                setActiveChat(prev => {
                    if (prev?.id === chatIdFromUrl) return prev;
                    return {
                        id: conversation.id,
                        uid: conversation.uid,
                        name: conversation.name,
                        type: conversation.type
                    };
                });
            }
        } else if (pathParts[0] === 'messages' && (!pathParts[1] || pathParts[1] !== 'chat')) {
            // If we're on /messages without a chat ID, clear active chat
            setActiveChat(prev => prev ? null : prev);
        }
    }, [location.pathname, conversations]);

    // Check if Convex is available
    useEffect(() => {
        if (!isConvexAvailable()) {
            console.warn('Convex is not available. Chat functionality is disabled.');
        }
    }, []);

    return (
        <div className="flex h-[calc(100vh-100px)] bg-white dark:bg-[#1f2128] rounded-2xl overflow-hidden border dark:border-gray-800 shadow-xl">
            
            {/* Sidebar (Always visible on Desktop, toggles on Mobile) */}
            <motion.div 
                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                className={`w-full md:w-80 border-r dark:border-gray-800 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}
            >
                <ChatSidebar 
                    user={user} 
                    userData={userData}
                    conversations={conversations}
                    activeChat={activeChat} 
                    onSelectChat={handleChatSelect}
                />
            </motion.div>

            {/* Main Chat Window */}
            {/* Always render ChatWindow to maintain consistent hook calls (React rules) */}
            <div className={`flex-1 flex flex-col relative ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                <ChatWindow 
                    activeChat={activeChat} 
                    user={user} 
                    userData={userData}
                    conversations={conversations}
                    onBack={() => handleChatSelect(null)}
                    toggleDetails={() => setShowDetails(!showDetails)}
                    openPublicProfile={openPublicProfile}
                />
                
                {/* Slide-out Details Pane */}
                <AnimatePresence>
                    {showDetails && activeChat && (
                        <motion.div 
                            initial={{ width: 0, opacity: 0 }} 
                            animate={{ width: 300, opacity: 1 }} 
                            exit={{ width: 0, opacity: 0 }}
                            className="border-l dark:border-gray-800 bg-gray-50 dark:bg-[#23262f] overflow-hidden relative z-20"
                        >
                            <ChatDetailsPane 
                                activeChat={activeChat} 
                                currentUser={userData} 
                                onClose={() => setShowDetails(false)} 
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
