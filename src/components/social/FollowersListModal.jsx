import React, { useState, useEffect } from 'react';
import { X, Users, UserCheck, Search, Loader2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db, getPaths } from '../../config/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import UserAvatar from '../shared/UserAvatar';
import FollowButton from './FollowButton';

const TABS = {
    FOLLOWERS: 'followers',
    FOLLOWING: 'following'
};

/**
 * Modal component for displaying followers/following lists
 * @param {string} userId - The user whose followers/following to display
 * @param {string} userName - Display name for the header
 * @param {string} initialTab - Which tab to show first ('followers' | 'following')
 * @param {object} currentUser - The authenticated user
 * @param {object} currentUserData - The authenticated user's profile data
 * @param {function} isFollowing - Check if current user follows a target
 * @param {function} toggleFollow - Toggle follow state
 * @param {function} onClose - Close modal callback
 * @param {function} openPublicProfile - Navigate to user profile
 */
export default function FollowersListModal({
    userId,
    userName,
    initialTab = TABS.FOLLOWERS,
    currentUser,
    currentUserData,
    isFollowing,
    toggleFollow,
    onClose,
    openPublicProfile
}) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch followers
    useEffect(() => {
        if (!userId) return;

        setLoading(true);
        const followersRef = collection(db, getPaths(userId).followers);
        const q = query(followersRef, orderBy('timestamp', 'desc'), limit(100));

        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                odId: doc.id,
                userId: doc.id,
                ...doc.data()
            }));
            setFollowers(data);
            setLoading(false);
        }, (error) => {
            console.error('Followers fetch error:', error);
            setLoading(false);
        });

        return () => unsub();
    }, [userId]);

    // Fetch following
    useEffect(() => {
        if (!userId) return;

        const followingRef = collection(db, getPaths(userId).following);
        const q = query(followingRef, orderBy('timestamp', 'desc'), limit(100));

        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                odId: doc.id,
                userId: doc.id,
                ...doc.data()
            }));
            setFollowing(data);
        }, (error) => {
            console.error('Following fetch error:', error);
        });

        return () => unsub();
    }, [userId]);

    const activeList = activeTab === TABS.FOLLOWERS ? followers : following;
    
    // Filter by search
    const filteredList = searchQuery.trim() 
        ? activeList.filter(user => 
            user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : activeList;

    const isOwnProfile = userId === currentUser?.uid;

    const handleUserClick = (targetUserId) => {
        if (openPublicProfile) {
            openPublicProfile(targetUserId);
            onClose();
        }
    };

    const handleToggleFollow = async (targetUser) => {
        if (!toggleFollow) return;
        await toggleFollow(targetUser.userId, {
            displayName: targetUser.displayName,
            photoURL: targetUser.photoURL,
            role: targetUser.role
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-[#2c2e36] rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-4 border-b dark:border-gray-700 shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg dark:text-white">
                            {userName || 'User'}
                        </h3>
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                        <button
                            onClick={() => setActiveTab(TABS.FOLLOWERS)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === TABS.FOLLOWERS
                                    ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-blue'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <Users size={16} />
                            <span>Followers</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                activeTab === TABS.FOLLOWERS
                                    ? 'bg-brand-blue/10 text-brand-blue'
                                    : 'bg-gray-200 dark:bg-gray-600'
                            }`}>
                                {followers.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab(TABS.FOLLOWING)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === TABS.FOLLOWING
                                    ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-blue'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <UserCheck size={16} />
                            <span>Following</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                activeTab === TABS.FOLLOWING
                                    ? 'bg-brand-blue/10 text-brand-blue'
                                    : 'bg-gray-200 dark:bg-gray-600'
                            }`}>
                                {following.length}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Search */}
                {activeList.length > 5 && (
                    <div className="px-4 py-3 border-b dark:border-gray-700 shrink-0">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-blue dark:text-white transition"
                            />
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="animate-spin text-brand-blue mb-2" size={28} />
                            <p className="text-sm text-gray-500">Loading...</p>
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                                {activeTab === TABS.FOLLOWERS ? (
                                    <Users size={24} className="text-gray-400" />
                                ) : (
                                    <UserCheck size={24} className="text-gray-400" />
                                )}
                            </div>
                            <p className="text-gray-500 text-center">
                                {searchQuery ? (
                                    `No results for "${searchQuery}"`
                                ) : activeTab === TABS.FOLLOWERS ? (
                                    isOwnProfile ? "You don't have any followers yet" : "No followers yet"
                                ) : (
                                    isOwnProfile ? "You're not following anyone yet" : "Not following anyone yet"
                                )}
                            </p>
                            {!searchQuery && activeTab === TABS.FOLLOWING && isOwnProfile && (
                                <p className="text-xs text-gray-400 mt-2 text-center">
                                    Find artists and creators to follow in the feed!
                                </p>
                            )}
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredList.map((user, index) => (
                                <UserListItem
                                    key={user.userId}
                                    user={user}
                                    index={index}
                                    currentUserId={currentUser?.uid}
                                    isFollowingUser={isFollowing?.(user.userId)}
                                    onToggleFollow={() => handleToggleFollow(user)}
                                    onUserClick={() => handleUserClick(user.userId)}
                                />
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

/**
 * Individual user list item
 */
function UserListItem({ 
    user, 
    index, 
    currentUserId, 
    isFollowingUser, 
    onToggleFollow, 
    onUserClick 
}) {
    const isOwnUser = user.userId === currentUserId;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ delay: index * 0.03 }}
            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition border-b dark:border-gray-700/50 last:border-0"
        >
            <div 
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                onClick={onUserClick}
            >
                <UserAvatar
                    src={user.photoURL}
                    name={user.displayName}
                    size="md"
                />
                <div className="min-w-0">
                    <h4 className="font-semibold text-sm dark:text-white truncate hover:text-brand-blue transition">
                        {user.displayName}
                    </h4>
                    {user.role && (
                        <p className="text-xs text-gray-500 truncate">
                            {user.role}
                        </p>
                    )}
                </div>
            </div>

            {!isOwnUser && (
                <FollowButton
                    isFollowing={isFollowingUser}
                    onToggle={onToggleFollow}
                    size="sm"
                    variant="outline"
                />
            )}

            {isOwnUser && (
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    You
                </span>
            )}
        </motion.div>
    );
}

/**
 * Compact trigger component for opening the modal
 * Shows follower/following counts as clickable links
 */
export function FollowStats({ 
    followersCount = 0, 
    followingCount = 0, 
    onFollowersClick, 
    onFollowingClick,
    size = 'md' // 'sm' | 'md' | 'lg'
}) {
    const sizeClasses = {
        sm: 'text-xs gap-3',
        md: 'text-sm gap-4',
        lg: 'text-base gap-5'
    };

    const numberClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    return (
        <div className={`flex items-center ${sizeClasses[size]}`}>
            <button 
                onClick={onFollowersClick}
                className="flex items-center gap-1 hover:text-brand-blue transition group"
            >
                <span className={`font-bold dark:text-white group-hover:text-brand-blue ${numberClasses[size]}`}>
                    {followersCount.toLocaleString()}
                </span>
                <span className="text-gray-500">
                    {followersCount === 1 ? 'Follower' : 'Followers'}
                </span>
            </button>
            
            <span className="text-gray-300 dark:text-gray-600">•</span>
            
            <button 
                onClick={onFollowingClick}
                className="flex items-center gap-1 hover:text-brand-blue transition group"
            >
                <span className={`font-bold dark:text-white group-hover:text-brand-blue ${numberClasses[size]}`}>
                    {followingCount.toLocaleString()}
                </span>
                <span className="text-gray-500">Following</span>
            </button>
        </div>
    );
}

