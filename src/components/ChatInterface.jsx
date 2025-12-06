import React, { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { rtdb } from '../config/firebase';
import { isRTDBAvailable, withRTDB, logRTDBStatus } from '../utils/rtdbHelpers';
import ChatSidebar from './chat/ChatSidebar';
import ChatWindow from './chat/ChatWindow';
import ChatDetailsPane from './chat/ChatDetailsPane';
import { usePresence } from '../hooks/usePresence';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInterface({ user, userData, openPublicProfile }) {
    const [activeChat, setActiveChat] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [conversations, setConversations] = useState([]); // Default to empty array

    // Log RTDB status on mount
    useEffect(() => {
        logRTDBStatus();
    }, []);

    // Initialize presence tracking for current user
    usePresence(user?.uid);

    // Fetch Conversations from Realtime DB - Rebuilt with helper
    useEffect(() => {
        if (!user?.uid) {
            return;
        }

        if (!isRTDBAvailable()) {
            console.warn('Realtime Database is not available. Chat functionality is disabled.');
            setConversations([]);
            return;
        }

        return withRTDB((db) => {
            // Query conversations ordered by Last Message Timestamp (lmt)
            const convosRef = query(
                ref(db, `conversations/${user.uid}`), 
                orderByChild('lmt')
            );
            
            const unsubscribe = onValue(convosRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    // Convert to array WITH IDs and sort descending (newest first)
                    const convosList = Object.entries(data)
                        .map(([id, val]) => ({ id, ...val }))
                        .sort((a, b) => (b.lmt || 0) - (a.lmt || 0));
                    setConversations(convosList);
                } else {
                    setConversations([]);
                }
            }, (error) => {
                console.error('Error fetching conversations:', error);
                setConversations([]);
            });

            return () => unsubscribe();
        }, () => {
            setConversations([]);
            return () => {}; // Return empty cleanup function
        });
    }, [user?.uid]);

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
                    conversations={conversations} // Pass the fetched conversations
                    activeChat={activeChat} 
                    onSelectChat={setActiveChat}  // Correct prop name is onSelectChat, not setActiveChat
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
