import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Convex Posts Module
 *
 * Real-time post sync layer that mirrors the MongoDB posts collection.
 * MongoDB is the source of truth, Convex provides real-time subscriptions.
 */

/**
 * Get recent posts - real-time query
 */
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(limit);
  },
});

/**
 * Get posts by author - real-time query
 */
export const listByAuthor = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query("posts")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

/**
 * Get posts by specific IDs - for "Following" feed
 */
export const listByIds = query({
  args: {
    userIds: v.array(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    // Get all posts and filter client-side
    // (Convex doesn't support "in" queries yet)
    const allPosts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(limit * 2); // Fetch extra to account for filtering

    // Filter to only posts from followed users
    return allPosts.filter(post => args.userIds.includes(post.userId));
  },
});

/**
 * Get a single post by ID - real-time query
 */
export const get = query({
  args: {
    postId: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_post_id", (q) => q.eq("postId", args.postId))
      .first();

    return post;
  },
});

/**
 * Sync a post from MongoDB to Convex (called from backend/action)
 */
export const syncPost = mutation({
  args: {
    postId: v.string(),
    userId: v.string(),
    displayName: v.optional(v.string()),
    authorPhoto: v.optional(v.string()),
    username: v.optional(v.string()),
    content: v.optional(v.string()),
    media: v.optional(v.array(v.any())),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    commentCount: v.optional(v.number()),
    reactionCount: v.optional(v.number()),
    saveCount: v.optional(v.number()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("posts")
      .withIndex("by_post_id", (q) => q.eq("postId", args.postId))
      .first();

    if (existing) {
      // Update existing post
      await ctx.db.patch(existing._id, {
        content: args.content,
        mediaUrls: args.media,
        updatedAt: args.updatedAt,
        engagement: {
          ...existing.engagement,
          commentsCount: args.commentCount ?? existing.engagement.commentsCount,
          likesCount: args.reactionCount ?? existing.engagement.likesCount,
          savesCount: args.saveCount ?? existing.engagement.savesCount,
        },
      });
      return existing._id;
    } else {
      // Insert new post
      const postId = await ctx.db.insert("posts", {
        postId: args.postId,
        userId: args.userId,
        authorName: args.displayName,
        authorPhoto: args.authorPhoto,
        authorUsername: args.username,
        content: args.content,
        mediaUrls: args.media,
        createdAt: args.createdAt,
        updatedAt: args.updatedAt || args.createdAt,
        engagement: {
          likesCount: args.reactionCount ?? 0,
          commentsCount: args.commentCount ?? 0,
          repostsCount: 0,
          savesCount: args.saveCount ?? 0,
        },
        role: args.role,
        visibility: "public", // Default
      } as any);
      return postId;
    }
  },
});

/**
 * Delete a post from Convex (soft delete sync from MongoDB)
 */
export const deletePost = mutation({
  args: {
    postId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("posts")
      .withIndex("by_post_id", (q) => q.eq("postId", args.postId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

/**
 * Update reaction count for a post
 */
export const updateReactionCount = mutation({
  args: {
    postId: v.string(),
    reactionCount: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("posts")
      .withIndex("by_post_id", (q) => q.eq("postId", args.postId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        engagement: {
          ...existing.engagement,
          likesCount: args.reactionCount,
        },
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Update comment count for a post
 */
export const updateCommentCount = mutation({
  args: {
    postId: v.string(),
    commentCount: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("posts")
      .withIndex("by_post_id", (q) => q.eq("postId", args.postId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        engagement: {
          ...existing.engagement,
          commentsCount: args.commentCount,
        },
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Bulk sync posts from MongoDB (for initial sync)
 */
export const bulkSyncPosts = mutation({
  args: {
    posts: v.array(
      v.object({
        postId: v.string(),
        userId: v.string(),
        displayName: v.optional(v.string()),
        authorPhoto: v.optional(v.string()),
        username: v.optional(v.string()),
        content: v.optional(v.string()),
        media: v.optional(v.array(v.any())),
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
        commentCount: v.optional(v.number()),
        reactionCount: v.optional(v.number()),
        saveCount: v.optional(v.number()),
        role: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let updated = 0;

    for (const post of args.posts) {
      const existing = await ctx.db
        .query("posts")
        .withIndex("by_post_id", (q) => q.eq("postId", post.postId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          content: post.content,
          mediaUrls: post.media,
          updatedAt: post.updatedAt,
          engagement: {
            ...existing.engagement,
            commentsCount: post.commentCount ?? existing.engagement.commentsCount,
            likesCount: post.reactionCount ?? existing.engagement.likesCount,
            savesCount: post.saveCount ?? existing.engagement.savesCount,
          },
        });
        updated++;
      } else {
        await ctx.db.insert("posts", {
          postId: post.postId,
          userId: post.userId,
          authorName: post.displayName,
          authorPhoto: post.authorPhoto,
          authorUsername: post.username,
          content: post.content,
          mediaUrls: post.media,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt || post.createdAt,
          engagement: {
            likesCount: post.reactionCount ?? 0,
            commentsCount: post.commentCount ?? 0,
            repostsCount: 0,
            savesCount: post.saveCount ?? 0,
          },
          role: post.role,
          visibility: "public",
        } as any);
        inserted++;
      }
    }

    return { success: true, total: args.posts.length, inserted, updated };
  },
});
