import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Share2, MoreHorizontal, User, Bookmark, Smile, UserPlus, Link2, Flag, Trash2, Check, Repeat2 } from 'lucide-react';
import { updatePost, deletePost, checkIsSaved, savePost, unsavePost, updatePostSaveCount, toggleReaction } from '../../config/neonQueries';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import StarFieldVisualizer from '../shared/StarFieldVisualizer';
import CommentSection from './CommentSection';
import RepostModal from './RepostModal';
import { motion, AnimatePresence } from 'framer-motion';
import { createNotification } from '../../hooks/useNotifications';
import FollowButton, { FollowButtonCompact } from './FollowButton';
import toast from 'react-hot-toast';
import UserAvatar from '../shared/UserAvatar';

const REACTION_SET = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

/**
 * Attachment interface
 */
interface Attachment {
    url: string;
    type: 'image' | 'video' | 'audio';
    name?: string;
    [key: string]: any;
}

/**
 * Post data interface
 */
interface Post {
    id: string;
    userId: string;
    displayName?: string;
    authorPhoto?: string;
    role?: string;
    timestamp?: string | Date;
    created_at?: string | Date;
    text?: string;
    attachments?: Attachment[];
    imageUrl?: string;
    audioUrl?: string;
    audioName?: string;
    reactions?: Record<string, string>;
    reactionCount?: number;
    commentCount?: number;
    saveCount?: number;
    [key: string]: any;
}

/**
 * Reaction counts interface
 */
interface ReactionCounts {
    [emoji: string]: number;
}

/**
 * PostCard props interface
 */
export interface PostCardProps {
    post: Post;
    currentUser?: any;
    currentUserData?: any;
    openPublicProfile?: (userId: string) => void;
    onReport?: () => void;
    onDelete?: (postId: string) => void;
    isFollowingAuthor?: boolean;
    onToggleFollow?: () => void;
    autoPlayVideos?: boolean;
}

