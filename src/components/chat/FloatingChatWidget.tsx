import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MessageSquare, Plus, X, Search, ArrowLeft, Send, 
  User, CheckCheck, Loader2, Minimize2, Bell, Sparkles, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import UserAvatar from '../shared/UserAvatar';
import { isConvexAvailable } from '../../config/convex';

interface FloatingChatWidgetProps {
  user?: {
    id?: string;
    uid?: string;
    [key: string]: any;
  } | null;
  userData?: any;
}

interface ActiveConversation {
  id: string;
  otherUserId: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  type: 'direct' | 'group';
}

interface IncomingAlert {
  chatId: string;
  senderName: string;
  senderPhoto?: string;
  message: string;
  timestamp: number;
  chat: ActiveConversation;
}

// Play pleasant web audio chime on incoming messages
const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First tone (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second chime tone (A5 harmonic)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.22, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    // Non-blocking browser audio fallback
  }
};

export default function FloatingChatWidget({ user, userData }: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'chat' | 'new'>('list');
  const [selectedChat, setSelectedChat] = useState<ActiveConversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newChatSearch, setNewChatSearch] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [incomingAlert, setIncomingAlert] = useState<IncomingAlert | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const latestMessageTimestampRef = useRef<number>(0);

  const userId = user?.id || user?.uid || '';
  const convexAvailable = isConvexAvailable();

  // Query user's real conversations (real-time Convex sync)
  const conversationsData = useQuery(
    api.conversations.getConversations,
    userId && convexAvailable ? { userId } : "skip"
  );

  // Normalize conversations
  const conversations: ActiveConversation[] = useMemo(() => {
    if (!conversationsData) return [];
    return conversationsData.map((conv: any) => ({
      id: conv.chatId,
      otherUserId: conv.otherUserId || '',
      name: conv.chatName || 'Unknown',
      avatar: conv.chatPhoto || '',
      lastMessage: conv.lastMessage || '',
      lastMessageTime: conv.lastMessageTime || 0,
      unreadCount: conv.unreadCount || 0,
      type: conv.chatType || 'direct',
    })).sort((a, b) => b.lastMessageTime - a.lastMessageTime);
  }, [conversationsData]);

  // Query messages for selected chat
  const messagesData = useQuery(
    api.messages.getMessages,
    selectedChat?.id && convexAvailable ? { chatId: selectedChat.id } : "skip"
  );

  // User search for new chat
  const searchResults = useQuery(
    api.users.searchUsers,
    newChatSearch.trim().length >= 2 && convexAvailable ? { searchText: newChatSearch.trim() } : "skip"
  );

  // Mutations
  const sendMessageMutation = useMutation(api.messages.sendMessage);
  const updateConversationMutation = useMutation(api.conversations.updateConversation);
  const updateUnreadCountMutation = useMutation(api.conversations.updateUnreadCount);

  // Calculate total unread count
  const totalUnread = useMemo(() => {
    return conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [conversations]);

  // Detect incoming new message and animate prominent notification banner
  useEffect(() => {
    if (!conversationsData || conversationsData.length === 0) return;

    // Find the most recent message across all conversations
    const sorted = [...conversationsData].sort((a: any, b: any) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
    const mostRecent = sorted[0];

    if (!mostRecent || !mostRecent.lastMessageTime) return;

    if (isInitialMount.current) {
      latestMessageTimestampRef.current = mostRecent.lastMessageTime;
      isInitialMount.current = false;
      return;
    }

    if (mostRecent.lastMessageTime > latestMessageTimestampRef.current) {
      latestMessageTimestampRef.current = mostRecent.lastMessageTime;

      // Only trigger alert if sent by another user
      if (mostRecent.lastSenderId !== userId) {
        const activeConv: ActiveConversation = {
          id: mostRecent.chatId,
          otherUserId: mostRecent.otherUserId || '',
          name: mostRecent.chatName || 'Unknown',
          avatar: mostRecent.chatPhoto || '',
          lastMessage: mostRecent.lastMessage || '',
          lastMessageTime: mostRecent.lastMessageTime || 0,
          unreadCount: mostRecent.unreadCount || 1,
          type: mostRecent.chatType || 'direct',
        };

        setIncomingAlert({
          chatId: mostRecent.chatId,
          senderName: mostRecent.chatName || 'Creator Contact',
          senderPhoto: mostRecent.chatPhoto || '',
          message: mostRecent.lastMessage || 'Sent a message',
          timestamp: mostRecent.lastMessageTime,
          chat: activeConv,
        });

        // Play chime sound
        playNotificationChime();
      }
    }
  }, [conversationsData, userId]);

  // Auto-dismiss alert after 9 seconds
  useEffect(() => {
    if (incomingAlert) {
      const timer = setTimeout(() => {
        setIncomingAlert(null);
      }, 9000);
      return () => clearTimeout(timer);
    }
  }, [incomingAlert]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (activeView === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesData, activeView, selectedChat]);

  // Handle selecting an active conversation
  const handleSelectChat = async (chat: ActiveConversation) => {
    setSelectedChat(chat);
    setActiveView('chat');
    setIncomingAlert(null);

    // Reset unread count in Convex
    if (userId && chat.id && updateUnreadCountMutation) {
      try {
        await updateUnreadCountMutation({
          userId,
          chatId: chat.id,
          setTo: 0,
        });
      } catch (err) {
        console.error('Failed to reset unread count:', err);
      }
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || !userId) return;

    const content = messageInput.trim();
    const senderName = userData?.displayName || userData?.firstName || 'User';
    const senderPhoto = userData?.avatarUrl || userData?.photo || '';
    const now = Date.now();

    setMessageInput('');

    try {
      // 1. Insert message (which also auto-syncs conversations in Convex)
      await sendMessageMutation({
        chatId: selectedChat.id,
        senderId: userId,
        senderName,
        senderPhoto,
        content,
      });

      // 2. Explicitly update client's own conversation record
      await updateConversationMutation({
        userId,
        chatId: selectedChat.id,
        lastMessage: content,
        lastMessageTime: now,
        lastSenderId: userId,
        chatName: selectedChat.name,
        chatPhoto: selectedChat.avatar || '',
        chatType: selectedChat.type,
        otherUserId: selectedChat.otherUserId || undefined,
      });
    } catch (error) {
      console.error('Failed to send message in floating widget:', error);
    }
  };

  // Handle starting a new chat with a searched user
  const handleStartChatWithUser = (targetUser: any) => {
    if (!targetUser || !userId) return;

    const otherUid = targetUser.clerkId || targetUser._id;
    const chatId = [userId, otherUid].sort().join('_');
    const targetName = targetUser.displayName || targetUser.username || targetUser.firstName || 'User';
    const targetAvatar = targetUser.avatarUrl || targetUser.photo || '';

    const newChat: ActiveConversation = {
      id: chatId,
      otherUserId: otherUid,
      name: targetName,
      avatar: targetAvatar,
      lastMessage: '',
      lastMessageTime: Date.now(),
      unreadCount: 0,
      type: 'direct',
    };

    setSelectedChat(newChat);
    setActiveView('chat');
    setNewChatSearch('');
  };

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  return (
    <>
      {/* Obvious Animated Incoming Message Toast Preview */}
      <AnimatePresence>
        {incomingAlert && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 30, scale: 0.8, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 450, damping: 26 }}
            className="fixed bottom-24 right-4 sm:right-6 z-[9999] max-w-sm w-[calc(100vw-2rem)] sm:w-88 bg-white/95 dark:bg-[#1a1c23]/95 backdrop-blur-2xl border-2 border-brand-blue/60 dark:border-brand-blue/70 rounded-3xl shadow-[0_20px_60px_rgba(59,130,246,0.35)] p-4 flex flex-col gap-3 cursor-pointer group hover:border-brand-blue transition-all"
            onClick={() => {
              handleSelectChat(incomingAlert.chat);
              setIsOpen(true);
              setIncomingAlert(null);
            }}
          >
            {/* Top Bar with Badge & Dismiss */}
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-blue" />
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-blue flex items-center gap-1">
                  <MessageCircle size={13} /> New Chat Message
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-400">
                  {new Date(incomingAlert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIncomingAlert(null);
                  }}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  title="Dismiss notification"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Sender & Content Preview */}
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <UserAvatar name={incomingAlert.senderName} src={incomingAlert.senderPhoto} size="md" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#1a1c23] rounded-full" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-blue transition-colors">
                  {incomingAlert.senderName}
                </h4>
                <p className="text-xs text-gray-700 dark:text-gray-200 line-clamp-2 leading-relaxed font-medium mt-0.5">
                  {incomingAlert.message}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-gray-400 group-hover:text-brand-blue transition-colors font-medium">
                Click to open conversation
              </span>
              <span className="px-3 py-1 bg-brand-blue text-white text-xs font-bold rounded-xl group-hover:bg-blue-600 transition flex items-center gap-1 shadow-sm">
                Reply <ArrowLeft size={12} className="rotate-180" />
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 sm:right-6 z-[9990] w-[calc(100vw-2rem)] sm:w-96 h-[520px] max-h-[80vh] bg-white dark:bg-[#1f2128] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/70 flex flex-col overflow-hidden backdrop-blur-lg"
          >
            {/* Widget Header */}
            <div className="p-3.5 bg-gray-50 dark:bg-[#282a33] border-b border-gray-200 dark:border-gray-700/60 flex items-center justify-between">
              {activeView === 'list' ? (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20 rounded-lg">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold dark:text-white leading-none">Chat Messages</h3>
                    <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Active Now
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveView('list')}
                    className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition"
                    title="Back to Active Chats"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <span className="text-sm font-bold dark:text-white truncate max-w-[180px]">
                    {activeView === 'new' ? 'New Message' : selectedChat?.name}
                  </span>
                </div>
              )}

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1">
                {activeView === 'list' && (
                  <button
                    onClick={() => setActiveView('new')}
                    className="p-1.5 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-1 text-xs font-bold shadow-sm"
                    title="New Chat"
                  >
                    <Plus size={14} /> New Chat
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                  title="Close Chat"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Widget Body Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* VIEW 1: Active Conversations List */}
              {activeView === 'list' && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  {/* Search Bar */}
                  <div className="p-2.5 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search active chats..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-xl dark:bg-[#18191e] dark:border-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>
                  </div>

                  {/* Conversations List */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {conversationsData === undefined ? (
                      <div className="p-8 text-center text-gray-400">
                        <Loader2 size={24} className="mx-auto mb-2 animate-spin text-brand-blue" />
                        <p className="text-xs">Loading conversations...</p>
                      </div>
                    ) : filteredConversations.length > 0 ? (
                      filteredConversations.map(chat => (
                        <button
                          key={chat.id}
                          onClick={() => handleSelectChat(chat)}
                          className="w-full p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition flex items-center gap-3 text-left group"
                        >
                          <div className="relative shrink-0">
                            <UserAvatar name={chat.name} src={chat.avatar} size="md" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <h4 className="text-xs font-bold dark:text-white truncate group-hover:text-brand-blue transition">
                                {chat.name}
                              </h4>
                              {chat.lastMessageTime > 0 && (
                                <span className="text-[10px] text-gray-400 shrink-0">
                                  {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                              {chat.lastMessage || 'No messages yet'}
                            </p>
                          </div>

                          {chat.unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-brand-blue text-white text-[10px] font-bold rounded-full animate-pulse">
                              {chat.unreadCount}
                            </span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-400">
                        <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-semibold">No conversations yet</p>
                        <p className="text-[11px] text-gray-500 mt-1">Click "New Chat" to message any creator</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW 2: Chat Thread */}
              {activeView === 'chat' && selectedChat && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  {/* Thread Message Stream */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                    {messagesData === undefined ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 size={24} className="animate-spin text-brand-blue" />
                      </div>
                    ) : messagesData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4 text-center">
                        <MessageSquare size={28} className="mb-2 opacity-40" />
                        <p className="text-xs font-semibold">No messages yet</p>
                        <p className="text-[11px]">Send a greeting to start the conversation!</p>
                      </div>
                    ) : (
                      messagesData.map((msg: any) => {
                        const isMe = msg.senderId === userId;
                        return (
                          <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                                isMe
                                  ? 'bg-brand-blue text-white rounded-br-none shadow-sm'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
                              }`}
                            >
                              {msg.content}
                            </div>
                            <span className="text-[9px] text-gray-400 mt-1 px-1">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input Form */}
                  <form
                    onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
                    className="p-2.5 bg-gray-50 dark:bg-[#282a33] border-t border-gray-200 dark:border-gray-700/60 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 text-xs border rounded-xl dark:bg-[#18191e] dark:border-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="p-2 bg-brand-blue text-white rounded-xl hover:bg-blue-600 disabled:opacity-40 transition shadow-sm"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              )}

              {/* VIEW 3: New Chat Composer */}
              {activeView === 'new' && (
                <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
                  <div className="space-y-1 shrink-0">
                    <label className="text-xs font-bold text-gray-500 uppercase block">Search User</label>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={newChatSearch}
                        onChange={e => setNewChatSearch(e.target.value)}
                        placeholder="Search by name, role, username..."
                        className="w-full pl-8 pr-3 py-2 text-xs border rounded-xl dark:bg-[#18191e] dark:border-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Search Results List */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                    {newChatSearch.trim().length >= 2 ? (
                      searchResults === undefined ? (
                        <div className="flex items-center justify-center p-6 text-gray-400">
                          <Loader2 size={18} className="animate-spin text-brand-blue mr-2" />
                          <span className="text-xs">Searching users...</span>
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.filter((u: any) => u.clerkId !== userId).map((u: any) => (
                          <button
                            key={u._id}
                            onClick={() => handleStartChatWithUser(u)}
                            className="w-full p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition flex items-center gap-3 text-left group"
                          >
                            <UserAvatar name={u.displayName || u.username || 'User'} src={u.avatarUrl} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold dark:text-white truncate group-hover:text-brand-blue transition">
                                {u.displayName || u.username || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User'}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                {u.accountTypes?.join(', ') || u.username || 'Creator'}
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-6 text-center text-gray-400 text-xs">
                          No users found matching "{newChatSearch}"
                        </div>
                      )
                    ) : (
                      <div className="p-6 text-center text-gray-400 text-xs">
                        Type at least 2 characters to search for creators to message.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Trigger Button with Radar Wave Pulse */}
      <div className="fixed bottom-6 right-6 z-[9990]">
        {/* Expanding radar pulse when there are unread messages or an active alert */}
        {(totalUnread > 0 || (incomingAlert && !isOpen)) && (
          <>
            <span className="absolute -inset-2 rounded-full bg-brand-blue/30 animate-ping pointer-events-none" />
            <span className="absolute -inset-1 rounded-full bg-blue-500/20 animate-pulse pointer-events-none" />
          </>
        )}

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          animate={incomingAlert && !isOpen ? { scale: [1, 1.15, 1], rotate: [0, -8, 8, -5, 5, 0] } : {}}
          transition={incomingAlert && !isOpen ? { repeat: Infinity, repeatDelay: 1.8, duration: 0.8 } : {}}
          onClick={() => {
            setIsOpen(prev => !prev);
            setIncomingAlert(null);
          }}
          className={`bg-gradient-to-r from-brand-blue via-blue-600 to-purple-600 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center gap-2 transition group relative ${
            (incomingAlert && !isOpen) || totalUnread > 0 ? 'ring-4 ring-brand-blue/60 ring-offset-2 dark:ring-offset-[#1a1d21]' : ''
          }`}
          aria-label="Toggle Floating Chat"
        >
          <div className="relative">
            {isOpen ? <Minimize2 size={22} /> : <MessageSquare size={22} />}
            {!isOpen && totalUnread > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[1.15rem] h-[1.15rem] px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 animate-pulse shadow-md">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-xs whitespace-nowrap">
            {isOpen ? 'Close Chat' : 'Chat'}
          </span>
        </motion.button>
      </div>
    </>
  );
}
