import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// =====================================================
// SOCIAL NOTIFICATIONS INTEGRATION
// Automatically creates notifications for social actions
// =====================================================

// Helper function to create notifications
const createNotification = async (
  ctx: any,
  recipientId: any,
  type: string,
  title: string,
  message: string,
  actorId: any,
  actorName: string,
  actorPhoto: string | null | undefined,
  targetId: string | null | undefined,
  targetType: string | null | undefined,
  metadata: any = null
) => {
  await ctx.db.insert("notifications", {
    userId: recipientId,
    type,
    title,
    message,
    actorId,
    actorName,
    actorPhoto,
    targetId,
    targetType,
    read: false,
    readAt: undefined,
    metadata,
    createdAt: Date.now(),
  });
};

// Helper to get user info
const getUserInfo = async (ctx: any, userId: any) => {
  const user = await ctx.db.get(userId);
  if (!user) return null;
  return {
    _id: user._id,
    displayName: user.displayName || user.username || "Someone",
    avatarUrl: user.avatarUrl,
  };
};

// =====================================================
// NOTIFICATION TRIGGERS
// =====================================================

/**
 * Create notification when someone follows a user
 */
export const notifyFollow = mutation({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const follower = await getUserInfo(ctx, args.followerId);
    if (!follower) return { success: false };

    const following = await ctx.db.get(args.followingId);
    if (!following) return { success: false };

    await createNotification(
      ctx,
      args.followingId,
      "follow",
      "New follower",
      `${follower.displayName} started following you`,
      args.followerId,
      follower.displayName,
      follower.avatarUrl,
      undefined,
      undefined,
      { followerClerkId: following.clerkId }
    );

    return { success: true };
  },
});

/**
 * Create notification when someone likes a post
 */
