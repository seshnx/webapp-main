import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper function to get Convex user ID from Clerk ID
async function getUserIdFromClerkId(ctx: any, clerkId: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
    .first();

  if (!user) {
    throw new Error(`User not found for Clerk ID: ${clerkId}`);
  }

  return user._id;
}

// Get conversations for a user
export const getConversations = query({
  args: { userId: v.string() }, // Clerk ID
  handler: async (ctx, args) => {
    const convexUserId = await getUserIdFromClerkId(ctx, args.userId);
    return await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", convexUserId))
      .order("desc")
      .collect();
  },
});

// Update conversation
export const updateConversation = mutation({
  args: {
    userId: v.string(), // Clerk ID
    chatId: v.string(),
    lastMessage: v.optional(v.string()),
    lastMessageTime: v.optional(v.number()),
    lastSenderId: v.optional(v.string()), // Clerk ID
    chatName: v.optional(v.string()),
    chatPhoto: v.optional(v.string()),
    chatType: v.union(v.literal("direct"), v.literal("group")),
    otherUserId: v.optional(v.string()), // Clerk ID
  },
  handler: async (ctx, args) => {
    const convexUserId = await getUserIdFromClerkId(ctx, args.userId);
    const conversationId = `${args.userId}_${args.chatId}`;

    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), convexUserId))
      .first();

    // Convert lastSenderId from Clerk ID to Convex ID if provided
    let convexLastSenderId: any = undefined;
    if (args.lastSenderId) {
      convexLastSenderId = await getUserIdFromClerkId(ctx, args.lastSenderId);
    }

    // Convert otherUserId from Clerk ID to Convex ID if provided
    let convexOtherUserId: any = undefined;
    if (args.otherUserId) {
      convexOtherUserId = await getUserIdFromClerkId(ctx, args.otherUserId);
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastMessage: args.lastMessage,
        lastMessageTime: args.lastMessageTime || Date.now(),
        lastSenderId: convexLastSenderId,
        chatName: args.chatName,
        chatPhoto: args.chatPhoto,
      });
    } else {
      await ctx.db.insert("conversations", {
        userId: convexUserId,
        chatId: args.chatId,
        lastMessage: args.lastMessage,
        lastMessageTime: args.lastMessageTime || Date.now(),
        unreadCount: 0,
        lastSenderId: convexLastSenderId,
        chatName: args.chatName,
        chatPhoto: args.chatPhoto,
        chatType: args.chatType,
        otherUserId: convexOtherUserId,
      });
    }
  },
});

// Update unread count
export const updateUnreadCount = mutation({
  args: {
    userId: v.string(), // Clerk ID
    chatId: v.string(),
    increment: v.optional(v.number()),
    setTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const convexUserId = await getUserIdFromClerkId(ctx, args.userId);

    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), convexUserId))
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
    userId: v.string(), // Clerk ID
    role: v.union(v.literal("member"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const convexUserId = await getUserIdFromClerkId(ctx, args.userId);

    // Check if member already exists
    const existing = await ctx.db
      .query("chatMembers")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), convexUserId))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("chatMembers", {
      chatId: args.chatId,
      userId: convexUserId,
      role: args.role,
      joinedAt: Date.now(),
    });
  },
});

// Create a group chat (Convex-native; replaces Firebase RTDB group creation).
export const createGroupChat = mutation({
  args: {
    creatorId: v.string(), // Clerk ID
    chatName: v.string(),
    memberIds: v.array(v.string()), // Clerk IDs - does not need to include creatorId; we'll enforce it
    chatPhoto: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const uniqueSuffix = `${now}_${Math.random().toString(16).slice(2)}`;
    const chatId = `group_${uniqueSuffix}`;

    // Convert all Clerk IDs to Convex IDs
    const convexCreatorId = await getUserIdFromClerkId(ctx, args.creatorId);
    const convexMemberIds = await Promise.all(
      args.memberIds.map(clerkId => getUserIdFromClerkId(ctx, clerkId))
    );

    const allMembers = Array.from(new Set([convexCreatorId, ...convexMemberIds]));

    // Create membership records
    for (const uid of allMembers) {
      await ctx.db.insert("chatMembers", {
        chatId,
        userId: uid,
        role: uid === convexCreatorId ? "admin" : "member",
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
        unreadCount: uid === convexCreatorId ? 0 : 1,
        lastSenderId: convexCreatorId,
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
    userId: v.string(), // Clerk ID
    chatId: v.string(),
  },
  handler: async (ctx, args) => {
    const convexUserId = await getUserIdFromClerkId(ctx, args.userId);

    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), convexUserId))
      .first();

    if (conversation) {
      await ctx.db.delete(conversation._id);
    }
  },
});
