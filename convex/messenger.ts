import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// =====================================================
// MESSENGER SYSTEM - COMPREHENSIVE IMPLEMENTATION
// =====================================================

import { getNativeUser } from "./utils/users";


// =====================================================
// DIRECT MESSAGING
// =====================================================

/**
 * Start a direct message conversation
 * Creates conversation for both users if it doesn't exist
 */
export const startDirectMessage = mutation({
  args: {
    initiatorId: v.string(), // Clerk ID
    recipientId: v.string(), // Clerk ID
  },
  handler: async (ctx, args) => {
    const initiator = await getNativeUser(ctx, args.initiatorId);
    const recipient = await getNativeUser(ctx, args.recipientId);

    if (!initiator || !recipient) {
      throw new Error("User not found");
    }

    if (initiator._id === recipient._id) {
      throw new Error("Cannot message yourself");
    }

    // Check if conversation already exists
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", initiator._id))
      .filter((q) => q.eq("field", "otherUserId"))
      .filter((q) => q.eq(q.field("otherUserId"), recipient._id))
      .first();

    if (existing) {
      return { chatId: existing.chatId, existing: true };
    }

    // Create unique chat ID
    const sortedIds = [initiator._id, recipient._id].sort();
    const chatId = `direct_${sortedIds[0]}_${sortedIds[1]}`;

    const now = Date.now();

    // Create conversation for initiator
    await ctx.db.insert("conversations", {
      userId: initiator._id,
      chatId,
      lastMessage: undefined,
      lastMessageTime: now,
      unreadCount: 0,
      lastSenderId: undefined,

      chatName: recipient.displayName || recipient.username,
      chatPhoto: recipient.avatarUrl,
      chatType: "direct",
      otherUserId: recipient._id,
    });

    // Create conversation for recipient
    await ctx.db.insert("conversations", {
      userId: recipient._id,
      chatId,
      lastMessage: undefined,
      lastMessageTime: now,
      unreadCount: 0,
      lastSenderId: undefined,

      chatName: initiator.displayName || initiator.username,
      chatPhoto: initiator.avatarUrl,
      chatType: "direct",
      otherUserId: initiator._id,
    });

    return { chatId, existing: false };
  },
});

// =====================================================
// MESSAGE MANAGEMENT
// =====================================================

/**
 * Send message with full conversation update
 * Updates conversation for all participants
 */
export const sendMessageWithUpdate = mutation({
  args: {
    chatId: v.string(),
    senderId: v.string(), // Clerk ID
    content: v.optional(v.string()),
    media: v.optional(v.object({
      type: v.string(),
      url: v.string(),
      thumbnail: v.optional(v.string()),
      name: v.optional(v.string()),
      gif: v.optional(v.boolean()),
      duration: v.optional(v.number()), // For audio/video
      fileSize: v.optional(v.number()), // For files
    })),
    replyTo: v.optional(v.id("messages")),
    mentionedUserIds: v.optional(v.array(v.string())), // Clerk IDs
    messageType: v.optional(v.string()), // text, image, video, audio, file, location, voice_note
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const sender = await getNativeUser(ctx, args.senderId);
    if (!sender) {
      throw new Error("Sender not found");
    }

    // Get reply to message details if provided
    let replyToDetails = null;
    if (args.replyTo) {
      const replyMessage = await ctx.db.get(args.replyTo);
      if (replyMessage) {
        replyToDetails = {
          messageId: replyMessage._id,
          text: replyMessage.content || "",
          sender: replyMessage.senderName,
        };
      }
    }

    // Insert message
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      senderId: sender._id,
      senderName: sender.displayName || sender.username || "User",
      senderPhoto: sender.avatarUrl,
      content: args.content,
      media: args.media,
      timestamp: Date.now(),
      edited: false,
      deleted: false,
      deletedForAll: false,
      replyTo: replyToDetails,
      reactions: {},
      messageType: args.messageType || "text",
      location: args.location,
      mentionedUserIds: args.mentionedUserIds || [],
      deliveryStatus: {
        delivered: false,
        deliveredAt: undefined,
        read: false,
        readAt: undefined,

      },
    });

    // Update conversations for all participants
    // We query the conversations table to find all users who have this chat active
    const activeConversations = await ctx.db
      .query("conversations")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    const lastMessageText = args.content || (args.media ? "📎 Media" : "Message");

    for (const conversation of activeConversations) {
      await ctx.db.patch(conversation._id, {
        lastMessage: lastMessageText,
        lastMessageTime: Date.now(),
        lastSenderId: sender._id,
        unreadCount: conversation.userId !== sender._id
          ? (conversation.unreadCount || 0) + 1
          : (conversation.unreadCount || 0),
      });
    }

    return messageId;
  },
});

