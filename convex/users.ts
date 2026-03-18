import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =====================================================
// USER QUERIES
// =====================================================

/**
 * Get user by Clerk ID
 * Used for authentication and user lookups
 */
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return user;
  },
});

/**
 * Get user by username
 * Used for profile URLs and search
 */
export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    return user;
  },
});

/**
 * Get user by email
 * Used for user lookup and verification
 */
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return user;
  },
});

/**
 * Get current user (alias for getUserByClerkId)
 */
export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return user;
  },
});

/**
 * Get multiple users by IDs
 * Used for displaying user lists, mentions, etc.
 */
export const getUsersByIds = query({
  args: { userIds: v.array(v.id("users")) },
  handler: async (ctx, args) => {
    const users = await Promise.all(
      args.userIds.map((id) => ctx.db.get(id))
    );

    return users.filter((user) => user !== null);
  },
});

/**
 * Search users by text
 * Searches username, displayName, and bio
 */
export const searchUsers = query({
  args: {
    searchText: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    // Get all users (in production, you'd want a proper full-text search)
    const allUsers = await ctx.db
      .query("users")
      .take(limit * 2); // Get extra to filter

    // Filter by search text
    const searchTerm = args.searchText.toLowerCase();
    const filtered = allUsers.filter((user) =>
      (user.username || "").toLowerCase().includes(searchTerm) ||
      (user.displayName || "").toLowerCase().includes(searchTerm) ||
      (user.bio || "").toLowerCase().includes(searchTerm)
    );

    return filtered.slice(0, limit);
  },
});

/**
 * Get users by account type
 * Used for finding talent, studios, labels, etc.
 */
export const getUsersByAccountType = query({
  args: {
    accountType: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const allUsers = await ctx.db
      .query("users")
      .take(limit);

    const filtered = allUsers.filter((user) =>
      user.accountTypes?.includes(args.accountType)
    );

    return filtered.slice(0, limit);
  },
});

/**
 * Get users by school
 * Used for EDU features - students and staff
 */
export const getUsersBySchool = query({
  args: {
    schoolId: v.id("schools"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    const users = await ctx.db
      .query("users")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .take(limit);

    return users;
  },
});

// =====================================================
// USER MUTATIONS
// =====================================================

/**
 * Create or update user from Clerk webhook
 * Called when user is created or updated in Clerk
 */
export const syncUserFromClerk = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    username: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const displayName = [args.firstName, args.lastName]
      .filter(Boolean)
      .join(" ") || args.username || args.email.split("@")[0];

    if (existing) {
      // Update existing user
      await ctx.db.patch(existing._id, {
        email: args.email,
        username: args.username,
        emailVerified: args.emailVerified ?? existing.emailVerified,
        displayName: displayName || existing.displayName,
        avatarUrl: args.imageUrl || existing.avatarUrl,
        lastActiveAt: Date.now(),
      });
      return existing._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        username: args.username,
        emailVerified: args.emailVerified ?? false,
        displayName: displayName,
        avatarUrl: args.imageUrl,
        accountTypes: [],
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
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastActiveAt: Date.now(),
      });
      return userId;
    }
  },
});

/**
 * Update user profile
 * Main function for profile updates
 */
