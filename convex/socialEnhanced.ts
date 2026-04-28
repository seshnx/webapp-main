import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

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

// =====================================================
// POST EDITING & MANAGEMENT
// =====================================================

/**
 * Edit an existing post
 */
export const editPost = mutation({
  args: {
    postId: v.id("posts"),
    clerkId: v.string(),
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
    const user = await getNativeUser(ctx, args.clerkId);
    if (!user) {
      throw new Error("User not found");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.authorId !== user._id) {
      throw new Error("Unauthorized to edit this post");
    }

    // Extract hashtags and mentions from new content
    const hashtags =
      args.content
        ?.match(/#[a-zA-Z0-9]+/g)
        ?.map((tag) => tag.slice(1).toLowerCase()) || post.hashtags;

    const mentions =
      args.content?.match(/@[a-zA-Z0-9]+/g)?.map((mention) => mention.slice(1)) || post.mentions;

    await ctx.db.patch(args.postId, {
      content: args.content,
      mediaUrls: args.mediaUrls,
      mediaType: args.mediaType,
      hashtags,
      mentions,
      category: args.category,
      visibility: args.visibility,
      equipment: args.equipment,
      software: args.software,
      customFields: args.customFields,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Pin a post to user profile
 */
export const pinPost = mutation({
  args: {
    postId: v.id("posts"),
    clerkId: v.string(),
    pinned: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getNativeUser(ctx, args.clerkId);
    if (!user) {
      throw new Error("User not found");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.authorId !== user._id) {
      throw new Error("Unauthorized to pin this post");
    }

    await ctx.db.patch(args.postId, {
      pinned: args.pinned,
      updatedAt: Date.now(),
    });

    return { success: true, pinned: args.pinned };
  },
});

/**
 * Increment post view count
 */
export const incrementViewCount = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    await ctx.db.patch(args.postId, {
      engagement: {
        ...post.engagement,
        viewsCount: ((post.engagement as any)?.viewsCount || 0) + 1,
      },
    });

    return { success: true };
  },
});

/**
 * Share post (external share tracking)
 */
export const sharePost = mutation({
  args: {
    postId: v.id("posts"),
    platform: v.string(), // twitter, facebook, instagram, linkedin, copy_link
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    await ctx.db.patch(args.postId, {
      engagement: {
        ...post.engagement,
        sharesCount: ((post.engagement as any)?.sharesCount || 0) + 1,
      },
    });

    return { success: true };
  },
});

// =====================================================
// USER BLOCKING
// =====================================================

/**
 * Block a user
 */
export const blockUser = mutation({
  args: {
    blockerId: v.string(), // Clerk ID
    blockedId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const blocker = await getNativeUser(ctx, args.blockerId);
    if (!blocker) {
      throw new Error("User not found");
    }

    if (blocker._id === args.blockedId) {
      throw new Error("Cannot block yourself");
    }

    // Check if already blocked
    const existing = await ctx.db
      .query("userBlocks")
      .withIndex("by_pair", (q) =>
        q.eq("blockerId", blocker._id).eq("blockedId", args.blockedId)
      )
      .first();

    if (existing) {
      return { success: true, alreadyBlocked: true };
    }

    // Create block
    await ctx.db.insert("userBlocks", {
      blockerId: blocker._id,
      blockedId: args.blockedId,
      createdAt: Date.now(),
    });

    // Unfollow if following
    const followRelationship = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", blocker._id).eq("followingId", args.blockedId)
      )
      .first();

    if (followRelationship) {
      await ctx.db.delete(followRelationship._id);
    }

    return { success: true, alreadyBlocked: false };
  },
});

/**
 * Unblock a user
 */
export const unblockUser = mutation({
  args: {
    blockerId: v.string(), // Clerk ID
    blockedId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const blocker = await getNativeUser(ctx, args.blockerId);
    if (!blocker) {
      throw new Error("User not found");
    }

    const block = await ctx.db
      .query("userBlocks")
      .withIndex("by_pair", (q) =>
        q.eq("blockerId", blocker._id).eq("blockedId", args.blockedId)
      )
      .first();

    if (block) {
      await ctx.db.delete(block._id);
      return { success: true, wasBlocked: true };
    }

    return { success: true, wasBlocked: false };
  },
});

/**
 * Get blocked users
 */
export const getBlockedUsers = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getNativeUser(ctx, args.clerkId);
    if (!user) {
      return [];
    }

    const blocks = await ctx.db
      .query("userBlocks")
      .withIndex("by_blocker", (q) => q.eq("blockerId", user._id))
      .collect();

    const blockedUsers = await Promise.all(
      blocks.map(async (block) => {
        const blockedUser = await ctx.db.get(block.blockedId);
        return blockedUser
          ? {
              _id: blockedUser._id,
              clerkId: blockedUser.clerkId,
              displayName: blockedUser.displayName || blockedUser.username,
              avatarUrl: blockedUser.avatarUrl,
              blockedAt: block.createdAt,
            }
          : null;
      })
    );

    return blockedUsers.filter((u) => u !== null);
  },
});

