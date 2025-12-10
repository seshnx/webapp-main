import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get conversations for a user
export const getConversations = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Update conversation
export const updateConversation = mutation({
  args: {
    userId: v.string(),
    chatId: v.string(),
    lastMessage: v.optional(v.string()),
    lastMessageTime: v.optional(v.number()),
    lastSenderId: v.optional(v.string()),
    chatName: v.optional(v.string()),
    chatPhoto: v.optional(v.string()),
    chatType: v.union(v.literal("direct"), v.literal("group")),
    otherUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const conversationId = `${args.userId}_${args.chatId}`;
    
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastMessage: args.lastMessage,
        lastMessageTime: args.lastMessageTime || Date.now(),
        lastSenderId: args.lastSenderId,
        chatName: args.chatName,
        chatPhoto: args.chatPhoto,
      });
    } else {
      await ctx.db.insert("conversations", {
        userId: args.userId,
        chatId: args.chatId,
        lastMessage: args.lastMessage,
        lastMessageTime: args.lastMessageTime || Date.now(),
        unreadCount: 0,
        lastSenderId: args.lastSenderId,
        chatName: args.chatName,
        chatPhoto: args.chatPhoto,
        chatType: args.chatType,
        otherUserId: args.otherUserId,
      });
    }
  },
});

// Update unread count
export const updateUnreadCount = mutation({
  args: {
    userId: v.string(),
    chatId: v.string(),
    increment: v.optional(v.number()),
    setTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (conversation) {
      const newCount = args.setTo !== undefined 
        ? args.setTo 
        : (conversation.unreadCount + (args.increment || 0));
      
      await ctx.db.patch(conversation._id, {
        unreadCount: Math.max(0, newCount),
      });
    }
  },
});

// Get members of a group chat
export const getChatMembers = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("chatMembers")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();
    
    return members.map(m => ({
      id: m._id,
      oduserId: m.userId,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  },
});

// Add member to a group chat
export const addChatMember = mutation({
  args: {
    chatId: v.string(),
    userId: v.string(),
    role: v.union(v.literal("member"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    // Check if member already exists
    const existing = await ctx.db
      .query("chatMembers")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("chatMembers", {
      chatId: args.chatId,
      userId: args.userId,
      role: args.role,
      joinedAt: Date.now(),
    });
  },
});

