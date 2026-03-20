// social.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Safely look up a native Convex User ID from a Clerk String ID
const getNativeUser = async (ctx: any, clerkId: string | undefined) => {
  if (!clerkId) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
    .first();
};


/**
 * Get user by Clerk ID
 */
export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// =====================================================
// POST QUERIES
// =====================================================

/**
 * Get post feed
 * Returns posts for the main feed with pagination
 */
export const getFeed = query({
  args: { 
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const skip = args.skip ?? 0;

    try {
      let q = ctx.db.query("posts");
      
      if (args.category && args.category !== "All") {
        q = q.withIndex("by_category", (q) => q.eq("category", args.category));
      } else {
        q = q.withIndex("by_created");
      }

      const rawPosts = await q.order("desc").take(limit + skip + 50);
      
      // Filter out soft-deleted posts and ensure visibility
      const validPosts = rawPosts.filter(p => !p.deletedAt && p.visibility === "public");
      
      // Manual pagination using slice
      return validPosts.slice(skip, skip + limit);
    } catch (error) {
      console.error("Error in getFeed:", error);
      return [];
    }
  },
});

/**
 * Get home feed for a specific user (Following + Own posts)
 */
export const getHomeFeed = query({
  args: { 
    userId: v.optional(v.string()), // Accept Clerk ID as string
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const skip = args.skip ?? 0;

    // 1. If no user is provided, just return the public feed safely
    if (!args.userId) {
      const allPosts = await ctx.db
        .query("posts")
        .withIndex("by_created")
        .order("desc")
        .take(limit + skip);
        
      return allPosts.slice(skip, skip + limit);
    }

    try {
      // 2. Look up the native Convex User ID using the provided Clerk ID
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId as string))
        .first();

      // If user isn't found in Convex yet, return empty array to prevent crash
      if (!user) return [];

      // 3. Get who the user follows
      const follows = await ctx.db
        .query("follows")
        .withIndex("by_follower", (q) => q.eq("followerId", user._id))
        .collect();

      const followingIds = follows.map((f) => f.followingId);
      
      // Include the user's own posts in their home feed
      followingIds.push(user._id);

      // 4. Fetch all posts (We fetch a larger batch to filter in memory)
      // Note: Convex doesn't currently support "IN" queries for arrays of IDs efficiently in standard queries, 
      // so we filter after fetching the most recent posts.
      const recentPosts = await ctx.db
        .query("posts")
        .withIndex("by_created")
        .order("desc")
        .take(100); // Fetch top 100 recent posts

      // 5. Filter posts to only show those from followed users (or self)
      const feedPosts = recentPosts.filter(post => 
        followingIds.some(id => id === post.authorId)
      );

      // 6. Apply manual pagination (slice)
      return feedPosts.slice(skip, skip + limit);

    } catch (error) {
      console.error("Error in getHomeFeed:", error);
      // Fail gracefully instead of crashing the client
      return [];
    }
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

/**
 * Search posts by query string
 */
export const searchPosts = query({
  args: {
    searchQuery: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    // Use full-text search index if configured in schema
    // Fallback to simple filtering for now
    const allPosts = await ctx.db
      .query("posts")
      .order("desc")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(100);

    const query = args.searchQuery.toLowerCase();

    return allPosts
      .filter((post) => {
        const inContent = post.content?.toLowerCase().includes(query);
        const inAuthor =
          post.authorName?.toLowerCase().includes(query) ||
          post.authorUsername?.toLowerCase().includes(query);
        const inHashtags = post.hashtags?.some((t) =>
          t.toLowerCase().includes(query)
        );
        return inContent || inAuthor || inHashtags;
      })
      .slice(0, limit);
  },
});

/**
 * Get a single post by ID
 */
export const getPost = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post || post.deletedAt) {
      return null;
    }
    return post;
  },
});

