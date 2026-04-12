import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// =====================================================
// SOCIAL SEARCH & DISCOVERY
// Advanced search and recommendation algorithms
// =====================================================

/**
 * Universal search across posts, users, and hashtags
 */
export const socialSearch = query({
  args: {
    searchQuery: v.string(),
    filters: v.optional(v.object({
      posts: v.optional(v.boolean()),
      users: v.optional(v.boolean()),
      hashtags: v.optional(v.boolean()),
    })),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const query = args.searchQuery.toLowerCase().trim();

    if (!query) {
      return { posts: [], users: [], hashtags: [] };
    }

    const filters = args.filters || { posts: true, users: true, hashtags: true };
    const results: any = {
      posts: [],
      users: [],
      hashtags: [],
    };

    // Search posts
    if (filters.posts) {
      const allPosts = await ctx.db
        .query("posts")
        .withIndex("by_created")
        .order("desc")
        .take(100);

      results.posts = allPosts
        .filter((post) => !post.deletedAt && post.visibility === "public")
        .filter((post) => {
          const inContent = post.content?.toLowerCase().includes(query);
          const inAuthor =
            post.authorName?.toLowerCase().includes(query) ||
            post.authorUsername?.toLowerCase().includes(query);
          const inHashtags = post.hashtags?.some((h) => h.toLowerCase().includes(query));
          const inCategory = post.category?.toLowerCase().includes(query);
          return inContent || inAuthor || inHashtags || inCategory;
        })
        .slice(0, limit)
        .map((post) => ({
          _id: post._id,
          content: post.content,
          authorName: post.authorName,
          authorUsername: post.authorUsername,
          authorPhoto: post.authorPhoto,
          mediaUrls: post.mediaUrls,
          createdAt: post.createdAt,
          engagement: post.engagement,
        }));
    }

    // Search users
    if (filters.users) {
      const allUsers = await ctx.db.query("users").take(100);

      results.users = allUsers
        .filter((user) => {
          const inName = user.displayName?.toLowerCase().includes(query);
          const inUsername = user.username?.toLowerCase().includes(query);
          const inBio = user.bio?.toLowerCase().includes(query);
          const inLocation = user.location?.toLowerCase().includes(query);
          const inSkills = user.skills?.some((s) => s.toLowerCase().includes(query));
          const inGenres = user.genres?.some((g) => g.toLowerCase().includes(query));
          return inName || inUsername || inBio || inLocation || inSkills || inGenres;
        })
        .slice(0, limit)
        .map((user) => ({
          _id: user._id,
          clerkId: user.clerkId,
          displayName: user.displayName || user.username,
          username: user.username,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          location: user.location,
          accountTypes: user.accountTypes,
          talentSubRole: user.talentSubRole,
          followerCount: user.stats?.followersCount || 0,
        }));
    }

    // Search hashtags
    if (filters.hashtags) {
      const recentPosts = await ctx.db
        .query("posts")
        .withIndex("by_created")
        .order("desc")
        .take(500);

      const hashtagCounts: Record<string, number> = {};
      recentPosts.forEach((post) => {
        post.hashtags?.forEach((tag) => {
          if (tag.toLowerCase().includes(query)) {
            hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
          }
        });
      });

      results.hashtags = Object.entries(hashtagCounts)
        .map(([hashtag, count]) => ({ hashtag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    }

    return results;
  },
});

/**
 * Discover content by category with smart filtering
 */
export const discoverByCategory = query({
  args: {
    category: v.string(),
    filters: v.optional(v.object({
      genres: v.optional(v.array(v.string())),
      skills: v.optional(v.array(v.string())),
      location: v.optional(v.string()),
      timeRange: v.optional(v.string()), // today, week, month, all
    })),
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const skip = args.skip || 0;

    let posts = await ctx.db
      .query("posts")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .order("desc")
      .take(200);

    // Apply filters
    if (args.filters?.genres && args.filters.genres.length > 0) {
      posts = posts.filter((post) =>
        post.hashtags?.some((tag) => args.filters!.genres!.includes(tag))
      );
    }

    if (args.filters?.location) {
      // Need to join with users to check location
      const postsWithLocation = await Promise.all(
        posts.map(async (post) => {
          const author = await ctx.db.get(post.authorId);
          return { post, author };
        })
      );

      posts = postsWithLocation
        .filter((item) => item.author?.location === args.filters?.location)
        .map((item) => item.post);
    }

    if (args.filters?.timeRange && args.filters.timeRange !== "all") {
      const now = Date.now();
      const timeRanges = {
        today: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
      };

      const cutoff = now - (timeRanges[args.filters.timeRange as keyof typeof timeRanges] || 0);
      posts = posts.filter((post) => post.createdAt >= cutoff);
    }

    return posts
      .filter((post) => !post.deletedAt && post.visibility === "public")
      .slice(skip, skip + limit);
  },
});

/**
 * Get trending topics and hashtags
 */
export const getTrendingTopics = query({
  args: {
    timeRange: v.optional(v.string()), // day, week, month
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const now = Date.now();

    const timeRanges = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    };

    const cutoff = now - (timeRanges[args.timeRange as keyof typeof timeRanges] || timeRanges.week);

    const recentPosts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(1000);

    const postsInRange = recentPosts.filter((post) => post.createdAt >= cutoff);

    // Analyze hashtags
    const hashtagCounts: Record<string, number> = {};
    const hashtagEngagement: Record<string, number> = {};

    postsInRange.forEach((post) => {
      post.hashtags?.forEach((tag) => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
        const engagement =
          (post.engagement?.likesCount || 0) +
          (post.engagement?.commentsCount || 0) +
          (post.engagement?.repostsCount || 0) +
          (post.engagement?.savesCount || 0);
        hashtagEngagement[tag] = (hashtagEngagement[tag] || 0) + engagement;
      });
    });

    // Calculate trending score (combination of frequency and engagement)
    const trending = Object.keys(hashtagCounts)
      .map((hashtag) => ({
        hashtag,
        count: hashtagCounts[hashtag],
        engagement: hashtagEngagement[hashtag],
        score: hashtagCounts[hashtag] * Math.log(hashtagEngagement[hashtag] + 1),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return trending;
  },
});

/**
 * Get suggested users to follow
 */
export const getSuggestedUsers = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return [];

    // Get users the current user is not following
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect();

    const followingIds = follows.map((f) => f.followingId);
    followingIds.push(user._id); // Exclude self

    // Get all users
    const allUsers = await ctx.db.query("users").take(200);

    // Score and filter users
    const suggestions = await Promise.all(
      allUsers
        .filter((u) => !followingIds.includes(u._id))
        .map(async (suggestedUser) => {
          let score = 0;

          // Same location boost
          if (user.location && suggestedUser.location === user.location) {
            score += 10;
          }

          // Shared genres/skills boost
          if (user.genres && suggestedUser.genres) {
            const sharedGenres = user.genres.filter((g) =>
              suggestedUser.genres?.includes(g)
            );
            score += sharedGenres.length * 3;
          }

          // Shared account types boost
          if (user.accountTypes && suggestedUser.accountTypes) {
            const sharedTypes = user.accountTypes.filter((t) =>
              suggestedUser.accountTypes?.includes(t)
            );
            score += sharedTypes.length * 2;
          }

          // Activity boost (recent posts)
          const userPosts = await ctx.db
            .query("posts")
            .withIndex("by_author", (q) => q.eq("authorId", suggestedUser._id))
            .take(10);

          const recentPosts = userPosts.filter(
            (p) => Date.now() - p.createdAt < 7 * 24 * 60 * 60 * 1000
          );
          score += recentPosts.length;

          // Follower count boost (popular users)
          const followerCount = suggestedUser.stats?.followersCount || 0;
          if (followerCount > 100) score += 5;
          if (followerCount > 500) score += 5;
          if (followerCount > 1000) score += 10;

          return {
            user: suggestedUser,
            score,
            reason: this.getSuggestionReason(user, suggestedUser, recentPosts.length),
          };
        })
    );

    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => ({
        _id: s.user._id,
        clerkId: s.user.clerkId,
        displayName: s.user.displayName || s.user.username,
        username: s.user.username,
        avatarUrl: s.user.avatarUrl,
        bio: s.user.bio,
        accountTypes: s.user.accountTypes,
        talentSubRole: s.user.talentSubRole,
        followerCount: s.user.stats?.followersCount || 0,
        reason: s.reason,
      }));
  },
});

