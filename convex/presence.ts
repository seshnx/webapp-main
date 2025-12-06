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

