// Stub API file for build-time
// This file is replaced by the real generated API when running `npx convex dev`
// During Vercel builds, this stub prevents import errors

// IMPORTANT: This stub should NOT be used at runtime when Convex is configured
// The hooks will validate function references, so we need to ensure components
// check isConvexAvailable() before using these

// For build-time only - these will be replaced by real function references
// when npx convex dev is run

export const api = {
  conversations: {
    getConversations: undefined,
    updateConversation: undefined,
    updateUnreadCount: undefined,
  },
  messages: {
    getMessages: undefined,
    sendMessage: undefined,
    editMessage: undefined,
    deleteMessage: undefined,
    addReaction: undefined,
    removeReaction: undefined,
  },
  presence: {
    getPresence: undefined,
    updatePresence: undefined,
  },
  readReceipts: {
    getReadReceipts: undefined,
    markAsRead: undefined,
    markMultipleAsRead: undefined,
  },
};

export const internal = {};