/**
 * Check if user is blocked
 */
export const isBlocked = query({
  args: {
    clerkId: v.string(),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getNativeUser(ctx, args.clerkId);
    if (!user) {
      return { blocked: false, blockedBy: false };
    }

    const blocked = await ctx.db
      .query("userBlocks")
      .withIndex("by_pair", (q) =>
        q.eq("blockerId", user._id).eq("blockedId", args.targetUserId)
      )
      .first();

    const blockedBy = await ctx.db
      .query("userBlocks")
      .withIndex("by_pair", (q) =>
        q.eq("blockerId", args.targetUserId).eq("blockedId", user._id)
      )
      .first();

    return {
      blocked: !!blocked,
      blockedBy: !!blockedBy,
    };
  },
});

// =====================================================
// CONTENT REPORTING
// =====================================================

/**
 * Report a post, comment, or user
 */
export const reportContent = mutation({
  args: {
    reporterId: v.string(), // Clerk ID
    targetId: v.string(), // Post ID, Comment ID, or User ID
    targetType: v.string(), // post, comment, user
    reason: v.string(), // spam, harassment, inappropriate, violence, scam, other
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const reporter = await getNativeUser(ctx, args.reporterId);
    if (!reporter) {
      throw new Error("Reporter not found");
    }

    // Check if already reported
    const existing = await ctx.db
      .query("contentReports")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.targetId).eq("targetType", args.targetType)
      )
      .filter((q) => q.eq(q.field("reporterId"), reporter._id))
      .first();

    if (existing) {
      return { success: true, alreadyReported: true };
    }

    await ctx.db.insert("contentReports", {
      reporterId: reporter._id,
      targetId: args.targetId,
      targetType: args.targetType,
      reason: args.reason,
      description: args.description,
      status: "Pending",
      createdAt: Date.now(),
    });

    return { success: true, alreadyReported: false };
  },
});

/**
 * Get reports for admin review
 */
export const getReports = query({
  args: {
    status: v.optional(v.string()), // Pending, Reviewing, Resolved, Dismissed
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const reports = await (args.status
      ? ctx.db
          .query("contentReports")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
      : ctx.db.query("contentReports")
    )
      .order("desc")
      .take(limit);

    // Enrich with reporter and target info
    const enriched = await Promise.all(
      reports.map(async (report) => {
        const reporter = await ctx.db.get(report.reporterId);
        let target = null;

        if (report.targetType === "user") {
          target = await ctx.db.get(report.targetId as any);
        } else if (report.targetType === "post") {
          target = await ctx.db.get(report.targetId as any);
        } else if (report.targetType === "comment") {
          target = await ctx.db.get(report.targetId as any);
        }

        return {
          ...report,
          reporter: reporter
            ? {
                _id: reporter._id,
                displayName: reporter.displayName || reporter.username,
                avatarUrl: reporter.avatarUrl,
              }
            : null,
          target,
        };
      })
    );

    return enriched;
  },
});