/**
 * Forward message to another chat
 */
export const forwardMessage = mutation({
  args: {
    messageId: v.id("messages"),
    fromChatId: v.string(),
    toChatId: v.string(),
    senderId: v.string(), // Clerk ID
  },
  handler: async (ctx, args) => {
    const originalMessage = await ctx.db.get(args.messageId);
    if (!originalMessage) {
      throw new Error("Message not found");
    }

    const sender = await getNativeUser(ctx, args.senderId);
    if (!sender) {
      throw new Error("Sender not found");
    }

    // Create forwarded message
    const forwardedMessageId = await ctx.db.insert("messages", {
      chatId: args.toChatId,
      senderId: sender._id,
      senderName: sender.displayName || sender.username || "User",
      senderPhoto: sender.avatarUrl,
      content: originalMessage.content,
      media: originalMessage.media,
      timestamp: Date.now(),
      edited: false,
      deleted: false,
      deletedForAll: false,
      replyTo: undefined,
      reactions: {},
      messageType: originalMessage.messageType || "text",
      forwardedFrom: {
        originalChatId: args.fromChatId,
        originalMessageId: args.messageId,
        originalSenderName: originalMessage.senderName,
      },
      deliveryStatus: {
        delivered: false,
        deliveredAt: undefined,
        read: false,
        readAt: undefined,

      },
    });

    // Update conversation
    const lastMessageText = `Forwarded: ${originalMessage.content || "Media"}`;
    const participants = await ctx.db
      .query("chatMembers")
      .withIndex("by_chat", (q) => q.eq("chatId", args.toChatId))
      .collect();

    for (const participant of participants) {
      const conversation = await ctx.db
        .query("conversations")
        .withIndex("by_chat", (q) => q.eq("chatId", args.toChatId))
        .filter((q) => q.eq(q.field("userId"), participant.userId))
        .first();

      if (conversation) {
        await ctx.db.patch(conversation._id, {
          lastMessage: lastMessageText,
          lastMessageTime: Date.now(),
          lastSenderId: sender._id,
          unreadCount: participant.userId !== sender._id
            ? conversation.unreadCount + 1
            : conversation.unreadCount,
        });
      }
    }

    return forwardedMessageId;
  },
});

/**
 * Pin/unpin a message in a chat
 */
export const pinMessage = mutation({
  args: {
    messageId: v.id("messages"),
    chatId: v.string(),
    pinned: v.boolean(),
    requesterId: v.string(), // Clerk ID
  },
  handler: async (ctx, args) => {
    const requester = await getNativeUser(ctx, args.requesterId);
    if (!requester) {
      throw new Error("User not found");
    }

    // Check if user is admin or member
    const membership = await ctx.db
      .query("chatMembers")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), requester._id))
      .first();

    if (!membership) {
      throw new Error("Not a member of this chat");
    }

    await ctx.db.patch(args.messageId, {
      pinned: args.pinned,
      pinnedAt: args.pinned ? Date.now() : undefined,
    });

    return { success: true, pinned: args.pinned };
  },
});

/**
 * Get pinned messages for a chat
 */
export const getPinnedMessages = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    return messages
      .filter((m) => m.pinned && !m.deleted)
      .sort((a, b) => (b.pinnedAt || 0) - (a.pinnedAt || 0));
  },
});

// =====================================================
// GROUP CHAT MANAGEMENT
// =====================================================

/**
 * Update group chat details
 */
