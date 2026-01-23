import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get recent profile updates for a user
export const getProfileUpdates = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profileUpdates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50)
      .collect();
  },
});

// Broadcast profile update to all connected clients
export const broadcastProfileUpdate = mutation({
  args: {
    userId: v.string(),
    field: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert("profileUpdates", {
      userId: args.userId,
      updatedAt: now,
      field: args.field,
      metadata: args.metadata,
    });

    return { success: true };
  },
});
