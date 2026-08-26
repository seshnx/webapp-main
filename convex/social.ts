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
      let rawPosts;

      if (args.category && args.category !== "All") {
        rawPosts = await ctx.db.query("posts")
          .withIndex("by_category", (q) => q.eq("category", args.category))
          .order("desc")
          .take(limit + skip + 50);
      } else {
        rawPosts = await ctx.db.query("posts")
          .withIndex("by_created")
          .order("desc")
          .take(limit + skip + 50);
      }
      
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
    clerkId: v.string(),
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get user by clerkId first
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return [];
    }

    const limit = args.limit || 20;
    const skip = args.skip || 0;

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", user._id))
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
    mediaAttachments: v.optional(v.array(v.object({
      url: v.string(),
      type: v.string(),
      name: v.optional(v.string()),
    }))),
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

    // Derive mediaUrls from mediaAttachments if not provided directly
    const mediaUrls = args.mediaUrls || args.mediaAttachments?.map((a) => a.url);
    const mediaType = args.mediaType || args.mediaAttachments?.[0]?.type;

    const postId = await ctx.db.insert("posts", {
      authorId: author._id, // Use the native Convex ID
      authorName: author.displayName || author.username || "Unknown",
      authorPhoto: author.avatarUrl,
      authorUsername: author.username,
      // Use talentSubRole for Talent users, otherwise use activeRole
      role: author.talentSubRole || author.activeRole || "Talent",
      content: args.content,
      mediaUrls,
      mediaAttachments: args.mediaAttachments,
      mediaType,
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

    // Send mention notifications (limit to 10)
    if (mentions.length > 0) {
      const limitedMentions = mentions.slice(0, 10);
      for (const mention of limitedMentions) {
        const mentionedUser = await ctx.db
          .query("users")
          .withIndex("by_username", (q) => q.eq("username", mention))
          .first();

        if (mentionedUser && mentionedUser._id !== author._id) {
          await ctx.db.insert("notifications", {
            userId: mentionedUser._id,
            type: "mention",
            title: "You were mentioned",
            message: `${author.displayName || author.username || "Someone"} mentioned you in a post`,
            actorId: author._id,
            actorName: author.displayName || author.username,
            actorPhoto: author.avatarUrl,
            targetId: postId.toString(),
            targetType: "post",
            read: false,
            createdAt: Date.now(),
          });
        }
      }
    }

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

/**
 * Update a post
 */
export const updatePost = mutation({
  args: {
    postId: v.id("posts"),
    authorId: v.string(),
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
    const author = await getNativeUser(ctx, args.authorId);
    if (!author) throw new Error("Author not found");

    const post = await ctx.db.get(args.postId);
    if (!post || post.deletedAt) throw new Error("Post not found");
    if (post.authorId !== author._id) throw new Error("Unauthorized");

    const updates: Record<string, any> = { updatedAt: Date.now() };

    if (args.content !== undefined) {
      updates.content = args.content;
      updates.hashtags =
        args.content?.match(/#[a-zA-Z0-9]+/g)?.map((t) => t.slice(1).toLowerCase()) || [];
      updates.mentions =
        args.content?.match(/@[a-zA-Z0-9]+/g)?.map((m) => m.slice(1)) || [];
    }

    if (args.mediaUrls !== undefined) updates.mediaUrls = args.mediaUrls;
    if (args.mediaType !== undefined) updates.mediaType = args.mediaType;
    if (args.category !== undefined) updates.category = args.category;
    if (args.visibility !== undefined) updates.visibility = args.visibility;
    if (args.equipment !== undefined) updates.equipment = args.equipment;
    if (args.software !== undefined) updates.software = args.software;
    if (args.customFields !== undefined) updates.customFields = args.customFields;

    await ctx.db.patch(args.postId, updates);
    return args.postId;
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

    // Enrich with author info
    const enriched = await Promise.all(
      comments.slice(skip, skip + limit).map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        return {
          commentId: comment._id,
          postId: comment.postId,
          userId: author?.clerkId || comment.authorId.toString(),
          content: comment.content,
          displayName: author?.displayName || author?.username || "User",
          authorPhoto: author?.avatarUrl || null,
          parentId: comment.parentId,
          createdAt: comment.createdAt,
        };
      })
    );

    return enriched;
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
      authorName: author.displayName || author.username || "User",
      authorPhoto: author.avatarUrl || null,
      content: args.content,
      parentId: args.parentId,
      reactionCount: 0,
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

      // Create comment notification for post author (skip self-notifications)
      const postAuthor = await ctx.db.get(post.authorId);
      if (postAuthor && postAuthor._id !== author._id) {
        await ctx.db.insert("notifications", {
          userId: postAuthor._id,
          type: args.parentId ? "reply" : "comment",
          title: args.parentId ? "New Reply" : "New Comment",
          message: `${author.displayName || author.username || "Someone"} ${args.parentId ? "replied to your comment" : "commented on your post"}`,
          actorId: author._id,
          actorName: author.displayName || author.username,
          actorPhoto: author.avatarUrl,
          targetId: post._id.toString(),
          targetType: "post",
          read: false,
          createdAt: Date.now(),
        });
      }
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
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user by clerkId first
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.authorId !== user._id) {
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
    clerkId: v.string(),
    emoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get user by clerkId first
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return false;
    }

    let q = ctx.db
      .query("reactions")
      .withIndex("by_user_target", (q) =>
        q
          .eq("userId", user._id)
          .eq("targetId", args.targetId)
          .eq("targetType", args.targetType)
      );

    if (args.emoji) {
      q = q.filter((q) => q.eq(q.field("emoji"), args.emoji));
    }

    const reaction = await q.first();
    if (!reaction) return null;
    return { emoji: (reaction as any).emoji, reacted: true };
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
         if (post && "engagement" in post) await ctx.db.patch(post._id, { engagement: { ...post.engagement, likesCount: Math.max(0, (post.engagement?.likesCount || 0) - 1) }});
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
         if (post && "engagement" in post) await ctx.db.patch(post._id, { engagement: { ...post.engagement, likesCount: (post.engagement?.likesCount || 0) + 1 }});
      }
      // Create like notification for post/comment author (skip self-likes)
      if (args.targetType === "post") {
        const targetPost = await ctx.db.get(args.targetId as any);
        if (targetPost && "authorId" in targetPost && targetPost.authorId !== user._id) {
          await ctx.db.insert("notifications", {
            userId: targetPost.authorId,
            type: "like",
            title: "New Like",
            message: `${user.displayName || user.username || "Someone"} liked your post`,
            actorId: user._id,
            actorName: user.displayName || user.username,
            actorPhoto: user.avatarUrl,
            targetId: args.targetId,
            targetType: "post",
            read: false,
            createdAt: Date.now(),
          });
        }
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
    followerClerkId: v.string(),
    followingClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get both users by clerkId
    const follower = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.followerClerkId))
      .first();

    const following = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.followingClerkId))
      .first();

    if (!follower || !following) {
      return false;
    }

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", follower._id))
      .filter((q) => q.eq(q.field("followingId"), following._id))
      .first();

    return !!follow;
  },
});

