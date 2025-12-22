import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabase';
import { Loader2, RefreshCw, Users, Compass, UserPlus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import PostCard from './social/PostCard';
import CreatePostWidget from './social/CreatePostWidget';
import ReportModal from './ReportModal';
import Discover from './social/Discover';
import { useFollowSystem } from '../hooks/useFollowSystem';
import FollowButton from './social/FollowButton';
import UserAvatar from './shared/UserAvatar';

// Feed mode tabs
const FEED_MODES = {
    FOR_YOU: 'for_you',
    FOLLOWING: 'following',
    DISCOVER: 'discover'
};

export default function SocialFeed({ user, userData, openPublicProfile }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportTarget, setReportTarget] = useState(null);
    const [feedMode, setFeedMode] = useState(FEED_MODES.FOR_YOU);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    // Use the follow system hook
    const userId = user?.id || user?.uid;
    const { 
        following, 
        stats, 
        loading: followLoading, 
        isFollowing, 
        toggleFollow,
        getFollowingIds 
    } = useFollowSystem(userId, userData);

    // Memoize following IDs for feed filtering
    const followingIds = useMemo(() => getFollowingIds(), [following]);

    // Load suggested users when on Following tab with no follows
    useEffect(() => {
        const userId = user?.id || user?.uid;
        if (feedMode === FEED_MODES.FOLLOWING && followingIds.length === 0 && userId) {
            loadSuggestedUsers();
        }
    }, [feedMode, followingIds.length, user?.id, user?.uid]);

    const loadSuggestedUsers = async () => {
        setLoadingSuggestions(true);
        try {
            if (!supabase || !user?.id && !user?.uid) return;
            
            const userId = user.id || user.uid;
            
            // Get recent posters as suggestions (excluding current user)
            const { data: posts, error } = await supabase
                .from('posts')
                .select('user_id, display_name, author_photo, role')
                .neq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20);
            
            if (error) throw error;
            
            // Extract unique users from posts
            const usersMap = new Map();
            (posts || []).forEach(post => {
                if (!usersMap.has(post.user_id)) {
                    usersMap.set(post.user_id, {
                        userId: post.user_id,
                        displayName: post.display_name,
                        photoURL: post.author_photo,
                        role: post.role
                    });
                }
            });
            
            setSuggestedUsers(Array.from(usersMap.values()).slice(0, 5));
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
        setLoadingSuggestions(false);
    };

    // Skeleton loader for feed
    const renderSkeleton = () => {
        const skeletonItems = Array.from({ length: 3 });
        return (
            <div className="space-y-4 p-fluid">
                <div className="bg-white dark:bg-[#1f2128] rounded-2xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-48 mb-3"></div>
                    <div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl w-full mb-2"></div>
                </div>
                {skeletonItems.map((_, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#1f2128] rounded-2xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                            <div className="flex-1">
                                <div className="h-3.5 w-32 bg-gray-200 dark:bg-gray-700 rounded-full mb-2"></div>
                                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                            </div>
                        </div>
                        <div className="h-3 w-5/6 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                        <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                        <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                        <div className="flex gap-3">
                            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Render loading skeletons while feed loads
    if (loading) {
        return renderSkeleton();
    }

    // Main feed listener
    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        setLoading(true);
        
        let query = supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });
        
        // Set limit based on feed mode
        const limitCount = (feedMode === FEED_MODES.FOLLOWING && followingIds.length > 0) ? 50 : 20;
        query = query.limit(limitCount);

        // Initial fetch
        query.then(({ data: posts, error }) => {
            if (error) {
                console.error("Feed error:", error);
                setLoading(false);
                return;
            }

            let newPosts = (posts || []).map(post => ({
                id: post.id,
                ...post,
                userId: post.user_id,
                displayName: post.display_name,
                authorPhoto: post.author_photo,
                timestamp: post.created_at,
                commentCount: post.comment_count || 0,
                reactionCount: post.reaction_count || 0,
                saveCount: post.save_count || 0
            }));
            
            // Client-side filtering for Following feed
            if (feedMode === FEED_MODES.FOLLOWING && followingIds.length > 0) {
                const userId = user?.id || user?.uid;
                newPosts = newPosts.filter(post => 
                    followingIds.includes(post.userId) || post.userId === userId
                );
            }
            
            setPosts(newPosts);
            setLoading(false);
        });

        // Subscribe to realtime changes
        const channel = supabase
            .channel('posts-feed')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'posts'
                },
                async () => {
                    // Refetch on changes
                    const { data: posts, error } = await supabase
                        .from('posts')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(limitCount);
                    
                    if (!error && posts) {
                        let newPosts = posts.map(post => ({
                            id: post.id,
                            ...post,
                            userId: post.user_id,
                            displayName: post.display_name,
                            authorPhoto: post.author_photo,
                            timestamp: post.created_at,
                            commentCount: post.comment_count || 0,
                            reactionCount: post.reaction_count || 0,
                            saveCount: post.save_count || 0
                        }));
                        
                        if (feedMode === FEED_MODES.FOLLOWING && followingIds.length > 0) {
                            const userId = user?.id || user?.uid;
                            newPosts = newPosts.filter(post => 
                                followingIds.includes(post.userId) || post.userId === userId
                            );
                        }
                        
                        setPosts(newPosts);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [feedMode, followingIds, user?.id, user?.uid]);

    const handlePost = async (postPayload) => {
        if (!user || !supabase) return;
        try {
            const userId = user.id || user.uid;
            const { error } = await supabase
                .from('posts')
                .insert({
                    user_id: userId,
                    display_name: userData?.effectiveDisplayName || `${userData?.firstName || 'User'} ${userData?.lastName || ''}`.trim(),
                    author_photo: userData?.photoURL || null,
                    role: userData?.activeProfileRole || 'User',
                    text: postPayload.text || null,
                    content: postPayload.text || null, // Also set content for compatibility
                    media_urls: postPayload.mediaUrls || [],
                    media_type: postPayload.mediaType || null,
                    created_at: new Date().toISOString(),
                    reactions: {},
                    reaction_count: 0,
                    comment_count: 0,
                    save_count: 0,
                    visibility: 'public' // Must be lowercase to match CHECK constraint
                });
            
            if (error) throw error;
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
                <button
                    onClick={() => setFeedMode(FEED_MODES.DISCOVER)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        feedMode === FEED_MODES.DISCOVER
                            ? 'bg-brand-blue text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                    <Search size={16} />
                    <span>Discover</span>
                </button>
            </div>

            {/* Feed Content */}
            {feedMode === FEED_MODES.DISCOVER ? (
                <Discover 
                    user={user} 
                    userData={userData} 
                    openPublicProfile={openPublicProfile}
                />
            ) : loading || followLoading ? (
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
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                        Suggested for you
                                    </h4>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-dark-card rounded-xl border dark:border-gray-700 animate-pulse">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                                                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                                                </div>
                                            </div>
                                            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                                        </div>
                                    ))}
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
