import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from "convex/react";
import { api } from '@convex/api';
import { isConvexAvailable } from '@/config/convex';

import ChatSidebar from './chat/ChatSidebar';
import ChatWindow from './chat/ChatWindow';
import ChatDetailsPane from './chat/ChatDetailsPane';
import { usePresence } from '@/hooks/usePresence';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import type { UserData } from '@/types';

// =====================================================
// TYPES
// =====================================================

interface ChatInterfaceProps {
  user: {
    id?: string;
    uid?: string;
    [key: string]: any;
  };
  userData: UserData | null;
  subProfiles?: Record<string, any>;
  openPublicProfile?: (userId: string) => void;
  pendingChatTarget?: {
    uid: string;
    name: string;
  } | null;
  clearPendingChatTarget?: () => void;
}

interface Conversation {
  id: string;
  uid: string;
  name: string;
  n: string;
  photo: string;
  type: 'direct' | 'group';
  lm: string;
  lmt: number;
  ls: string;
  uc: number;
}

interface ActiveChat extends Conversation {
  id: string;
  uid: string;
  name: string;
  type: 'direct' | 'group';
}

interface ProfilePhotosMap {
  [userId: string]: string | null;
}

// =====================================================
// COMPONENT
// =====================================================

export default function ChatInterface({
  user,
  userData,
  subProfiles = {},
  openPublicProfile,
  pendingChatTarget,
  clearPendingChatTarget
}: ChatInterfaceProps): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { t } = useLanguage();
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [profilePhotos, setProfilePhotos] = useState<ProfilePhotosMap>({});

  // Normalize user ID for backward compatibility
  const userId = user?.id || user?.uid;

  // Initialize presence tracking for current user
  usePresence(userId);

  // Handle conversationId from URL
  useEffect(() => {
    if (conversationId && activeChat?.id !== conversationId) {
      // If we already have the conversation in our list, use it
      // Otherwise, we'll set a placeholder while loading
      setActiveChat(prev => {
        if (prev?.id === conversationId) return prev;
        return {
          id: conversationId,
          uid: conversationId.includes('_') ? conversationId.split('_').find(id => id !== userId) || '' : '',
          name: 'Loading...',
          type: 'direct',
          photo: '',
          n: '',
          lm: '',
          lmt: Date.now(),
          ls: '',
          uc: 0
        };
      });
    } else if (!conversationId && activeChat) {
      setActiveChat(null);
    }
  }, [conversationId, userId, activeChat?.id]);

  // Handle chat selection
  const handleChatSelect = (chat: ActiveChat | null) => {
    setActiveChat(chat);
    if (chat?.id) {
      navigate(`/messages/${chat.id}`);
    } else {
      navigate('/messages');
    }
  };

  // Handle pending chat target - auto-open conversation when navigating from another page
  useEffect(() => {
    if (pendingChatTarget && userId) {
      const chatId = [userId, pendingChatTarget.uid].sort().join('_');
      handleChatSelect({
        id: chatId,
        uid: pendingChatTarget.uid,
        name: pendingChatTarget.name,
        type: 'direct',
        photo: '',
        n: '',
        lm: '',
        lmt: Date.now(),
        ls: '',
        uc: 0
      });
      // Clear the pending target so it doesn't re-trigger
      clearPendingChatTarget?.();
    }
  }, [pendingChatTarget, userId, clearPendingChatTarget]);

  // FIX: Calculate Convex availability directly.
  // Do NOT use useMemo here, as it causes the "Cannot access before initialization" error.
  const convexAvailable = isConvexAvailable();

  const conversationsQuery = useMemo(() => {
    return userId && convexAvailable ? { userId } : "skip";
  }, [userId, convexAvailable]);

  // Fetch Conversations from Convex (automatically reactive)
  // Hook must always be called (React rules), but we skip if Convex not available
  const conversationsData = useQuery(
    api.conversations.getConversations,
    conversationsQuery
  );

  // Fetch fresh profile photos for direct chat users
  useEffect(() => {
    const fetchProfilePhotos = async (): Promise<void> => {
      if (!conversationsData) return;

      // Profile photos are already included in Convex conversation data via conv.chatPhoto
      // No additional fetch needed - photos are populated from Convex user records
      // TODO: If fresh photos are needed, use: useQuery(api.users.getProfilePhotos, { userIds })
    };

    fetchProfilePhotos();
  }, [conversationsData]);

  // Transform Convex data to match existing format, using fresh profile photos
  const conversations = useMemo((): Conversation[] => {
    if (!conversationsData) return [];

    return conversationsData.map(conv => ({
      id: conv.chatId,
      uid: conv.otherUserId || conv.chatId,
      name: conv.chatName || 'Unknown',
      n: conv.chatName || 'Unknown',
      // Use fresh profile photo for direct chats, fall back to stored photo
      photo: (conv.chatType === 'direct' && conv.otherUserId && profilePhotos[conv.otherUserId])
        ? profilePhotos[conv.otherUserId]
        : (conv.chatPhoto || ''),
      type: conv.chatType || 'direct',
      lm: conv.lastMessage || '',
      lmt: conv.lastMessageTime || 0,
      ls: conv.lastSenderId || '',
      uc: conv.unreadCount || 0,
    })).sort((a, b) => (b.lmt || 0) - (a.lmt || 0));
  }, [conversationsData, profilePhotos]);





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
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`w-full md:w-80 border-r dark:border-gray-800 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}
      >
        <ChatSidebar
          user={user}
          userData={userData}
          subProfiles={subProfiles}
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
          subProfiles={subProfiles}
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