export const notifyPostLike = mutation({
  args: {
    postId: v.id("posts"),
    likerId: v.id("users"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return { success: false };

    // Don't notify if liking own post
    if (post.authorId === args.likerId) {
      return { success: true };
    }

    const liker = await getUserInfo(ctx, args.likerId);
    if (!liker) return { success: false };

    const emojiMap: Record<string, string> = {
      "❤️": "loved",
      "👍": "liked",
      "🔥": "fired up",
      "👏": "applauded",
      "🎉": "celebrated",
    };

    const action = emojiMap[args.emoji] || "reacted to";

    await createNotification(
      ctx,
      post.authorId,
      "like",
      `${action} your post`,
      `${liker.displayName} ${action} your post`,
      args.likerId,
      liker.displayName,
      liker.avatarUrl,
      args.postId,
      "post",
      { emoji: args.emoji }
    );

    return { success: true };
  },
});

/**
 * Create notification when someone comments on a post
 */
export const notifyPostComment = mutation({
  args: {
    postId: v.id("posts"),
    commentId: v.id("comments"),
    commenterId: v.id("users"),
    commentContent: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return { success: false };

    // Don't notify if commenting on own post
    if (post.authorId === args.commenterId) {
      return { success: true };
    }

    const commenter = await getUserInfo(ctx, args.commenterId);
    if (!commenter) return { success: false };

    const preview =
      args.commentContent.length > 50
        ? args.commentContent.substring(0, 50) + "..."
        : args.commentContent;

    await createNotification(
      ctx,
      post.authorId,
      "comment",
      "New comment",
      `${commenter.displayName} commented: "${preview}"`,
      args.commenterId,
      commenter.displayName,
      commenter.avatarUrl,
      args.postId,
      "post",
      { commentId: args.commentId, commentContent: args.commentContent }
    );

    return { success: true };
  },
});

/**
 * Create notification when someone replies to a comment
 */
export const notifyCommentReply = mutation({
  args: {
    postId: v.id("posts"),
    parentCommentId: v.id("comments"),
    replyId: v.id("comments"),
    replierId: v.id("users"),
    replyContent: v.string(),
  },
  handler: async (ctx, args) => {
    const parentComment = await ctx.db.get(args.parentCommentId);
    if (!parentComment) return { success: false };

    // Don't notify if replying to own comment
    if (parentComment.authorId === args.replierId) {
      return { success: true };
    }

    const replier = await getUserInfo(ctx, args.replierId);
    if (!replier) return { success: false };

    const preview =
      args.replyContent.length > 50
        ? args.replyContent.substring(0, 50) + "..."
        : args.replyContent;

    await createNotification(
      ctx,
      parentComment.authorId,
      "comment_reply",
      "Reply to your comment",
      `${replier.displayName} replied: "${preview}"`,
      args.replierId,
      replier.displayName,
      replier.avatarUrl,
      args.postId,
      "comment",
      {
        commentId: args.replyId,
        parentCommentId: args.parentCommentId,
        replyContent: args.replyContent,
      }
    );

    return { success: true };
  },
});

/**
 * Create notification when someone mentions a user
 */
export const notifyMention = mutation({
  args: {
    mentionedUserId: v.id("users"),
    postId: v.id("posts"),
    mentionerId: v.id("users"),
    postContent: v.string(),
  },
  handler: async (ctx, args) => {
    // Don't notify if mentioning yourself
    if (args.mentionedUserId === args.mentionerId) {
      return { success: true };
    }

    const mentioner = await getUserInfo(ctx, args.mentionerId);
    if (!mentioner) return { success: false };

    const preview =
      args.postContent.length > 100
        ? args.postContent.substring(0, 100) + "..."
        : args.postContent;

    await createNotification(
      ctx,
      args.mentionedUserId,
      "mention",
      "You were mentioned",
      `${mentioner.displayName} mentioned you in a post`,
      args.mentionerId,
      mentioner.displayName,
      mentioner.avatarUrl,
      args.postId,
      "post",
      { postContent: args.postContent }
    );

    return { success: true };
  },
});

/**
 * Create notification when someone reposts
 */
export const notifyRepost = mutation({
  args: {
    originalPostId: v.id("posts"),
    repostId: v.id("posts"),
    reposterId: v.id("users"),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const originalPost = await ctx.db.get(args.originalPostId);
    if (!originalPost) return { success: false };

    // Don't notify if reposting own post
    if (originalPost.authorId === args.reposterId) {
      return { success: true };
    }

    const reposter = await getUserInfo(ctx, args.reposterId);
    if (!reposter) return { success: false };

    let message = `${reposter.displayName} reposted your post`;
    if (args.comment) {
      message += ` and added: "${args.comment.substring(0, 50)}${args.comment.length > 50 ? "..." : ""}"`;
    }

    await createNotification(
      ctx,
      originalPost.authorId,
      "repost",
      "Your post was reposted",
      message,
      args.reposterId,
      reposter.displayName,
      reposter.avatarUrl,
      args.repostId,
      "post",
      { originalPostId: args.originalPostId, comment: args.comment }
    );

    return { success: true };
  },
});

/**
 * Create notification when someone saves a post
 */
export const notifyPostSave = mutation({
  args: {
    postId: v.id("posts"),
    saverId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return { success: false };

    // Don't notify if saving own post
    if (post.authorId === args.saverId) {
      return { success: true };
    }

    const saver = await getUserInfo(ctx, args.saverId);
    if (!saver) return { success: false };

    await createNotification(
      ctx,
      post.authorId,
      "save",
      "Your post was saved",
      `${saver.displayName} saved your post`,
      args.saverId,
      saver.displayName,
      saver.avatarUrl,
      args.postId,
      "post",
      {}
    );

    return { success: true };
  },
});

/**
 * Create notification when a post starts trending
 */
export const notifyTrendingPost = mutation({
  args: {
    postId: v.id("posts"),
    engagementThreshold: v.number(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return { success: false };

    const totalEngagement =
      (post.engagement?.likesCount || 0) +
      (post.engagement?.commentsCount || 0) +
      (post.engagement?.repostsCount || 0) +
      (post.engagement?.savesCount || 0);

    if (totalEngagement < args.engagementThreshold) {
      return { success: true };
    }

    // Check if already notified for trending
    const existingNotif = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", post.authorId))
      .filter((q) => q.eq(q.field("type"), "trending"))
      .filter((q) => q.eq(q.field("targetId"), args.postId))
      .first();

    if (existingNotif) {
      return { success: true, alreadyNotified: true };
    }

    await createNotification(
      ctx,
      post.authorId,
      "trending",
      "Your post is trending! 🚀",
      `Your post is getting lots of engagement with ${totalEngagement} interactions!`,
      undefined,
      "SeshNx",
      undefined,
      args.postId,
      "post",
      { engagementCount: totalEngagement }
    );

    return { success: true, alreadyNotified: false };
  },
});

/**
 * Create notification for welcome message
 */
export const notifyWelcome = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return { success: false };

    await createNotification(
      ctx,
      args.userId,
      "welcome",
      "Welcome to SeshNx! 🎵",
      "Get started by completing your profile and connecting with other music creators.",
      undefined,
      "SeshNx Team",
      undefined,
      undefined,
      undefined,
      {
        actionUrl: "/profile/edit",
        actionText: "Complete Profile",
      }
    );

    return { success: true };
  },
});

