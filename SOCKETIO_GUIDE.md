# Socket.io Real-time Integration Guide

## Overview

Socket.io has been integrated to provide **true real-time updates** instead of polling. This means instant delivery of new posts, comments, reactions, and follow events.

## What Changed

### Before (Polling)
```typescript
// Manual polling every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    fetchPosts(); // Wastes resources
  }, 30000);

  return () => clearInterval(interval);
}, []);
```

### After (Real-time)
```typescript
// Instant updates via WebSocket
const { socket, isConnected } = useSocket(userId);

useEffect(() => {
  if (!socket || !isConnected) return;

  const handleNewPost = (data) => {
    // Instantly receive new posts!
    addPostToFeed(data.post);
  };

  socket.on('new_post', handleNewPost);

  return () => socket.off('new_post', handleNewPost);
}, [socket, isConnected]);
```

## Architecture

### Server Side (`server.js`)
- **Socket.io server** on port 3001
- Handles WebSocket connections
- Broadcasts events to relevant users
- Integrates with MongoDB for user lookups

### Client Side (`src/hooks/useSocket.ts`)
- **React hooks** for easy WebSocket integration
- Auto-reconnection with exponential backoff
- Type-safe event handling
- Connection status tracking

## Available Real-time Events

### 1. **New Posts** (`new_post`)
- Sent to followers when someone posts
- Includes post data (author, content, media, timestamp)
- **Use Case**: Instant feed updates

### 2. **New Comments** (`new_comment`)
- Sent to post author and commenters
- Includes comment data
- **Use Case**: Real-time comment threads

### 3. **Reaction Updates** (`reaction_update`)
- Sent when someone reacts to content
- Includes reaction type and target
- **Use Case**: Live like/emoji counts

### 4. **Follow Events** (`new_follower`)
- Sent to user when someone follows them
- Includes follower ID
- **Use Case**: Instant follow notifications

### 5. **User Presence** (`user_presence`)
- Broadcasted when users come online/offline
- Includes status (online/offline/away)
- **Use Case**: Live online indicators

## How to Use

### Basic Socket Connection

```typescript
import { useSocket } from '@/hooks/useSocket';

function MyComponent() {
  const { socket, isConnected } = useSocket(userId);

  return (
    <div>
      <p>Connected: {isConnected ? '✅' : '❌'}</p>
    </div>
  );
}
```

### Listen to Events

```typescript
import { useSocket } from '@/hooks/useSocket';

function FeedComponent() {
  const { socket, isConnected, on, off } = useSocket(userId);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewPost = (data) => {
      console.log('New post:', data.post);
      // Update UI instantly
      addPost(data.post);
    };

    on('new_post', handleNewPost);

    return () => off('new_post', handleNewPost);
  }, [socket, isConnected, on, off]);

  return <div>{/* feed content */}</div>;
}
```

### Send Events

```typescript
const { emit, isConnected } = useSocket(userId);

const sendMessage = () => {
  if (isConnected) {
    emit('chat_message', {
      conversationId: 'abc123',
      message: 'Hello!'
    });
  }
};
```

### Join/Leave Rooms

```typescript
const { joinRoom, leaveRoom } = useSocket(userId);

useEffect(() => {
  // Join conversation room
  joinRoom(`conversation:${conversationId}`);

  return () => {
    // Leave when component unmounts
    leaveRoom(`conversation:${conversationId}`);
  };
}, [conversationId, joinRoom, leaveRoom]);
```

## Starting the Socket Server

### Development

```bash
# Start Socket server + Vite dev server
npm run dev:social

# Or start all services (Socket + API + Vite)
npm run dev:full

# Or start Socket server standalone
npm run dev:socket
```

### Production

```bash
# Socket server runs on port 3001
# Make sure to set SOCKET_PORT environment variable
export SOCKET_PORT=3001
node server.js
```

## Environment Variables

Add to your `.env` file:

```env
# Socket.io server URL
VITE_SOCKET_URL=http://localhost:3001

# Production
VITE_SOCKET_URL=https://api.seshnx.com

# Server port (default: 3001)
SOCKET_PORT=3001
```

## Specialized Hooks

### useRealTimePosts
```typescript
const { socket, isConnected } = useRealTimePosts(
  userId,
  (newPost) => {
    console.log('New post received:', newPost);
    // Handle new post
  },
  true // enabled
);
```

### useRealTimeComments
```typescript
const { socket, isConnected } = useRealTimeComments(
  userId,
  (newComment) => {
    console.log('New comment:', newComment);
    // Handle new comment
  }
);
```

### useRealTimeReactions
```typescript
const { socket, isConnected } = useRealTimeReactions(
  userId,
  (reaction) => {
    console.log('New reaction:', reaction);
    // Handle reaction update
  }
);
```

### useUserPresence
```typescript
const { socket, isConnected, updatePresence } = useUserPresence(
  userId,
  (userId, status) => {
    console.log(`${userId} is now ${status}`);
    // Handle presence change
  }
);

// Update own presence
updatePresence('online');
```

## Integration with React Query

Socket.io works seamlessly with React Query:

```typescript
// React Query handles data fetching and caching
const { data: posts } = usePosts({}, 20);

// Socket.io handles real-time updates
useSocket(userId, (newPost) => {
  // Optimistically add to React Query cache
  queryClient.setQueryData(['posts'], (old) => [newPost, ...old]);
});
```

## Performance Benefits

1. **⚡ Instant Updates**
   - No polling delays
   - WebSocket is faster than HTTP requests

2. **📉 Reduced Server Load**
   - No repeated polling requests
   - Only send data when something changes

3. **🔄 Better UX**
   - Live feed updates
   - Instant notifications
   - Real-time collaboration

4. **💰 Lower Costs**
   - Fewer API calls = lower bandwidth
   - More efficient resource usage

## Troubleshooting

### Connection Issues

```typescript
const { isConnected } = useSocket(userId);

useEffect(() => {
  if (!isConnected) {
    console.warn('Socket not connected');
    // Show connection status to user
  }
}, [isConnected]);
```

### Reconnection

Socket.io automatically reconnects with exponential backoff:
- 1s, 2s, 4s, 8s, 16s, 32s delays
- Up to 5 reconnection attempts
- Automatically re-authenticates on reconnect

### Debug Mode

```javascript
// In server.js
const io = new Server(httpServer, {
  debug: true // Enable debug logs
});
```

## Monitoring

Check connection status in browser console:

```javascript
// Client logs
🔌 Socket connected: abc123
✅ Socket authenticated: abc123
📢 New post received: {...}
```

## Next Steps

1. **Add presence indicators** to user profiles
2. **Implement real-time typing indicators** for chat
3. **Add live comment counts** that update instantly
4. **Create real-time notifications** system
5. **Add live user counts** to rooms/pages

## Comparison: Polling vs WebSocket

| Feature | Polling | Socket.io |
|---------|---------|-----------|
| Speed | 30s delay | Instant |
| Server Load | High | Low |
| Bandwidth | Wasteful | Efficient |
| Mobile | Poor | Excellent |
| Scaling | Difficult | Built-in |
| Complexity | Simple | Moderate |

The Socket.io integration provides a **significant upgrade** in user experience while actually **reducing server load**!