const renderText = (text: string | undefined) => {
    if (!text) return null;
    return text.split(/(\s+)/).map((part, i) => {
        if (part.match(/^#\w+/)) return <span key={i} className="text-brand-blue font-bold cursor-pointer hover:underline">{part}</span>;
        if (part.match(/^@\w+/)) return <span key={i} className="text-purple-600 font-bold cursor-pointer hover:underline">{part}</span>;
        return part;
    });
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const PostCard = React.forwardRef<HTMLDivElement, PostCardProps>(function PostCard({
    post,
    currentUser,
    currentUserData,
    openPublicProfile,
    onReport,
    onDelete,
    isFollowingAuthor,
    onToggleFollow,
    autoPlayVideos = false
}, ref) {
    const [showComments, setShowComments] = useState<boolean>(false);
    const [commentCount, setCommentCount] = useState<number>(post.commentCount || 0);
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [showReactionMenu, setShowReactionMenu] = useState<boolean>(false);
    const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
    const [showShareMenu, setShowShareMenu] = useState<boolean>(false);
    const [showRepostModal, setShowRepostModal] = useState<boolean>(false);
    const [linkCopied, setLinkCopied] = useState<boolean>(false);
    const [savingPost, setSavingPost] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const moreMenuRef = useRef<HTMLDivElement>(null);
    const shareMenuRef = useRef<HTMLDivElement>(null);

    const userId = currentUser?.id || currentUser?.uid;
    const isOwnPost = post.userId === userId;

    // Real-time reactions from Convex (with fallback for when not configured)
    const convexReactions = useQuery(api.reactions.list, { targetId: post.id, targetType: 'post' as const });
    const convexReactionsSummary = useQuery(api.reactions.getSummary, { targetId: post.id, targetType: 'post' as const });
    const myReactionConvex = useQuery(api.reactions.getUserReaction, {
        targetId: post.id,
        targetType: 'post' as const,
        userId: userId || ''
    });

    // Check if Convex is available (not in error state and loaded)
    const convexAvailable = convexReactionsSummary !== undefined && !convexReactionsSummary;

    // Use Convex data if available, otherwise fall back to post data
    const myReaction = convexAvailable && userId
        ? (myReactionConvex?.emoji || null)
        : (post.reactions?.[userId]);

    // Calculate reaction counts from Convex summary or post data
    const reactionCounts: ReactionCounts = convexAvailable && Object.keys(convexReactionsSummary || {}).length > 0
        ? Object.fromEntries(
            Object.entries(convexReactionsSummary || {}).map(([emoji, data]: [string, any]) => [emoji, data.count])
          )
        : (post.reactions
            ? Object.values(post.reactions).reduce((acc: ReactionCounts, emoji: string) => {
                acc[emoji] = (acc[emoji] || 0) + 1;
                return acc;
              }, {})
            : {});

    const totalReactions = Object.values(reactionCounts).reduce((a: number, b: number) => a + b, 0);

    // Check if post is saved on mount
    useEffect(() => {
        if (!userId) return;

        const checkSaved = async () => {
            try {
                const saved = await checkIsSaved(userId, post.id);
                setIsSaved(saved);
            } catch (e) {
                console.error('Error checking saved status:', e);
                setIsSaved(false); // Default to false on error
            }
        };
        checkSaved();
    }, [userId, post.id]);

    // Close menus on outside click
    useEffect(() => {
        const handleClickOutside = (event: Event) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowReactionMenu(false);
            }
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setShowMoreMenu(false);
            }
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
                setShowShareMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleReaction = async (emoji: string) => {
        setShowReactionMenu(false);
        if (!userId) return;

        try {
            // Check if this is removing the current reaction or adding a new one
            if (myReaction === emoji) {
                // Remove reaction
                await toggleReaction(userId, 'post', post.id, emoji);
            } else {
                // Add/change reaction
                const wasReacted = !!myReaction;
                await toggleReaction(userId, 'post', post.id, emoji);

                // Send notification (only for new reactions, not changes)
                if (!wasReacted && !isOwnPost) {
                    createNotification({
                        targetUserId: post.userId,
                        type: 'reaction',
                        fromUserId: userId,
                        fromUserName: currentUserData?.effectiveDisplayName || currentUserData?.firstName || 'Someone',
                        fromUserPhoto: currentUserData?.photoURL,
                        postId: post.id,
                        postPreview: post.text?.substring(0, 50),
                        message: `reacted ${emoji} to your post`
                    });
                }
            }
        } catch (e) {
            console.error("Reaction failed", e);
            toast.error("Couldn't add reaction");
        }
    };

    const handleSavePost = async () => {
        if (!userId || savingPost) return;
        setSavingPost(true);

        try {
            if (isSaved) {
                // Unsave
                await unsavePost(userId, post.id);
                await updatePostSaveCount(post.id, -1);

                setIsSaved(false);
                toast.success('Removed from saved');
            } else {
                // Save
                await savePost(userId, post.id, {
                    author_id: post.userId,
                    author_name: post.displayName,
                    preview: post.text?.substring(0, 100) || 'Media post',
                    has_media: !!(post.attachments?.length || post.imageUrl || post.audioUrl)
                });
                await updatePostSaveCount(post.id, 1);

                setIsSaved(true);
                toast.success('Post saved!');

                // Optionally notify author (some platforms do this)
                // Uncomment if desired:
                // if (!isOwnPost) {
                //     createNotification({
                //         targetUserId: post.userId,
                //         type: 'save',
                //         fromUserId: userId,
                //         fromUserName: currentUserData?.effectiveDisplayName || 'Someone',
                //         fromUserPhoto: currentUserData?.photoURL,
                //         postId: post.id,
                //         message: 'saved your post'
                //     });
                // }
            }
        } catch (e) {
            console.error("Save failed", e);
            toast.error("Couldn't save post");
        }
        setSavingPost(false);
    };

    const handleShare = () => {
        // Show share menu instead of directly sharing
        setShowShareMenu(!showShareMenu);
    };

    const handleRepost = () => {
        setShowShareMenu(false);
        if (!userId) {
            toast.error('Please log in to repost');
            return;
        }
        setShowRepostModal(true);
    };

    const handleCopyLink = () => {
        const shareUrl = `${window.location.origin}/post/${post.id}`;
        copyLink(shareUrl);
        setShowShareMenu(false);
    };

    const copyLink = (url: string) => {
        navigator.clipboard.writeText(url);
        setLinkCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const handleDeletePost = async () => {
        if (!isOwnPost) return;
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            const success = await deletePost(post.id);

            if (!success) {
                toast.error("Couldn't delete post - permission denied");
                return;
            }

            toast.success('Post deleted');
            // Notify parent to remove post from UI
            if (onDelete) onDelete(post.id);
        } catch (e) {
            console.error('Delete failed:', e);
            toast.error("Couldn't delete post");
        }
    };

    return (
        <motion.div
            ref={ref}
            variants={cardVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            layout
            className="bg-white dark:bg-dark-card border dark:border-gray-700 rounded-xl overflow-visible shadow-sm mb-4 relative"
        >
            {/* Header */}
            <div className="p-4 flex justify-between items-start">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                        className="cursor-pointer shrink-0"
                        onClick={() => post.userId && openPublicProfile?.(post.userId)}
                        role="button"
                        tabIndex={0}
                        aria-label={`View ${post.displayName || 'user'}'s profile`}
                    >
                        <UserAvatar
                            src={post.authorPhoto}
                            name={post.displayName}
                            size="md"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h4
                                className="font-bold dark:text-white text-sm hover:underline decoration-brand-blue cursor-pointer truncate"
                                onClick={() => post.userId && openPublicProfile?.(post.userId)}
                            >
                                {post.displayName || 'Unknown User'}
                            </h4>
                            {/* Follow button in header for non-own posts */}
                            {!isOwnPost && onToggleFollow && !isFollowingAuthor && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onToggleFollow(); }}
                                    className="text-xs font-bold text-brand-blue hover:text-blue-700 transition shrink-0"
                                >
                                    • Follow
                                </button>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="truncate">{post.role}</span>
                            <span>•</span>
                            <span className="shrink-0">
                                {post.timestamp || post.created_at
                                    ? new Date(post.timestamp || post.created_at).toLocaleDateString()
                                    : 'Just now'
                                }
                            </span>
                        </div>
                    </div>
                </div>

                {/* More menu */}
                <div className="relative" ref={moreMenuRef}>
                    <button
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                    >
                        <MoreHorizontal size={20} />
                    </button>

                    <AnimatePresence>
                        {showMoreMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 overflow-hidden z-50"
                            >
                                <button
                                    onClick={() => { copyLink(`${window.location.origin}/post/${post.id}`); setShowMoreMenu(false); }}
                                    className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                >
                                    <Link2 size={16} className="text-gray-400" />
                                    <span className="dark:text-gray-200">Copy link</span>
                                </button>

                                {!isOwnPost && (
                                    <>
                                        {onToggleFollow && (
                                            <button
                                                onClick={() => { onToggleFollow(); setShowMoreMenu(false); }}
                                                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                            >
                                                <UserPlus size={16} className="text-gray-400" />
                                                <span className="dark:text-gray-200">
                                                    {isFollowingAuthor ? 'Unfollow' : 'Follow'} {post.displayName?.split(' ')[0]}
                                                </span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { onReport?.(); setShowMoreMenu(false); }}
                                            className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-red-500"
                                        >
                                            <Flag size={16} />
                                            <span>Report post</span>
                                        </button>
                                    </>
                                )}

                                {isOwnPost && (
                                    <button
                                        onClick={() => { handleDeletePost(); setShowMoreMenu(false); }}
                                        className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-red-500"
                                    >
                                        <Trash2 size={16} />
                                        <span>Delete post</span>
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Content Body */}
            <div className="px-4 pb-2">
                {post.text && (
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm leading-relaxed mb-3">
                        {renderText(post.text)}
                    </p>
                )}

                {/* Attachments */}
                {post.attachments && post.attachments.length > 0 && (
                    <div className={`grid gap-2 mb-3 ${post.attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {post.attachments.map((att, i) => (
                            <div key={i} className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                                {att.type === 'image' && <img src={att.url} className="w-full h-auto object-contain rounded-lg" alt="content" style={{ maxHeight: '600px' }} />}
                                {att.type === 'video' && (
                                    <video
                                        src={att.url}
                                        controls
                                        className="w-full h-auto object-contain bg-black rounded-lg"
                                        style={{ maxHeight: '600px' }}
                                        autoPlay={autoPlayVideos}
                                        playsInline
                                        muted={autoPlayVideos}
                                        preload="metadata"
                                    />
                                )}
                                {att.type === 'audio' && (
                                    <div className="w-full">
                                        <StarFieldVisualizer audioUrl={att.url} fileName={att.name || 'Audio Track'} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Fallbacks for legacy posts */}
                {post.audioUrl && !post.attachments && (
                    <div className="rounded-lg overflow-hidden bg-transparent mb-3">
                        <StarFieldVisualizer audioUrl={post.audioUrl} fileName={post.audioName || 'Track'} />
                    </div>
                )}
                {post.imageUrl && !post.attachments && (
                    <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
                        <img src={post.imageUrl} className="w-full h-auto object-contain rounded-lg" alt="legacy content" style={{ maxHeight: '600px' }} />
                    </div>
                )}
            </div>

            {/* Engagement Stats */}
            {(totalReactions > 0 || post.saveCount > 0) && (
                <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex gap-1">
                        {Object.entries(reactionCounts).map(([emoji, count]) => (
                            <motion.div
                                key={emoji}
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${myReaction === emoji ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800' : 'bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700'} dark:text-gray-300`}
                            >
                                <span>{emoji}</span>
                                <span className="font-bold">{count}</span>
                            </motion.div>
                        ))}
                    </div>
                    {post.saveCount > 0 && (
                        <span className="text-xs text-gray-400">
                            {post.saveCount} save{post.saveCount !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="px-4 py-3 border-t dark:border-gray-700 flex items-center justify-between relative">
                <div className="flex gap-2 sm:gap-4">
                    {/* Reaction Button */}
                    <div className="relative">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowReactionMenu(!showReactionMenu)}
                            className={`flex items-center gap-1.5 sm:gap-2 text-sm font-medium transition px-2 py-1 rounded-lg ${myReaction ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                            {myReaction ? <span className="text-lg">{myReaction}</span> : <Smile size={18} />}
                            <span className="hidden sm:inline">{myReaction ? 'Reacted' : 'React'}</span>
                        </motion.button>

                        <AnimatePresence>
                            {showReactionMenu && (
                                <motion.div
                                    ref={menuRef}
                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                    className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 shadow-xl rounded-full p-2 flex gap-1 sm:gap-2 z-50 border dark:border-gray-600 origin-bottom-left"
                                >
                                    {REACTION_SET.map(emoji => (
                                        <motion.button
                                            key={emoji}
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => { e.stopPropagation(); handleReaction(emoji); }}
                                            className={`text-xl p-1 sm:p-1.5 rounded-full ${myReaction === emoji ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                        >
                                            {emoji}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Comment Button */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-1.5 sm:gap-2 text-sm font-medium text-gray-500 hover:text-brand-blue transition px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <MessageCircle size={18} />
                        <span className="hidden sm:inline">{commentCount > 0 ? commentCount : 'Comment'}</span>
                        {commentCount > 0 && <span className="sm:hidden">{commentCount}</span>}
                    </motion.button>

                    {/* Share Button */}
                    <div className="relative">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleShare}
                            className={`flex items-center gap-1.5 sm:gap-2 text-sm font-medium transition px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${linkCopied ? 'text-green-500' : 'text-gray-500 hover:text-green-500'}`}
                        >
                            {linkCopied ? <Check size={18} /> : <Share2 size={18} />}
                            <span className="hidden sm:inline">{linkCopied ? 'Copied!' : 'Share'}</span>
                        </motion.button>

                        {/* Share Dropdown Menu */}
                        <AnimatePresence>
                            {showShareMenu && (
                                <motion.div
                                    ref={shareMenuRef}
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 shadow-xl rounded-lg py-2 min-w-[160px] z-50 border dark:border-gray-600 origin-bottom-left"
                                >
                                    <button
                                        onClick={handleRepost}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                                    >
                                        <Repeat2 size={16} className="text-primary" />
                                        <span>Repost</span>
                                    </button>
                                    <button
                                        onClick={handleCopyLink}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                                    >
                                        <Link2 size={16} />
                                        <span>Copy link</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Save Button */}
                <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={handleSavePost}
                    disabled={savingPost}
                    className={`${isSaved ? 'text-brand-blue' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'} transition p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full disabled:opacity-50`}
                    title={isSaved ? 'Remove from saved' : 'Save post'}
                >
                    <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                </motion.button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <CommentSection
                            post={post}
                            currentUser={currentUser}
                            currentUserData={currentUserData}
                            blockedUsers={[]}
                            onCountChange={setCommentCount}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Repost Modal */}
            <RepostModal
                post={post}
                userId={userId}
                isOpen={showRepostModal}
                onClose={() => setShowRepostModal(false)}
                onSuccess={(repostId) => {
                    // Optionally refresh the feed or do something with the new repost
                    console.log('Repost created:', repostId);
                }}
            />
        </motion.div>
    );
});

export default PostCard;