/**
 * Get posts by a specific user
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
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .order("desc")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(skip + limit);

    return posts.slice(skip, skip + limit);
  },
});

/**
 * Get posts by category
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
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .order("desc")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .take(skip + limit);

    return posts.slice(skip, skip + limit);
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
    authorId: v.string(), // Accept Clerk ID string
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
    // Look up the Convex user using the Clerk ID
    const author = await getNativeUser(ctx, args.authorId);
    if (!author) {
      throw new Error("Author not found or not synced to database yet.");
    }

    const hashtags =
      args.content
        ?.match(/#[a-zA-Z0-9]+/g)
        ?.map((tag) => tag.slice(1).toLowerCase()) || [];

    const mentions =
      args.content?.match(/@[a-zA-Z0-9]+/g)?.map((mention) => mention.slice(1)) || [];

    const postId = await ctx.db.insert("posts", {
      authorId: author._id, // Use the native Convex ID
      authorName: author.displayName || author.username || "Unknown",
      authorPhoto: author.avatarUrl,
      authorUsername: author.username,
      // Use talentSubRole for Talent users, otherwise use activeRole
      role: author.talentSubRole || author.activeRole || "Talent",
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

    return postId;
  },
});

/**
 * Delete a post (soft delete)
 */
export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
    authorId: v.string(), // CHANGED
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const author = await getNativeUser(ctx, args.authorId);
    if (!author || post.authorId !== author._id) {
      throw new Error("Unauthorized");
    }

    // Soft delete
    await ctx.db.patch(args.postId, { deletedAt: Date.now() });
  },
});

/**
 * Repost a post
 */
export const repostPost = mutation({
  args: {
    originalPostId: v.id("posts"),
    authorId: v.string(), // CHANGED
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const originalPost = await ctx.db.get(args.originalPostId);
    if (!originalPost) throw new Error("Original post not found");

    const author = await getNativeUser(ctx, args.authorId);
    if (!author) throw new Error("Author not found");

    const postId = await ctx.db.insert("posts", {
      authorId: author._id,
      authorName: author.displayName || "Unknown",
      authorPhoto: author.imageUrl || author.avatarUrl,
      authorUsername: author.username,
      role: author.activeProfileRole || author.activeRole,
      content: args.comment,
      repostOf: originalPost._id,
      visibility: "public",
      engagement: {
        likesCount: 0,
        commentsCount: 0,
        repostsCount: 0,
        savesCount: 0,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Increment original post's repost count
    await ctx.db.patch(originalPost._id, {
      engagement: {
        ...originalPost.engagement,
        repostsCount: (originalPost.engagement?.repostsCount || 0) + 1,
      },
    });

    return postId;
  },
});

// =====================================================
// COMMENT QUERIES
// =====================================================

/**
 * Get comments for a post
 */
export const getComments = query({
  args: {
    postId: v.id("posts"),
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const skip = args.skip || 0;

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("asc")
      .take(skip + limit);

    return comments.slice(skip, skip + limit);
  },
});

/**
 * Get nested replies for a comment
 */
export const getReplies = query({
  args: {
    commentId: v.id("comments"),
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const skip = args.skip || 0;

    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentId", args.commentId))
      .order("asc")
      .take(skip + limit);

    return replies.slice(skip, skip + limit);
  },
});

// =====================================================
// COMMENT MUTATIONS
// =====================================================

/**
 * Add a comment to a post
 */
export const createComment = mutation({
  args: {
    postId: v.id("posts"),
    authorId: v.string(), // CHANGED
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const author = await getNativeUser(ctx, args.authorId);
    if (!author) throw new Error("Author not found");

    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: author._id,
      content: args.content,
      parentId: args.parentId,
      engagement: { likesCount: 0, repliesCount: 0 },
      createdAt: Date.now(),
    });

    // Increment the post's comment count
    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(post._id, {
        engagement: {
          ...post.engagement,
          commentsCount: (post.engagement?.commentsCount || 0) + 1,
        },
      });
    }

    return commentId;
  },
});

/**
 * Delete a comment
 */
