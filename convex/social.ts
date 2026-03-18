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

    let postsQuery = ctx.db
      .query("posts")
      .withIndex("by_created", (q) => q.order("desc"))
      .filter((q) => q.eq(q.field("deletedAt"), undefined));

    // Filter by category if specified
    if (args.category) {
      postsQuery = postsQuery.filter((q) =>
        q.eq(q.field("category"), args.category)
      );
    }

    // Use .take(limit + skip) and slice the array since Convex doesn't use .skip()
    const posts = await postsQuery.take(skip + limit);
    return posts.slice(skip);
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

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) =>
        q.eq("authorId", args.authorId).order("desc")
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(skip + limit);

    return posts.slice(skip);
  },
});

/**
 * Get post by ID
 * Returns a single post with its details
 */
export const getPostById = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    return post;
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

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_category", (q) =>
        q.eq("category", args.category).order("desc")
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(skip + limit);

    return posts.slice(skip);
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

    // Get all posts (in production, you'd want a proper index)
    const allPosts = await ctx.db
      .query("posts")
      .withIndex("by_created", (q) => q.order("desc"))
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
      .withIndex("by_repost_of", (q) =>
        q.eq("repostOf", args.originalPostId).order("desc")
      )
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
      .withIndex("by_created", (q) => q.order("desc"))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(limit * 2);

    const searchTerm = args.searchText.toLowerCase();
    const filtered = allPosts.filter((post) =>
      (post.content || "").toLowerCase().includes(searchTerm) ||
      (post.hashtags || []).some((tag) => tag.toLowerCase().includes(searchTerm))
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
    visibility: v.optional(v.string()), // public, followers, private
    equipment: v.optional(v.array(v.string())),
    software: v.optional(v.array(v.string())),
    customFields: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Get author info
    const author = await ctx.db.get(args.authorId);
    if (!author) {
      throw new Error("Author not found");
    }

    // Extract hashtags and mentions from content
    const hashtags = args.content
      ?.match(/#\w+/g)
      ?.map((tag) => tag.slice(1).toLowerCase()) || [];

    const mentions = args.content
      ?.match(/@\w+/g)
      ?.map((mention) => mention.slice(1)) || [];

    // Create post
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

    // Increment user's post count
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

    // Re-extract hashtags and mentions if content is updated
    const updateData: any = {
      content: args.content,
      mediaUrls: args.mediaUrls,
      category: args.category,
      visibility: args.visibility,
      updatedAt: Date.now(),
    };

    if (args.content) {
      updateData.hashtags = args.content
        .match(/#\w+/g)
        ?.map((tag) => tag.slice(1).toLowerCase()) || [];

      updateData.mentions = args.content
        .match(/@\w+/g)
        ?.map((mention) => mention.slice(1)) || [];
    }

    await ctx.db.patch(args.postId, updateData);

    return { success: true };
  },
});

/**
 * Delete a post (soft delete)
 * Marks post as deleted rather than removing it
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

    // Verify ownership
    if (post.authorId !== args.authorId) {
      throw new Error("You can only delete your own posts");
    }

    // Soft delete
    await ctx.db.patch(args.postId, {
      deletedAt: Date.now(),
    });

    // Decrement user's post count
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
 * Creates a new post that references the original
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

    // Check if user already reposted this post
    const existingRepost = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) =>
        q.eq("authorId", args.authorId).order("desc")
      )
      .filter((q) =>
        q.eq(q.field("repostOf"), args.originalPostId)
      )
      .first();

    if (existingRepost) {
      throw new Error("You already reposted this post");
    }

    // Create repost
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

    // Increment repost count on original post
    // Note: You'd want to track this separately or calculate on read

    return repostId;
  },
});

/**
 * Undo repost
 * Soft deletes the repost
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
 * Returns all comments for a specific post
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
      .withIndex("by_post", (q) =>
        q.eq("postId", args.postId).order("asc")
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(limit);

    return comments;
  },
});

/**
 * Get comment replies
 * Returns nested replies for a comment
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
      .withIndex("by_parent", (q) =>
        q.eq("parentId", args.parentId).order("asc")
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(limit);

    return replies;
  },
});

/**
 * Get comments by author
 * Returns all comments from a specific user
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
      .withIndex("by_author", (q) =>
        q.eq("authorId", args.authorId).order("desc")
      )
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
    // Get author info
    const author = await ctx.db.get(args.authorId);
    if (!author) {
      throw new Error("Author not found");
    }

    // Verify post exists
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // If parentId is provided, verify it exists
    if (args.parentId) {
      const parentComment = await ctx.db.get(args.parentId);
      if (!parentComment || parentComment.postId !== args.postId) {
        throw new Error("Parent comment not found");
      }
    }

    // Create comment
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

    // Increment post's comment count
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

    // Decrement post's comment count
    if (comment.postId) {
      const post = await ctx.db.get(comment.postId);
      if (post) {
        await ctx.db.patch(comment.postId, {
          engagement: {
            ...post.engagement,
            commentsCount: Math.max(0, (post.engagement?.commentsCount || 1) - 1),
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
 * Get reactions for a target (post or comment)
 */