export const updateProfile = mutation({
  args: {
    clerkId: v.string(),
    displayName: v.optional(v.string()),
    username: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if username is taken (if changing username)
    if (args.username && args.username !== user.username) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username))
        .first();

      if (existing && existing._id !== user._id) {
        throw new Error("Username already taken");
      }
    }

    // Update user
    await ctx.db.patch(user._id, {
      displayName: args.displayName,
      username: args.username,
      bio: args.bio,
      headline: args.headline,
      avatarUrl: args.avatarUrl,
      bannerUrl: args.bannerUrl,
      location: args.location,
      website: args.website,
      skills: args.skills,
      genres: args.genres,
      instruments: args.instruments,
      software: args.software,
      updatedAt: Date.now(),
      lastActiveAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update user account types and active role
 */
export const updateAccountTypes = mutation({
  args: {
    clerkId: v.string(),
    accountTypes: v.array(v.string()),
    activeRole: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      accountTypes: args.accountTypes,
      activeRole: args.activeRole,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update user settings
 */
export const updateSettings = mutation({
  args: {
    clerkId: v.string(),
    privacy: v.optional(v.string()),
    notificationsEnabled: v.optional(v.boolean()),
    showEmail: v.optional(v.boolean()),
    showLocation: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      settings: {
        ...user.settings,
        ...args,
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update last active timestamp
 * Called when user logs in or interacts with app
 */
export const updateLastActive = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return { success: false };
    }

    await ctx.db.patch(user._id, {
      lastActiveAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete user (admin only or self-deletion)
 */
export const deleteUser = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // TODO: Add admin check or ownership check

    await ctx.db.delete(user._id);

    return { success: true };
  },
});

// =====================================================
// SUB-PROFILES
// =====================================================

/**
 * Get sub-profiles for a user
 */
export const getSubProfiles = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const subProfiles = await ctx.db
      .query("subProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return subProfiles;
  },
});

/**
 * Create sub-profile
 * Users can have multiple profiles (Talent, Studio, Label, etc.)
 */
export const createSubProfile = mutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
    displayName: v.string(),
    photoUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    genres: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const subProfile = await ctx.db.insert("subProfiles", {
      userId: args.userId,
      role: args.role,
      displayName: args.displayName,
      photoUrl: args.photoUrl,
      bio: args.bio,
      skills: args.skills || [],
      genres: args.genres || [],
      location: args.location,
      stats: {
        followersCount: 0,
        postsCount: 0,
      },
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return subProfile;
  },
});

/**
 * Update sub-profile
 */
export const updateSubProfile = mutation({
  args: {
    subProfileId: v.id("subProfiles"),
    displayName: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    genres: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subProfileId, {
      displayName: args.displayName,
      photoUrl: args.photoUrl,
      bio: args.bio,
      skills: args.skills,
      genres: args.genres,
      location: args.location,
      isActive: args.isActive,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete sub-profile
 */
export const deleteSubProfile = mutation({
  args: { subProfileId: v.id("subProfiles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.subProfileId);
    return { success: true };
  },
});

// =====================================================
// FOLLOW SYSTEM
// =====================================================

/**
 * Get followers for a user
 */
export const getFollowers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", args.userId))
      .collect();

    // Get full user objects for followers
    const followers = await Promise.all(
      follows.map((f) => ctx.db.get(f.followerId))
    );

    return followers.filter((f) => f !== null);
  },
});

/**
 * Get users that a user is following
 */
export const getFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();

    // Get full user objects for following
    const following = await Promise.all(
      follows.map((f) => ctx.db.get(f.followingId))
    );

    return following.filter((f) => f !== null);
  },
});

/**
 * Check if user A follows user B
 */
export const isFollowing = query({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .first();

    return !!follow;
  },
});

/**
 * Follow a user
 */
export const followUser = mutation({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if already following
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .first();

    if (existing) {
      return { success: true, alreadyFollowing: true };
    }

    // Create follow relationship
    await ctx.db.insert("follows", {
      followerId: args.followerId,
      followingId: args.followingId,
      createdAt: Date.now(),
    });

    // Update follower counts
    await ctx.db.patch(args.followerId, {
      stats: {
        ...(await ctx.db.get(args.followerId)).stats,
        followingCount: ((await ctx.db.get(args.followerId)).stats?.followingCount || 0) + 1,
      },
    });

    await ctx.db.patch(args.followingId, {
      stats: {
        ...(await ctx.db.get(args.followingId)).stats,
        followersCount: ((await ctx.db.get(args.followingId)).stats?.followersCount || 0) + 1,
      },
    });

    return { success: true, alreadyFollowing: false };
  },
});

/**
 * Unfollow a user
 */
export const unfollowUser = mutation({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .first();

    if (!follow) {
      return { success: true, wasNotFollowing: true };
    }

    await ctx.db.delete(follow._id);

    // Update follower counts
    await ctx.db.patch(args.followerId, {
      stats: {
        ...(await ctx.db.get(args.followerId)).stats,
        followingCount: Math.max(0, ((await ctx.db.get(args.followerId)).stats?.followingCount || 1) - 1),
      },
    });

    await ctx.db.patch(args.followingId, {
      stats: {
        ...(await ctx.db.get(args.followingId)).stats,
        followersCount: Math.max(0, ((await ctx.db.get(args.followingId)).stats?.followersCount || 1) - 1),
      },
    });

    return { success: true, wasNotFollowing: false };
  },
});

// =====================================================
// USER STATS HELPERS
// =====================================================

/**
 * Increment user stat
 * Used for updating postsCount, bookingsCount, etc.
 */
export const incrementUserStat = mutation({
  args: {
    userId: v.id("users"),
    stat: v.string(),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const amount = args.amount ?? 1;
    const currentValue = user.stats?.[args.stat] || 0;

    await ctx.db.patch(args.userId, {
      stats: {
        ...user.stats,
        [args.stat]: currentValue + amount,
      },
    });

    return { success: true };
  },
});

/**
 * Decrement user stat
 */
export const decrementUserStat = mutation({
  args: {
    userId: v.id("users"),
    stat: v.string(),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const amount = args.amount ?? 1;
    const currentValue = user.stats?.[args.stat] || 0;

    await ctx.db.patch(args.userId, {
      stats: {
        ...user.stats,
        [args.stat]: Math.max(0, currentValue - amount),
      },
    });

    return { success: true };
  },
});

/**
 * Aggregated User Data Query
 * Replaces legacy Neon queries by fetching User, SubProfiles, and Bookings in one go.
 */
export const getFullUserData = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return null;

    // Fetch supplemental data in parallel
    const [subProfiles, bookings] = await Promise.all([
      ctx.db
        .query("subProfiles")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("bookings")
        .withIndex("by_client", (q) => q.eq("clientId", user._id))
        .collect(),
    ]);

    // Format subProfiles into a record map for easy UI access: { "Talent": {...}, "Producer": {...} }
    const subProfilesMap = subProfiles.reduce((acc, profile) => {
      acc[profile.role] = profile;
      return acc;
    }, {} as Record<string, any>);

    return {
      ...user,
      subProfiles: subProfilesMap,
      bookingCount: bookings.length,
      tokenBalance: 0, // Placeholder until Wallet logic is explicitly migrated
    };
  },
});
