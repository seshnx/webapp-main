import React, { useState, useEffect, useMemo } from 'react';
import { X, User, Bell, Flag, Lock, Users, Briefcase, FileText, Clock, Video, Image as ImageIcon, Loader2, Images } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/api';
import StatCard from '@/components/shared/StatCard';
import MediaGallery from './media/MediaGallery';

/**
 * Shared media interface
 */
interface SharedMedia {
    type: 'image' | 'video';
    url: string;
}

/**
 * Stats interface
 */
interface ChatStats {
    sessions: number;
    rating: number | string;
    responseTime: string;
}

/**
 * Active chat interface
 */
interface ActiveChat {
    id: string;
    type: 'direct' | 'group';
    uid?: string;
    name?: string;
    n?: string;
    photo?: string;
    role?: string;
}

/**
 * ChatDetailsPane props
 */
export interface ChatDetailsPaneProps {
    activeChat: ActiveChat;
    onClose: () => void;
    currentUser?: any;
}

import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/api';

export default function ChatDetailsPane({ activeChat, onClose, currentUser }: ChatDetailsPaneProps) {
    const [media, setMedia] = useState<SharedMedia[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [blocking, setBlocking] = useState<boolean>(false);
    const [showMediaGallery, setShowMediaGallery] = useState<boolean>(false);

    const isGroup = activeChat.type === 'group';
    const targetUid = activeChat.uid; // This is the Clerk ID
    const chatName = activeChat.name || activeChat.n || 'Unknown';

    // 1. Convex Queries
    const targetUser = useQuery(api.users.getUserByClerkId, 
        !isGroup && targetUid ? { clerkId: targetUid } : "skip"
    );

    const talentBookings = useQuery(api.bookings.getTalentBookings, 
        !isGroup && targetUid ? { talentClerkId: targetUid, status: "Completed" } : "skip"
    );

    // 2. Convex Mutations
    const updateSettings = useMutation(api.users.updateSettings);

    const stats: ChatStats = useMemo(() => {
        if (isGroup) return { sessions: 0, rating: 0, responseTime: 'N/A' };
        return {
            sessions: talentBookings?.length || 0,
            rating: targetUser?.rating || 'New',
            responseTime: targetUser?.responseTime || '~1hr'
        };
    }, [isGroup, targetUser, talentBookings]);

    const handleBlockUser = async () => {
        if (isGroup || !targetUid || !currentUser) return;
        if (!confirm(`Are you sure you want to block ${chatName}?`)) return;

        setBlocking(true);
        try {
            const blockedUsers = currentUser.settings?.social?.blockedUsers || [];

            if (!blockedUsers.includes(targetUid)) {
                await updateSettings({
                    clerkId: currentUser.clerkId || currentUser.id,
                    settings: {
                        ...currentUser.settings,
                        social: {
                            ...currentUser.settings?.social,
                            blockedUsers: [...blockedUsers, targetUid]
                        }
                    }
                });
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
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => (e.target as HTMLImageElement).src = ''}
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
                                <StatCard title="Sessions" value={stats.sessions} icon={<Briefcase size={16} />} bg="bg-blue-50 dark:bg-blue-900/20" text="text-blue-600 dark:text-blue-400" />
                                <StatCard title="Rating" value={stats.rating} icon={<Flag size={16} />} bg="bg-yellow-50 dark:bg-yellow-900/20" text="text-yellow-600 dark:text-yellow-400" />
                                <StatCard title="Reply Time" value={stats.responseTime} icon={<Clock size={16} />} bg="bg-green-50 dark:bg-green-900/20" text="text-green-600 dark:text-green-400" />
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
