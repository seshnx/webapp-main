// social.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =====================================================
// POST QUERIES
// =====================================================

/**
 * Get post feed
 * Returns posts for the main feed with pagination
 */
export const getFeed = query({
  args: {
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const skip = args.skip || 0;

    // Fetch more than needed to account for filtering
    const fetchSize = (skip + limit) * 2;

    let posts = await ctx.db
      .query("posts")
      .order("desc")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(fetchSize);

    // Filter by category if specified
    if (args.category) {
      posts = posts.filter((post) => post.category === args.category);
    }

    // Apply pagination
    return posts.slice(skip, skip + limit);
  },
});

/**
 * Get posts by author
 * Returns all posts from a specific user
 */
export const getPostsByAuthor = query({
  args: {
    authorId: v.id("users"),
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const skip = args.skip || 0;
    const fetchSize = (skip + limit) * 2;

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .order("desc")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(fetchSize);

    return posts.slice(skip, skip + limit);
  },
});

/**
 * Get post by ID
 * Returns a single post with its details
 */
export const getPostById = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.postId);
  },
});

/**
 * Get posts by category
 * Returns filtered posts by category (Music, Studio, Gear, etc.)
 */
export const getPostsByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const skip = args.skip || 0;
    const fetchSize = (skip + limit) * 2;

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .order("desc")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(fetchSize);

    return posts.slice(skip, skip + limit);
  },
});

/**
 * Get posts by hashtag
 * Returns posts containing a specific hashtag
 */
export const getPostsByHashtag = query({
  args: {
    hashtag: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    // Get all posts
    const allPosts = await ctx.db
      .query("posts")
      .order("desc")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(limit * 2);

    // Filter by hashtag
    const filtered = allPosts.filter((post) =>
      post.hashtags?.includes(args.hashtag)
    );

    return filtered.slice(0, limit);
  },
});

/**
 * Get reposts of a post
 * Returns all reposts of a specific post
 */
