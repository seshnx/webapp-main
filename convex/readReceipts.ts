import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get read receipts for a given chat
 */
export const getReadReceipts = query({
  args: {
    chatId: v.string(),
  },
  handler: async (ctx, args) => {
    const receipts = await ctx.db
      .query("readReceipts")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    return receipts;
  },
});

/**
 * Mark a message as read
 */
export const markAsRead = mutation({
  args: {
    chatId: v.string(),
    messageId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("readReceipts")
      .withIndex("by_chat_user", (q) =>
        q.eq("chatId", args.chatId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        messageId: args.messageId,
        readAt: now,
      });
    } else {
      await ctx.db.insert("readReceipts", {
        chatId: args.chatId,
        messageId: args.messageId,
        userId: args.userId,
        readAt: now,
      });
    }
  },
});

/**
 * Mark multiple messages as read (sets last read to the latest message)
 */
export const markMultipleAsRead = mutation({
  args: {
    chatId: v.string(),
    messageIds: v.array(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.messageIds || args.messageIds.length === 0) return;
    const latestMessageId = args.messageIds[args.messageIds.length - 1];
    const now = Date.now();

    const existing = await ctx.db
      .query("readReceipts")
      .withIndex("by_chat_user", (q) =>
        q.eq("chatId", args.chatId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        messageId: latestMessageId,
        readAt: now,
      });
    } else {
      await ctx.db.insert("readReceipts", {
        chatId: args.chatId,
        messageId: latestMessageId,
        userId: args.userId,
        readAt: now,
      });
    }
  },
});