export const getReactions = query({
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
 * Get reaction summary grouped by emoji
 * Returns count of each emoji reaction
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
 * Check if user reacted to a target
 * Returns the user's reaction if exists
 */
export const getUserReaction = query({
  args: {
    targetId: v.string(),
    targetType: v.union(v.literal("post"), v.literal("comment")),
    userId: v.id("users"),
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

// =====================================================
// REACTION MUTATIONS
// =====================================================

/**
 * Toggle a reaction (add if not exists, remove if exists)
 * Handles likes and emoji reactions
 */
export const toggleReaction = mutation({
  args: {
    targetId: v.string(),
    targetType: v.union(v.literal("post"), v.literal("comment")),
    emoji: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check for existing reaction
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
      // Remove reaction
      await ctx.db.delete(existing._id);

      // Decrement reaction count if it's a post
      if (args.targetType === "post") {
        const post = await ctx.db
          .query("posts")
          .filter((q) => q.eq(q.field("_id"), existing.targetId))
          .first();

        if (post) {
          await ctx.db.patch(post._id, {
            engagement: {
              ...post.engagement,
              likesCount: Math.max(0, (post.engagement?.likesCount || 1) - 1),
            },
          });
        }
      }

      return { action: "removed", emoji: existing.emoji };
    } else {
      // Add new reaction
      await ctx.db.insert("reactions", {
        targetId: args.targetId,
        targetType: args.targetType,
        emoji: args.emoji,
        userId: args.userId,
        timestamp: Date.now(),
      });

      // Increment reaction count if it's a post
      if (args.targetType === "post") {
        const post = await ctx.db
          .query("posts")
          .filter((q) => q.eq(q.field("_id"), args.targetId))
          .first();

        if (post) {
          await ctx.db.patch(post._id, {
            engagement: {
              ...post.engagement,
              likesCount: (post.engagement?.likesCount || 0) + 1,
            },
          });
        }
      }

      // Increment comment reaction count
      if (args.targetType === "comment") {
        const comment = await ctx.db
          .query("comments")
          .filter((q) => q.eq(q.field("_id"), args.targetId))
          .first();

        if (comment) {
          await ctx.db.patch(comment._id, {
            reactionCount: comment.reactionCount + 1,
          });
        }
      }

      return { action: "added", emoji: args.emoji };
    }
  },
});

/**
 * Clear all reactions from a target
 * Removes all reactions from a post or comment
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
// SAVED POSTS (BOOKMARKS)
// =====================================================

/**
 * Get saved posts for a user
 * Returns posts that the user has bookmarked
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
      .withIndex("by_user", (q) => q.eq("userId", args.userId).order("desc"))
      .take(limit)
      .collect();

    // Get full post objects
    const posts = await Promise.all(
      saved.map((s) => ctx.db.get(s.postId))
    );

    return posts.filter((p) => p !== null && p.deletedAt === undefined);
  },
});

/**
 * Check if a post is saved by a user
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
 * Save a post (bookmark)
 */
export const savePost = mutation({
  args: {
    userId: v.id("users"),
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    // Check if already saved
    const existing = await ctx.db
      .query("savedPosts")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", args.userId).eq("postId", args.postId)
      )
      .first();

    if (existing) {
      return { success: true, alreadySaved: true };
    }

    // Save post
    await ctx.db.insert("savedPosts", {
      userId: args.userId,
      postId: args.postId,
      createdAt: Date.now(),
    });

    // Increment post's save count
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
 * Unsave a post (remove bookmark)
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

    // Decrement post's save count
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
 * Get posts for user's home feed
 * Returns posts from user and people they follow
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

    // Get people user follows
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();

    const followingIds = follows.map((f) => f.followingId);

    // Fix invalid index, invalid filter, and invalid skip() chain
    const allPosts = await ctx.db
      .query("posts")
      .withIndex("by_created", (q) => q.order("desc")) 
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(skip + (limit * 5));

    // Filter to only show posts from user + following
    const feedPosts = allPosts.slice(skip).filter((post) =>
      post.authorId === args.userId || followingIds.includes(post.authorId)
    );

    return feedPosts.slice(0, limit);
  },
});

/**
 * Get trending posts
 * Returns posts with high engagement
 */
export const getTrendingPosts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const allPosts = await ctx.db
      .query("posts")
      .withIndex("by_created", (q) => q.order("desc"))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(100)
      .collect();

    // Sort by engagement (likes + comments + reposts + saves)
    const sorted = allPosts
      .sort((a, b) => {
        const aScore = (a.engagement?.likesCount || 0) +
                      (a.engagement?.commentsCount || 0) +
                      (a.engagement?.repostsCount || 0) +
                      (a.engagement?.savesCount || 0);
        const bScore = (b.engagement?.likesCount || 0) +
                      (b.engagement?.commentsCount || 0) +
                      (b.engagement?.repostsCount || 0) +
                      (b.engagement?.savesCount || 0);
        return bScore - aScore;
      })
      .slice(0, limit);

    return sorted;
  },
});