export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
    authorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.authorId !== args.authorId) {
      throw new Error("Unauthorized to delete this comment");
    }

    // Soft delete by updating content
    await ctx.db.patch(args.commentId, {
      content: "[Deleted]",
    });

    // We don't decrement the comment count to keep thread structure
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
    return await ctx.db
      .query("reactions")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.targetId).eq("targetType", args.targetType)
      )
      .collect();
  },
});

/**
 * Check if current user has reacted to a target
 */
export const hasReacted = query({
  args: {
    targetId: v.string(),
    targetType: v.union(v.literal("post"), v.literal("comment")),
    userId: v.id("users"),
    emoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("reactions")
      .withIndex("by_user_target", (q) =>
        q
          .eq("userId", args.userId)
          .eq("targetId", args.targetId)
          .eq("targetType", args.targetType)
      );

    if (args.emoji) {
      q = q.filter((q) => q.eq(q.field("emoji"), args.emoji));
    }

    const reaction = await q.first();
    return !!reaction;
  },
});

// =====================================================
// REACTION MUTATIONS
// =====================================================

/**
 * Toggle a reaction (add or remove)
 */
export const toggleReaction = mutation({
  args: {
    targetId: v.string(),
    targetType: v.union(v.literal("post"), v.literal("comment")),
    emoji: v.string(),
    userId: v.string(), // CHANGED
  },
  handler: async (ctx, args) => {
    const user = await getNativeUser(ctx, args.userId);
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_user_target", (q) =>
        q.eq("userId", user._id).eq("targetId", args.targetId).eq("targetType", args.targetType)
      )
      .filter((q) => q.eq(q.field("emoji"), args.emoji))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      // Remove a like logically via patch
      if (args.targetType === "post") {
         const post = await ctx.db.get(args.targetId as any);
         if (post) await ctx.db.patch(post._id, { engagement: { ...post.engagement, likesCount: Math.max(0, (post.engagement?.likesCount || 0) - 1) }});
      }
      return { added: false };
    } else {
      await ctx.db.insert("reactions", {
        targetId: args.targetId,
        targetType: args.targetType,
        emoji: args.emoji,
        userId: user._id,
        timestamp: Date.now(),
      });
      // Add a like logically via patch
      if (args.targetType === "post") {
         const post = await ctx.db.get(args.targetId as any);
         if (post) await ctx.db.patch(post._id, { engagement: { ...post.engagement, likesCount: (post.engagement?.likesCount || 0) + 1 }});
      }
      return { added: true };
    }
  },
});

// =====================================================
// FOLLOW QUERIES
// =====================================================

/**
 * Check if user follows another user
 */
export const isFollowing = query({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.followerId))
      .filter((q) => q.eq(q.field("followingId"), args.followingId))
      .first();

    return !!follow;
  },
});

/**
 * Get followers for a user
 */
export const getFollowers = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", args.userId))
      .collect();

    const results = [];
    for (const f of follows) {
      const user = await ctx.db.get(f.followerId);
      if (user) {
        results.push({
          _id: user._id,
          clerkId: user.clerkId,
          displayName: user.displayName || user.username || "User",
          photoURL: user.avatarUrl,
          role: user.talentSubRole || user.activeRole,
          timestamp: f.createdAt,
        });
      }
    }
    return results;
  },
});

/**
 * Get users the specified user is following
 */
export const getFollowing = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();

    const results = [];
    for (const f of follows) {
      const user = await ctx.db.get(f.followingId);
      if (user) {
        results.push({
          _id: user._id,
          clerkId: user.clerkId,
          displayName: user.displayName || user.username || "User",
          photoURL: user.avatarUrl,
          role: user.talentSubRole || user.activeRole,
          timestamp: f.createdAt,
        });
      }
    }
    return results;
  },
});

// =====================================================
// FOLLOW MUTATIONS
// =====================================================

/**
 * Toggle follow status
 */
export const toggleFollow = mutation({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (args.followerId === args.followingId) {
      throw new Error("Cannot follow yourself");
    }

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.followerId))
      .filter((q) => q.eq(q.field("followingId"), args.followingId))
      .first();

    if (existing) {
      // Unfollow
      await ctx.db.delete(existing._id);
      return { following: false };
    } else {
      // Follow
      await ctx.db.insert("follows", {
        followerId: args.followerId,
        followingId: args.followingId,
        createdAt: Date.now(),
      });
      return { following: true };
    }
  },
});

