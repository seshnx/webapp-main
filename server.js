/**
 * Socket.io Server for Real-time Updates
 *
 * Run with: node server.js
 * This server handles WebSocket connections for real-time social features
 */

import { createServer } from 'http';
import { Server } from 'socket.io';
import { initMongoDB, getMongoDb } from './src/config/mongodb.js';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://app.seshnx.com', 'https://seshnx.com']
      : ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Store active users and their socket IDs
const activeUsers = new Map(); // socket.id -> userId
const userSockets = new Map(); // userId -> Set of socket IDs

/**
 * Initialize MongoDB connection
 */
async function initializeServer() {
  try {
    await initMongoDB();
    console.log('✅ MongoDB connected for Socket.io server');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
  }
}

/**
 * Broadcast new post to all followers
 */
async function broadcastNewPost(post) {
  if (!post || !post.author_id) return;

  try {
    const db = getMongoDb();
    if (!db) return;

    // Get author's followers
    const followers = await db.collection('social_follows')
      .find({ following_id: post.author_id })
      .toArray();

    const followerIds = followers.map(f => f.follower_id);

    // Send to all active followers
    followerIds.forEach(followerId => {
      const socketIds = userSockets.get(followerId);
      if (socketIds) {
        socketIds.forEach(socketId => {
          io.to(socketId).emit('new_post', {
            type: 'NEW_POST',
            post: {
              id: post.id,
              userId: post.author_id,
              displayName: post.display_name,
              authorPhoto: post.author_photo,
              text: post.content,
              attachments: post.media_urls,
              timestamp: post.created_at,
              commentCount: 0,
              reactionCount: 0,
              saveCount: 0,
              role: post.posted_as_role
            }
          });
        });
      }
    });

    console.log(`📢 Broadcasted new post to ${followerIds.length} followers`);
  } catch (error) {
    console.error('Error broadcasting new post:', error);
  }
}

/**
 * Broadcast new comment to post author and engaged users
 */
async function broadcastNewComment(comment) {
  if (!comment || !comment.post_id) return;

  try {
    const db = getMongoDb();
    if (!db) return;

    // Get post author
    const post = await db.collection('social_posts')
      .findOne({ id: comment.post_id });

    if (!post) return;

    const postAuthorId = post.author_id;
    const commentAuthorId = comment.author_id;

    // Get users who have commented on this post
    const commenters = await db.collection('social_comments')
      .find({ post_id: comment.post_id })
      .toArray();

    const engagedUserIds = new Set([
      postAuthorId,
      ...commenters.map(c => c.author_id)
    ]);

    // Send to all engaged users (except commenter)
    engagedUserIds.forEach(userId => {
      if (userId !== commentAuthorId) {
        const socketIds = userSockets.get(userId);
        if (socketIds) {
          socketIds.forEach(socketId => {
            io.to(socketId).emit('new_comment', {
              type: 'NEW_COMMENT',
              comment: {
                id: comment.id,
                postId: comment.post_id,
                userId: comment.author_id,
                displayName: comment.display_name,
                authorPhoto: comment.author_photo,
                content: comment.content,
                timestamp: comment.created_at,
                likes: 0
              }
            });
          });
        }
      }
    });

    console.log(`💬 Broadcasted new comment to ${engagedUserIds.size} users`);
  } catch (error) {
    console.error('Error broadcasting new comment:', error);
  }
}

/**
 * Broadcast reaction update
 */
async function broadcastReactionUpdate(targetId, targetType, reaction) {
  try {
    const db = getMongoDb();
    if (!db) return;

    // Get target (post or comment) to find author
    const collection = targetType === 'post' ? 'social_posts' : 'social_comments';
    const target = await db.collection(collection).findOne({ id: targetId });

    if (!target) return;

    const targetAuthorId = target.author_id;

    // Send to target author
    const socketIds = userSockets.get(targetAuthorId);
    if (socketIds) {
      socketIds.forEach(socketId => {
        io.to(socketId).emit('reaction_update', {
          type: 'REACTION_UPDATE',
          targetType,
          targetId,
          reaction: {
            id: reaction.id,
            userId: reaction.user_id,
            emoji: reaction.emoji,
            timestamp: reaction.created_at
          }
        });
      });
    }

    console.log(`❤️ Broadcasted reaction update to ${targetAuthorId}`);
  } catch (error) {
    console.error('Error broadcasting reaction update:', error);
  }
}

/**
 * Broadcast follow event
 */
async function broadcastFollowEvent(followerId, followingId) {
  // Send to the user being followed
  const socketIds = userSockets.get(followingId);
  if (socketIds) {
    socketIds.forEach(socketId => {
      io.to(socketId).emit('new_follower', {
        type: 'NEW_FOLLOWER',
        followerId,
        timestamp: new Date().toISOString()
      });
    });
  }

  console.log(`👥 Broadcasted follow event to ${followingId}`);
}

/**
 * Socket.io connection handler
 */
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Handle user authentication
  socket.on('authenticate', async (data) => {
    const { userId, token } = data;

    if (userId) {
      activeUsers.set(socket.id, userId);

      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);

      socket.join(`user:${userId}`);

      console.log(`✅ User ${userId} authenticated with socket ${socket.id}`);

      // Send confirmation
      socket.emit('authenticated', {
        success: true,
        socketId: socket.id
      });
    }
  });

  // Handle presence updates
  socket.on('presence_update', (data) => {
    const userId = activeUsers.get(socket.id);
    if (userId) {
      // Broadcast presence to followers
      socket.broadcast.emit('user_presence', {
        userId,
        status: data.status || 'online',
        lastSeen: new Date().toISOString()
      });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const userId = activeUsers.get(socket.id);
    if (userId && data.conversationId) {
      socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
        userId,
        conversationId: data.conversationId
      });
    }
  });

  socket.on('typing_stop', (data) => {
    const userId = activeUsers.get(socket.id);
    if (userId && data.conversationId) {
      socket.to(`conversation:${data.conversationId}`).emit('user_stopped_typing', {
        userId,
        conversationId: data.conversationId
      });
    }
  });

  // Handle join room (for conversations, etc.)
  socket.on('join_room', (data) => {
    const { room } = data;
    socket.join(room);
    console.log(`📱 Socket ${socket.id} joined room: ${room}`);
  });

  // Handle leave room
  socket.on('leave_room', (data) => {
    const { room } = data;
    socket.leave(room);
    console.log(`📱 Socket ${socket.id} left room: ${room}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const userId = activeUsers.get(socket.id);

    if (userId) {
      const socketIds = userSockets.get(userId);
      if (socketIds) {
        socketIds.delete(socket.id);

        // Remove user from active users if no more sockets
        if (socketIds.size === 0) {
          userSockets.delete(userId);
          activeUsers.delete(socket.id);

          // Broadcast offline status
          socket.broadcast.emit('user_presence', {
            userId,
            status: 'offline',
            lastSeen: new Date().toISOString()
          });

          console.log(`👤 User ${userId} went offline`);
        }
      }
    }

    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

/**
 * Make broadcast functions available globally for API endpoints
 */
global.broadcastNewPost = broadcastNewPost;
global.broadcastNewComment = broadcastNewComment;
global.broadcastReactionUpdate = broadcastReactionUpdate;
global.broadcastFollowEvent = broadcastFollowEvent;

/**
 * Start server
 */
const PORT = process.env.SOCKET_PORT || 3001;

initializeServer().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Socket.io server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch((error) => {
  console.error('Failed to start Socket.io server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});