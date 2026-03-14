/**
 * Socket.io Client Hook
 *
 * Manages WebSocket connection for real-time updates
 * Replaces polling with instant event-based communication
 */

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Socket.io configuration
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.NODE_ENV === 'production'
    ? null // Disable Socket.io in production on Vercel (serverless)
    : 'http://localhost:3001');

// Check if Socket.io should be enabled
const SOCKET_ENABLED = SOCKET_URL !== null;

interface SocketHookReturn {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
}

/**
 * Hook for managing Socket.io connection
 *
 * @param userId - User ID for authentication
 * @param enabled - Whether to connect (default: true)
 * @returns Socket connection and utility functions
 *
 * @example
 * function MyComponent() {
 *   const { socket, isConnected } = useSocket(user.id);
 *
 *   useEffect(() => {
 *     if (socket) {
 *       socket.on('new_post', (data) => {
 *         console.log('New post:', data);
 *       });
 *     }
 *   }, [socket]);
 *
 *   return <div>Connected: {isConnected.toString()}</div>;
 * }
 */
export function useSocket(
  userId?: string | null,
  enabled = true
): SocketHookReturn {
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef<boolean>(false);

  // Initialize socket connection
  useEffect(() => {
    // Check if Socket.io is enabled and available
    if (!enabled || !userId || !SOCKET_ENABLED || !SOCKET_URL) {
      if (!SOCKET_ENABLED) {
        console.log('📡 Socket.io disabled - using polling instead');
      }
      return;
    }

    try {
      // Create socket connection
      const socket = io(SOCKET_URL, {
        auth: {
          userId
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 3, // Reduce attempts in production
        timeout: 5000, // Shorter timeout
        autoConnect: true
      });

      socketRef.current = socket;

      // Connection event handlers
      socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket.id);
        isConnectedRef.current = true;

        // Authenticate with user ID
        socket.emit('authenticate', { userId });
      });

      socket.on('authenticated', (data) => {
        if (data.success) {
          console.log('✅ Socket authenticated:', data.socketId);
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        isConnectedRef.current = false;
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
        isConnectedRef.current = false;
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        isConnectedRef.current = true;

        // Re-authenticate on reconnect
        socket.emit('authenticate', { userId });
      });

      socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 Socket reconnection attempt:', attemptNumber);
      });

      socket.on('reconnect_error', (error) => {
        console.error('❌ Socket reconnection error:', error.message);
      });

      socket.on('reconnect_failed', () => {
        console.error('❌ Socket reconnection failed - falling back to polling');
        isConnectedRef.current = false;
      });

      // Cleanup on unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
          isConnectedRef.current = false;
        }
      };
    } catch (error) {
      console.error('Failed to initialize Socket.io:', error);
      isConnectedRef.current = false;
    }
  }, [userId, enabled]);

  /**
   * Emit event to server
   */
  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current && isConnectedRef.current) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Cannot emit event: socket not connected');
    }
  }, []);

  /**
   * Listen to event from server
   */
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  /**
   * Stop listening to event
   */
  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  /**
   * Join a room (for conversation, etc.)
   */
  const joinRoom = useCallback((room: string) => {
    if (socketRef.current && isConnectedRef.current) {
      socketRef.current.emit('join_room', { room });
    }
  }, []);

  /**
   * Leave a room
   */
  const leaveRoom = useCallback((room: string) => {
    if (socketRef.current && isConnectedRef.current) {
      socketRef.current.emit('leave_room', { room });
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected: isConnectedRef.current,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom
  };
}

/**
 * Hook for real-time post updates
 */
export function useRealTimePosts(
  userId?: string | null,
  onNewPost?: (post: any) => void,
  enabled = true
) {
  const { socket, isConnected } = useSocket(userId, enabled);

  useEffect(() => {
    if (!socket || !isConnected || !onNewPost) {
      return;
    }

    const handleNewPost = (data: any) => {
      console.log('📢 New post received:', data);
      onNewPost(data.post);
    };

    socket.on('new_post', handleNewPost);

    return () => {
      socket.off('new_post', handleNewPost);
    };
  }, [socket, isConnected, onNewPost]);

  return { socket, isConnected };
}

/**
 * Hook for real-time comment updates
 */
export function useRealTimeComments(
  userId?: string | null,
  onNewComment?: (comment: any) => void,
  enabled = true
) {
  const { socket, isConnected } = useSocket(userId, enabled);

  useEffect(() => {
    if (!socket || !isConnected || !onNewComment) {
      return;
    }

    const handleNewComment = (data: any) => {
      console.log('💬 New comment received:', data);
      onNewComment(data.comment);
    };

    socket.on('new_comment', handleNewComment);

    return () => {
      socket.off('new_comment', handleNewComment);
    };
  }, [socket, isConnected, onNewComment]);

  return { socket, isConnected };
}

/**
 * Hook for real-time reaction updates
 */
export function useRealTimeReactions(
  userId?: string | null,
  onReactionUpdate?: (update: any) => void,
  enabled = true
) {
  const { socket, isConnected } = useSocket(userId, enabled);

  useEffect(() => {
    if (!socket || !isConnected || !onReactionUpdate) {
      return;
    }

    const handleReactionUpdate = (data: any) => {
      console.log('❤️ Reaction update received:', data);
      onReactionUpdate(data.reaction);
    };

    socket.on('reaction_update', handleReactionUpdate);

    return () => {
      socket.off('reaction_update', handleReactionUpdate);
    };
  }, [socket, isConnected, onReactionUpdate]);

  return { socket, isConnected };
}

/**
 * Hook for real-time follow events
 */
export function useRealTimeFollows(
  userId?: string | null,
  onNewFollower?: (followerId: string) => void,
  enabled = true
) {
  const { socket, isConnected } = useSocket(userId, enabled);

  useEffect(() => {
    if (!socket || !isConnected || !onNewFollower) {
      return;
    }

    const handleNewFollower = (data: any) => {
      console.log('👥 New follower received:', data);
      onNewFollower(data.followerId);
    };

    socket.on('new_follower', handleNewFollower);

    return () => {
      socket.off('new_follower', handleNewFollower);
    };
  }, [socket, isConnected, onNewFollower]);

  return { socket, isConnected };
}

/**
 * Hook for user presence (online/offline status)
 */
export function useUserPresence(
  userId?: string | null,
  onPresenceChange?: (userId: string, status: string) => void,
  enabled = true
) {
  const { socket, isConnected } = useSocket(userId, enabled);

  useEffect(() => {
    if (!socket || !isConnected || !onPresenceChange) {
      return;
    }

    const handlePresence = (data: any) => {
      console.log('👤 Presence update received:', data);
      onPresenceChange(data.userId, data.status);
    };

    socket.on('user_presence', handlePresence);

    return () => {
      socket.off('user_presence', handlePresence);
    };
  }, [socket, isConnected, onPresenceChange]);

  /**
   * Update current user's presence status
   */
  const updatePresence = useCallback((status: 'online' | 'offline' | 'away') => {
    if (socket && isConnected) {
      socket.emit('presence_update', { status });
    }
  }, [socket, isConnected]);

  return { socket, isConnected, updatePresence };
}