/**
 * Update report status (admin only)
 */
export const updateReportStatus = mutation({
  args: {
    reportId: v.id("contentReports"),
    status: v.string(), // Reviewing, Resolved, Dismissed
    resolution: v.optional(v.string()),
    reviewedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    await ctx.db.patch(args.reportId, {
      status: args.status,
      resolution: args.resolution,
      reviewedBy: args.reviewedBy,
      reviewedAt: Date.now(),
    });

    return { success: true };
  },
});

// =====================================================
// ADVANCED FEED ALGORITHMS
// =====================================================

/**
 * Get personalized "For You" feed
 * Uses collaborative filtering and engagement signals
 */
export const getForYouFeed = query({
  args: {
    clerkId: v.optional(v.string()),
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const skip = args.skip || 0;

    // If no user, return trending posts
    if (!args.clerkId) {
      const allPosts = await ctx.db
        .query("posts")
        .withIndex("by_created")
        .order("desc")
        .take(100);

      const validPosts = allPosts.filter(
        (p) => !p.deletedAt && p.visibility === "public"
      );

      const trending = validPosts
        .sort((a, b) => {
          const aScore =
            (a.engagement?.likesCount || 0) * 2 +
            (a.engagement?.commentsCount || 0) * 3 +
            (a.engagement?.repostsCount || 0) * 4 +
            (a.engagement?.savesCount || 0) * 5;
          const bScore =
            (b.engagement?.likesCount || 0) * 2 +
            (b.engagement?.commentsCount || 0) * 3 +
            (b.engagement?.repostsCount || 0) * 4 +
            (b.engagement?.savesCount || 0) * 5;
          return bScore - aScore;
        })
        .slice(skip, skip + limit);

      return trending;
    }

    const user = await getNativeUser(ctx, args.clerkId);
    if (!user) {
      return [];
    }

    // Get user's interests from profile
    const userGenres = user.genres || [];
    const userSkills = user.skills || [];
    const userAccountTypes = user.accountTypes || [];

    // Get recent posts
    const recentPosts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(200);

    const validPosts = recentPosts.filter(
      (p) => !p.deletedAt && p.visibility === "public"
    );

    // Score posts based on relevance
    const scoredPosts = await Promise.all(
      validPosts.map(async (post) => {
        let score = 0;

        // Content relevance
        if (
          post.category &&
          userAccountTypes.includes(post.category as any)
        ) {
          score += 10;
        }

        // Genre matching
        if (post.hashtags) {
          const matchingGenres = post.hashtags.filter((tag) =>
            userGenres.includes(tag)
          );
          score += matchingGenres.length * 3;
        }

        // Engagement weighting (recent high-engagement posts)
        const engagementScore =
          (post.engagement?.likesCount || 0) * 0.5 +
          (post.engagement?.commentsCount || 0) * 1 +
          (post.engagement?.repostsCount || 0) * 1.5 +
          (post.engagement?.savesCount || 0) * 2;
        score += engagementScore * 0.1;

        // Recency boost
        const hoursSinceCreation =
          (Date.now() - post.createdAt) / (1000 * 60 * 60);
        if (hoursSinceCreation < 24) {
          score += 5;
        } else if (hoursSinceCreation < 48) {
          score += 3;
        } else if (hoursSinceCreation < 72) {
          score += 1;
        }

        // Follow boost (posts from followed users)
        const isFollowing = await ctx.db
          .query("follows")
          .withIndex("by_pair", (q) =>
            q.eq("followerId", user._id).eq("followingId", post.authorId)
          )
          .first();

        if (isFollowing) {
          score += 15;
        }

        return { post, score };
      })
    );

    // Sort by score and paginate
    return scoredPosts
      .sort((a, b) => b.score - a.score)
      .slice(skip, skip + limit)
      .map((item) => item.post);
  },
});

