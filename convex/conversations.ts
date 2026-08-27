import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper function to get Convex user from Clerk ID or Convex ID safely
async function getUserRecord(ctx: any, id: string) {
  if (!id || id === "skip" || id === "undefined") return null;

  // Try query by clerkId index
  const userByClerk = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", id))
    .first();

  if (userByClerk) return userByClerk;

  // Try direct ID lookup if valid format
  try {
    const userById = await ctx.db.get(id as any);
    if (userById) return userById;
  } catch {
    // not a valid convex id format
  }

  return null;
}

// Get conversations for a user (real-time!)
export const getConversations = query({
  args: { userId: v.string() }, // Clerk ID or Convex ID
  handler: async (ctx, args) => {
    try {
      const user = await getUserRecord(ctx, args.userId);
      if (!user) return [];

      const convs = await ctx.db
        .query("conversations")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .collect();

      // Enrich conversations with other user details if available
      const enriched = await Promise.all(
        convs.map(async (conv) => {
          let otherClerkId: string | undefined = undefined;
          let otherName = conv.chatName;
          let otherAvatar = conv.chatPhoto;

          if (conv.otherUserId) {
            const otherUser = await ctx.db.get(conv.otherUserId);
            if (otherUser) {
              otherClerkId = otherUser.clerkId;
              otherName = otherName || otherUser.displayName || otherUser.username || `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || 'User';
              otherAvatar = otherAvatar || otherUser.avatarUrl;
            }
          }

          let lastSenderClerkId: string | undefined = undefined;
          if (conv.lastSenderId) {
            const senderUser = await ctx.db.get(conv.lastSenderId);
            if (senderUser) {
              lastSenderClerkId = senderUser.clerkId;
            }
          }

          return {
            ...conv,
            otherUserId: otherClerkId || (conv.otherUserId ? String(conv.otherUserId) : undefined),
            lastSenderId: lastSenderClerkId || (conv.lastSenderId ? String(conv.lastSenderId) : undefined),
            chatName: otherName,
            chatPhoto: otherAvatar,
          };
        })
      );

      return enriched;
    } catch (err) {
      console.error("Error in getConversations:", err);
      return [];
    }
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
    const user = await getUserRecord(ctx, args.userId);
    if (!user) return;

    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    let convexLastSenderId: any = undefined;
    if (args.lastSenderId) {
      const senderUser = await getUserRecord(ctx, args.lastSenderId);
      if (senderUser) convexLastSenderId = senderUser._id;
    }

    let convexOtherUserId: any = undefined;
    if (args.otherUserId) {
      const otherUser = await getUserRecord(ctx, args.otherUserId);
      if (otherUser) convexOtherUserId = otherUser._id;
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastMessage: args.lastMessage,
        lastMessageTime: args.lastMessageTime || Date.now(),
        lastSenderId: convexLastSenderId,
        chatName: args.chatName || existing.chatName,
        chatPhoto: args.chatPhoto || existing.chatPhoto,
      });
    } else {
      await ctx.db.insert("conversations", {
        userId: user._id,
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
    const user = await getUserRecord(ctx, args.userId);
    if (!user) return;

    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), user._id))
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
    const user = await getUserRecord(ctx, args.userId);
    if (!user) return;

    const existing = await ctx.db
      .query("chatMembers")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("chatMembers", {
      chatId: args.chatId,
      userId: user._id,
      role: args.role,
      joinedAt: Date.now(),
    });
  },
});

// Create a group chat
export const createGroupChat = mutation({
  args: {
    creatorId: v.string(), // Clerk ID
    chatName: v.string(),
    memberIds: v.array(v.string()), // Clerk IDs
    chatPhoto: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const uniqueSuffix = `${now}_${Math.random().toString(16).slice(2)}`;
    const chatId = `group_${uniqueSuffix}`;

    const creator = await getUserRecord(ctx, args.creatorId);
    if (!creator) throw new Error("Creator user not found");

    const memberUsers = await Promise.all(
      args.memberIds.map(clerkId => getUserRecord(ctx, clerkId))
    );
    const validMembers = [creator, ...memberUsers.filter((u): u is NonNullable<typeof u> => u !== null)];
    const uniqueMemberIds = Array.from(new Set(validMembers.map(u => u._id)));

    // Create membership records
    for (const uid of uniqueMemberIds) {
      await ctx.db.insert("chatMembers", {
        chatId,
        userId: uid,
        role: uid === creator._id ? "admin" : "member",
        joinedAt: now,
      });
    }

    // Create conversations for all members
    for (const uid of uniqueMemberIds) {
      await ctx.db.insert("conversations", {
        userId: uid,
        chatId,
        lastMessage: "Group created",
        lastMessageTime: now,
        unreadCount: uid === creator._id ? 0 : 1,
        lastSenderId: creator._id,
        chatName: args.chatName,
        chatPhoto: args.chatPhoto,
        chatType: "group",
        otherUserId: undefined,
      });
    }

    return { chatId };
  },
});

// Delete a conversation for a single user
export const deleteConversation = mutation({
  args: {
    userId: v.string(), // Clerk ID
    chatId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserRecord(ctx, args.userId);
    if (!user) return;

    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (conversation) {
      await ctx.db.delete(conversation._id);
    }
  },
});
