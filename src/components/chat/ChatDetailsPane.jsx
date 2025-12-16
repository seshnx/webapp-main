import React, { useState, useEffect } from 'react';
import { X, User, Bell, Flag, Lock, Users, Briefcase, FileText, Clock, Video, Image as ImageIcon, Loader2, Images } from 'lucide-react';
import StatCard from '../shared/StatCard';
import MediaGallery from './media/MediaGallery';
import { supabase } from '../../config/supabase';

export default function ChatDetailsPane({ activeChat, onClose, currentUser }) {
    const [media, setMedia] = useState([]);
    const [stats, setStats] = useState({ sessions: 0, rating: 0, responseTime: 'N/A' });
    const [loading, setLoading] = useState(true);
    const [blocking, setBlocking] = useState(false);
    const [showMediaGallery, setShowMediaGallery] = useState(false);

    const isGroup = activeChat.type === 'group';
    const targetUid = activeChat.uid;
    // FIX: Normalize name (activeChat might use 'n' or 'name')
    const chatName = activeChat.name || activeChat.n || 'Unknown';

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // 1. FETCH SHARED MEDIA from RTDB? 
                // Note: The previous version looked in Firestore 'chats/{id}/messages'. 
                // Since we moved to RTDB for messages, we should conceptually query RTDB here or ignore for now.
                // For simplicity, we will skip fetching media from RTDB in this iteration to avoid complex queries,
                // or we can just leave the list empty until a dedicated media index is built.
                setMedia([]); 

                // 2. FETCH USER STATS (Only for Direct Chats)
                if (!isGroup && targetUid && supabase) {
                    const currentUserId = currentUser?.id || currentUser?.uid;
                    
                    // Fetch profile
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('rating, response_time')
                        .eq('id', targetUid)
                        .single();

                    // Count completed bookings
                    const { count } = await supabase
                        .from('bookings')
                        .select('*', { count: 'exact', head: true })
                        .eq('sender_id', currentUserId)
                        .eq('target_id', targetUid)
                        .eq('status', 'Completed');

                    setStats({
                        sessions: count || 0,
                        rating: profileData?.rating || 'New',
                        responseTime: profileData?.response_time || '~1hr' 
                    });
                }
            } catch (e) {
                console.error("Failed to load details:", e);
            }
            setLoading(false);
        };

        if (activeChat?.id) {
            loadData();
        }
    }, [activeChat.id, targetUid, isGroup, currentUser?.uid]);

    const handleBlockUser = async () => {
        if (isGroup || !targetUid || !currentUser || !supabase) return;
        if (!confirm(`Are you sure you want to block ${chatName}?`)) return;

        setBlocking(true);
        try {
            const userId = currentUser?.id || currentUser?.uid;
            
            // Get current settings
            const { data: profile } = await supabase
                .from('profiles')
                .select('settings')
                .eq('id', userId)
                .single();
            
            const currentSettings = profile?.settings || {};
            const blockedUsers = currentSettings.social?.blockedUsers || [];
            
            if (!blockedUsers.includes(targetUid)) {
                await supabase
                    .from('profiles')
                    .update({
                        settings: {
                            ...currentSettings,
                            social: {
                                ...currentSettings.social,
                                blockedUsers: [...blockedUsers, targetUid]
                            }
                        }
                    })
                    .eq('id', userId);
            }
            
            alert("User blocked.");
            onClose(); 
        } catch (e) {
            console.error("Block failed:", e);
            alert("Failed to block user.");
        }
        setBlocking(false);
    };

    const handleReportUser = () => {
        alert("Please use the report option on their profile page for full moderation tools.");
    };

    return (
        <div className="absolute right-0 top-0 h-full w-full md:w-80 bg-gray-800 shadow-xl z-20 flex flex-col transition-transform duration-300 ease-in-out border-l border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
                <h3 className="text-lg font-semibold text-white">Details</h3>
                <button 
                    onClick={onClose} 
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition duration-150"
                    aria-label="Close details"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Profile Section */}
            <div className="p-6 flex flex-col items-center border-b border-gray-700 bg-gray-800">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-700 flex items-center justify-center shadow-lg border-4 border-gray-600">
                    <img 
                        src={activeChat.photo} 
                        className="w-full h-full object-cover" 
                        onError={(e) => e.target.src = ''}
                        alt={chatName}
                    />
                    {!activeChat.photo && (isGroup ? <Users className="w-10 h-10 text-gray-500"/> : <User className="w-10 h-10 text-gray-500" />)}
                </div>
                <h4 className="text-xl font-bold text-white text-center leading-tight">{chatName}</h4>
                <p className="text-xs text-gray-400 mt-2 flex items-center px-3 py-1 bg-gray-700 rounded-full">
                    {isGroup ? <Users className="w-3 h-3 mr-1"/> : <Briefcase className="w-3 h-3 mr-1" />}
                    {isGroup ? 'Group Chat' : (activeChat.role || 'Creative')}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Stats (Hidden for Groups) */}
                {!isGroup && (
                    <div className="p-4 border-b border-gray-700">
                        <h5 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Performance</h5>
                        {loading ? (
                            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-brand-blue"/></div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                <StatCard title="Sessions" value={stats.sessions} icon={Briefcase} color="text-blue-400" />
                                <StatCard title="Rating" value={stats.rating} icon={Flag} color="text-yellow-400" />
                                <StatCard title="Reply Time" value={stats.responseTime} icon={Clock} color="text-green-400" />
                            </div>
                        )}
                    </div>
                )}

                {/* Shared Media Section */}
                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Shared Media</h5>
                        <button
                            onClick={() => setShowMediaGallery(true)}
                            className="text-xs text-brand-blue hover:underline font-medium"
                        >
                            View All
                        </button>
                    </div>
                    {media.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                            {media.slice(0, 6).map((item, i) => (
                                <div
                                    key={i}
                                    className="aspect-square rounded-lg overflow-hidden bg-gray-700 cursor-pointer hover:opacity-80 transition"
                                >
                                    {item.type === 'image' && (
                                        <img src={item.url} className="w-full h-full object-cover" alt="Media" />
                                    )}
                                    {item.type === 'video' && (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Video size={20} className="text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500 text-center py-4">No shared media yet</p>
                    )}
                </div>

                {/* Actions */}
                <div className="p-4 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition">
                        <Bell className="w-4 h-4 text-yellow-500" />
                        <span>Mute Notifications</span>
                    </button>

                    <button
                        onClick={() => setShowMediaGallery(true)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition"
                    >
                        <Images className="w-4 h-4 text-purple-500" />
                        <span>Media Gallery</span>
                    </button>
                    
                    {!isGroup && (
                        <>
                            <button 
                                onClick={handleBlockUser}
                                disabled={blocking}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition disabled:opacity-50"
                            >
                                {blocking ? <Loader2 className="w-4 h-4 animate-spin"/> : <Lock className="w-4 h-4" />}
                                <span>Block User</span>
                            </button>
                            
                            <button 
                                onClick={handleReportUser}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition"
                            >
                                <Flag className="w-4 h-4" />
                                <span>Report User</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Media Gallery Modal */}
            {showMediaGallery && (
                <MediaGallery
                    chatId={activeChat.id}
                    onClose={() => setShowMediaGallery(false)}
                />
            )}
        </div>
    );
}