export const getReposts = query({
  args: {
    originalPostId: v.id("posts"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const reposts = await ctx.db
      .query("posts")
      .withIndex("by_repost_of", (q) => q.eq("repostOf", args.originalPostId))
      .order("desc")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(limit);

    return reposts;
  },
});

/**
 * Search posts
 * Searches post content and captions
 */
export const searchPosts = query({
  args: {
    searchText: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const allPosts = await ctx.db
      .query("posts")
      .order("desc")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(limit * 2);

    const searchTerm = args.searchText.toLowerCase();
    const filtered = allPosts.filter(
      (post) =>
        (post.content || "").toLowerCase().includes(searchTerm) ||
        (post.hashtags || []).some((tag) =>
          tag.toLowerCase().includes(searchTerm)
        )
    );

    return filtered.slice(0, limit);
  },
});

// =====================================================
// POST MUTATIONS
// =====================================================

/**
 * Create a new post
 */
export const createPost = mutation({
  args: {
    authorId: v.id("users"),
    content: v.optional(v.string()),
    mediaUrls: v.optional(v.array(v.string())),
    mediaType: v.optional(v.string()),
    category: v.optional(v.string()),
    visibility: v.optional(v.string()),
    equipment: v.optional(v.array(v.string())),
    software: v.optional(v.array(v.string())),
    customFields: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const author = await ctx.db.get(args.authorId);
    if (!author) {
      throw new Error("Author not found");
    }

    const hashtags =
      args.content
        ?.match(/#\w+/g)
        ?.map((tag) => tag.slice(1).toLowerCase()) || [];

    const mentions =
      args.content?.match(/@\w+/g)?.map((mention) => mention.slice(1)) || [];

    const postId = await ctx.db.insert("posts", {
      authorId: args.authorId,
      authorName: author.displayName,
      authorPhoto: author.avatarUrl,
      authorUsername: author.username,
      role: author.activeRole,
      content: args.content,
      mediaUrls: args.mediaUrls,
      mediaType: args.mediaType,
      hashtags,
      mentions,
      category: args.category,
      visibility: args.visibility || "public",
      repostOf: undefined,
      parentId: undefined,
      equipment: args.equipment,
      software: args.software,
      customFields: args.customFields,
      engagement: {
        likesCount: 0,
        commentsCount: 0,
        repostsCount: 0,
        savesCount: 0,
      },
      deletedAt: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.patch(args.authorId, {
      stats: {
        ...author.stats,
        postsCount: (author.stats?.postsCount || 0) + 1,
      },
    });

    return postId;
  },
});

/**
 * Update an existing post
 */
export const updatePost = mutation({
  args: {
    postId: v.id("posts"),
    content: v.optional(v.string()),
    mediaUrls: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    visibility: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const updateData: any = {
      content: args.content,
      mediaUrls: args.mediaUrls,
      category: args.category,
      visibility: args.visibility,
      updatedAt: Date.now(),
    };

    if (args.content) {
      updateData.hashtags =
        args.content
          .match(/#\w+/g)
          ?.map((tag) => tag.slice(1).toLowerCase()) || [];

      updateData.mentions =
        args.content?.match(/@\w+/g)?.map((mention) => mention.slice(1)) || [];
    }

    await ctx.db.patch(args.postId, updateData);
    return { success: true };
  },
});

/**
 * Delete a post (soft delete)
 */
export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
    authorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.authorId !== args.authorId) {
      throw new Error("You can only delete your own posts");
    }

    await ctx.db.patch(args.postId, {
      deletedAt: Date.now(),
    });

    const author = await ctx.db.get(args.authorId);
    if (author) {
      await ctx.db.patch(args.authorId, {
        stats: {
          ...author.stats,
          postsCount: Math.max(0, (author.stats?.postsCount || 1) - 1),
        },
      });
    }

    return { success: true };
  },
});

/**
 * Repost a post
 */
export const repostPost = mutation({
  args: {
    originalPostId: v.id("posts"),
    authorId: v.id("users"),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const originalPost = await ctx.db.get(args.originalPostId);
    if (!originalPost) {
      throw new Error("Original post not found");
    }

    const author = await ctx.db.get(args.authorId);
    if (!author) {
      throw new Error("Author not found");
    }

    const existingRepost = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .filter((q) => q.eq(q.field("repostOf"), args.originalPostId))
      .first();

    if (existingRepost) {
      throw new Error("You already reposted this post");
    }

    const repostId = await ctx.db.insert("posts", {
      authorId: args.authorId,
      authorName: author.displayName,
      authorPhoto: author.avatarUrl,
      authorUsername: author.username,
      role: author.activeRole,
      content: args.comment || "",
      mediaUrls: originalPost.mediaUrls,
      mediaType: originalPost.mediaType,
      hashtags: originalPost.hashtags,
      mentions: originalPost.mentions,
      category: originalPost.category,
      visibility: originalPost.visibility,
      repostOf: args.originalPostId,
      parentId: undefined,
      engagement: {
        likesCount: 0,
        commentsCount: 0,
        repostsCount: 0,
        savesCount: 0,
      },
      deletedAt: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return repostId;
  },
});

/**
 * Undo repost
 */
export const unrepostPost = mutation({
  args: {
    repostId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const repost = await ctx.db.get(args.repostId);
    if (!repost) {
      throw new Error("Repost not found");
    }

    if (!repost.repostOf) {
      throw new Error("This is not a repost");
    }

    await ctx.db.patch(args.repostId, {
      deletedAt: Date.now(),
    });

    return { success: true };
  },
});

// =====================================================
// COMMENT QUERIES
// =====================================================

/**
 * Get comments for a post
 */
export const getCommentsByPost = query({
  args: {
    postId: v.id("posts"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("asc")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(limit);

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
    const limit = args.limit || 20;

    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .order("asc")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(limit);

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
    const limit = args.limit || 20;

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .order("desc")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(limit);

    return comments;
  },
});

// =====================================================
// COMMENT MUTATIONS
// =====================================================

/**
 * Create a new comment
 */
export const createComment = mutation({
  args: {
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const author = await ctx.db.get(args.authorId);
    if (!author) {
      throw new Error("Author not found");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (args.parentId) {
      const parentComment = await ctx.db.get(args.parentId);
      if (!parentComment || parentComment.postId !== args.postId) {
        throw new Error("Parent comment not found");
      }
    }

    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      commentId: crypto.randomUUID(),
      authorId: args.authorId,
      authorName: author.displayName,
      authorPhoto: author.avatarUrl,
      content: args.content,
      parentId: args.parentId,
      reactionCount: 0,
      deletedAt: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.patch(args.postId, {
      engagement: {
        ...post.engagement,
        commentsCount: (post.engagement?.commentsCount || 0) + 1,
      },
    });

    return commentId;
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

    await ctx.db.patch(args.commentId, {
      deletedAt: Date.now(),
    });

    if (comment.postId) {
      const post = await ctx.db.get(comment.postId);
      if (post) {
        await ctx.db.patch(comment.postId, {
          engagement: {
            ...post.engagement,
            commentsCount: Math.max(
              0,
              (post.engagement?.commentsCount || 1) - 1
            ),
          },
        });
      }
    }

    return { success: true };
  },
});

// =====================================================
// REACTION QUERIES
// =====================================================

/**
 * Get reactions for a target
 */
export const getReactions = query({
  args: {
    targetId: v.string(),
    targetType: v.union(v.literal("post"), v.literal("comment")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reactions")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.targetId).eq("targetType", args.targetType)
      )
      .collect();
  },
});

/**
 * Get reaction summary
 */
export const getReactionSummary = query({
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
 * Check if user reacted
 */
export const getUserReaction = query({
  args: {
    targetId: v.string(),
    targetType: v.union(v.literal("post"), v.literal("comment")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reactions")
      .withIndex("by_user_target", (q) =>
        q
          .eq("userId", args.userId)
          .eq("targetId", args.targetId)
          .eq("targetType", args.targetType)
      )
      .first();
  },
});

// =====================================================
// REACTION MUTATIONS
// =====================================================

/**
 * Toggle a reaction
 */
export const toggleReaction = mutation({
  args: {
    targetId: v.string(),
    targetType: v.union(v.literal("post"), v.literal("comment")),
    emoji: v.string(),
    userId: v.id("users"),
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

      if (args.targetType === "post") {
        const posts = await ctx.db
          .query("posts")
          .filter((q) => q.eq(q.field("_id"), existing.targetId))
          .take(1);

        if (posts.length > 0) {
          await ctx.db.patch(posts[0]._id, {
            engagement: {
              ...posts[0].engagement,
              likesCount: Math.max(
                0,
                (posts[0].engagement?.likesCount || 1) - 1
              ),
            },
          });
        }
      }

      if (args.targetType === "comment") {
        const comments = await ctx.db
          .query("comments")
          .filter((q) => q.eq(q.field("_id"), existing.targetId))
          .take(1);

        if (comments.length > 0) {
          await ctx.db.patch(comments[0]._id, {
            reactionCount: Math.max(0, comments[0].reactionCount - 1),
          });
        }
      }

      return { action: "removed", emoji: existing.emoji };
    } else {
      await ctx.db.insert("reactions", {
        targetId: args.targetId,
        targetType: args.targetType,
        emoji: args.emoji,
        userId: args.userId,
        timestamp: Date.now(),
      });

      if (args.targetType === "post") {
        const posts = await ctx.db
          .query("posts")
          .filter((q) => q.eq(q.field("_id"), args.targetId))
          .take(1);

        if (posts.length > 0) {
          await ctx.db.patch(posts[0]._id, {
            engagement: {
              ...posts[0].engagement,
              likesCount: (posts[0].engagement?.likesCount || 0) + 1,
            },
          });
        }
      }

      if (args.targetType === "comment") {
        const comments = await ctx.db
          .query("comments")
          .filter((q) => q.eq(q.field("_id"), args.targetId))
          .take(1);

        if (comments.length > 0) {
          await ctx.db.patch(comments[0]._id, {
            reactionCount: comments[0].reactionCount + 1,
          });
        }
      }

      return { action: "added", emoji: args.emoji };
    }
  },
});

/**
 * Clear all reactions
 */
export const clearReactions = mutation({
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

    return { cleared: reactions.length };
  },
});

// =====================================================
// SAVED POSTS
// =====================================================

/**
 * Get saved posts
 */
export const getSavedPosts = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const saved = await ctx.db
      .query("savedPosts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    const posts = await Promise.all(saved.map((s) => ctx.db.get(s.postId)));

    return posts.filter((p) => p !== null && p.deletedAt === undefined);
  },
});

/**
 * Check if post is saved
 */
export const isPostSaved = query({
  args: {
    userId: v.id("users"),
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const saved = await ctx.db
      .query("savedPosts")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", args.userId).eq("postId", args.postId)
      )
      .first();

    return !!saved;
  },
});

/**
 * Save a post
 */
export const savePost = mutation({
  args: {
    userId: v.id("users"),
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("savedPosts")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", args.userId).eq("postId", args.postId)
      )
      .first();

    if (existing) {
      return { success: true, alreadySaved: true };
    }

    await ctx.db.insert("savedPosts", {
      userId: args.userId,
      postId: args.postId,
      createdAt: Date.now(),
    });

    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(args.postId, {
        engagement: {
          ...post.engagement,
          savesCount: (post.engagement?.savesCount || 0) + 1,
        },
      });
    }

    return { success: true, alreadySaved: false };
  },
});

/**
 * Unsave a post
 */
export const unsavePost = mutation({
  args: {
    userId: v.id("users"),
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const saved = await ctx.db
      .query("savedPosts")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", args.userId).eq("postId", args.postId)
      )
      .first();

    if (!saved) {
      return { success: true, wasNotSaved: true };
    }

    await ctx.db.delete(saved._id);

    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(args.postId, {
        engagement: {
          ...post.engagement,
          savesCount: Math.max(0, (post.engagement?.savesCount || 1) - 1),
        },
      });
    }

    return { success: true, wasNotSaved: false };
  },
});

// =====================================================
// FEED HELPERS
// =====================================================

/**
 * Get home feed
 */
export const getHomeFeed = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const skip = args.skip || 0;

    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();

    const followingIds = follows.map((f) => f.followingId);

    const allPosts = await ctx.db
      .query("posts")
      .order("desc")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take((skip + limit) * 3);

    const feedPosts = allPosts.filter(
      (post) =>
        post.authorId === args.userId || followingIds.includes(post.authorId)
    );

    return feedPosts.slice(skip, skip + limit);
  },
});

/**
 * Get trending posts
 */
export const getTrendingPosts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const allPosts = await ctx.db
      .query("posts")
      .order("desc")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(100);

    const sorted = allPosts
      .sort((a, b) => {
        const aScore =
          (a.engagement?.likesCount || 0) +
          (a.engagement?.commentsCount || 0) +
          (a.engagement?.repostsCount || 0) +
          (a.engagement?.savesCount || 0);
        const bScore =
          (b.engagement?.likesCount || 0) +
          (b.engagement?.commentsCount || 0) +
          (b.engagement?.repostsCount || 0) +
          (b.engagement?.savesCount || 0);
        return bScore - aScore;
      })
      .slice(0, limit);

    return sorted;
  },
});
