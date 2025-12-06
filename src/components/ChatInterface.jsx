import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isConvexAvailable } from '../config/convex';
import ChatSidebar from './chat/ChatSidebar';
import ChatWindow from './chat/ChatWindow';
import ChatDetailsPane from './chat/ChatDetailsPane';
import { usePresence } from '../hooks/usePresence';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInterface({ user, userData, openPublicProfile }) {
    const [activeChat, setActiveChat] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    // Initialize presence tracking for current user
    usePresence(user?.uid);

    // Fetch Conversations from Convex (automatically reactive)
    const conversationsData = useQuery(
        api.conversations.getConversations,
        user?.uid && isConvexAvailable() ? { userId: user.uid } : "skip"
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
                    onSelectChat={setActiveChat}
                />
            </motion.div>

            {/* Main Chat Window */}
            <div className={`flex-1 flex flex-col relative ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                <AnimatePresence mode="wait">
                    {activeChat ? (
                        <motion.div 
                            key={activeChat.id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex-1 flex"
                        >
                            <div className="flex-1 flex flex-col">
                            <ChatWindow 
                                activeChat={activeChat} 
                                user={user} 
                                userData={userData}
                                conversations={conversations}
                                onBack={() => setActiveChat(null)}
                                toggleDetails={() => setShowDetails(!showDetails)}
                                openPublicProfile={openPublicProfile}
                            />
                            </div>
                            
                            {/* Slide-out Details Pane */}
                            <AnimatePresence>
                                {showDetails && (
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
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex-1 flex items-center justify-center text-gray-400 flex-col"
                        >
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <span className="text-4xl">💬</span>
                            </div>
                            <p>Select a conversation to start chatting</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
