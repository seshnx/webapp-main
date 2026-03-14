import React from 'react';
import { debugLog, logError, useSocialDebug } from '../../utils/socialDebug';

interface PostCardDebugProps {
  post: any;
  onReaction?: (postId: string, emoji: string) => void;
  onRepost?: (postId: string) => void;
  onUnrepost?: (repostId: string) => void;
  currentUser?: any;
}

export default function PostCardDebug({ post, onReaction, onRepost, onUnrepost, currentUser }: PostCardDebugProps) {
  const debug = useSocialDebug('PostCard');

  const handleReactionClick = async (emoji: string) => {
    debug.log('Reaction clicked', { postId: post.id?.substring(0, 8), emoji });
    try {
      if (onReaction) await onReaction(post.id, emoji);
    } catch (err) {
      logError(err, 'PostCard.reaction');
    }
  };

  return (
    <div className="post-card-debug border-2 border-dashed border-blue-500 p-4 mb-4 rounded">
      <div className="bg-blue-50 p-2 mb-2 text-xs">
        <strong>🐛 DEBUG MODE</strong><br/>
        Post ID: {post.id?.substring(0, 8)}...<br/>
        Author: {post.author_id?.substring(0, 8)}...<br/>
        Likes: {post.engagement?.likes_count || 0}<br/>
        Comments: {post.engagement?.comments_count || 0}
      </div>
      <div className="text-sm">
        {post.content}
      </div>
      <div className="mt-2 flex gap-2">
        <button onClick={() => handleReactionClick('👍')} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
          👍 Like
        </button>
        <button onClick={() => onRepost?.(post.id)} className="px-2 py-1 bg-green-500 text-white rounded text-xs">
          🔄 Repost
        </button>
      </div>
    </div>
  );
}
