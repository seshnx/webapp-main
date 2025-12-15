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
      userId: m.userId,
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

// Create a group chat (Convex-native; replaces Firebase RTDB group creation).
export const createGroupChat = mutation({
  args: {
    creatorId: v.string(),
    chatName: v.string(),
    memberIds: v.array(v.string()), // does not need to include creatorId; we'll enforce it
    chatPhoto: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const uniqueSuffix = `${now}_${Math.random().toString(16).slice(2)}`;
    const chatId = `group_${uniqueSuffix}`;

    const allMembers = Array.from(new Set([args.creatorId, ...(args.memberIds || [])]));

    // Create membership records
    for (const uid of allMembers) {
      await ctx.db.insert("chatMembers", {
        chatId,
        userId: uid,
        role: uid === args.creatorId ? "admin" : "member",
        joinedAt: now,
      });
    }

    // Create conversations for all members so the group appears immediately
    for (const uid of allMembers) {
      await ctx.db.insert("conversations", {
        userId: uid,
        chatId,
        lastMessage: "Group created",
        lastMessageTime: now,
        unreadCount: uid === args.creatorId ? 0 : 1,
        lastSenderId: args.creatorId,
        chatName: args.chatName,
        chatPhoto: args.chatPhoto,
        chatType: "group",
        otherUserId: undefined,
      });
    }

    return { chatId };
  },
});

// Delete (hide) a conversation for a single user (does not delete the chat/messages).
export const deleteConversation = mutation({
  args: {
    userId: v.string(),
    chatId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (conversation) {
      await ctx.db.delete(conversation._id);
    }
  },
});