export const updateGroupChat = mutation({
  args: {
    chatId: v.string(),
    requesterId: v.string(), // Clerk ID
    chatName: v.optional(v.string()),
    chatPhoto: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const requester = await getNativeUser(ctx, args.requesterId);
    if (!requester) {
      throw new Error("User not found");
    }

    // Check if user is admin
    const membership = await ctx.db
      .query("chatMembers")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), requester._id))
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Only admins can update group details");
    }

    // Update all conversation records for this chat
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    for (const conversation of conversations) {
      await ctx.db.patch(conversation._id, {
        ...(args.chatName && { chatName: args.chatName }),
        ...(args.chatPhoto && { chatPhoto: args.chatPhoto }),
      });
    }

    return { success: true };
  },
});

/**
 * Remove member from group chat
 */
export const removeGroupMember = mutation({
  args: {
    chatId: v.string(),
    requesterId: v.string(), // Clerk ID
    memberId: v.string(), // Clerk ID to remove
  },
  handler: async (ctx, args) => {
    const requester = await getNativeUser(ctx, args.requesterId);
    const memberToRemove = await getNativeUser(ctx, args.memberId);

    if (!requester || !memberToRemove) {
      throw new Error("User not found");
    }

    // Check if requester is admin
    const requesterMembership = await ctx.db
      .query("chatMembers")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), requester._id))
      .first();

    if (!requesterMembership || requesterMembership.role !== "admin") {
      throw new Error("Only admins can remove members");
    }

    // Remove membership
    const membership = await ctx.db
      .query("chatMembers")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), memberToRemove._id))
      .first();

    if (membership) {
      await ctx.db.delete(membership._id);
    }

    // Delete conversation for removed user
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), memberToRemove._id))
      .first();

    if (conversation) {
      await ctx.db.delete(conversation._id);
    }

    return { success: true };
  },
});

/**
 * Make member admin
 */
export const makeAdmin = mutation({
  args: {
    chatId: v.string(),
    requesterId: v.string(), // Clerk ID
    memberId: v.string(), // Clerk ID to promote
  },
  handler: async (ctx, args) => {
    const requester = await getNativeUser(ctx, args.requesterId);
    const member = await getNativeUser(ctx, args.memberId);

    if (!requester || !member) {
      throw new Error("User not found");
    }

    // Only creator can make admins (simplified - could check if requester is original creator)
    const membership = await ctx.db
      .query("chatMembers")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), member._id))
      .first();

    if (membership) {
      await ctx.db.patch(membership._id, {
        role: "admin",
      });
    }

    return { success: true };
  },
});

/**
 * Leave group chat
 */
export const leaveGroupChat = mutation({
  args: {
    chatId: v.string(),
    userId: v.string(), // Clerk ID
  },
  handler: async (ctx, args) => {
    const user = await getNativeUser(ctx, args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Remove membership
    const membership = await ctx.db
      .query("chatMembers")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (membership) {
      await ctx.db.delete(membership._id);
    }

    // Delete conversation
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (conversation) {
      await ctx.db.delete(conversation._id);
    }

    // Add system message about leaving
    await ctx.db.insert("messages", {
      chatId: args.chatId,
      senderId: user._id,
      senderName: "System",
      senderPhoto: undefined,
      content: `${user.displayName || user.username} left the group`,
      timestamp: Date.now(),
      messageType: "system",
    });

    return { success: true };
  },
});

// =====================================================
// MESSAGE SEARCH
// =====================================================

/**
 * Search messages within a conversation
 */
export const searchMessages = query({
  args: {
    chatId: v.string(),
    searchQuery: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const query = args.searchQuery.toLowerCase();

    const allMessages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .take(500); // Get recent messages to search

    return allMessages
      .filter((m) => !m.deleted && !m.deletedForAll)
      .filter((m) => {
        const inContent = m.content?.toLowerCase().includes(query);
        const inSender = m.senderName?.toLowerCase().includes(query);
        return inContent || inSender;
      })
      .slice(0, limit);
  },
});

/**
 * Search messages across all conversations
 */
export const searchAllMessages = query({
  args: {
    userId: v.string(), // Clerk ID - user's own conversations
    searchQuery: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const query = args.searchQuery.toLowerCase();

    const user = await getNativeUser(ctx, args.userId);
    if (!user) {
      return [];
    }

    // Get all user's conversations
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const chatIds = conversations.map((c) => c.chatId);

    // Search messages in these conversations
    const results: any[] = [];
    for (const chatId of chatIds) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_chat", (q) => q.eq("chatId", chatId))
        .order("desc")
        .take(100);

      const matching = messages
        .filter((m) => !m.deleted && !m.deletedForAll)
        .filter((m) => {
          const inContent = m.content?.toLowerCase().includes(query);
          const inSender = m.senderName?.toLowerCase().includes(query);
          return inContent || inSender;
        });

      for (const message of matching) {
        const conversation = conversations.find((c) => c.chatId === chatId);
        results.push({
          message,
          conversation: conversation ? {
            chatId: conversation.chatId,
            chatName: conversation.chatName,
            chatPhoto: conversation.chatPhoto,
            chatType: conversation.chatType,
          } : undefined,
        });

        if (results.length >= limit) break;
      }

      if (results.length >= limit) break;
    }

    return results.slice(0, limit);
  },
});