// Helper function to generate suggestion reasons
const getSuggestionReason = (
  currentUser: any,
  suggestedUser: any,
  recentPostsCount: number
): string => {
  if (currentUser.location && suggestedUser.location === currentUser.location) {
    return "Near you";
  }

  if (
    currentUser.genres &&
    suggestedUser.genres &&
    currentUser.genres.some((g: string) => suggestedUser.genres?.includes(g))
  ) {
    return "Similar music taste";
  }

  if (
    currentUser.accountTypes &&
    suggestedUser.accountTypes &&
    currentUser.accountTypes.some((t: string) => suggestedUser.accountTypes?.includes(t))
  ) {
    return "Similar role";
  }

  if (recentPostsCount > 0) {
    return "Active creator";
  }

  if (suggestedUser.stats?.followersCount > 1000) {
    return "Popular creator";
  }

  return "Suggested for you";
};

/**
 * Get user activity feed (what users are doing)
 */
export const getUserActivity = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return [];

    // Get who user follows
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect();

    const followingIds = follows.map((f) => f.followingId);

    // Get recent activity from followed users
    const activities: any[] = [];

    // Recent posts
    const recentPosts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(100);

    for (const post of recentPosts.slice(0, limit)) {
      if (followingIds.includes(post.authorId)) {
        const author = await ctx.db.get(post.authorId);
        activities.push({
          type: "post",
          actor: author,
          post,
          createdAt: post.createdAt,
        });
      }
    }

    // Sort by time and limit
    return activities
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
      .map((activity) => ({
        type: activity.type,
        actor: {
          _id: activity.actor._id,
          displayName: activity.actor.displayName || activity.actor.username,
          username: activity.actor.username,
          avatarUrl: activity.actor.avatarUrl,
        },
        post: {
          _id: activity.post._id,
          content: activity.post.content,
          mediaUrls: activity.post.mediaUrls,
          createdAt: activity.post.createdAt,
        },
        createdAt: activity.createdAt,
      }));
  },
});

