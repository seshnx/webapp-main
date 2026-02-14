import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Convex Comments Module
 *
 * Real-time comment sync layer that mirrors the Neon comments table.
 * Neon remains the source of truth, Convex provides real-time subscriptions.
 */

/**
 * Get all comments for a post (real-time query)
 */
export const list = query({
  args: {
    postId: v.string(),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("asc")
      .collect();

    return comments;
  },
});

/**
 * Get a single comment by ID (real-time query)
 */
export const get = query({
  args: {
    commentId: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db
      .query("comments")
      .withIndex("by_comment_id", (q) => q.eq("commentId", args.commentId))
      .first();

    return comment;
  },
});

/**
 * Get comments count for a post (real-time query)
 */
export const count = query({
  args: {
    postId: v.string(),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    return comments.length;
  },
});

/**
 * Sync a comment from Neon to Convex (called from backend/action)
 * This is typically called via a Convex action or server-side sync job
 */
export const syncComment = mutation({
  args: {
    commentId: v.string(),
    postId: v.string(),
    userId: v.string(),
    content: v.string(),
    displayName: v.optional(v.string()),
    authorPhoto: v.optional(v.string()),
    parentId: v.optional(v.string()),
    reactionCount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("comments")
      .withIndex("by_comment_id", (q) => q.eq("commentId", args.commentId))
      .first();

    if (existing) {
      // Update existing comment
      await ctx.db.patch(existing._id, {
        content: args.content,
        reactionCount: args.reactionCount ?? 0,
        updatedAt: args.updatedAt ?? Date.now(),
      });
      return existing._id;
    } else {
      // Insert new comment
      const commentId = await ctx.db.insert("comments", {
        commentId: args.commentId,
        postId: args.postId,
        userId: args.userId,
        content: args.content,
        displayName: args.displayName,
        authorPhoto: args.authorPhoto,
        parentId: args.parentId,
        reactionCount: args.reactionCount ?? 0,
        createdAt: args.createdAt,
        updatedAt: args.updatedAt,
      });
      return commentId;
    }
  },
});

/**
 * Delete a comment from Convex (soft delete sync from Neon)
 */
export const deleteComment = mutation({
  args: {
    commentId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("comments")
      .withIndex("by_comment_id", (q) => q.eq("commentId", args.commentId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

/**
 * Update reaction count for a comment
 */
export const updateReactionCount = mutation({
  args: {
    commentId: v.string(),
    reactionCount: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("comments")
      .withIndex("by_comment_id", (q) => q.eq("commentId", args.commentId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        reactionCount: args.reactionCount,
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Bulk sync comments from Neon (for initial sync)
 */
export const bulkSyncComments = mutation({
  args: {
    comments: v.array(
      v.object({
        commentId: v.string(),
        postId: v.string(),
        userId: v.string(),
        content: v.string(),
        displayName: v.optional(v.string()),
        authorPhoto: v.optional(v.string()),
        parentId: v.optional(v.string()),
        reactionCount: v.optional(v.number()),
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const comment of args.comments) {
      const existing = await ctx.db
        .query("comments")
        .withIndex("by_comment_id", (q) => q.eq("commentId", comment.commentId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          content: comment.content,
          reactionCount: comment.reactionCount ?? 0,
          updatedAt: comment.updatedAt,
        });
      } else {
        await ctx.db.insert("comments", {
          commentId: comment.commentId,
          postId: comment.postId,
          userId: comment.userId,
          content: comment.content,
          displayName: comment.displayName,
          authorPhoto: comment.authorPhoto,
          parentId: comment.parentId,
          reactionCount: comment.reactionCount ?? 0,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
        });
      }
    }

    return { success: true, count: args.comments.length };
  },
});

/**
 * Clear all comments for a post (for testing/debugging)
 */
export const clearPostComments = mutation({
  args: {
    postId: v.string(),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    return { deleted: comments.length };
  },
});