/**
 * Create notification for profile completion milestone
 */
export const notifyProfileCompletion = mutation({
  args: {
    userId: v.id("users"),
    completionPercentage: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return { success: false };

    let message = "";
    if (args.completionPercentage >= 80) {
      message = "Your profile is almost complete! Add a few more details to reach 100%.";
    } else if (args.completionPercentage >= 50) {
      message = "Great progress! Your profile is 50% complete. Keep going!";
    } else {
      message = "Start completing your profile to get discovered by others.";
    }

    await createNotification(
      ctx,
      args.userId,
      "profile_completion",
      "Profile Progress",
      message,
      undefined,
      "SeshNx",
      undefined,
      undefined,
      undefined,
      {
        completionPercentage: args.completionPercentage,
        actionUrl: "/profile/edit",
        actionText: "Edit Profile",
      }
    );

    return { success: true };
  },
});

/**
 * Create notification for new follower milestone
 */
export const notifyFollowerMilestone = mutation({
  args: {
    userId: v.id("users"),
    followerCount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return { success: false };

    const milestones = [10, 50, 100, 500, 1000, 5000, 10000];
    const milestone = milestones.find((m) => args.followerCount === m);

    if (!milestone) return { success: true };

    await createNotification(
      ctx,
      args.userId,
      "follower_milestone",
      "Follower Milestone! 🎉",
      `Congratulations! You now have ${milestone} followers!`,
      undefined,
      "SeshNx",
      undefined,
      undefined,
      undefined,
      { followerCount: args.followerCount, milestone }
    );

    return { success: true };
  },
});

// =====================================================
// BULK NOTIFICATIONS
// =====================================================

/**
 * Create multiple notifications at once
 * Useful for batch operations
 */
export const bulkNotify = mutation({
  args: {
    notifications: v.array(
      v.object({
        recipientId: v.id("users"),
        type: v.string(),
        title: v.string(),
        message: v.string(),
        actorId: v.optional(v.id("users")),
        actorName: v.optional(v.string()),
        actorPhoto: v.optional(v.string()),
        targetId: v.optional(v.string()),
        targetType: v.optional(v.string()),
        metadata: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, args) => {
    let created = 0;

    for (const notif of args.notifications) {
      await ctx.db.insert("notifications", {
        userId: notif.recipientId,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        actorId: notif.actorId,
        actorName: notif.actorName,
        actorPhoto: notif.actorPhoto,
        targetId: notif.targetId,
        targetType: notif.targetType,
        read: false,
        readAt: undefined,
        metadata: notif.metadata,
        createdAt: Date.now(),
      });
      created++;
    }

    return { success: true, created };
  },
});