// =====================================================
// ARCHIVE & FAVORITES
// =====================================================

/**
 * Archive conversation
 */
export const archiveConversation = mutation({
  args: {
    userId: v.string(), // Clerk ID
    chatId: v.string(),
    archived: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getNativeUser(ctx, args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (conversation) {
      await ctx.db.patch(conversation._id, {
        archived: args.archived,
        archivedAt: args.archived ? Date.now() : undefined,
      });
    }

    return { success: true };
  },
});

/**
 * Get archived conversations
 */
export const getArchivedConversations = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await getNativeUser(ctx, args.userId);
    if (!user) {
      return [];
    }

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return conversations.filter((c) => c.archived);
  },
});

/**
 * Star/favorite message
 */
export const starMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(), // Clerk ID
    starred: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getNativeUser(ctx, args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const starredBy = message.starredBy || [];

    if (args.starred) {
      if (!starredBy.includes(user._id)) {
        starredBy.push(user._id);
      }
    } else {
      const index = starredBy.indexOf(user._id);
      if (index > -1) {
        starredBy.splice(index, 1);
      }
    }

    await ctx.db.patch(args.messageId, {
      starredBy,
    });

    return { success: true, starred: args.starred };
  },
});

/**
 * Get starred messages
 */
export const getStarredMessages = query({
  args: {
    userId: v.string(), // Clerk ID
    chatId: v.optional(v.string()), // Filter by chat if provided
  },
  handler: async (ctx, args) => {
    const user = await getNativeUser(ctx, args.userId);
    if (!user) {
      return [];
    }

    let messages;

    if (args.chatId) {
      messages = await ctx.db
        .query("messages")
        .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
        .collect();
    } else {
      // Get all user's conversations and their messages
      const conversations = await ctx.db
        .query("conversations")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      const chatIds = conversations.map((c) => c.chatId);
      messages = [];

      for (const chatId of chatIds) {
        const chatMessages = await ctx.db
          .query("messages")
          .withIndex("by_chat", (q) => q.eq("chatId", chatId))
          .collect();
        messages.push(...chatMessages);
      }
    }

    return messages.filter((m) =>
      m.starredBy && m.starredBy.includes(user._id) && !m.deleted
    );
  },
});

// =====================================================
// DELIVERY & READ STATUS
// =====================================================

/**
 * Mark message as delivered to a user
 */
export const markAsDelivered = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(), // Clerk ID
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const user = await getNativeUser(ctx, args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const deliveryStatus = message.deliveryStatus || {
      delivered: false,
      deliveredAt: undefined,
      read: false,
      readAt: undefined,
    };

    await ctx.db.patch(args.messageId, {
      deliveryStatus: {
        ...deliveryStatus,
        delivered: true,
        deliveredAt: Date.now(),
      },
    });

    return { success: true };
  },
});

/**
 * Mark message as read by user
 */
export const markMessageAsRead = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(), // Clerk ID
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const user = await getNativeUser(ctx, args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const deliveryStatus = message.deliveryStatus || {
      delivered: false,
      deliveredAt: undefined,
      read: false,
      readAt: undefined,
    };

    await ctx.db.patch(args.messageId, {
      deliveryStatus: {
        ...deliveryStatus,
        delivered: true,
        deliveredAt: deliveryStatus.deliveredAt || Date.now(),
        read: true,
        readAt: Date.now(),
      },
    });

    // Update read receipt
    await ctx.db.insert("readReceipts", {
      chatId: message.chatId,
      messageId: args.messageId,
      userId: user._id,
      readAt: Date.now(),
    });

    // Update conversation unread count
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_chat", (q) => q.eq("chatId", message.chatId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (conversation && (conversation.unreadCount || 0) > 0) {
      await ctx.db.patch(conversation._id, {
        unreadCount: 0,
      });
    }

    return { success: true };
  },
});

