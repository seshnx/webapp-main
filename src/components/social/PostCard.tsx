import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Share2, MoreHorizontal, User, Bookmark, Smile, UserPlus, Link2, Flag, Trash2, Check, Repeat2, Edit3, FileEdit, ExternalLink, DollarSign } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import StarFieldVisualizer from '../shared/StarFieldVisualizer';
import CommentSection from './CommentSection';
import RepostModal from './RepostModal';
import PostEditAmendModal from './PostEditAmendModal';
import { motion, AnimatePresence } from 'framer-motion';
import FollowButton, { FollowButtonCompact } from './FollowButton';
import toast from 'react-hot-toast';
import UserAvatar from '../shared/UserAvatar';
import AudioWaveformPlayer from './AudioWaveformPlayer';
import TipModal from './TipModal';
// getOptimizedImageUrl removed — Cloudflare Image Resizing not enabled

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
    timestamp?: string | number | Date;
    created_at?: string | number | Date;
    createdAt?: string | number | Date;
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
    subProfiles?: Record<string, any>;
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

const getFileNameFromUrl = (url: string, providedName?: string): string => {
    if (providedName) {
        const genericNames = ['audio track', 'track', 'attachment 1', 'attachment 2', 'attachment 3', 'attachment'];
        const isGeneric = genericNames.includes(providedName.toLowerCase().trim());
        
        if (!isGeneric) {
            return providedName;
        }
    }

    try {
        const decoded = decodeURIComponent(url.split('?')[0]);
        let fileName = decoded.split('/').pop() || 'Audio Track';

        // Remove file extension
        fileName = fileName.replace(/\.[^/.]+$/, "");

        // Remove upload prefixes like "1774661823432_yuqgpj_"
        fileName = fileName.replace(/^\d+_[a-zA-Z0-9]+_/, '');
        
        // Clean up formatting
        fileName = fileName.replace(/[-_]/g, ' ');

        return fileName || 'Audio Track';
    } catch {
        return providedName || 'Audio Track';
    }
};

const detectMediaType = (url: string): 'image' | 'video' | 'audio' => {
    if (!url || typeof url !== 'string') return 'image';
    const path = url.split('?')[0].toLowerCase();
    if (/\.(mp4|webm|mov|avi|mkv|m4v)(\/|$)/i.test(path) || path.includes('/video') || path.includes('video/')) return 'video';
    if (/\.(mp3|wav|ogg|aac|flac|m4a|wma)(\/|$)/i.test(path) || path.includes('/audio') || path.includes('audio/')) return 'audio';
    return 'image';
};

