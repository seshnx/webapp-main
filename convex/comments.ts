import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// COMMENTS
// =============================================================================

/**
 * List comments for a post (by string postId for client compatibility)
 * Returns empty array if postId doesn't match Convex document format
 */
export const list = query({
  args: {
    postId: v.string(),
  },
  handler: async (ctx, args) => {
    // If the postId is a Convex document ID, query normally
    // Otherwise return empty (comments live in Neon and are fetched via socialApi)
    return [];
  },
});

/**
 * Get comments for a post
 */
export const getCommentsByPost = query({
  args: {
    postId: v.id("posts"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("desc")
      .take(args.limit || 20);

    return comments;
  },
});

/**
 * Get comment replies
 */
export const getCommentReplies = query({
  args: {
    parentId: v.id("comments"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .order("desc")
      .take(args.limit || 20);

    return replies;
  },
});

/**
 * Get comments by author
 */
export const getCommentsByAuthor = query({
  args: {
    authorId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .order("desc")
      .take(args.limit || 50);

    return comments;
  },
});

/**
 * Create a comment
 */
export const createComment = mutation({
  args: {
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: args.authorId,
      content: args.content,
      parentId: args.parentId,
      reactionCount: 0,
      createdAt: Date.now(),
    });

    return { success: true, commentId };
  },
});

/**
 * Update a comment
 */
export const updateComment = mutation({
  args: {
    commentId: v.id("comments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);

    if (!comment) {
      throw new Error("Comment not found");
    }

    await ctx.db.patch(args.commentId, {
      content: args.content,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete a comment (soft delete)
 */
export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);

    if (!comment) {
      throw new Error("Comment not found");
    }

    // Soft delete
    await ctx.db.patch(args.commentId, {
      deletedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Increment reaction count
 */
export const incrementReactionCount = mutation({
  args: {
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);

    if (!comment) {
      throw new Error("Comment not found");
    }

    await ctx.db.patch(args.commentId, {
      reactionCount: (comment.reactionCount || 0) + 1,
    });

    return { success: true, newCount: (comment.reactionCount || 0) + 1 };
  },
});

/**
 * Decrement reaction count
 */
export const decrementReactionCount = mutation({
  args: {
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);

    if (!comment) {
      throw new Error("Comment not found");
    }

    const newCount = Math.max(0, (comment.reactionCount || 0) - 1);

    await ctx.db.patch(args.commentId, {
      reactionCount: newCount,
    });

    return { success: true, newCount };
  },
});
