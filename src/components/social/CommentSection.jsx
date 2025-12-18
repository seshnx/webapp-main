import React, { useState, useEffect } from 'react';
import { Send, Trash2, CornerDownRight } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { createNotification } from '../../hooks/useNotifications';
import UserAvatar from '../shared/UserAvatar';

export default function CommentSection({ post, currentUser, currentUserData, blockedUsers, onCountChange }) {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!supabase || !post.id) return;

        // Initial fetch
        supabase
            .from('comments')
            .select('*')
            .eq('post_id', post.id)
            .order('created_at', { ascending: true })
            .then(({ data, error }) => {
                if (error) {
                    console.error('Comments fetch error:', error);
                    return;
                }
                
                const comments = (data || []).map(c => ({
                    id: c.id,
                    ...c,
                    userId: c.user_id,
                    displayName: c.display_name,
                    userPhoto: c.user_photo,
                    timestamp: c.created_at
                }));
                
                // Client-side block filtering
                const filtered = comments.filter(c => !blockedUsers?.includes(c.userId));
                setComments(filtered);
                onCountChange(filtered.length);
            });

        // Subscribe to realtime changes
        const channel = supabase
            .channel(`comments-${post.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'comments',
                    filter: `post_id=eq.${post.id}`
                },
                async () => {
                    const { data } = await supabase
                        .from('comments')
                        .select('*')
                        .eq('post_id', post.id)
                        .order('created_at', { ascending: true });
                    
                    if (data) {
                        const comments = data.map(c => ({
                            id: c.id,
                            ...c,
                            userId: c.user_id,
                            displayName: c.display_name,
                            userPhoto: c.user_photo,
                            timestamp: c.created_at
                        }));
                        
                        const filtered = comments.filter(c => !blockedUsers?.includes(c.userId));
                        setComments(filtered);
                        onCountChange(filtered.length);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [post.id, blockedUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = currentUser?.id || currentUser?.uid;
        if (!text.trim() || !userId || !supabase) return;
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
            
            const { error } = await supabase
                .from('comments')
                .insert({
                    post_id: post.id,
                    user_id: userId,
                    text: commentContent,
                    content: commentContent, // Required by schema - NOT NULL
                    display_name: displayName,
                    author_photo: currentUserData?.photoURL || null,
                    user_photo: currentUserData?.photoURL || null,
                    created_at: new Date().toISOString()
                });
            
            if (error) {
                console.error('Comment insert error:', error);
                alert(`Failed to post comment: ${error.message || 'Unknown error'}`);
                setLoading(false);
                return;
            }
            
            // Update post comment count
            await supabase.rpc('increment', {
                table_name: 'posts',
                id_column: 'id',
                id_value: post.id,
                count_column: 'comment_count'
            }).catch(() => {
                // Fallback if RPC doesn't exist
                supabase
                    .from('posts')
                    .update({ comment_count: (post.commentCount || 0) + 1 })
                    .eq('id', post.id);
            });
            
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
            alert(`Failed to post comment: ${e.message || 'Unknown error'}`);
            setLoading(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Delete comment?") || !supabase) return;
        try {
            await supabase
                .from('comments')
                .delete()
                .eq('id', commentId);
            
            // Decrement comment count
            await supabase
                .from('posts')
                .update({ comment_count: Math.max((post.commentCount || 0) - 1, 0) })
                .eq('id', post.id);
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