/**
 * Get followers for a user
 */
export const getFollowers = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user by clerkId first
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return [];
    }

    const follows = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", user._id))
      .collect();

    const results = [];
    for (const f of follows) {
      const followerUser = await ctx.db.get(f.followerId);
      if (followerUser) {
        results.push({
          _id: followerUser._id,
          clerkId: followerUser.clerkId,
          displayName: followerUser.displayName || followerUser.username || "User",
          photoURL: followerUser.avatarUrl,
          role: followerUser.talentSubRole || followerUser.activeRole,
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
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user by clerkId first
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return [];
    }

    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect();

    const results = [];
    for (const f of follows) {
      const followedUser = await ctx.db.get(f.followingId);
      if (followedUser) {
        results.push({
          _id: followedUser._id,
          clerkId: followedUser.clerkId,
          displayName: followedUser.displayName || followedUser.username || "User",
          photoURL: followedUser.avatarUrl,
          role: followedUser.talentSubRole || followedUser.activeRole,
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
    followerClerkId: v.string(),
    followingClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get both users by clerkId
    const follower = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.followerClerkId))
      .first();

    const following = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.followingClerkId))
      .first();

    if (!follower || !following) {
      throw new Error("User not found");
    }

    if (follower._id === following._id) {
      throw new Error("Cannot follow yourself");
    }

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", follower._id))
      .filter((q) => q.eq(q.field("followingId"), following._id))
      .first();

    if (existing) {
      // Unfollow
      await ctx.db.delete(existing._id);
      return { following: false };
    } else {
      // Follow
      await ctx.db.insert("follows", {
        followerId: follower._id,
        followingId: following._id,
        createdAt: Date.now(),
      });
      return { following: true };
    }
  },
});

