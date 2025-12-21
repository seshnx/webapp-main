// Import React and hooks first to ensure they're available
import React, { useState, useEffect, useMemo } from 'react';
import { 
    Calendar, User, MessageCircle, Search, Edit2, Zap, Sliders, 
    ArrowRight, Bell, Music, TrendingUp, Clock, AlertTriangle, 
    CheckCircle, XCircle, ShoppingBag, ChevronRight, Sparkles,
    Headphones, Radio, Mic2, Play, Heart, Star, ArrowUpRight,
    Wallet, Users, Eye, Activity, BarChart3, Crown, Flame, Target
} from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isConvexAvailable } from '../config/convex';
import { supabase } from '../config/supabase'; 
import { useNotifications } from '../hooks/useNotifications';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedNumber from './shared/AnimatedNumber';

// Get time-based greeting
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
    if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' };
    if (hour < 21) return { text: 'Good evening', emoji: '🌅' };
    return { text: 'Good night', emoji: '🌙' };
};

// GlassStatCard moved inside Dashboard component to access AnimatedNumber

// Quick action button with enhanced styling
const QuickActionButton = ({ icon, label, description, onClick, color }) => (
    <motion.button
        whileHover={{ scale: 1.01, x: 4 }}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className="w-full text-left px-4 py-3.5 rounded-xl border dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-[#1f2128] hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-300 group"
    >
        <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <div className="flex-1">
                <span className="font-semibold dark:text-white block">{label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{description}</span>
            </div>
            <ArrowRight size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
        </div>
    </motion.button>
);

// Activity item with better styling
const ActivityItem = ({ notification, onClick, formatTime }) => {
    const getActivityIcon = (type) => {
        switch (type) {
            case 'follow': return { icon: <Users size={14} />, color: 'bg-blue-500' };
            case 'like': return { icon: <Heart size={14} />, color: 'bg-red-500' };
            case 'comment': return { icon: <MessageCircle size={14} />, color: 'bg-green-500' };
            case 'mention': return { icon: <Mic2 size={14} />, color: 'bg-purple-500' };
            case 'booking': return { icon: <Calendar size={14} />, color: 'bg-amber-500' };
            default: return { icon: <Bell size={14} />, color: 'bg-gray-500' };
        }
    };
    
    const { icon, color } = getActivityIcon(notification.type);
    
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: 4, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
            onClick={onClick}
            className={`p-4 cursor-pointer transition-colors duration-200 ${!notification.read ? 'bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10' : ''}`}
        >
            <div className="flex items-start gap-3">
                <div className={`${color} p-2 rounded-full text-white shrink-0`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm dark:text-gray-200">
                        <span className="font-semibold">{notification.fromUserName}</span>{' '}
                        <span className="text-gray-600 dark:text-gray-400">{notification.message}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        {formatTime(notification.timestamp)}
                    </p>
                </div>
                {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shrink-0 mt-2" />
                )}
            </div>
        </motion.div>
    );
};

