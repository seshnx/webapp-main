import React, { useState, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { getComments, createComment, deleteComment, updatePostCommentCount } from '../../config/neonQueries';
import { createNotification } from '../../hooks/useNotifications';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import UserAvatar from '../shared/UserAvatar';
import type { UserData } from '../../types';

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
    blockedUsers?: string[];
    onCountChange?: (count: number) => void;
}

/**
 * CommentSection component for displaying and managing post comments
 */
export default function CommentSection({
    post,
    currentUser,
    currentUserData,
    blockedUsers = [],
    onCountChange
}: CommentSectionProps) {
    // Real-time comments from Convex
    const convexComments = useQuery(api.comments.list, { postId: post.id });
    const [comments, setComments] = useState<CommentData[]>([]);
    const [text, setText] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

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
            onCountChange?.(filtered.length);
        }
    }, [convexComments, blockedUsers, onCountChange]);

    // Initial load from Neon if Convex is empty (fallback)
    useEffect(() => {
        if (!post.id) return;

        // Only fetch from Neon if Convex has no data yet
        if (!convexComments || convexComments.length === 0) {
            loadCommentsFromNeon();
        }
    }, [post.id]);

    const loadCommentsFromNeon = async () => {
        try {
            const data = await getComments(post.id);

            if (data && data.length > 0) {
                // Client-side block filtering
                const filtered = data.filter((c) => !blockedUsers?.includes(c.user_id));
                setComments(filtered as unknown as CommentData[]);
                onCountChange?.(filtered.length);
            }
        } catch (error) {
            console.error('Comments fetch error:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const userId = currentUser?.id || currentUser?.uid;
        if (!text.trim() || !userId) return;
        setLoading(true);

        const displayName = currentUserData?.effectiveDisplayName ||
            currentUserData?.firstName ||
            currentUser?.displayName ||
            'User';

        try {
            // Ensure content is not empty (required by schema)
            const commentContent = text.trim();
            if (!commentContent) {
                alert('Please enter a comment');
                setLoading(false);
                return;
            }

            // Create comment using Neon
            await createComment({
                post_id: post.id,
                user_id: userId,
                content: commentContent,
            });

            // Update post comment count
            await updatePostCommentCount(post.id, 1);

            // Reload comments to show the new one
            await loadComments();

            // Send notification to post author (if not commenting on own post)
            if (post.userId !== userId) {
                createNotification({
                    targetUserId: post.userId,
                    type: 'comment',
                    fromUserId: userId,
                    fromUserName: displayName,
                    fromUserPhoto: currentUserData?.photoURL,
                    postId: post.id,
                    postPreview: post.text?.substring(0, 50),
                    message: 'commented on your post'
                });
            }

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
        try {
            await deleteComment(commentId);
            await updatePostCommentCount(post.id, -1);
            await loadComments();
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
                                {comment.userId === currentUser?.uid && (
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
}
