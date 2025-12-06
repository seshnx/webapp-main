import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Send, Trash2, CornerDownRight } from 'lucide-react';
import { db, getPaths, appId } from '../../config/firebase';
import { createNotification } from '../../hooks/useNotifications';
import UserAvatar from '../shared/UserAvatar';

export default function CommentSection({ post, currentUser, currentUserData, blockedUsers, onCountChange }) {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const q = query(
            collection(db, `artifacts/${appId}/public/data/posts/${post.id}/replies`), 
            orderBy('timestamp', 'asc')
        );
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            // Client-side block filtering
            const filtered = data.filter(c => !blockedUsers?.includes(c.userId));
            setComments(filtered);
            onCountChange(filtered.length);
        });
        return () => unsub();
    }, [post.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || !currentUser?.uid) return;
        setLoading(true);
        
        const displayName = currentUserData?.effectiveDisplayName || 
            currentUserData?.firstName || 
            currentUser?.displayName || 
            'User';
        
        try {
            await addDoc(collection(db, `artifacts/${appId}/public/data/posts/${post.id}/replies`), {
                text,
                userId: currentUser.uid,
                displayName,
                userPhoto: currentUserData?.photoURL || null,
                timestamp: serverTimestamp()
            });
            
            // Send notification to post author (if not commenting on own post)
            if (post.userId !== currentUser.uid) {
                createNotification({
                    targetUserId: post.userId,
                    type: 'comment',
                    fromUserId: currentUser.uid,
                    fromUserName: displayName,
                    fromUserPhoto: currentUserData?.photoURL,
                    postId: post.id,
                    postPreview: post.text?.substring(0, 50),
                    message: 'commented on your post'
                });
            }
            
            setText('');
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Delete comment?")) return;
        try {
            await deleteDoc(doc(db, `artifacts/${appId}/public/data/posts/${post.id}/replies`, commentId));
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
                                            ? new Date(comment.timestamp.toMillis()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) 
                                            : '...'
                                        }
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
