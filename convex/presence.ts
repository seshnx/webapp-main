import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get presence for a user
export const getPresence = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Update presence
export const updatePresence = mutation({
  args: {
    userId: v.string(),
    online: v.boolean(),
    lastSeen: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        online: args.online,
        lastSeen: args.lastSeen || Date.now(),
      });
    } else {
      await ctx.db.insert("presence", {
        userId: args.userId,
        online: args.online,
        lastSeen: args.lastSeen || Date.now(),
      });
    }
  },
});

// Get typing indicators for a chat
export const getTypingIndicators = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const staleThreshold = 5000; // 5 seconds

    // Get all typing indicators for this chat
    const indicators = await ctx.db
      .query("typingIndicators")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    // Filter to only active typing users (updated within last 5 seconds)
    return indicators.filter(
      (indicator) =>
        indicator.isTyping && now - indicator.updatedAt < staleThreshold
    );
  },
});

// Update typing indicator
export const updateTypingIndicator = mutation({
  args: {
    chatId: v.string(),
    userId: v.string(),
    userName: v.string(),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_chat_user", (q) =>
        q.eq("chatId", args.chatId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isTyping: args.isTyping,
        userName: args.userName,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("typingIndicators", {
        chatId: args.chatId,
        userId: args.userId,
        userName: args.userName,
        isTyping: args.isTyping,
        updatedAt: Date.now(),
      });
    }
  },
});

// Clear all typing indicators for a user (useful for cleanup)
export const clearTypingIndicator = mutation({
  args: {
    chatId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_chat_user", (q) =>
        q.eq("chatId", args.chatId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isTyping: false,
        updatedAt: Date.now(),
      });
    }
  },
});