/**
 * Explore page data (trending posts, users, hashtags)
 */
export const getExploreData = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get trending posts
    const trendingPosts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(100);

    const trending = trendingPosts
      .filter((p) => !p.deletedAt && p.visibility === "public")
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
      .slice(0, 20);

    // Get suggested users
    let suggestedUsers: any[] = [];
    if (args.clerkId) {
      suggestedUsers = await ctx.runQuery(api.socialSearch.getSuggestedUsers, {
        clerkId: args.clerkId,
        limit: 10,
      });
    } else {
      // Fallback: get users with most followers
      const allUsers = await ctx.db.query("users").take(100);
      suggestedUsers = allUsers
        .sort((a, b) => (b.stats?.followersCount || 0) - (a.stats?.followersCount || 0))
        .slice(0, 10)
        .map((user) => ({
          _id: user._id,
          clerkId: user.clerkId,
          displayName: user.displayName || user.username,
          username: user.username,
          avatarUrl: user.avatarUrl,
          followerCount: user.stats?.followersCount || 0,
        }));
    }

    // Get trending hashtags
    const recentPosts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(500);

    const hashtagCounts: Record<string, number> = {};
    recentPosts.forEach((post) => {
      post.hashtags?.forEach((tag) => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      });
    });

    const trendingHashtags = Object.entries(hashtagCounts)
      .map(([hashtag, count]) => ({ hashtag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return {
      trendingPosts: trending.map((post) => ({
        _id: post._id,
        content: post.content,
        authorName: post.authorName,
        authorUsername: post.authorUsername,
        authorPhoto: post.authorPhoto,
        mediaUrls: post.mediaUrls,
        engagement: post.engagement,
        createdAt: post.createdAt,
      })),
      suggestedUsers,
      trendingHashtags,
    };
  },
});