/**
 * Get posts from followed users with smart filtering
 */
export const getFollowingFeed = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const skip = args.skip || 0;

    const user = await getNativeUser(ctx, args.clerkId);
    if (!user) {
      return [];
    }

    // Get who user follows
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect();

    const followingIds = follows.map((f) => f.followingId);

    // Include user's own posts
    followingIds.push(user._id);

    // Get recent posts from followed users
    const recentPosts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(200);

    // Filter and sort
    const feedPosts = recentPosts
      .filter((post) => followingIds.includes(post.authorId))
      .filter((post) => !post.deletedAt && post.visibility === "public")
      .slice(skip, skip + limit);

    return feedPosts;
  },
});

// =====================================================
// FEED CUSTOMIZATION
// =====================================================

/**
 * Mute a user's posts (hide from feed without unfollowing)
 */
export const muteUser = mutation({
  args: {
    muterId: v.string(), // Clerk ID
    mutedId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const muter = await getNativeUser(ctx, args.muterId);
    if (!muter) {
      throw new Error("User not found");
    }

    // Check if already muted
    const existing = await ctx.db
      .query("userBlocks")
      .withIndex("by_blocker", (q) => q.eq("blockerId", muter._id))
      .filter((q) => q.eq(q.field("blockedId"), args.mutedId))
      .first();

    if (existing) {
      return { success: true, alreadyMuted: true };
    }

    await ctx.db.insert("userBlocks", {
      blockerId: muter._id,
      blockedId: args.mutedId,
      createdAt: Date.now(),
    });

    return { success: true, alreadyMuted: false };
  },
});

/**
 * Unmute a user
 */
export const unmuteUser = mutation({
  args: {
    muterId: v.string(), // Clerk ID
    mutedId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const muter = await getNativeUser(ctx, args.muterId);
    if (!muter) {
      throw new Error("User not found");
    }

    const block = await ctx.db
      .query("userBlocks")
      .withIndex("by_pair", (q) =>
        q.eq("blockerId", muter._id).eq("blockedId", args.mutedId)
      )
      .first();

    if (block) {
      await ctx.db.delete(block._id);
      return { success: true, wasMuted: true };
    }

    return { success: true, wasMuted: false };
  },
});

// =====================================================
// POST ANALYTICS
// =====================================================

/**
 * Get detailed analytics for a post
 */
export const getPostAnalytics = query({
  args: {
    postId: v.id("posts"),
    clerkId: v.string(), // For authorization
  },
  handler: async (ctx, args) => {
    const user = await getNativeUser(ctx, args.clerkId);
    if (!user) {
      throw new Error("User not found");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Only post author can see detailed analytics
    if (post.authorId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Get reactions breakdown
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.postId).eq("targetType", "post")
      )
      .collect();

    const reactionBreakdown: Record<string, number> = {};
    reactions.forEach((r) => {
      reactionBreakdown[r.emoji] = (reactionBreakdown[r.emoji] || 0) + 1;
    });

    // Get comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    // Get reposts
    const reposts = await ctx.db
      .query("posts")
      .withIndex("by_repost_of", (q) => q.eq("repostOf", args.postId))
      .collect();

    // Get saves
    const saves = await ctx.db
      .query("savedPosts")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    return {
      postId: post._id,
      createdAt: post.createdAt,
      engagement: {
        views: (post.engagement as any)?.viewsCount || 0,
        likes: post.engagement?.likesCount || 0,
        comments: comments.length,
        reposts: reposts.length,
        saves: saves.length,
        shares: (post.engagement as any)?.sharesCount || 0,
      },
      reactionBreakdown,
      topComments: comments
        .sort((a, b) => (b.reactionCount || 0) - (a.reactionCount || 0))
        .slice(0, 5),
    };
  },
});