import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get read receipts for a chat
export const getReadReceipts = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("readReceipts")
      .withIndex("by_chat_user", (q) => q.eq("chatId", args.chatId))
      .collect();
  },
});

// Mark message as read
export const markAsRead = mutation({
  args: {
    chatId: v.string(),
    messageId: v.id("messages"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if receipt already exists
    const existing = await ctx.db
      .query("readReceipts")
      .withIndex("by_chat_user", (q) => 
        q.eq("chatId", args.chatId).eq("userId", args.userId)
      )
      .filter((q) => q.eq(q.field("messageId"), args.messageId))
      .first();

    if (existing) {
      // Update existing receipt
      await ctx.db.patch(existing._id, {
        readAt: Date.now(),
      });
    } else {
      // Create new receipt
      await ctx.db.insert("readReceipts", {
        chatId: args.chatId,
        messageId: args.messageId,
        userId: args.userId,
        readAt: Date.now(),
      });
    }
  },
});

// Mark multiple messages as read
export const markMultipleAsRead = mutation({
  args: {
    chatId: v.string(),
    messageIds: v.array(v.id("messages")),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the latest message ID (assuming messages are sorted)
    const latestMessageId = args.messageIds[args.messageIds.length - 1];
    
    // Mark the latest message as read (this implies all previous are read)
    await ctx.db.insert("readReceipts", {
      chatId: args.chatId,
      messageId: latestMessageId,
      userId: args.userId,
      readAt: Date.now(),
    });
  },
});