export default function Dashboard({ 
    user, 
    userData, 
    setActiveTab, 
    bookingCount = 0, 
    subProfiles = {}, 
    tokenBalance = 0 
}) {
    // Glassmorphic stat card - using Suspense for AnimatedNumber to avoid TDZ issues
    const GlassStatCard = ({ title, value, icon, gradient, onClick, trend, trendUp }) => (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`relative p-5 rounded-[1.25rem] cursor-pointer overflow-hidden group ${gradient}`}
        >
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl transform -translate-x-8 translate-y-8" />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                        {icon}
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-green-300' : 'text-red-300'}`}>
                            <ArrowUpRight size={14} className={!trendUp ? 'rotate-90' : ''} />
                            {trend}
                        </div>
                    )}
                </div>
                <div className="text-3xl font-black text-white mb-1">
                    <AnimatedNumber value={value} />
                </div>
                <div className="text-white/80 text-sm font-medium">{title}</div>
            </div>
            
            {/* Hover shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </motion.div>
    );

    // Initialize state first to avoid TDZ issues
    const [recentConvos, setRecentConvos] = useState([]);
    const [trendingItem, setTrendingItem] = useState(null);
    
    // Access constants after state initialization
    const greeting = getGreeting();

    // Real-time notifications from Supabase
    const { notifications, unreadCount } = useNotifications(user?.id || user?.uid);
    
    const isStudio = userData?.accountTypes?.includes('Studio');
    const studioRooms = subProfiles?.['Studio']?.rooms || [];
    const profileViews = userData?.profileViews || 0;

    // Use state to store constants - load asynchronously to avoid TDZ issues
    const [profileSchemas, setProfileSchemas] = useState(null);
    const [bookingThreshold, setBookingThreshold] = useState(60);
    
    // Load constants asynchronously after component mounts
    useEffect(() => {
        // Use a small delay to ensure module initialization is complete
        const timer = setTimeout(() => {
            import('../config/constants').then(mod => {
                if (mod.PROFILE_SCHEMAS) {
                    setProfileSchemas(mod.PROFILE_SCHEMAS);
                }
                if (mod.BOOKING_THRESHOLD) {
                    setBookingThreshold(mod.BOOKING_THRESHOLD);
                }
            }).catch(err => {
                console.warn('Failed to load constants:', err);
                // Set empty object as fallback
                setProfileSchemas({});
            });
        }, 0);
        
        return () => clearTimeout(timer);
    }, []);

    // Calculate Overall Completion for Banner (only when constants are loaded)
    const roles = userData?.accountTypes || [];
    const { avgCompletion, showCompletionWarning } = useMemo(() => {
        if (!profileSchemas) {
            return { avgCompletion: 100, showCompletionWarning: false };
        }
        
        let totalPct = 0;
        let roleCount = 0;

        roles.forEach(role => {
            const data = subProfiles?.[role] || {};
            // Also check userData for Talent subRole
            const talentData = role === 'Talent' ? { ...data, talentSubRole: userData?.talentSubRole } : data;
            const schema = profileSchemas[role] || [];
            if (schema.length === 0) return;
            
            // Filter out toggle fields and list fields, but include subRole fields
            const relevantFields = schema.filter(f => !f.isToggle && f.type !== 'list');
            const totalFields = relevantFields.length || 1;
            
            const filledFields = relevantFields.filter(f => {
                const value = f.isSubRole ? talentData[f.key] : data[f.key];
                // Check if the value is truthy and has content
                if (value === null || value === undefined) return false;
                if (Array.isArray(value)) return value.length > 0;
                if (typeof value === 'string') return value.trim().length > 0;
                if (typeof value === 'number') return true;
                return !!value;
            }).length;
            
            totalPct += (filledFields / totalFields);
            roleCount++;
        });
        
        const completion = roleCount > 0 ? Math.round((totalPct / roleCount) * 100) : 100;
        return { 
            avgCompletion: completion, 
            showCompletionWarning: completion < 60 
        };
    }, [profileSchemas, roles, subProfiles, userData?.talentSubRole]);

    // Memoize Convex availability
    const convexAvailable = useMemo(() => isConvexAvailable(), []);
    const conversationsQuery = useMemo(() => {
        return (user?.id || user?.uid) && convexAvailable ? { userId: user?.id || user?.uid } : "skip";
    }, [user?.uid, convexAvailable]);

    const conversationsData = useQuery(
        api.conversations.getConversations,
        conversationsQuery
    );

    useEffect(() => {
        if (!conversationsData) {
            setRecentConvos([]);
            return;
        }
        const convos = conversationsData
            .map(conv => ({
                uid: conv.otherUserId || conv.chatId,
                name: conv.chatName || 'Unknown',
                lastMessage: conv.lastMessage || '',
                timestamp: conv.lastMessageTime || 0,
                isMe: conv.lastSenderId === (user?.id || user?.uid),
                photo: conv.chatPhoto
            }))
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 4);
        setRecentConvos(convos);
    }, [conversationsData, user?.id, user?.uid]);

    useEffect(() => {
        if (!supabase) return;
        
        // Initial fetch - use maybeSingle() to handle empty results gracefully
        supabase
            .from('market_items')
            .select('*')
            .eq('status', 'active') // Filter by active status to match RLS policy
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
            .then(({ data, error }) => {
                if (error) {
                    // Only log non-404/406 errors (404 means table doesn't exist, 406 might be RLS/format issue)
                    if (error.code !== 'PGRST116' && error.code !== 'PGRST301' && !error.message?.includes('does not exist')) {
                        console.warn('Error fetching trending item:', error.message, error.code);
                    }
                    return;
                }
                if (data) {
                    setTrendingItem({ 
                        id: data.id, 
                        ...data,
                        timestamp: data.created_at
                    });
                }
            });
        
        // Subscribe to changes (only if table exists)
        const channel = supabase
            .channel('trending-item')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'market_items'
                },
                async () => {
                    const { data, error } = await supabase
                        .from('market_items')
                        .select('*')
                        .eq('status', 'active') // Filter by active status to match RLS policy
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();
                    
                    if (error) {
                        // Silently handle errors (table might not exist or RLS issue)
                        return;
                    }
                    if (data) {
                        setTrendingItem({ 
                            id: data.id, 
                            ...data,
                            timestamp: data.created_at
                        });
                    }
                }
            )
            .subscribe();
        
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const formatNotificationTime = (ts) => {
        if (!ts) return 'Just now';
        let date;
        if (typeof ts.toMillis === 'function') {
            date = new Date(ts.toMillis());
        } else if (typeof ts === 'number') {
            date = new Date(ts);
        } else if (ts instanceof Date) {
            date = ts;
        } else {
            return 'Just now';
        }
        if (isNaN(date.getTime())) return 'Just now';
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen pb-24 px-4 md:px-6 pt-4 md:pt-6">
            {/* Hero Section with Gradient Background */}
            <div className="relative overflow-hidden rounded-3xl md:rounded-[2rem] shadow-2xl max-w-7xl mx-auto">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-purple-600 to-pink-500 opacity-90" />
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
                </div>
                
                {/* Grid pattern overlay */}
                <div 
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}
                />

                <div className="relative z-10 px-5 md:px-8 py-8 md:py-12">
                    {/* Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-10"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{greeting.emoji}</span>
                                <span className="text-white/80 text-lg font-medium">{greeting.text}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                                {userData?.effectiveDisplayName || 
                                 userData?.displayName ||
                                 (userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}` : userData?.firstName || userData?.lastName) ||
                                 userData?.email?.split('@')[0] ||
                                 'Creator'}
                            </h1>
                            <p className="text-white/60 mt-2 text-lg">Your creative command center</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full flex items-center gap-2 text-white"
                            >
                                <Clock size={16} className="text-white/70" />
                                <span className="text-sm font-medium">
                                    {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                            </motion.div>
                            
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab('feed')}
                                className="relative bg-white text-gray-900 px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <Bell size={16} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                                        {unreadCount}
                                    </span>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        <GlassStatCard
                            title="SeshFx Balance"
                            value={tokenBalance}
                            icon={<Zap size={20} className="text-white" fill="currentColor" />}
                            gradient="bg-gradient-to-br from-amber-500/90 to-orange-600/90 backdrop-blur-sm"
                            onClick={() => setActiveTab('payments')}
                            trend="+12%"
                            trendUp={true}
                        />
                        <GlassStatCard
                            title="Pending Bookings"
                            value={bookingCount}
                            icon={<Calendar size={20} className="text-white" />}
                            gradient="bg-gradient-to-br from-blue-500/90 to-indigo-600/90 backdrop-blur-sm"
                            onClick={() => setActiveTab('bookings')}
                        />
                        <GlassStatCard
                            title="Active Chats"
                            value={recentConvos.length}
                            icon={<MessageCircle size={20} className="text-white" />}
                            gradient="bg-gradient-to-br from-emerald-500/90 to-teal-600/90 backdrop-blur-sm"
                            onClick={() => setActiveTab('messages')}
                        />
                        <GlassStatCard
                            title="Profile Views"
                            value={profileViews}
                            icon={<Eye size={20} className="text-white" />}
                            gradient="bg-gradient-to-br from-pink-500/90 to-rose-600/90 backdrop-blur-sm"
                            onClick={() => setActiveTab('profile')}
                            trend="+8%"
                            trendUp={true}
                        />
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto mt-6 md:mt-8 relative z-20">
                {/* Completion Warning Banner */}
                <AnimatePresence>
                    {showCompletionWarning && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 rounded-[1.25rem] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-3 rounded-xl text-white shadow-lg">
                                    <Target size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                                        Complete Your Profile
                                        <span className="text-sm font-normal bg-amber-200 dark:bg-amber-800 px-2 py-0.5 rounded-full">
                                            {avgCompletion}%
                                        </span>
                                    </h4>
                                    <p className="text-sm text-amber-700 dark:text-amber-400">
                                        A complete profile increases your visibility and booking chances
                                    </p>
                                </div>
                            </div>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab('profile')} 
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-lg flex items-center gap-2"
                            >
                                <Sparkles size={16} />
                                Complete Now
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Main Feeds */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Activity Feed */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-[#1f2128] rounded-[1.25rem] border dark:border-gray-800 overflow-hidden shadow-xl"
                        >
                            <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white dark:from-[#23262f] dark:to-[#1f2128]">
                                <h3 className="font-bold dark:text-white flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <Activity size={16} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    Activity Feed
                                </h3>
                                {unreadCount > 0 && (
                                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse shadow-lg">
                                        {unreadCount} New
                                    </span>
                                )}
                            </div>
                            <div className="divide-y dark:divide-gray-800">
                                {(!notifications || notifications.length === 0) ? (
                                    <div className="p-12 text-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-[1.25rem] flex items-center justify-center mx-auto mb-4">
                                            <Sparkles size={28} className="text-gray-400" />
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 font-medium">All caught up!</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">No new notifications</p>
                                    </div>
                                ) : (
                                    notifications.slice(0, 5).map((n, i) => (
                                        <ActivityItem
                                            key={n.id || i}
                                            notification={n}
                                            onClick={() => setActiveTab('feed')}
                                            formatTime={formatNotificationTime}
                                        />
                                    ))
                                )}
                            </div>
                            {notifications?.length > 5 && (
                                <div className="p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-[#1a1c23]">
                                    <button 
                                        onClick={() => setActiveTab('feed')}
                                        className="w-full text-center text-sm text-brand-blue font-semibold hover:underline"
                                    >
                                        View All Activity →
                                    </button>
                                </div>
                            )}
                        </motion.div>

                        {/* Studio Overview */}
                        {isStudio && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white dark:bg-[#1f2128] rounded-[1.25rem] border dark:border-gray-800 overflow-hidden shadow-xl"
                            >
                                <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/10 dark:to-[#1f2128]">
                                    <h3 className="font-bold dark:text-white flex items-center gap-2">
                                        <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                            <Headphones size={16} className="text-purple-600 dark:text-purple-400" />
                                        </div>
                                        Studio Status
                                    </h3>
                                    <button 
                                        onClick={() => setActiveTab('studio-ops')} 
                                        className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-medium"
                                    >
                                        Manage <ArrowRight size={14}/>
                                    </button>
                                </div>
                                
                                <div className="p-5">
                                    {studioRooms.length === 0 ? (
                                        <div className="text-center py-8 border-2 border-dashed dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#1a1c23]">
                                            <Radio size={32} className="mx-auto mb-3 text-gray-400" />
                                            <p className="text-gray-500 mb-3">No rooms configured yet</p>
                                            <button 
                                                onClick={() => setActiveTab('studio-ops')}
                                                className="text-purple-600 font-bold hover:underline"
                                            >
                                                + Add Your First Room
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {studioRooms.map((room, idx) => (
                                                <motion.div 
                                                    key={idx}
                                                    whileHover={{ scale: 1.02 }}
                                                    className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1a1c23] dark:to-[#23262f] p-4 rounded-xl border dark:border-gray-700/50"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="font-bold dark:text-white">{room.name}</div>
                                                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                                                            room.active 
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                        }`}>
                                                            {room.active ? <CheckCircle size={10}/> : <AlertTriangle size={10}/>}
                                                            {room.active ? 'Active' : 'Maint.'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                                        <span>{room.equipment?.length || 0} items</span>
                                                        <span>•</span>
                                                        <span className="font-bold text-green-600 dark:text-green-400">${room.rate}/hr</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Recent Messages */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white dark:bg-[#1f2128] rounded-[1.25rem] border dark:border-gray-800 overflow-hidden shadow-xl"
                        >
                            <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/10 dark:to-[#1f2128]">
                                <h3 className="font-bold dark:text-white flex items-center gap-2">
                                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                        <MessageCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    Recent Messages
                                </h3>
                                <button 
                                    onClick={() => setActiveTab('messages')} 
                                    className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                                >
                                    View All
                                </button>
                            </div>
                            <div className="p-4 space-y-2">
                                {recentConvos.length === 0 ? (
                                    <div className="text-center text-gray-400 py-8">
                                        <MessageCircle size={32} className="mx-auto mb-3 opacity-50" />
                                        <p className="font-medium">No messages yet</p>
                                        <p className="text-sm text-gray-400">Start a conversation!</p>
                                    </div>
                                ) : (
                                    recentConvos.map((c, i) => (
                                        <motion.div 
                                            key={c.uid + i}
                                            whileHover={{ x: 4, backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                                            onClick={() => setActiveTab('messages')}
                                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                                        >
                                            <div className="relative">
                                                {c.photo ? (
                                                    <img src={c.photo} className="h-10 w-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                                                        {c.name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#1f2128] rounded-full" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <span className="font-semibold dark:text-white truncate">{c.name || 'Unknown User'}</span>
                                                    <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                                                        {new Date(c.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {c.isMe && <span className="text-gray-400">You: </span>}
                                                    {c.lastMessage}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                    
                    {/* Right Column: Actions & Discovery */}
                    <div className="space-y-6">
                        
                        {/* Quick Actions */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-[#1f2128] rounded-[1.25rem] border dark:border-gray-800 p-5 shadow-xl"
                        >
                            <h3 className="font-bold mb-4 dark:text-white flex items-center gap-2">
                                <Flame size={18} className="text-orange-500" />
                                Quick Actions
                            </h3>
                            <div className="space-y-3">
                                {/* Professional role-specific actions */}
                                {userData?.accountTypes?.some(r => ['Talent', 'Producer', 'Engineer', 'Composer'].includes(r)) && (
                                    <>
                                        <QuickActionButton
                                            icon={<Zap size={18} className="text-yellow-600" />}
                                            label="Browse Open Gigs"
                                            description="Find work opportunities near you"
                                            onClick={() => setActiveTab('bookings')}
                                            color="bg-yellow-100 dark:bg-yellow-900/30"
                                        />
                                        <QuickActionButton
                                            icon={<Mic2 size={18} className="text-pink-600" />}
                                            label="Update Availability"
                                            description="Let clients know you're open for work"
                                            onClick={() => setActiveTab('profile')}
                                            color="bg-pink-100 dark:bg-pink-900/30"
                                        />
                                    </>
                                )}
                                
                                {/* Studio-specific actions */}
                                {userData?.accountTypes?.includes('Studio') && (
                                    <QuickActionButton
                                        icon={<Calendar size={18} className="text-indigo-600" />}
                                        label="Manage Bookings"
                                        description="View and manage studio sessions"
                                        onClick={() => setActiveTab('bookings')}
                                        color="bg-indigo-100 dark:bg-indigo-900/30"
                                    />
                                )}
                                
                                {/* Label/Agent-specific actions */}
                                {userData?.accountTypes?.some(r => ['Label', 'Agent'].includes(r)) && (
                                    <QuickActionButton
                                        icon={<Users size={18} className="text-teal-600" />}
                                        label="Manage Roster"
                                        description="View and manage your artists"
                                        onClick={() => setActiveTab('business')}
                                        color="bg-teal-100 dark:bg-teal-900/30"
                                    />
                                )}
                                
                                <QuickActionButton
                                    icon={<Edit2 size={18} className="text-blue-600" />}
                                    label="Create Post"
                                    description="Share with your network"
                                    onClick={() => setActiveTab('feed')}
                                    color="bg-blue-100 dark:bg-blue-900/30"
                                />
                                
                                {/* Find talent for non-professional roles */}
                                {!userData?.accountTypes?.some(r => ['Talent', 'Producer', 'Engineer', 'Composer', 'Studio'].includes(r)) && (
                                    <QuickActionButton
                                        icon={<Search size={18} className="text-purple-600" />}
                                        label="Find Talent"
                                        description="Discover collaborators"
                                        onClick={() => setActiveTab('bookings')}
                                        color="bg-purple-100 dark:bg-purple-900/30"
                                    />
                                )}
                                
                                <QuickActionButton
                                    icon={<ShoppingBag size={18} className="text-amber-600" />}
                                    label="Marketplace"
                                    description="Buy & sell gear"
                                    onClick={() => setActiveTab('marketplace')}
                                    color="bg-amber-100 dark:bg-amber-900/30"
                                />
                            </div>
                        </motion.div>

                        {/* Trending Promo Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="relative rounded-[1.25rem] overflow-hidden shadow-xl"
                        >
                            {/* Animated gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600" />
                            <div className="absolute inset-0">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
                            </div>
                            
                            <div className="relative z-10 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                                        <Zap size={18} className="text-yellow-300" fill="currentColor" />
                                    </div>
                                    <span className="text-xs font-bold text-yellow-300 uppercase tracking-wider">Trending on SeshFx</span>
                                </div>
                                
                                {trendingItem ? (
                                    <>
                                        <h4 className="font-black text-xl text-white mb-1 truncate">{trendingItem.title}</h4>
                                        <p className="text-white/60 text-sm mb-4">by {trendingItem.author} • {trendingItem.price} Tokens</p>
                                    </>
                                ) : (
                                    <>
                                        <h4 className="font-black text-xl text-white mb-1">Discover New Sounds</h4>
                                        <p className="text-white/60 text-sm mb-4">Fresh beats & presets daily</p>
                                    </>
                                )}
                                
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab('seshfx')} 
                                    className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                                >
                                    <Play size={16} fill="currentColor" />
                                    Visit Store
                                </motion.button>
                            </div>
                        </motion.div>
                        
                        {/* Profile Completion */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white dark:bg-[#1f2128] rounded-[1.25rem] border dark:border-gray-800 p-5 shadow-xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold dark:text-white flex items-center gap-2">
                                    <Crown size={18} className="text-amber-500" />
                                    Profile Health
                                </h3>
                                <span className={`text-sm font-bold ${avgCompletion >= 80 ? 'text-green-500' : avgCompletion >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                    {avgCompletion}%
                                </span>
                            </div>
                            
                            {/* Overall progress ring */}
                            <div className="flex items-center gap-4 mb-5 p-4 bg-gray-50 dark:bg-[#1a1c23] rounded-xl">
                                <div className="relative w-16 h-16">
                                    <svg className="w-16 h-16 transform -rotate-90">
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="28"
                                            stroke="currentColor"
                                            strokeWidth="6"
                                            fill="none"
                                            className="text-gray-200 dark:text-gray-700"
                                        />
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="28"
                                            stroke="currentColor"
                                            strokeWidth="6"
                                            fill="none"
                                            strokeDasharray={`${avgCompletion * 1.76} 176`}
                                            className={avgCompletion >= 80 ? 'text-green-500' : avgCompletion >= 50 ? 'text-amber-500' : 'text-red-500'}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Star size={20} className={avgCompletion >= 80 ? 'text-green-500' : avgCompletion >= 50 ? 'text-amber-500' : 'text-red-500'} fill="currentColor" />
                                    </div>
                                </div>
                                <div>
                                    <div className="font-bold dark:text-white">
                                        {avgCompletion >= 80 ? 'Looking Great!' : avgCompletion >= 50 ? 'Almost There!' : 'Needs Work'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {avgCompletion < 100 ? 'Complete your profile to boost visibility' : 'Your profile is fully complete'}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {(userData?.accountTypes || []).map(role => {
                                    const data = subProfiles?.[role] || {};
                                    const schema = PROFILE_SCHEMAS[role] || [];
                                    if (schema.length === 0) return null;

                                    const total = schema.filter(f => !f.isToggle && f.type !== 'list').length || 1;
                                    const filled = schema.filter(f => !f.isToggle && f.type !== 'list' && data[f.key] && data[f.key].length).length;
                                    const pct = Math.round((filled/total)*100);
                                    
                                    return (
                                        <motion.div 
                                            key={role}
                                            whileHover={{ scale: 1.01 }}
                                            onClick={() => setActiveTab('profile')}
                                            className="p-3 rounded-xl bg-gray-50 dark:bg-[#1a1c23] cursor-pointer hover:shadow-md transition-all"
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium dark:text-gray-300">{role}</span>
                                                <span className={`text-xs font-bold ${pct >= 80 ? 'text-green-500' : pct >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                                    {pct}%
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className={`h-full rounded-full ${pct >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : pct >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`}
                                                />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
