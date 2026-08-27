import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Send a tip to a creator
 */
export const sendTip = mutation({
  args: {
    senderClerkId: v.string(),
    receiverId: v.id("users"),
    amount: v.number(),
    currency: v.optional(v.string()),
    message: v.optional(v.string()),
    postId: v.optional(v.id("posts")),
  },
  handler: async (ctx, args) => {
    const sender = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.senderClerkId))
      .first();

    if (!sender) throw new Error("Sender not found");

    const tipId = await ctx.db.insert("tips", {
      senderId: sender._id,
      senderName: sender.displayName || sender.firstName || "Supporter",
      receiverId: args.receiverId,
      amount: args.amount,
      currency: args.currency || "USD",
      message: args.message,
      postId: args.postId,
      createdAt: Date.now(),
    });

    // Notify receiver
    await ctx.db.insert("notifications", {
      userId: args.receiverId,
      type: "tip",
      title: "Tip Received!",
      message: `${sender.displayName || "Someone"} sent you a $${args.amount} tip!`,
      actorId: sender._id,
      actorName: sender.displayName || sender.firstName,
      actorPhoto: sender.avatarUrl,
      read: false,
      createdAt: Date.now(),
    });

    return tipId;
  },
});

/**
 * Get tips received by user
 */
export const getReceivedTips = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("tips")
      .withIndex("by_receiver", (q) => q.eq("receiverId", user._id))
      .order("desc")
      .take(50);
  },
});