/**
 * Follow a user
 */
export const followUser = mutation({
  args: {
    followerClerkId: v.string(),
    followingClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const follower = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.followerClerkId))
      .first();

    const following = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.followingClerkId))
      .first();

    if (!follower || !following) {
      throw new Error("User not found");
    }

    if (follower._id === following._id) {
      throw new Error("Cannot follow yourself");
    }

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) => q.eq("followerId", follower._id).eq("followingId", following._id))
      .first();

    if (existing) {
      return { following: true };
    }

    await ctx.db.insert("follows", {
      followerId: follower._id,
      followingId: following._id,
      createdAt: Date.now(),
    });

    // Create follow notification
    await ctx.db.insert("notifications", {
      userId: following._id,
      type: "follow",
      title: "New Follower",
      message: `${follower.displayName || follower.username || "Someone"} started following you`,
      actorId: follower._id,
      actorName: follower.displayName || follower.username,
      actorPhoto: follower.avatarUrl,
      read: false,
      createdAt: Date.now(),
    });

    return { following: true };
  },
});

/**
 * Unfollow a user
 */
export const unfollowUser = mutation({
  args: {
    followerClerkId: v.string(),
    followingClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const follower = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.followerClerkId))
      .first();

    const following = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.followingClerkId))
      .first();

    if (!follower || !following) {
      throw new Error("User not found");
    }

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) => q.eq("followerId", follower._id).eq("followingId", following._id))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return { following: false };
  },
});

// =====================================================
// BLOCK SYSTEM
// =====================================================

/**
 * Block a user
 */
export const blockUser = mutation({
  args: {
    blockerClerkId: v.string(),
    blockedClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const blocker = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.blockerClerkId))
      .first();

    const blocked = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.blockedClerkId))
      .first();

    if (!blocker || !blocked) {
      throw new Error("User not found");
    }

    if (blocker._id === blocked._id) {
      throw new Error("Cannot block yourself");
    }

    const existingBlock = await ctx.db
      .query("userBlocks")
      .withIndex("by_pair", (q) => q.eq("blockerId", blocker._id).eq("blockedId", blocked._id))
      .first();

    if (existingBlock) {
      return { blocked: true };
    }

    await ctx.db.insert("userBlocks", {
      blockerId: blocker._id,
      blockedId: blocked._id,
      createdAt: Date.now(),
    });

    // Remove follow relationships in both directions
    const followForward = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) => q.eq("followerId", blocker._id).eq("followingId", blocked._id))
      .first();
    if (followForward) await ctx.db.delete(followForward._id);

    const followBackward = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) => q.eq("followerId", blocked._id).eq("followingId", blocker._id))
      .first();
    if (followBackward) await ctx.db.delete(followBackward._id);

    return { blocked: true };
  },
});

/**
 * Unblock a user
 */
export const unblockUser = mutation({
  args: {
    blockerClerkId: v.string(),
    blockedClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const blocker = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.blockerClerkId))
      .first();

    const blocked = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.blockedClerkId))
      .first();

    if (!blocker || !blocked) {
      throw new Error("User not found");
    }

    const existingBlock = await ctx.db
      .query("userBlocks")
      .withIndex("by_pair", (q) => q.eq("blockerId", blocker._id).eq("blockedId", blocked._id))
      .first();

    if (existingBlock) {
      await ctx.db.delete(existingBlock._id);
    }

    return { blocked: false };
  },
});

