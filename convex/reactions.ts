import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Convex Reactions Module
 *
 * Real-time reaction sync layer that mirrors the Neon reactions table.
 * Neon remains the source of truth, Convex provides real-time subscriptions.
 */

/**
 * Get all reactions for a target (post or comment) - real-time
 */
export const list = query({
  args: {
    targetId: v.string(),
    targetType: v.union(v.literal("post"), v.literal("comment")),
  },
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.targetId).eq("targetType", args.targetType)
      )
      .collect();

    return reactions;
  },
});

/**
 * Get reaction count grouped by emoji for a target - real-time
 */
export const getSummary = query({
  args: {
    targetId: v.string(),
    targetType: v.union(v.literal("post"), v.literal("comment")),
  },
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.targetId).eq("targetType", args.targetType)
      )
      .collect();

    // Group by emoji
    const summary: Record<string, { count: number; users: string[] }> = {};
    for (const reaction of reactions) {
      if (!summary[reaction.emoji]) {
        summary[reaction.emoji] = { count: 0, users: [] };
      }
      summary[reaction.emoji].count++;
      summary[reaction.emoji].users.push(reaction.userId);
    }

    return summary;
  },
});

/**
 * Get a user's reaction on a target - real-time
 */
export const getUserReaction = query({
  args: {
    targetId: v.string(),
    targetType: v.union(v.literal("post"), v.literal("comment")),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const reaction = await ctx.db
      .query("reactions")
      .withIndex("by_user_target", (q) =>
        q
          .eq("userId", args.userId)
          .eq("targetId", args.targetId)
          .eq("targetType", args.targetType)
      )
      .first();

    return reaction;
  },
});

/**
 * Get total reaction count for a target - real-time
 */
export const count = query({
  args: {
    targetId: v.string(),
    targetType: v.union(v.literal("post"), v.literal("comment")),
  },
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.targetId).eq("targetType", args.targetType)
      )
      .collect();

    return reactions.length;
  },
});

/**
 * Sync a reaction from Neon to Convex (called from backend/action)
 */
export const syncReaction = mutation({
  args: {
    targetId: v.string(),
    targetType: v.union(v.literal("post"), v.literal("comment")),
    userId: v.string(),
    emoji: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_user_target", (q) =>
        q
          .eq("userId", args.userId)
          .eq("targetId", args.targetId)
          .eq("targetType", args.targetType)
      )
      .first();

    if (existing) {
      // Update existing reaction (in case of emoji change)
      await ctx.db.patch(existing._id, {
        emoji: args.emoji,
        timestamp: args.timestamp,
      });
      return existing._id;
    } else {
      // Insert new reaction
      const reactionId = await ctx.db.insert("reactions", {
        targetId: args.targetId,
        targetType: args.targetType,
        userId: args.userId,
        emoji: args.emoji,
        timestamp: args.timestamp,
      });
      return reactionId;
    }
  },
});

/**
 * Remove a reaction from Convex (sync from Neon)
 */
export const removeReaction = mutation({
  args: {
    targetId: v.string(),
    targetType: v.union(v.literal("post"), v.literal("comment")),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_user_target", (q) =>
        q
          .eq("userId", args.userId)
          .eq("targetId", args.targetId)
          .eq("targetType", args.targetType)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { success: true };
    }

    return { success: false, message: "Reaction not found" };
  },
});

/**
 * Bulk sync reactions from Neon (for initial sync)
 */
export const bulkSyncReactions = mutation({
  args: {
    reactions: v.array(
      v.object({
        targetId: v.string(),
        targetType: v.union(v.literal("post"), v.literal("comment")),
        userId: v.string(),
        emoji: v.string(),
        timestamp: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    let synced = 0;
    let inserted = 0;
    let updated = 0;

    for (const reaction of args.reactions) {
      const existing = await ctx.db
        .query("reactions")
        .withIndex("by_user_target", (q) =>
          q
            .eq("userId", reaction.userId)
            .eq("targetId", reaction.targetId)
            .eq("targetType", reaction.targetType)
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          emoji: reaction.emoji,
          timestamp: reaction.timestamp,
        });
        updated++;
      } else {
        await ctx.db.insert("reactions", {
          targetId: reaction.targetId,
          targetType: reaction.targetType,
          userId: reaction.userId,
          emoji: reaction.emoji,
          timestamp: reaction.timestamp,
        });
        inserted++;
      }
      synced++;
    }

    return { success: true, total: synced, inserted, updated };
  },
});

/**
 * Clear all reactions for a target (for testing/debugging)
 */
export const clearTargetReactions = mutation({
  args: {
    targetId: v.string(),
    targetType: v.union(v.literal("post"), v.literal("comment")),
  },
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.targetId).eq("targetType", args.targetType)
      )
      .collect();

    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    return { deleted: reactions.length };
  },
});
