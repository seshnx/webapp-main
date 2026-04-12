import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// =====================================================
// USER & PROFILE MIGRATIONS
// =====================================================

/**
 * Migrate users from Neon to Convex
 * Merges clerk_users and profiles tables
 */
export const migrateUsers = mutation({
  args: {
    users: v.array(v.object({
      clerkId: v.string(),
      email: v.string(),
      username: v.optional(v.string()),
      emailVerified: v.optional(v.boolean()),
      displayName: v.optional(v.string()),
      bio: v.optional(v.string()),
      headline: v.optional(v.string()),
      avatarUrl: v.optional(v.string()),
      bannerUrl: v.optional(v.string()),
      location: v.optional(v.string()),
      website: v.optional(v.string()),
      skills: v.optional(v.array(v.string())),
      genres: v.optional(v.array(v.string())),
      instruments: v.optional(v.array(v.string())),
      software: v.optional(v.array(v.string())),
      accountTypes: v.array(v.string()),
      activeRole: v.optional(v.string()),
      subRoles: v.optional(v.array(v.string())),
      schoolId: v.optional(v.string()),
      studentId: v.optional(v.string()),
      staffId: v.optional(v.string()),
      internId: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    const results = {
      migrated: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const user of args.users) {
      try {
        // Check if user already exists
        const existing = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", user.clerkId))
          .first();

        if (existing) {
          // Update existing user
          await ctx.db.patch(existing._id, {
            email: user.email,
            username: user.username,
            displayName: user.displayName,
            bio: user.bio,
            headline: user.headline,
            avatarUrl: user.avatarUrl,
            bannerUrl: user.bannerUrl,
            location: user.location,
            website: user.website,
            skills: user.skills,
            genres: user.genres,
            instruments: user.instruments,
            software: user.software,
            accountTypes: user.accountTypes,
            activeRole: user.activeRole,
            subRoles: user.subRoles,
            updatedAt: user.updatedAt,
            lastActiveAt: user.updatedAt,
          });
          results.updated++;
        } else {
          // Insert new user
          await ctx.db.insert("users", {
            clerkId: user.clerkId,
            email: user.email,
            username: user.username,
            emailVerified: user.emailVerified ?? false,
            displayName: user.displayName,
            bio: user.bio,
            headline: user.headline,
            avatarUrl: user.avatarUrl,
            bannerUrl: user.bannerUrl,
            location: user.location,
            website: user.website,
            skills: user.skills,
            genres: user.genres,
            instruments: user.instruments,
            software: user.software,
            accountTypes: user.accountTypes,
            activeRole: user.activeRole,
            subRoles: user.subRoles,
            stats: {
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              bookingsCount: 0,
            },
            settings: {
              privacy: "public",
              notificationsEnabled: true,
              showEmail: false,
              showLocation: true,
            },
            schoolId: user.schoolId ? (user.schoolId as any) : undefined,
            studentId: user.studentId,
            staffId: user.staffId,
            internId: user.internId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastActiveAt: user.updatedAt,
          });
          results.migrated++;
        }
      } catch (error) {
        results.errors.push(`User ${user.clerkId}: ${error}`);
        results.skipped++;
      }
    }

    return results;
  },
});

// =====================================================
// POST MIGRATIONS
// =====================================================

/**
 * Migrate posts from MongoDB to Convex
 */
export const migratePosts = mutation({
  args: {
    posts: v.array(v.object({
      id: v.string(),
      author_id: v.string(),
      content: v.optional(v.string()),
      media_urls: v.optional(v.array(v.string())),
      media_type: v.optional(v.string()),
      hashtags: v.optional(v.array(v.string())),
      mentions: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      visibility: v.string(),
      repost_of: v.optional(v.string()),
      parent_id: v.optional(v.string()),
      equipment: v.optional(v.array(v.string())),
      software: v.optional(v.array(v.string())),
      custom_fields: v.optional(v.any()),
      created_at: v.number(),
      updated_at: v.number(),
      deleted_at: v.optional(v.number()),
    }))
  },
  handler: async (ctx, args) => {
    const results = {
      migrated: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const post of args.posts) {
      try {
        // Find author by clerk ID
        const author = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", post.author_id))
          .first();

        if (!author) {
          results.errors.push(`Post ${post.id}: Author not found`);
          results.skipped++;
          continue;
        }

        // Check for repost
        let repostOf = undefined;
        if (post.repost_of) {
          const originalPost = await ctx.db
            .query("posts")
            .filter((q) => q.eq(q.field("postId"), post.repost_of))
            .first();
          repostOf = originalPost?._id;
        }

        // Check for parent post
        let parentId = undefined;
        if (post.parent_id) {
          const parentPost = await ctx.db
            .query("posts")
            .filter((q) => q.eq(q.field("postId"), post.parent_id))
            .first();
          parentId = parentPost?._id;
        }

        // Check if post already exists
        const existing = await ctx.db
          .query("posts")
          .filter((q) => q.eq(q.field("postId"), post.id))
          .first();

        if (existing) {
          // Update existing post
          await ctx.db.patch(existing._id, {
            content: post.content,
            mediaUrls: post.media_urls,
            mediaType: post.media_type,
            hashtags: post.hashtags,
            mentions: post.mentions,
            category: post.category,
            visibility: post.visibility,
            repostOf,
            parentId,
            equipment: post.equipment,
            software: post.software,
            customFields: post.custom_fields,
            deletedAt: post.deleted_at,
            updatedAt: post.updated_at,
          });
          results.updated++;
        } else {
          // Insert new post
          await ctx.db.insert("posts", {
            postId: post.id,
            authorId: author._id,
            authorName: author.displayName,
            authorPhoto: author.avatarUrl,
            authorUsername: author.username,
            role: author.activeRole,
            content: post.content,
            mediaUrls: post.media_urls,
            mediaType: post.media_type,
            hashtags: post.hashtags,
            mentions: post.mentions,
            category: post.category,
            visibility: post.visibility,
            repostOf,
            parentId,
            equipment: post.equipment,
            software: post.software,
            customFields: post.custom_fields,
            engagement: {
              likesCount: 0,
              commentsCount: 0,
              repostsCount: 0,
              savesCount: 0,
            },
            deletedAt: post.deleted_at,
            createdAt: post.created_at,
            updatedAt: post.updated_at,
          });
          results.migrated++;
        }
      } catch (error) {
        results.errors.push(`Post ${post.id}: ${error}`);
        results.skipped++;
      }
    }

    return results;
  },
});

// =====================================================
// COMMENT MIGRATIONS
// =====================================================

/**
 * Migrate comments from MongoDB to Convex
 */
export const migrateComments = mutation({
  args: {
    comments: v.array(v.object({
      id: v.string(),
      post_id: v.string(),
      author_id: v.string(),
      content: v.string(),
      parent_id: v.optional(v.string()),
      reaction_count: v.number(),
      created_at: v.number(),
      updated_at: v.optional(v.number()),
      deleted_at: v.optional(v.number()),
    }))
  },
  handler: async (ctx, args) => {
    const results = {
      migrated: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const comment of args.comments) {
      try {
        // Find post
        const post = await ctx.db
          .query("posts")
          .filter((q) => q.eq(q.field("postId"), comment.post_id))
          .first();

        if (!post) {
          results.errors.push(`Comment ${comment.id}: Post not found`);
          results.skipped++;
          continue;
        }

        // Find author
        const author = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", comment.author_id))
          .first();

        if (!author) {
          results.errors.push(`Comment ${comment.id}: Author not found`);
          results.skipped++;
          continue;
        }

        // Check for parent comment
        let parentId = undefined;
        if (comment.parent_id) {
          const parentComment = await ctx.db
            .query("comments")
            .filter((q) => q.eq(q.field("commentId"), comment.parent_id))
            .first();
          parentId = parentComment?._id;
        }

        // Check if comment already exists
        const existing = await ctx.db
          .query("comments")
          .filter((q) => q.eq(q.field("commentId"), comment.id))
          .first();

        if (existing) {
          // Update existing comment
          await ctx.db.patch(existing._id, {
            content: comment.content,
            parentId,
            reactionCount: comment.reaction_count,
            deletedAt: comment.deleted_at,
            updatedAt: comment.updated_at,
          });
          results.updated++;
        } else {
          // Insert new comment
          await ctx.db.insert("comments", {
            postId: post._id,
            commentId: comment.id,
            authorId: author._id,
            authorName: author.displayName,
            authorPhoto: author.avatarUrl,
            content: comment.content,
            parentId,
            reactionCount: comment.reaction_count,
            deletedAt: comment.deleted_at,
            createdAt: comment.created_at,
            updatedAt: comment.updated_at,
          });
          results.migrated++;
        }
      } catch (error) {
        results.errors.push(`Comment ${comment.id}: ${error}`);
        results.skipped++;
      }
    }

    return results;
  },
});

// =====================================================
// REACTION MIGRATIONS
// =====================================================

/**
 * Migrate reactions from MongoDB to Convex
 */
export const migrateReactions = mutation({
  args: {
    reactions: v.array(v.object({
      target_id: v.string(),
      target_type: v.string(),
      emoji: v.string(),
      user_id: v.string(),
      created_at: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    const results = {
      migrated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const reaction of args.reactions) {
      try {
        // Find user
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", reaction.user_id))
          .first();

        if (!user) {
          results.errors.push(`Reaction: User ${reaction.user_id} not found`);
          results.skipped++;
          continue;
        }

        // Check if reaction already exists
        const existing = await ctx.db
          .query("reactions")
          .withIndex("by_user_target", (q) =>
            q
              .eq("userId", user._id)
              .eq("targetId", reaction.target_id)
              .eq("targetType", reaction.target_type as "post" | "comment")
          )
          .first();

        if (existing) {
          results.skipped++;
          continue;
        }

        // Insert reaction
        await ctx.db.insert("reactions", {
          targetId: reaction.target_id,
          targetType: reaction.target_type as "post" | "comment",
          emoji: reaction.emoji,
          userId: user._id,
          timestamp: reaction.created_at,
        });

        results.migrated++;
      } catch (error) {
        results.errors.push(`Reaction: ${error}`);
        results.skipped++;
      }
    }

    return results;
  },
});

// =====================================================
// FOLLOW MIGRATIONS
// =====================================================

/**
 * Migrate follows from MongoDB to Convex
 */
export const migrateFollows = mutation({
  args: {
    follows: v.array(v.object({
      follower_id: v.string(),
      following_id: v.string(),
      created_at: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    const results = {
      migrated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const follow of args.follows) {
      try {
        // Find users
        const follower = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", follow.follower_id))
          .first();

        const following = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", follow.following_id))
          .first();

        if (!follower || !following) {
          results.errors.push(`Follow: Users not found`);
          results.skipped++;
          continue;
        }

        // Check if follow already exists
        const existing = await ctx.db
          .query("follows")
          .withIndex("by_pair", (q) =>
            q.eq("followerId", follower._id).eq("followingId", following._id)
          )
          .first();

        if (existing) {
          results.skipped++;
          continue;
        }

        // Insert follow
        await ctx.db.insert("follows", {
          followerId: follower._id,
          followingId: following._id,
          createdAt: follow.created_at,
        });

        results.migrated++;
      } catch (error) {
        results.errors.push(`Follow: ${error}`);
        results.skipped++;
      }
    }

    return results;
  },
});

// =====================================================
// VALIDATION QUERIES
// =====================================================

/**
 * Validate migration by counting records
 */
export const validateMigration = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const posts = await ctx.db.query("posts").collect();
    const comments = await ctx.db.query("comments").collect();
    const reactions = await ctx.db.query("reactions").collect();
    const follows = await ctx.db.query("follows").collect();

    return {
      users: users.length,
      posts: posts.length,
      comments: comments.length,
      reactions: reactions.length,
      follows: follows.length,
    };
  },
});
