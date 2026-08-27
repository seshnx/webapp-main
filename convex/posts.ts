import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Convex Posts Module
 *
 * Queries for the posts table with deleted-user resolution.
 * When an author's account has been deleted (no clerkId, or user record missing),
 * the post's authorName is overridden to "[Deleted User]".
 * 
 * For active users, the post's original authorName is preserved to maintain
 * role-based display names (Studio Name, Artist Stagename, Producer Tag, etc.)
 * chosen at the time of posting.
 */

/**
 * Resolve post author - check if user is still active, override name if deleted.
 * Preserves original role-based display name for active users.
 */
const resolvePostAuthor = async (ctx: any, post: any) => {
  if (!post) return null;

  let author = null;
  if (post.authorId) {
    try {
      author = await ctx.db.get(post.authorId);
    } catch (e) {
      // authorId might not be a valid document ID
    }
  }

  // Resolve repost original if this post is a repost
  let originalPost = null;
  if (post.repostOf) {
    try {
      const rawOriginal: any = await ctx.db.get(post.repostOf);
      if (rawOriginal && !rawOriginal.deletedAt) {
        let origAuthor = null;
        if (rawOriginal.authorId) {
          try {
            origAuthor = await ctx.db.get(rawOriginal.authorId);
          } catch (e) {}
          if (!origAuthor) {
            try {
              origAuthor = await ctx.db
                .query("users")
                .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", String(rawOriginal.authorId)))
                .first();
            } catch (e) {}
          }
        }
        originalPost = {
          ...rawOriginal,
          id: rawOriginal._id,
          authorClerkId: origAuthor?.clerkId,
          displayName: rawOriginal.displayName || rawOriginal.authorName || origAuthor?.displayName || origAuthor?.profileName || "Creator",
          username: rawOriginal.username || rawOriginal.authorUsername || origAuthor?.username || "user",
          authorPhoto: rawOriginal.authorPhoto || origAuthor?.imageUrl || origAuthor?.avatarUrl,
          role: rawOriginal.role || origAuthor?.activeProfileRole,
          content: rawOriginal.content,
          text: rawOriginal.content || rawOriginal.text,
          mediaAttachments: rawOriginal.mediaAttachments,
          attachments: rawOriginal.attachments,
          mediaUrls: rawOriginal.mediaUrls,
          imageUrl: rawOriginal.imageUrl,
          audioUrl: rawOriginal.audioUrl,
          audioName: rawOriginal.audioName,
          equipment: rawOriginal.equipment,
          software: rawOriginal.software,
          createdAt: rawOriginal.createdAt,
          amendments: rawOriginal.amendments,
        };
      } else {
        originalPost = {
          isDeleted: true,
          displayName: "[Deleted Post]",
        };
      }
    } catch (e) {
      originalPost = null;
    }
  }

  const isDeletedOrMissing =
    !author ||
    !author.clerkId ||
    (!author.profileName && !author.username && !author.displayName && !author.firstName);

  if (isDeletedOrMissing) {
    return {
      ...post,
      authorName: "[Deleted User]",
      authorUsername: "deleted",
      authorPhoto: undefined,
      displayName: "[Deleted User]",
      username: "deleted",
      originalPost,
    };
  }

  // Keep the role-based name from the post document — do NOT override with user profile name
  return {
    ...post,
    authorClerkId: author.clerkId,
    displayName: post.authorName || author.displayName || author.profileName || "User",
    username: post.authorUsername || author.username || "user",
    originalPost,
  };
};

/**
 * Get recent posts - real-time query
 */
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .filter((q: any) => q.eq(q.field("deletedAt"), undefined))
      .take(limit);

    return await Promise.all(posts.map((p: any) => resolvePostAuthor(ctx, p)));
  },
});

/**
 * Get posts by specific user IDs - for "Following" feed
 */
export const listByIds = query({
  args: {
    userIds: v.array(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    // Get recent posts and filter to followed users
    const allPosts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .filter((q: any) => q.eq(q.field("deletedAt"), undefined))
      .take(limit * 2); // Fetch extra to account for filtering

    // Filter to only posts from followed users
    // Note: authorId is a Convex document ID, but userIds may be Clerk IDs
    // We need to match both formats
    const filteredPosts = allPosts.filter((post: any) => {
      const authorIdStr = String(post.authorId);
      return args.userIds.includes(authorIdStr);
    });

    return await Promise.all(
      filteredPosts.slice(0, limit).map((p: any) => resolvePostAuthor(ctx, p))
    );
  },
});

/**
 * Get posts by author - real-time query
 */
export const listByAuthor = query({
  args: {
    authorId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    // Try to find user by Clerk ID to get the Convex document ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", args.authorId))
      .first();

    if (!user) return [];

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q: any) => q.eq("authorId", user._id))
      .order("desc")
      .filter((q: any) => q.eq(q.field("deletedAt"), undefined))
      .take(limit);

    return await Promise.all(posts.map((p: any) => resolvePostAuthor(ctx, p)));
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
    try {
      const post: any = await ctx.db.get(args.postId as any);
      if (!post || post.deletedAt) return null;
      return resolvePostAuthor(ctx, post);
    } catch {
      return null;
    }
  },
});
