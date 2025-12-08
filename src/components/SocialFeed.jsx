import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, where, getDocs } from 'firebase/firestore';
import { db, appId, getPaths } from '../config/firebase';
import { Loader2, RefreshCw, Users, Compass, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import PostCard from './social/PostCard';
import CreatePostWidget from './social/CreatePostWidget';
import ReportModal from './ReportModal';
import { useFollowSystem } from '../hooks/useFollowSystem';
import FollowButton from './social/FollowButton';
import UserAvatar from './shared/UserAvatar';

// Feed mode tabs
const FEED_MODES = {
    FOR_YOU: 'for_you',
    FOLLOWING: 'following'
};

export default function SocialFeed({ user, userData, openPublicProfile }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportTarget, setReportTarget] = useState(null);
    const [feedMode, setFeedMode] = useState(FEED_MODES.FOR_YOU);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    // Use the follow system hook
    const { 
        following, 
        stats, 
        loading: followLoading, 
        isFollowing, 
        toggleFollow,
        getFollowingIds 
    } = useFollowSystem(user?.uid, userData);

    // Memoize following IDs for feed filtering
    const followingIds = useMemo(() => getFollowingIds(), [following]);

    // Load suggested users when on Following tab with no follows
    useEffect(() => {
        if (feedMode === FEED_MODES.FOLLOWING && followingIds.length === 0 && user?.uid) {
            loadSuggestedUsers();
        }
    }, [feedMode, followingIds.length, user?.uid]);

    const loadSuggestedUsers = async () => {
        setLoadingSuggestions(true);
        try {
            // Get recent posters as suggestions (excluding current user)
            const postsQuery = query(
                collection(db, `artifacts/${appId}/public/data/posts`),
                orderBy('timestamp', 'desc'),
                limit(20)
            );
            const snapshot = await getDocs(postsQuery);
            
            // Extract unique users from posts
            const usersMap = new Map();
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.userId !== user?.uid && !usersMap.has(data.userId)) {
                    usersMap.set(data.userId, {
                        userId: data.userId,
                        displayName: data.displayName,
                        photoURL: data.authorPhoto,
                        role: data.role
                    });
                }
            });
            
            setSuggestedUsers(Array.from(usersMap.values()).slice(0, 5));
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
        setLoadingSuggestions(false);
    };

    // Main feed listener
    useEffect(() => {
        setLoading(true);
        const feedPath = `artifacts/${appId}/public/data/posts`;
        
        let q;
        if (feedMode === FEED_MODES.FOLLOWING && followingIds.length > 0) {
            // For Following feed, we need to filter by followed users
            // Firestore 'in' query is limited to 30 items, so we'll do client-side filtering for now
            q = query(
                collection(db, feedPath), 
                orderBy('timestamp', 'desc'), 
                limit(50) // Fetch more to filter
            );
        } else {
            // For You feed - show all posts
            q = query(
                collection(db, feedPath), 
                orderBy('timestamp', 'desc'), 
                limit(20)
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Client-side filtering for Following feed
            if (feedMode === FEED_MODES.FOLLOWING && followingIds.length > 0) {
                newPosts = newPosts.filter(post => 
                    followingIds.includes(post.userId) || post.userId === user?.uid
                );
            }
            
            setPosts(newPosts);
            setLoading(false);
        }, (err) => {
            console.error("Feed error:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [feedMode, followingIds, user?.uid]);

    const handlePost = async (postPayload) => {
        if (!user) return;
        try {
            await addDoc(collection(db, `artifacts/${appId}/public/data/posts`), {
                ...postPayload,
                userId: user.uid,
                displayName: userData?.effectiveDisplayName || `${userData?.firstName || 'User'} ${userData?.lastName || ''}`.trim(),
                authorPhoto: userData?.photoURL || null,
                role: userData?.activeProfileRole || 'User',
                timestamp: serverTimestamp(),
                reactions: {},
                reactionCount: 0,
                commentCount: 0,
                saveCount: 0,
                visibility: 'Public'
            });
        } catch (e) {
            console.error("Failed to post:", e);
            alert("Could not post update. Please try again.");
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    // Suggested user card component
    const SuggestedUserCard = ({ suggestedUser }) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-3 bg-white dark:bg-dark-card rounded-xl border dark:border-gray-700 hover:border-brand-blue/30 transition-all"
        >
            <div 
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                onClick={() => openPublicProfile?.(suggestedUser.userId)}
            >
                <UserAvatar 
                    src={suggestedUser.photoURL}
                    name={suggestedUser.displayName}
                    size="md"
                />
                <div className="min-w-0">
                    <h4 className="font-bold text-sm dark:text-white truncate hover:text-brand-blue transition">
                        {suggestedUser.displayName}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">{suggestedUser.role}</p>
                </div>
            </div>
            <FollowButton
                isFollowing={isFollowing(suggestedUser.userId)}
                onToggle={() => toggleFollow(suggestedUser.userId, suggestedUser)}
                size="sm"
                variant="default"
            />
        </motion.div>
    );

    return (
        <div className="max-w-2xl mx-auto pb-20">
            {/* Create Post Widget */}
            <CreatePostWidget 
                user={user} 
                userData={userData} 
                onPost={handlePost} 
            />

            {/* Feed Mode Toggle */}
            <div className="flex items-center gap-2 mb-4 bg-white dark:bg-dark-card p-1.5 rounded-xl border dark:border-gray-700 shadow-sm">
                <button
                    onClick={() => setFeedMode(FEED_MODES.FOR_YOU)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        feedMode === FEED_MODES.FOR_YOU
                            ? 'bg-brand-blue text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                    <Compass size={16} />
                    <span>For You</span>
                </button>
                <button
                    onClick={() => setFeedMode(FEED_MODES.FOLLOWING)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        feedMode === FEED_MODES.FOLLOWING
                            ? 'bg-brand-blue text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                    <Users size={16} />
                    <span>Following</span>
                    {stats.followingCount > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            feedMode === FEED_MODES.FOLLOWING
                                ? 'bg-white/20'
                                : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                            {stats.followingCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Feed Content */}
            {loading || followLoading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-brand-blue" size={32} />
                </div>
            ) : (
                <>
                    {/* Following tab empty state with suggestions */}
                    {feedMode === FEED_MODES.FOLLOWING && followingIds.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 mb-6 border border-blue-100 dark:border-blue-800/30"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-blue/10 flex items-center justify-center">
                                    <UserPlus size={28} className="text-brand-blue" />
                                </div>
                                <h3 className="text-lg font-bold dark:text-white mb-2">
                                    Start following creators
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                                    Follow artists, engineers, and studios to see their posts in your Following feed.
                                </p>
                            </div>

                            {/* Suggested users */}
                            {loadingSuggestions ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="animate-spin text-brand-blue" size={24} />
                                </div>
                            ) : suggestedUsers.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                        Suggested for you
                                    </h4>
                                    {suggestedUsers.map(suggestedUser => (
                                        <SuggestedUserCard 
                                            key={suggestedUser.userId} 
                                            suggestedUser={suggestedUser} 
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Posts */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-4"
                    >
                        <AnimatePresence mode='popLayout'>
                            {posts.map(post => (
                                <PostCard 
                                    key={post.id} 
                                    post={post} 
                                    currentUser={user}
                                    currentUserData={userData}
                                    openPublicProfile={openPublicProfile || (() => {})}
                                    onReport={() => setReportTarget(post)}
                                    isFollowingAuthor={isFollowing(post.userId)}
                                    onToggleFollow={() => toggleFollow(post.userId, {
                                        displayName: post.displayName,
                                        photoURL: post.authorPhoto,
                                        role: post.role
                                    })}
                                />
                            ))}
                        </AnimatePresence>
                        
                        {posts.length === 0 && feedMode === FEED_MODES.FOR_YOU && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                className="text-center py-10 text-gray-500"
                            >
                                <RefreshCw className="mx-auto mb-2 opacity-50" size={32}/>
                                <p>No posts yet. Be the first to share something!</p>
                            </motion.div>
                        )}

                        {posts.length === 0 && feedMode === FEED_MODES.FOLLOWING && followingIds.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                className="text-center py-10 text-gray-500"
                            >
                                <Users className="mx-auto mb-2 opacity-50" size={32}/>
                                <p>No recent posts from people you follow.</p>
                                <button 
                                    onClick={() => setFeedMode(FEED_MODES.FOR_YOU)}
                                    className="mt-3 text-brand-blue hover:underline text-sm font-medium"
                                >
                                    Browse For You feed →
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                </>
            )}

            {/* Report Modal */}
            {reportTarget && (
                <ReportModal 
                    user={user}
                    target={{
                        id: reportTarget.id,
                        type: 'Post',
                        summary: reportTarget.text ? reportTarget.text.substring(0, 50) : 'Media Post'
                    }}
                    onClose={() => setReportTarget(null)} 
                />
            )}
        </div>
    );
}