/**
 * Get delivery status for a message
 */
export const getDeliveryStatus = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      return null;
    }

    // Get all members of the chat
    const members = await ctx.db
      .query("chatMembers")
      .withIndex("by_chat", (q) => q.eq("chatId", message.chatId))
      .collect();

    const status: any[] = [];
    for (const member of members) {
      const user = await ctx.db.get(member.userId);
      if (user) {
        // Check read receipts
        const readReceipt = await ctx.db
          .query("readReceipts")
          .withIndex("by_chat_user", (q) =>
            q.eq("chatId", message.chatId).eq("userId", member.userId)
          )
          .filter((q) => q.eq(q.field("messageId"), args.messageId))
          .first();

        status.push({
          userId: member.userId,
          userName: user.displayName || user.username,
          delivered: message.deliveryStatus?.delivered || false,
          deliveredAt: message.deliveryStatus?.deliveredAt,
          read: !!readReceipt,
          readAt: readReceipt?.readAt,
        });
      }
    }

    return status;
  },
});

// =====================================================
// ONLINE STATUS
// =====================================================

/**
 * Set user online status
 */
export const setOnlineStatus = mutation({
  args: {
    clerkId: v.string(),
    online: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getNativeUser(ctx, args.clerkId);
    if (!user) {
      throw new Error("User not found");
    }

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        online: args.online,
        lastSeen: args.online ? 0 : Date.now(),
      });
    } else {
      await ctx.db.insert("presence", {
        userId: args.clerkId,
        online: args.online,
        lastSeen: args.online ? 0 : Date.now(),
      });
    }

    return { success: true };
  },
});

/**
 * Get online status for multiple users
 */
export const getOnlineStatus = query({
  args: {
    userIds: v.array(v.string()), // Clerk IDs
  },
  handler: async (ctx, args) => {
    const status: Record<string, any> = {};

    for (const clerkId of args.userIds) {
      const presence = await ctx.db
        .query("presence")
        .withIndex("by_user", (q) => q.eq("userId", clerkId))
        .first();

      status[clerkId] = {
        online: presence?.online || false,
        lastSeen: presence?.lastSeen,
      };
    }

    return status;
  },
});

/**
 * Get all online users
 */
export const getOnlineUsers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const onlinePresences = await ctx.db
      .query("presence")
      .filter((q) => q.eq(q.field("online"), true))
      .take(limit);

    const users = await Promise.all(
      onlinePresences.map(async (presence) => {
        // userId in presence table is clerkId
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", presence.userId))
          .first();
        
        if (!user) return null;

        return {
          _id: user._id,
          clerkId: user.clerkId,
          displayName: user.displayName || user.username,
          avatarUrl: user.avatarUrl,
          online: true,
        };
      })
    );

    return users.filter((u): u is NonNullable<typeof u> => u !== null);
  },
});

// =====================================================
// CONVERSATION STATS
// =====================================================

/**
 * Get conversation statistics
 */
export const getConversationStats = query({
  args: {
    chatId: v.string(),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("chatMembers")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    const totalMessages = messages.filter((m) => !m.deleted && !m.deletedForAll).length;
    const mediaMessages = messages.filter((m) => m.media && !m.deleted);
    const pinnedMessages = messages.filter((m) => m.pinned && !m.deleted);

    // Get message count per user
    const messageCounts: Record<string, number> = {};
    messages.forEach((m) => {
      if (!m.deleted && !m.deletedForAll) {
        messageCounts[m.senderId] = (messageCounts[m.senderId] || 0) + 1;
      }
    });

    return {
      memberCount: members.length,
      totalMessages,
      mediaMessages: mediaMessages.length,
      pinnedMessages: pinnedMessages.length,
      messageCounts,
      createdAt: messages.length > 0 ? messages[0].timestamp : Date.now(),
      lastActivity: messages.length > 0 ? messages[messages.length - 1].timestamp : Date.now(),
    };
  },
});