const normalizePostAttachments = (p: any): Array<{ url: string; type: 'image' | 'video' | 'audio'; name?: string }> => {
    if (!p) return [];

    // 1. Structured attachments
    if (Array.isArray(p.attachments) && p.attachments.length > 0) {
        return p.attachments.map((att: any, idx: number) => ({
            url: typeof att === 'string' ? att : att.url,
            type: (typeof att === 'object' && att.type) ? att.type : detectMediaType(typeof att === 'string' ? att : att.url),
            name: typeof att === 'object' ? att.name : `Attachment ${idx + 1}`,
        })).filter((a: any) => Boolean(a.url));
    }

    // 2. mediaAttachments array
    if (Array.isArray(p.mediaAttachments) && p.mediaAttachments.length > 0) {
        return p.mediaAttachments.map((att: any, idx: number) => ({
            url: att.url,
            type: att.type || detectMediaType(att.url),
            name: att.name || `Attachment ${idx + 1}`,
        })).filter((a: any) => Boolean(a.url));
    }

    // 3. mediaUrls array
    if (Array.isArray(p.mediaUrls) && p.mediaUrls.length > 0) {
        return p.mediaUrls.map((url: string, idx: number) => ({
            url,
            type: detectMediaType(url),
            name: `Attachment ${idx + 1}`,
        })).filter((a: any) => Boolean(a.url));
    }

    // 4. Single properties
    const list: Array<{ url: string; type: 'image' | 'video' | 'audio'; name?: string }> = [];
    if (p.audioUrl) {
        list.push({ url: p.audioUrl, type: 'audio', name: p.audioName || 'Audio Track' });
    }
    if (p.imageUrl) {
        list.push({ url: p.imageUrl, type: 'image', name: 'Image' });
    }
    if (p.videoUrl) {
        list.push({ url: p.videoUrl, type: 'video', name: 'Video' });
    }
    return list;
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const EMPTY_ARRAY: string[] = [];

const PostCard = React.memo(React.forwardRef<HTMLDivElement, PostCardProps>(function PostCard({
    post,
    currentUser,
    currentUserData,
    subProfiles,
    openPublicProfile,
    onReport,
    onDelete,
    isFollowingAuthor,
    onToggleFollow,
    autoPlayVideos = false
}, ref) {
    const navigate = useNavigate();
    const [showComments, setShowComments] = useState<boolean>(false);
    const [commentCount, setCommentCount] = useState<number>(post.commentCount || 0);
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [showReactionMenu, setShowReactionMenu] = useState<boolean>(false);
    const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
    const [showShareMenu, setShowShareMenu] = useState<boolean>(false);
    const [showRepostModal, setShowRepostModal] = useState<boolean>(false);
    const [showTipModal, setShowTipModal] = useState<boolean>(false);
    const [showEditAmendModal, setShowEditAmendModal] = useState<boolean>(false);
    const [editAmendMode, setEditAmendMode] = useState<'edit' | 'amend'>('edit');
    const [linkCopied, setLinkCopied] = useState<boolean>(false);
    const [savingPost, setSavingPost] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const moreMenuRef = useRef<HTMLDivElement>(null);
    const shareMenuRef = useRef<HTMLDivElement>(null);

    const userId = currentUser?.id || currentUser?.uid;
    const authorClerkId = (post as any)?.authorClerkId || (post as any)?.clerkId;
    const authorDocId = post.authorId || post.userId;
    const isOwnPost = Boolean(
        (userId && (post.userId === userId || authorClerkId === userId || (post as any)?.userId === userId)) ||
        (currentUserData && authorDocId && (currentUserData._id === authorDocId || currentUserData.clerkId === authorClerkId))
    );

    const postCreatedAt = (post as any)?.createdAt || (post as any)?.created_at || (post as any)?.timestamp;
    const postAgeMs = postCreatedAt ? (Date.now() - new Date(postCreatedAt).getTime()) : 0;
    const canEditOriginal = isOwnPost && postAgeMs <= 30 * 60 * 1000;

    // DEBUG: Log attachment data for first 3 posts
    const debugAttachments = () => {
        if (!post.attachments?.length) {
            console.log(`[PostCard DEBUG] post=${post.id} NO attachments | imageUrl=${post.imageUrl} | audioUrl=${post.audioUrl}`);
        } else {
            console.log(`[PostCard DEBUG] post=${post.id} attachments:`, post.attachments.map(a => ({
                type: a.type,
                url: a.url,
            })));
        }
    };
    React.useEffect(() => { debugAttachments(); }, [post.id]);

    // Convex mutations
    const toggleReactionMutation = useMutation(api.social.toggleReaction);
    const savePostMutation = useMutation(api.social.savePost);
    const unsavePostMutation = useMutation(api.social.unsavePost);
    const deletePostMutation = useMutation(api.social.deletePost);

    // Real-time reactions from Convex
    const convexReactions = useQuery(api.social.getReactions,
        post.id ? { targetId: post.id, targetType: 'post' as const } : "skip"
    );
    // hasReacted returns { emoji, reacted } or null — resolves Clerk ID internally
    const myReactionData = useQuery(api.social.hasReacted,
        (userId && post.id) ? { clerkId: userId, targetId: post.id, targetType: 'post' as const } : "skip"
    );
    const isSavedQuery = useQuery(api.social.isSaved,
        (userId && post.id) ? { clerkId: userId, postId: post.id as Id<"posts"> } : "skip"
    );

    // Fallback query to resolve original post if this is a repost and not pre-resolved
    const repostId = (post as any)?.repostOf;
    const fallbackOriginalPost = useQuery(
        api.posts.get,
        repostId && !(post as any)?.originalPost ? { postId: repostId as Id<"posts"> } : "skip"
    );
    const resolvedOriginalPost = (post as any)?.originalPost || fallbackOriginalPost;
    const isRepost = Boolean(repostId || (post as any)?.originalPost || (post as any)?.isRepost);

    // Derive reaction counts from Convex
    const reactionCounts: ReactionCounts = convexReactions
        ? convexReactions.reduce((acc: ReactionCounts, r: any) => {
            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
            return acc;
        }, {} as ReactionCounts)
        : (post.reactions
            ? Object.values(post.reactions).reduce((acc: ReactionCounts, emoji: string) => {
                acc[emoji] = (acc[emoji] || 0) + 1;
                return acc;
              }, {} as ReactionCounts)
            : {});

    // Get emoji from hasReacted result (no need for separate ID comparison)
    const myReaction = (myReactionData && typeof myReactionData === 'object' && 'emoji' in myReactionData)
        ? (myReactionData as any).emoji
        : null;

    const totalReactions = Object.values(reactionCounts).reduce((a: number, b: number) => a + b, 0);

    // Sync isSaved from Convex query
    useEffect(() => {
        if (isSavedQuery !== undefined) {
            setIsSaved(isSavedQuery as boolean);
        }
    }, [isSavedQuery]);

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
            await toggleReactionMutation({
                targetId: post.id,
                targetType: 'post' as const,
                emoji,
                userId,
            });
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
                await unsavePostMutation({ userId, postId: post.id as Id<"posts"> });
                toast.success('Removed from saved');
            } else {
                await savePostMutation({ userId, postId: post.id as Id<"posts"> });
                toast.success('Post saved!');
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
            await deletePostMutation({
                postId: post.id as Id<"posts">,
                authorId: userId!,
            });

            toast.success('Post deleted');
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
            {/* Repost Header Indicator */}
            {isRepost && (
                <div className="px-4 py-2 flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-semibold border-b border-purple-100 dark:border-purple-950/60 bg-purple-50/40 dark:bg-purple-950/20">
                    <Repeat2 size={14} className="shrink-0 text-purple-500" />
                    <span>Reposted by <strong className="hover:underline cursor-pointer" onClick={() => post.userId && openPublicProfile?.(post.userId)}>{post.displayName || 'User'}</strong></span>
                </div>
            )}

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
                                {post.displayName || '[Deleted User]'}
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
                            <span className="shrink-0 flex items-center gap-1">
                                {post.createdAt || post.timestamp || post.created_at
                                    ? new Date(post.createdAt || post.timestamp || post.created_at).toLocaleDateString()
                                    : 'Just now'
                                }
                                {post.isEdited && (
                                    <span className="text-[10px] text-gray-400 font-normal italic">(edited)</span>
                                )}
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
                                    <>
                                        {canEditOriginal ? (
                                            <button
                                                onClick={() => {
                                                    setEditAmendMode('edit');
                                                    setShowEditAmendModal(true);
                                                    setShowMoreMenu(false);
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-brand-blue"
                                            >
                                                <Edit3 size={16} />
                                                <span>Edit post</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditAmendMode('amend');
                                                    setShowEditAmendModal(true);
                                                    setShowMoreMenu(false);
                                                    toast('Original editing closed after 30 mins. Opening amendment.', { icon: 'ℹ️' });
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-400"
                                            >
                                                <Edit3 size={16} />
                                                <div className="flex flex-col">
                                                    <span>Edit post</span>
                                                    <span className="text-[10px] text-amber-500 font-semibold">30m limit passed (Amend)</span>
                                                </div>
                                            </button>
                                        )}

                                        <button
                                            onClick={() => {
                                                setEditAmendMode('amend');
                                                setShowEditAmendModal(true);
                                                setShowMoreMenu(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-emerald-600 dark:text-emerald-400"
                                        >
                                            <FileEdit size={16} />
                                            <span>Add amendment</span>
                                        </button>

                                        <button
                                            onClick={() => { handleDeletePost(); setShowMoreMenu(false); }}
                                            className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-red-500"
                                        >
                                            <Trash2 size={16} />
                                            <span>Delete post</span>
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Content Body */}
            <div className="px-4 pb-2">
                {(post.content || post.text) && (
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm leading-relaxed mb-3">
                        {renderText(post.content || post.text)}
                    </p>
                )}

                {/* Attachments for Current Post */}
                {(() => {
                    const postAttachments = normalizePostAttachments(post);
                    if (!postAttachments.length) return null;

                    return (
                        <div className={`grid gap-2 mb-3 ${postAttachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {postAttachments.map((att, i) => (
                                <div key={i} className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                                    {att.type === 'image' && (
                                        <img
                                            src={att.url}
                                            className="w-full h-auto object-contain rounded-lg"
                                            alt={att.name || 'content'}
                                            style={{ maxHeight: '600px' }}
                                            loading="lazy"
                                            onError={(e) => {
                                                console.error(`[PostCard IMG ERROR] Failed to load: ${(e.target as HTMLImageElement).src}`);
                                                (e.target as HTMLImageElement).style.border = '3px solid red';
                                            }}
                                        />
                                    )}
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
                                            <AudioWaveformPlayer
                                                audioUrl={att.url}
                                                title={getFileNameFromUrl(att.url, att.name)}
                                                gearUsed={post.equipment || post.software}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                })()}

                {/* Embedded Original Post Card for Reposts */}
                {isRepost && (
                    <div className="mt-3 p-3.5 rounded-xl bg-gray-50/90 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/70 space-y-2.5">
                        {!resolvedOriginalPost ? (
                            <div className="text-xs text-gray-400 italic py-2 flex items-center gap-2">
                                <Repeat2 size={13} className="animate-spin text-purple-400" />
                                <span>Loading reposted content...</span>
                            </div>
                        ) : resolvedOriginalPost.isDeleted ? (
                            <div className="text-xs text-gray-400 italic py-1 flex items-center gap-2">
                                <Trash2 size={13} className="text-gray-400" />
                                <span>This original post is no longer available.</span>
                            </div>
                        ) : (
                            <>
                                {/* Original Author Header */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div
                                            className="cursor-pointer shrink-0"
                                            onClick={() => (resolvedOriginalPost.authorId || resolvedOriginalPost.userId) && openPublicProfile?.(resolvedOriginalPost.authorId || resolvedOriginalPost.userId)}
                                        >
                                            <UserAvatar
                                                src={resolvedOriginalPost.authorPhoto}
                                                name={resolvedOriginalPost.displayName || resolvedOriginalPost.authorName}
                                                size="sm"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span
                                                    className="font-bold text-xs dark:text-white hover:underline cursor-pointer truncate"
                                                    onClick={() => (resolvedOriginalPost.authorId || resolvedOriginalPost.userId) && openPublicProfile?.(resolvedOriginalPost.authorId || resolvedOriginalPost.userId)}
                                                >
                                                    {resolvedOriginalPost.displayName || resolvedOriginalPost.authorName || 'Creator'}
                                                </span>
                                                {resolvedOriginalPost.role && (
                                                    <span className="text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 px-1.5 py-0.2 rounded-md">
                                                        {resolvedOriginalPost.role}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                                <span>@{resolvedOriginalPost.username || resolvedOriginalPost.authorUsername || 'user'}</span>
                                                <span>•</span>
                                                <span>
                                                    {resolvedOriginalPost.createdAt
                                                        ? new Date(resolvedOriginalPost.createdAt).toLocaleDateString()
                                                        : 'Original Post'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* View Original Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const origId = resolvedOriginalPost._id || resolvedOriginalPost.id || repostId;
                                            if (origId) {
                                                navigate(`/post/${origId}`);
                                            }
                                        }}
                                        className="flex items-center gap-1 text-[11px] font-semibold text-brand-blue hover:text-blue-500 transition px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 shrink-0"
                                        title="View original post"
                                    >
                                        <ExternalLink size={12} />
                                        <span>View Original</span>
                                    </button>
                                </div>

                                {/* Original Body Text */}
                                {(resolvedOriginalPost.content || resolvedOriginalPost.text) && (
                                    <p className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                                        {renderText(resolvedOriginalPost.content || resolvedOriginalPost.text)}
                                    </p>
                                )}

                                {/* Original Attachments */}
                                {(() => {
                                    const origAttachments = normalizePostAttachments(resolvedOriginalPost);
                                    const origAudios = origAttachments.filter((a) => a.type === 'audio');
                                    const origNonAudios = origAttachments.filter((a) => a.type !== 'audio');

                                    return (
                                        <>
                                            {/* Original Audio Players */}
                                            {origAudios.map((att, i) => (
                                                <div key={i} className="w-full">
                                                    <AudioWaveformPlayer
                                                        audioUrl={att.url}
                                                        title={getFileNameFromUrl(att.url, att.name || resolvedOriginalPost.audioName)}
                                                        gearUsed={resolvedOriginalPost.equipment || resolvedOriginalPost.software}
                                                    />
                                                </div>
                                            ))}

                                            {/* Original Images & Videos */}
                                            {origNonAudios.length > 0 && (
                                                <div className={`grid gap-2 rounded-xl overflow-hidden ${origNonAudios.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                                    {origNonAudios.map((att, idx) => (
                                                        <div key={idx} className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                                                            {att.type === 'image' ? (
                                                                <img
                                                                    src={att.url}
                                                                    alt={att.name || 'Original attachment'}
                                                                    className="w-full h-auto object-contain max-h-80 rounded-lg"
                                                                    loading="lazy"
                                                                />
                                                            ) : (
                                                                <video
                                                                    src={att.url}
                                                                    controls
                                                                    className="w-full max-h-80 object-contain bg-black rounded-lg"
                                                                    autoPlay={autoPlayVideos}
                                                                    playsInline
                                                                    muted={autoPlayVideos}
                                                                    preload="metadata"
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}

                                {/* Original Equipment / Software */}
                                {((resolvedOriginalPost.equipment?.length > 0) || (resolvedOriginalPost.software?.length > 0)) && (
                                    <div className="flex flex-wrap gap-1 text-[10px] text-gray-400 pt-1">
                                        {resolvedOriginalPost.equipment?.map((gear: string, i: number) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700/60 rounded text-gray-600 dark:text-gray-300">
                                                🎛️ {gear}
                                            </span>
                                        ))}
                                        {resolvedOriginalPost.software?.map((sw: string, i: number) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700/60 rounded text-gray-600 dark:text-gray-300">
                                                💻 {sw}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Amendments List */}
                {post.amendments && post.amendments.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                        <div className="text-[11px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1.5">
                            <FileEdit size={13} />
                            Amendments ({post.amendments.length})
                        </div>
                        {post.amendments.map((amendment: any, index: number) => (
                            <div
                                key={index}
                                className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-xl p-3 text-xs"
                            >
                                <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                                        Amendment #{index + 1}
                                    </span>
                                    <span>
                                        {amendment.createdAt
                                            ? new Date(amendment.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                                            : 'Recent'}
                                    </span>
                                </div>
                                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                                    {renderText(amendment.text)}
                                </p>
                            </div>
                        ))}
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
                        {/* Tip Button - Disallowed on Reposts */}
                        {!isOwnPost && !isRepost && (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowTipModal(true)}
                                className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-500/30 transition px-2.5 py-1 rounded-lg"
                                title="Tip Creator"
                            >
                                <DollarSign size={16} />
                                <span>Tip</span>
                            </motion.button>
                        )}
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
                            subProfiles={subProfiles}
                            blockedUsers={EMPTY_ARRAY}
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
            {/* Tip Creator Modal */}
            {showTipModal && (
                <TipModal
                    creatorName={post.displayName || 'Creator'}
                    creatorPhoto={post.authorPhoto}
                    onClose={() => setShowTipModal(false)}
                />
            )}

            {/* Edit / Amend Modal */}
            {isOwnPost && userId && (
                <PostEditAmendModal
                    isOpen={showEditAmendModal}
                    mode={editAmendMode}
                    postId={post.id}
                    authorId={userId}
                    initialContent={post.content || post.text || ''}
                    postCreatedAt={postCreatedAt}
                    onClose={() => setShowEditAmendModal(false)}
                />
            )}
        </motion.div>
    );
}));

export default PostCard;