/**
 * Get blocked users for a user
 */
export const getBlockedUsers = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return [];

    const blocks = await ctx.db
      .query("userBlocks")
      .withIndex("by_blocker", (q) => q.eq("blockerId", user._id))
      .collect();

    const results = [];
    for (const block of blocks) {
      const blockedUser = await ctx.db.get(block.blockedId);
      if (blockedUser) {
        results.push({
          clerkId: blockedUser.clerkId,
          displayName: blockedUser.displayName || blockedUser.username || "User",
          photoURL: blockedUser.avatarUrl,
          blockedAt: block.createdAt,
        });
      }
    }
    return results;
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
    clerkId: v.string(),
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get user by clerkId first
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return [];
    }

    const limit = args.limit || 20;
    const skip = args.skip || 0;

    const saved = await ctx.db
      .query("savedPosts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
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
    clerkId: v.optional(v.string()),
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    if (!args.clerkId) return false;

    // Get user by clerkId first
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId!))
      .first();

    if (!user) {
      return false;
    }

    const saved = await ctx.db
      .query("savedPosts")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", user._id).eq("postId", args.postId)
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
      createdAt: Date.now(),
      savedAt: Date.now(),
    });

    // Optionally increment save count
    const post = await ctx.db.get(args.postId);
    if (post && "engagement" in post) {
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
    clerkIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const clerkId of args.clerkIds) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

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

// =====================================================
// DISCOVERY QUERIES
// =====================================================

/**
 * Discover artists (Talent users)
 */
export const discoverArtists = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const allUsers = await ctx.db.query("users").take(200);

    const artists = allUsers.filter(u =>
      u.activeRole === "Talent" ||
      u.talentSubRole === "Singer" ||
      u.talentSubRole === "Rapper" ||
      u.talentSubRole === "DJ" ||
      u.talentSubRole === "Vocalist" ||
      u.talentSubRole === "Musician"
    );

    return artists.slice(0, limit).map(u => ({
      clerkId: u.clerkId,
      displayName: u.displayName || u.username || "Artist",
      photoURL: u.avatarUrl,
      role: u.talentSubRole || u.activeRole || "Talent",
      location: u.location,
      followersCount: u.stats?.followersCount || 0,
    }));
  },
});

/**
 * Discover producers
 */
export const discoverProducers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const allUsers = await ctx.db.query("users").take(200);

    const producers = allUsers.filter(u =>
      u.activeRole === "Producer" ||
      (u.accountTypes && u.accountTypes.includes("Producer"))
    );

    return producers.slice(0, limit).map(u => ({
      clerkId: u.clerkId,
      displayName: u.displayName || u.username || "Producer",
      photoURL: u.avatarUrl,
      role: u.activeRole || "Producer",
      location: u.location,
      followersCount: u.stats?.followersCount || 0,
    }));
  },
});

/**
 * Discover studios
 */
export const discoverStudios = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const allUsers = await ctx.db.query("users").take(200);

    const studios = allUsers.filter(u =>
      u.activeRole === "Studio" ||
      (u.accountTypes && u.accountTypes.includes("Studio"))
    );

    return studios.slice(0, limit).map(u => ({
      clerkId: u.clerkId,
      displayName: u.displayName || u.username || "Studio",
      photoURL: u.avatarUrl,
      role: u.activeRole || "Studio",
      location: u.location,
      followersCount: u.stats?.followersCount || 0,
    }));
  },
});

/**
 * Discover sounds (audio posts)
 */
export const discoverSounds = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const allPosts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(200);

    const sounds = allPosts.filter(p =>
      !p.deletedAt &&
      p.visibility === "public" &&
      p.mediaType === "audio"
    );

    return sounds.slice(0, limit);
  },
});

/**
 * Discover schools
 */
export const discoverSchools = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const schools = await ctx.db
      .query("schools")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .take(limit);

    return schools.map(s => ({
      id: s._id,
      name: s.name,
      code: s.code,
      description: s.description,
      logoUrl: s.logoUrl,
      location: s.location,
    }));
  },
});
