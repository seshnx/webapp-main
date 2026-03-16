# Convex Real-time Migration Guide

## Overview

Socket.IO has been successfully replaced with **Convex** for all real-time features. This ensures **full Vercel compatibility** since Convex works seamlessly with serverless deployments, while Socket.IO requires a long-running WebSocket server.

## What Changed

### Before (Socket.IO)
```typescript
// Socket.io server on port 3001 - NOT compatible with Vercel
import { useSocket } from '@/hooks/useSocket';

const { socket, isConnected } = useSocket(userId);

useEffect(() => {
  if (!socket || !isConnected) return;

  const handleNewPost = (data) => {
    addPost(data.post);
  };

  socket.on('new_post', handleNewPost);

  return () => socket.off('new_post', handleNewPost);
}, [socket, isConnected]);
```

### After (Convex)
```typescript
// Convex - FULLY compatible with Vercel
import { useRealtimePosts } from '@/hooks/useRealtimePosts';

const { posts, isConnected } = useRealtimePosts({
  userId,
  feedMode: 'for_you',
  followingIds: ['user1', 'user2']
});

// Posts update automatically in real-time!
// No manual event listeners needed.
```

## Migration Summary

| Feature | Socket.IO | Convex |
|---------|-----------|---------|
| Posts | `new_post` event | `api.posts.list` (real-time query) |
| Comments | `new_comment` event | `api.comments.list` (real-time query) |
| Reactions | `reaction_update` event | `api.reactions.list` (real-time query) |
| Follows | `new_follower` event | `api.follows.getFollowers` (real-time query) |
| Presence | `user_presence` event | `api.presence.getPresence` (real-time query) |
| Chat Messages | Custom events | `api.messages.getMessages` (real-time query) |
| Typing Indicators | `typing_start/stop` | `api.presence.getTypingIndicators` (real-time query) |

## New Convex Modules

### Posts (`convex/posts.ts`)
- `list` - Get recent posts (real-time)
- `listByAuthor` - Get posts by user (real-time)
- `listByIds` - Get posts from followed users (real-time)
- `syncPost` - Sync post from MongoDB to Convex
- `updateReactionCount` - Update reaction count
- `updateCommentCount` - Update comment count

### Follows (`convex/follows.ts`)
- `getFollowers` - Get user's followers (real-time)
- `getFollowing` - Get who user is following (real-time)
- `isFollowing` - Check if following (real-time)
- `getFollowerCount` - Get follower count (real-time)
- `getFollowingCount` - Get following count (real-time)
- `syncFollow` - Sync follow from MongoDB

## New React Hooks

### `useRealtimePosts`
```typescript
import { useRealtimePosts } from '@/hooks/useRealtimePosts';

function SocialFeed() {
  const { posts, isLoading, isConnected } = useRealtimePosts({
    userId: user.id,
    feedMode: 'following',
    followingIds: ['user1', 'user2']
  });

  return <div>{posts.map(post => <PostCard key={post.id} {...post} />)}</div>;
}
```

### `useRealtimeFollows`
```typescript
import { useRealtimeFollows, useIsFollowing } from '@/hooks/useRealtimeFollows';

function ProfileHeader({ userId }) {
  const { followerCount, followingCount } = useRealtimeFollows({
    userId,
    onNewFollower: (followerId) => showNotification('New follower!')
  });

  const isFollowing = useIsFollowing(currentUserId, userId);

  return (
    <div>
      <span>{followerCount} followers</span>
      <span>{followingCount} following</span>
      <button>{isFollowing ? 'Unfollow' : 'Follow'}</button>
    </div>
  );
}
```

### `usePresence` (Already existed, still works!)
```typescript
import { usePresence, useUserPresence } from '@/hooks/usePresence';

// Automatically manage current user's presence
usePresence(userId);

// Subscribe to another user's presence
const { online, lastSeen } = useUserPresence(otherUserId);
```

## Backend Integration

When you create/update data in MongoDB, sync it to Convex for real-time updates:

### Creating a Post
```typescript
// 1. Save to MongoDB (source of truth)
const post = await mongoDb.collection('social_posts').insertOne({...});

// 2. Sync to Convex (for real-time updates)
import { useSyncPost } from '@/hooks/useRealtimePosts';

const syncPost = useSyncPost();
await syncPost({
  postId: post.id,
  userId: post.author_id,
  displayName: post.display_name,
  content: post.content,
  createdAt: post.created_at,
  // ...
});
```

### Following a User
```typescript
// 1. Save to MongoDB
await mongoDb.collection('social_follows').insertOne({
  follower_id,
  following_id,
  created_at: Date.now()
});

// 2. Sync to Convex
import { useSyncFollow } from '@/hooks/useRealtimeFollows';

const { syncFollow } = useSyncFollow();
await syncFollow(followerId, followingId, Date.now());
```

## Removed Files

You can safely delete these files:
- `server.js` - Socket.IO server (no longer needed)
- `src/hooks/useSocket.ts` - Socket.IO client hook (deprecated)
- `scripts/start-socket-server.js` - Socket.IO startup script (no longer needed)
- `SOCKETIO_GUIDE.md` - Old Socket.IO documentation (this file replaces it)

## Environment Variables

You can remove these Socket.IO environment variables:
- `VITE_SOCKET_URL` - No longer needed
- `SOCKET_PORT` - No longer needed

Convex uses its own environment variable (already configured):
- `VITE_CONVEX_URL` - Convex deployment URL

## Deployment

### Vercel (Production)
✅ **Works out of the box** - Convex is fully compatible with Vercel's serverless architecture.

### Local Development
```bash
# Start Vite dev server (Convex connects automatically)
npm run dev

# That's it! No separate Socket server needed.
```

## Benefits of Convex over Socket.IO

1. **Vercel Compatible** - Works seamlessly with serverless deployments
2. **Simpler Architecture** - No separate WebSocket server to manage
3. **Better TypeScript Support** - Fully typed queries and mutations
4. **Built-in Optimistic Updates** - Automatic UI updates
5. **Easier Debugging** - Convex dashboard for inspecting data
6. **Better Scaling** - Managed infrastructure, no server maintenance
7. **Real-time by Default** - All queries are automatically subscribed

## Troubleshooting

### Convex connection issues
```typescript
import { isConvexAvailable } from '@/config/convex';

if (!isConvexAvailable()) {
  console.warn('Convex not available - using polling fallback');
}
```

### Posts not updating in real-time
- Check `VITE_CONVEX_URL` environment variable
- Verify Convex deployment is active
- Check browser console for connection errors

### Follow counts not updating
- Ensure follow is synced to Convex after MongoDB insert
- Check Convex dashboard to verify data exists

## Next Steps

1. ✅ Remove Socket.IO dependencies from package.json
2. ✅ Add Convex posts and follows modules
3. ✅ Update components to use new hooks
4. ⏭️ Delete old Socket.IO files (`server.js`, `useSocket.ts`)
5. ⏭️ Remove Socket.IO environment variables
6. ⏭️ Deploy to Vercel and test real-time features

## Support

- Convex Docs: https://docs.convex.dev
- Convex Dashboard: https://dashboard.convex.dev
- Real-time capabilities: https://docs.convex.dev/real-time
