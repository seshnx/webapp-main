import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/api';
import type { Id } from '@convex/dataModel';
import UserAvatar from '@/components/shared/UserAvatar';
import type { UserData } from '@/types';

/**
 * Comment data interface
 */
interface CommentData {
    id: string;
    user_id: string;
    text: string;
    displayName?: string;
    userPhoto?: string;
    timestamp?: string;
    [key: string]: any;
}

/**
 * Post data interface
 */
interface PostData {
    id: string;
    userId: string;
    text?: string;
    [key: string]: any;
}

/**
 * Props for CommentSection component
 */
export interface CommentSectionProps {
    post: PostData;
    currentUser?: any;
    currentUserData?: UserData | null;
    subProfiles?: Record<string, any>;
    blockedUsers?: string[];
    onCountChange?: (count: number) => void;
}

/**
 * CommentSection component for displaying and managing post comments
 */
const CommentSection = React.memo(function CommentSection({
    post,
    currentUser,
    currentUserData,
    subProfiles = {},
    blockedUsers = [],
    onCountChange
}: CommentSectionProps) {
    // ... (rest of the component)
    // Real-time comments from Convex
    const convexComments = useQuery(api.social.getComments, { postId: post.id as Id<"posts"> });
    const [comments, setComments] = useState<CommentData[]>([]);
    const [text, setText] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    // Convex mutations
    const createCommentMutation = useMutation(api.social.createComment);
    const deleteCommentMutation = useMutation(api.social.deleteComment);

    const prevCountRef = useRef<number>(-1);

    // Sync Convex comments to local state (with blocking filter)
    useEffect(() => {
        if (convexComments) {
            // Map Convex comments to our CommentData format
            const mapped = convexComments.map((c: any) => ({
                id: c.commentId,
                user_id: c.userId,
                text: c.content,
                displayName: c.displayName,
                userPhoto: c.authorPhoto,
                timestamp: new Date(c.createdAt).toISOString(),
            }));

            // Filter out blocked users
            const filtered = mapped.filter((c) => !blockedUsers?.includes(c.user_id));
            setComments(filtered);
            
            // Only notify if count actually changed to prevent loops
            if (onCountChange && filtered.length !== prevCountRef.current) {
                prevCountRef.current = filtered.length;
                onCountChange(filtered.length);
            }
        }
    }, [convexComments, blockedUsers, onCountChange]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const userId = currentUser?.id || currentUser?.uid;
        if (!text.trim() || !userId) return;
        setLoading(true);

        // Get active profile data for display name and photo
        const activeRole = currentUserData?.activeProfileRole || currentUserData?.accountTypes?.[0] || 'Fan';
        const mongoSubprofile = currentUserData?.subprofiles?.[activeRole];
        const legacySubprofile = subProfiles?.[activeRole];
        const activeProfile = mongoSubprofile || legacySubprofile || {};

        const displayName = activeProfile?.display_name ||
            activeProfile?.displayName ||
            currentUserData?.displayName ||
            currentUserData?.effectiveDisplayName ||
            currentUserData?.firstName ||
            currentUser?.displayName ||
            'User';

        const authorPhoto = activeProfile?.photo_url ||
            currentUserData?.photoURL ||
            currentUser?.imageUrl ||
            null;

        try {
            const commentContent = text.trim();
            if (!commentContent) {
                alert('Please enter a comment');
                setLoading(false);
                return;
            }

            // Create comment via Convex (notifications handled by backend)
            await createCommentMutation({
                postId: post.id as Id<"posts">,
                authorId: userId,
                content: commentContent,
            });

            setText('');
            setLoading(false);
        } catch (e) {
            console.error('Comment submission error:', e);
            const errorMessage = e instanceof Error ? e.message : 'Unknown error';
            alert(`Failed to post comment: ${errorMessage}`);
            setLoading(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!window.confirm("Delete comment?")) return;
        const userId = currentUser?.id || currentUser?.uid;
        if (!userId) return;
        try {
            await deleteCommentMutation({
                commentId: commentId as Id<"comments">,
                clerkId: userId,
            });
        } catch (e) {
            console.error('Delete comment error:', e);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-[#1f2128] border-t dark:border-gray-700 p-4 animate-in slide-in-from-top-2">
            {/* Comments List */}
            <div className="space-y-4 mb-4 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                {comments.length === 0 && (
                    <div className="text-center text-gray-400 text-xs py-2">
                        No comments yet. Be the first!
                    </div>
                )}
                {comments.map(comment => (
                    <div key={comment.id} className="group flex gap-3 text-sm">
                        <UserAvatar
                            src={comment.userPhoto}
                            name={comment.displayName}
                            size="xs"
                            className="shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="bg-white dark:bg-dark-card border dark:border-gray-700 p-3 rounded-2xl rounded-tl-none inline-block max-w-full">
                                <div className="flex justify-between items-baseline gap-2 mb-1">
                                    <span className="font-bold dark:text-white text-xs truncate">
                                        {comment.displayName}
                                    </span>
                                    <span className="text-[10px] text-gray-400 shrink-0">
                                        {comment.timestamp
                                            ? new Date(comment.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
                                            : 'Just now'}
                                    </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 break-words">{comment.text}</p>
                            </div>
                            <div className="flex gap-3 mt-1 ml-2">
                                <button className="text-[10px] font-bold text-gray-500 hover:text-brand-blue transition">
                                    Reply
                                </button>
                                {comment.user_id === (currentUser?.id || currentUser?.uid) && (
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <UserAvatar
                    src={currentUserData?.photoURL}
                    name={currentUserData?.firstName || 'You'}
                    size="xs"
                    className="shrink-0 hidden sm:block"
                />
                <input
                    className="flex-1 bg-white dark:bg-dark-card border dark:border-gray-600 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none dark:text-white transition"
                    placeholder="Write a comment..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={!text.trim() || loading}
                    className="bg-brand-blue text-white p-2 rounded-full hover:bg-blue-600 disabled:opacity-50 transition shadow-sm"
                >
                    <Send size={16} className={loading ? 'animate-pulse' : ''}/>
                </button>
            </form>
        </div>
    );
});

export default CommentSection;