// =====================================================
// SAVED POSTS QUERIES
// =====================================================

/**
 * Get saved posts for a user
 */
export const getSavedPosts = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const skip = args.skip || 0;

    const saved = await ctx.db
      .query("savedPosts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(skip + limit);

    // Get actual post data for the saved records
    const pagedSaved = saved.slice(skip, skip + limit);

    const result = [];
    for (const record of pagedSaved) {
      const post = await ctx.db.get(record.postId);
      if (post && !post.deletedAt) {
        result.push({
          ...post,
          savedAt: record.savedAt,
        });
      }
    }

    return result;
  },
});

/**
 * Check if a post is saved by a user
 */
export const isSaved = query({
  args: {
    userId: v.optional(v.id("users")),
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return false;

    const saved = await ctx.db
      .query("savedPosts")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", args.userId).eq("postId", args.postId)
      )
      .first();

    return !!saved;
  },
});

// =====================================================
// SAVED POSTS MUTATIONS
// =====================================================

/**
 * Save a post
 */
export const savePost = mutation({
  args: {
    userId: v.string(), // CHANGED
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const user = await getNativeUser(ctx, args.userId);
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("savedPosts")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .first();

    if (existing) return { saved: true };

    await ctx.db.insert("savedPosts", {
      userId: user._id,
      postId: args.postId,
      savedAt: Date.now(),
    });
    
    // Optionally increment save count
    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(post._id, {
        engagement: {
          ...post.engagement,
          savesCount: (post.engagement?.savesCount || 0) + 1,
        },
      });
    }

    return { saved: true };
  },
});

/**
 * Remove a post from saved
 */
export const unsavePost = mutation({
  args: {
    userId: v.string(), // CHANGED
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const user = await getNativeUser(ctx, args.userId);
    if (!user) throw new Error("User not found");

    const saved = await ctx.db
      .query("savedPosts")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .first();

    if (saved) {
      await ctx.db.delete(saved._id);
      
      const post = await ctx.db.get(args.postId);
      if (post) {
        await ctx.db.patch(post._id, {
          engagement: {
            ...post.engagement,
            savesCount: Math.max(0, (post.engagement?.savesCount || 0) - 1),
          },
        });
      }
    }

    return { saved: false };
  },
});
/**
 * Bulk get user profiles by Convex IDs
 */
/**
 * Search users by name or username
 */
export const searchUsers = query({
  args: {
    searchQuery: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const query = args.searchQuery.toLowerCase();

    const allUsers = await ctx.db
      .query("users")
      .take(100); // Simple scan for now

    return allUsers.filter(user => 
      user.displayName?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query) ||
      user.clerkId.toLowerCase().includes(query)
    ).slice(0, limit);
  },
});

/**
 * Get trending hashtags
 */
export const getTrendingHashtags = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const recentPosts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(200);

    const counts: Record<string, number> = {};
    recentPosts.forEach(post => {
      post.hashtags?.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([hashtag, count]) => ({ hashtag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },
});

/**
 * Get posts by hashtag
 */
export const getPostsByHashtag = query({
  args: {
    hashtag: v.string(),
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const skip = args.skip || 0;
    const tag = args.hashtag.toLowerCase().replace("#", "");

    const allPosts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(200);

    const filtered = allPosts.filter(post => 
      post.hashtags?.some(h => h.toLowerCase() === tag)
    );

    return filtered.slice(skip, skip + limit);
  },
});

export const getUsersByIds = query({
  args: {
    userIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const id of args.userIds) {
      const user = await ctx.db.get(id);
      if (user) {
        results.push({
          _id: user._id,
          clerkId: user.clerkId,
          displayName: user.displayName || user.username || "User",
          photoURL: user.avatarUrl,
          role: user.talentSubRole || user.activeRole,
        });
      }
    }
    return results;
  },
});
