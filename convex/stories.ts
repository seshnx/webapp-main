import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all unexpired stories (active in last 24h)
 */
export const getActiveStories = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const activeStories = await ctx.db
      .query("stories")
      .withIndex("by_expires", (q) => q.gt("expiresAt", now))
      .order("desc")
      .take(50);

    return activeStories;
  },
});

/**
 * Create a 24h ephemeral story
 */
export const createStory = mutation({
  args: {
    clerkId: v.string(),
    mediaUrl: v.string(),
    mediaType: v.string(),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours from now

    const storyId = await ctx.db.insert("stories", {
      authorId: user._id,
      authorName: user.displayName || user.firstName || "Creator",
      authorPhoto: user.avatarUrl,
      mediaUrl: args.mediaUrl,
      mediaType: args.mediaType,
      caption: args.caption,
      expiresAt,
      createdAt: now,
    });

    return storyId;
  },
});

/**
 * Record a view for a story
 */
export const markStoryViewed = mutation({
  args: {
    storyId: v.id("stories"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return;

    const existing = await ctx.db
      .query("storyViews")
      .withIndex("by_story_viewer", (q) =>
        q.eq("storyId", args.storyId).eq("viewerId", user._id)
      )
      .first();

    if (!existing) {
      await ctx.db.insert("storyViews", {
        storyId: args.storyId,
        viewerId: user._id,
        viewedAt: Date.now(),
      });
    }
  },
});
