// Stub API file for build-time
// This file is replaced by the real generated API when running `npx convex dev`
// During Vercel builds, this stub prevents import errors
// The actual API will be generated when you run `npx convex dev` locally

// Create stub function references that match Convex's API structure
const createStub = (path) => {
  const stub = () => {};
  stub._functionName = path;
  stub._functionType = 'query';
  return stub;
};

export const api = {
  conversations: {
    getConversations: createStub('conversations/getConversations'),
    updateConversation: createStub('conversations/updateConversation'),
    updateUnreadCount: createStub('conversations/updateUnreadCount'),
  },
  messages: {
    getMessages: createStub('messages/getMessages'),
    sendMessage: createStub('messages/sendMessage'),
    editMessage: createStub('messages/editMessage'),
    deleteMessage: createStub('messages/deleteMessage'),
    addReaction: createStub('messages/addReaction'),
    removeReaction: createStub('messages/removeReaction'),
  },
  presence: {
    getPresence: createStub('presence/getPresence'),
    updatePresence: createStub('presence/updatePresence'),
  },
  readReceipts: {
    getReadReceipts: createStub('readReceipts/getReadReceipts'),
    markAsRead: createStub('readReceipts/markAsRead'),
    markMultipleAsRead: createStub('readReceipts/markMultipleAsRead'),
  },
};

export const internal = {};
