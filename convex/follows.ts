import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Convex Follows Module
 *
 * Real-time follow sync layer that mirrors the MongoDB follows collection.
 * MongoDB is the source of truth, Convex provides real-time subscriptions.
 */

/**
 * Get user's followers - real-time query
 */
export const getFollowers = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", args.userId))
      .order("desc")
      .collect();

    return follows;
  },
});

/**
 * Get who user is following - real-time query
 */
export const getFollowing = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .order("desc")
      .collect();

    return follows;
  },
});

/**
 * Check if user A is following user B - real-time query
 */
export const isFollowing = query({
  args: {
    followerId: v.string(),
    followingId: v.string(),
  },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .first();

    return !!follow;
  },
});

/**
 * Get follower count - real-time query
 */
export const getFollowerCount = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", args.userId))
      .collect();

    return follows.length;
  },
});

/**
 * Get following count - real-time query
 */
export const getFollowingCount = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();

    return follows.length;
  },
});

/**
 * Sync a follow relationship from MongoDB to Convex
 */
export const syncFollow = mutation({
  args: {
    followerId: v.string(),
    followingId: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .first();

    if (existing) {
      return existing._id;
    } else {
      const followId = await ctx.db.insert("follows", {
        followerId: args.followerId,
        followingId: args.followingId,
        createdAt: args.createdAt,
      });
      return followId;
    }
  },
});

/**
 * Remove a follow relationship from Convex (unfollow sync from MongoDB)
 */
export const removeFollow = mutation({
  args: {
    followerId: v.string(),
    followingId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { success: true };
    }

    return { success: false, message: "Follow relationship not found" };
  },
});

/**
 * Bulk sync follows from MongoDB (for initial sync)
 */
export const bulkSyncFollows = mutation({
  args: {
    follows: v.array(
      v.object({
        followerId: v.string(),
        followingId: v.string(),
        createdAt: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let skipped = 0;

    for (const follow of args.follows) {
      const existing = await ctx.db
        .query("follows")
        .withIndex("by_pair", (q) =>
          q
            .eq("followerId", follow.followerId)
            .eq("followingId", follow.followingId)
        )
        .first();

      if (existing) {
        skipped++;
      } else {
        await ctx.db.insert("follows", {
          followerId: follow.followerId,
          followingId: follow.followingId,
          createdAt: follow.createdAt,
        });
        inserted++;
      }
    }

    return { success: true, total: args.follows.length, inserted, skipped };
  },
});
