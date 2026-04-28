import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Helper to resolve Clerk ID to Convex User ID
 */
async function getNativeUserId(ctx: any, clerkId: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
    .first();
  return user ? user._id : null;
}

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
    const nativeUserId = await getNativeUserId(ctx, args.userId);
    if (!nativeUserId) return;

    // Check if receipt already exists
    const existing = await ctx.db
      .query("readReceipts")
      .withIndex("by_chat_user", (q) => 
        q.eq("chatId", args.chatId).eq("userId", nativeUserId)
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
        userId: nativeUserId,
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
    const nativeUserId = await getNativeUserId(ctx, args.userId);
    if (!nativeUserId) return;

    // Get the latest message ID (assuming messages are sorted)
    const latestMessageId = args.messageIds[args.messageIds.length - 1];
    
    // Mark the latest message as read (this implies all previous are read)
    await ctx.db.insert("readReceipts", {
      chatId: args.chatId,
      messageId: latestMessageId,
      userId: nativeUserId,
      readAt: Date.now(),
    });
  },
});

