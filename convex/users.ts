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

/**
 * Search users by profile fields
 * Advanced search for finding talent, studios, engineers, etc.
 */
export const searchUsersByProfile = query({
  args: {
    talentSubRole: v.optional(v.string()),
    vocalRange: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    availabilityStatus: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    // Build query with filters
    let users = await ctx.db.query("users").take(limit * 2);

    // Filter by provided criteria
    if (args.talentSubRole) {
      users = users.filter(u => u.talentSubRole === args.talentSubRole);
    }
    if (args.vocalRange) {
      users = users.filter(u => u.vocalRange === args.vocalRange);
    }
    if (args.genres && args.genres.length > 0) {
      users = users.filter(u =>
        u.genres && args.genres!.some(g => u.genres!.includes(g))
      );
    }
    if (args.skills && args.skills.length > 0) {
      users = users.filter(u =>
        u.skills && args.skills!.some(s => u.skills!.includes(s))
      );
    }
    if (args.location) {
      users = users.filter(u => u.location === args.location);
    }
    if (args.availabilityStatus) {
      users = users.filter(u => u.availabilityStatus === args.availabilityStatus);
    }

    return users.slice(0, limit);
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
        firstName: args.firstName,
        lastName: args.lastName,
        displayName: displayName || existing.displayName,
        avatarUrl: args.imageUrl || existing.avatarUrl,
        // Initialize profileName if not set
        profileName: existing.profileName || displayName,
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
        firstName: args.firstName,
        lastName: args.lastName,
        displayName: displayName,
        profileName: displayName, // Initialize with displayName
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
 * Main function for profile updates - supports all role-specific fields
 */
export const updateProfile = mutation({
  args: {
    clerkId: v.string(),
    // Basic fields
    displayName: v.optional(v.string()),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    headline: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    location: v.optional(v.string()),
    address: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    website: v.optional(v.string()),
    useRealName: v.optional(v.boolean()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profileName: v.optional(v.string()),

    // Professional arrays
    skills: v.optional(v.array(v.string())),
    genres: v.optional(v.array(v.string())),
    instruments: v.optional(v.array(v.string())),
    software: v.optional(v.array(v.string())),

    // Portfolio links
    portfolioUrls: v.optional(v.array(v.object({
      title: v.string(),
      url: v.string(),
      type: v.string(),
    }))),

    // Pricing
    rates: v.optional(v.number()),
    sessionRate: v.optional(v.number()),
    dayRate: v.optional(v.number()),
    hourlyRate: v.optional(v.number()),
    projectRate: v.optional(v.number()),
    availabilityStatus: v.optional(v.string()),

    // Talent-specific fields
    talentSubRole: v.optional(v.string()),
    vocalRange: v.optional(v.string()),
    vocalStyles: v.optional(v.array(v.string())),
    primaryInstrument: v.optional(v.string()),
    playingExperience: v.optional(v.string()),
    canReadMusic: v.optional(v.string()),
    ownGear: v.optional(v.string()),
    gearHighlights: v.optional(v.string()),
    readingSkill: v.optional(v.string()),
    remoteWork: v.optional(v.string()),
    label: v.optional(v.string()),
    touring: v.optional(v.string()),
    travelDist: v.optional(v.number()),

    // DJ-specific fields
    djStyles: v.optional(v.array(v.string())),
    djSetup: v.optional(v.string()),
    canProvidePa: v.optional(v.string()),

    // Demo/media links
    demoReelUrl: v.optional(v.string()),
    sampleWorkUrl: v.optional(v.string()),
    reelUrl: v.optional(v.string()),

    // Studio-specific fields
    studioHours: v.optional(v.string()),
    liveRoomDimensions: v.optional(v.string()),
    parking: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
    virtualTourUrl: v.optional(v.string()),
    gearList: v.optional(v.string()),

    // Engineer-specific fields
    daw: v.optional(v.array(v.string())),
    outboard: v.optional(v.string()),
    credits: v.optional(v.string()),
    hasStudio: v.optional(v.string()),

    // Producer-specific fields
    productionStyles: v.optional(v.array(v.string())),
    beatLeasePrice: v.optional(v.number()),
    exclusivePrice: v.optional(v.number()),
    customBeatPrice: v.optional(v.number()),
    acceptsCollabs: v.optional(v.string()),

    // Composer-specific fields
    compType: v.optional(v.array(v.string())),
    libraries: v.optional(v.string()),
    canOrchestrate: v.optional(v.string()),
    turnaroundTime: v.optional(v.string()),

    // Agent-specific fields
    agencyName: v.optional(v.string()),
    rosterSize: v.optional(v.number()),
    territory: v.optional(v.string()),

    // Label-specific fields
    acceptingDemos: v.optional(v.string()),

    // Fan-specific fields
    lookingFor: v.optional(v.array(v.string())),

    // Technician-specific fields
    technicianSkills: v.optional(v.string()),
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

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: Date.now(),
      lastActiveAt: Date.now(),
    };

    // Basic fields
    if (args.displayName !== undefined) updateData.displayName = args.displayName;
    if (args.username !== undefined) updateData.username = args.username;
    if (args.bio !== undefined) updateData.bio = args.bio;
    if (args.headline !== undefined) updateData.headline = args.headline;
    if (args.avatarUrl !== undefined) updateData.avatarUrl = args.avatarUrl;
    if (args.bannerUrl !== undefined) updateData.bannerUrl = args.bannerUrl;
    if (args.location !== undefined) updateData.location = args.location;
    if (args.address !== undefined) updateData.address = args.address;
    if (args.zipCode !== undefined) updateData.zipCode = args.zipCode;
    if (args.website !== undefined) updateData.website = args.website;
    if (args.useRealName !== undefined) updateData.useRealName = args.useRealName;
    if (args.firstName !== undefined) updateData.firstName = args.firstName;
    if (args.lastName !== undefined) updateData.lastName = args.lastName;
    if (args.profileName !== undefined) updateData.profileName = args.profileName;

    // Professional arrays
    if (args.skills !== undefined) updateData.skills = args.skills;
    if (args.genres !== undefined) updateData.genres = args.genres;
    if (args.instruments !== undefined) updateData.instruments = args.instruments;
    if (args.software !== undefined) updateData.software = args.software;

    // Portfolio links
    if (args.portfolioUrls !== undefined) updateData.portfolioUrls = args.portfolioUrls;

    // Pricing
    if (args.rates !== undefined) updateData.rates = args.rates;
    if (args.sessionRate !== undefined) updateData.sessionRate = args.sessionRate;
    if (args.dayRate !== undefined) updateData.dayRate = args.dayRate;
    if (args.hourlyRate !== undefined) updateData.hourlyRate = args.hourlyRate;
    if (args.projectRate !== undefined) updateData.projectRate = args.projectRate;
    if (args.availabilityStatus !== undefined) updateData.availabilityStatus = args.availabilityStatus;

    // Talent-specific fields
    if (args.talentSubRole !== undefined) updateData.talentSubRole = args.talentSubRole;
    if (args.vocalRange !== undefined) updateData.vocalRange = args.vocalRange;
    if (args.vocalStyles !== undefined) updateData.vocalStyles = args.vocalStyles;
    if (args.primaryInstrument !== undefined) updateData.primaryInstrument = args.primaryInstrument;
    if (args.playingExperience !== undefined) updateData.playingExperience = args.playingExperience;
    if (args.canReadMusic !== undefined) updateData.canReadMusic = args.canReadMusic;
    if (args.ownGear !== undefined) updateData.ownGear = args.ownGear;
    if (args.gearHighlights !== undefined) updateData.gearHighlights = args.gearHighlights;
    if (args.readingSkill !== undefined) updateData.readingSkill = args.readingSkill;
    if (args.remoteWork !== undefined) updateData.remoteWork = args.remoteWork;
    if (args.label !== undefined) updateData.label = args.label;
    if (args.touring !== undefined) updateData.touring = args.touring;
    if (args.travelDist !== undefined) updateData.travelDist = args.travelDist;

    // DJ-specific fields
    if (args.djStyles !== undefined) updateData.djStyles = args.djStyles;
    if (args.djSetup !== undefined) updateData.djSetup = args.djSetup;
    if (args.canProvidePa !== undefined) updateData.canProvidePa = args.canProvidePa;

    // Demo/media links
    if (args.demoReelUrl !== undefined) updateData.demoReelUrl = args.demoReelUrl;
    if (args.sampleWorkUrl !== undefined) updateData.sampleWorkUrl = args.sampleWorkUrl;
    if (args.reelUrl !== undefined) updateData.reelUrl = args.reelUrl;

    // Studio-specific fields
    if (args.studioHours !== undefined) updateData.studioHours = args.studioHours;
    if (args.liveRoomDimensions !== undefined) updateData.liveRoomDimensions = args.liveRoomDimensions;
    if (args.parking !== undefined) updateData.parking = args.parking;
    if (args.amenities !== undefined) updateData.amenities = args.amenities;
    if (args.virtualTourUrl !== undefined) updateData.virtualTourUrl = args.virtualTourUrl;
    if (args.gearList !== undefined) updateData.gearList = args.gearList;

    // Engineer-specific fields
    if (args.daw !== undefined) updateData.daw = args.daw;
    if (args.outboard !== undefined) updateData.outboard = args.outboard;
    if (args.credits !== undefined) updateData.credits = args.credits;
    if (args.hasStudio !== undefined) updateData.hasStudio = args.hasStudio;

    // Producer-specific fields
    if (args.productionStyles !== undefined) updateData.productionStyles = args.productionStyles;
    if (args.beatLeasePrice !== undefined) updateData.beatLeasePrice = args.beatLeasePrice;
    if (args.exclusivePrice !== undefined) updateData.exclusivePrice = args.exclusivePrice;
    if (args.customBeatPrice !== undefined) updateData.customBeatPrice = args.customBeatPrice;
    if (args.acceptsCollabs !== undefined) updateData.acceptsCollabs = args.acceptsCollabs;

    // Composer-specific fields
    if (args.compType !== undefined) updateData.compType = args.compType;
    if (args.libraries !== undefined) updateData.libraries = args.libraries;
    if (args.canOrchestrate !== undefined) updateData.canOrchestrate = args.canOrchestrate;
    if (args.turnaroundTime !== undefined) updateData.turnaroundTime = args.turnaroundTime;

    // Agent-specific fields
    if (args.agencyName !== undefined) updateData.agencyName = args.agencyName;
    if (args.rosterSize !== undefined) updateData.rosterSize = args.rosterSize;
    if (args.territory !== undefined) updateData.territory = args.territory;

    // Label-specific fields
    if (args.acceptingDemos !== undefined) updateData.acceptingDemos = args.acceptingDemos;

    // Fan-specific fields
    if (args.lookingFor !== undefined) updateData.lookingFor = args.lookingFor;

    // Technician-specific fields
    if (args.technicianSkills !== undefined) updateData.technicianSkills = args.technicianSkills;

    // Update user
    await ctx.db.patch(user._id, updateData);

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
 * Users can have multiple profiles (Talent, Studio, Label, etc.) with role-specific fields
 */
export const createSubProfile = mutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
    displayName: v.string(),
    photoUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    address: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    genres: v.optional(v.array(v.string())),
    instruments: v.optional(v.array(v.string())),
    software: v.optional(v.array(v.string())),
    portfolioUrls: v.optional(v.array(v.object({
      title: v.string(),
      url: v.string(),
      type: v.string(),
    }))),
    demoReelUrl: v.optional(v.string()),
    sampleWorkUrl: v.optional(v.string()),
    rates: v.optional(v.number()),
    sessionRate: v.optional(v.number()),
    dayRate: v.optional(v.number()),
    hourlyRate: v.optional(v.number()),
    projectRate: v.optional(v.number()),
    availabilityStatus: v.optional(v.string()),
    // Talent-specific
    talentSubRole: v.optional(v.string()),
    vocalRange: v.optional(v.string()),
    vocalStyles: v.optional(v.array(v.string())),
    primaryInstrument: v.optional(v.string()),
    playingExperience: v.optional(v.string()),
    gearHighlights: v.optional(v.string()),
    djStyles: v.optional(v.array(v.string())),
    label: v.optional(v.string()),
    touring: v.optional(v.string()),
    // Studio-specific
    liveRoomDimensions: v.optional(v.string()),
    parking: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
    virtualTourUrl: v.optional(v.string()),
    gearList: v.optional(v.string()),
    // Engineer-specific
    daw: v.optional(v.array(v.string())),
    outboard: v.optional(v.string()),
    credits: v.optional(v.string()),
    hasStudio: v.optional(v.string()),
    // Producer-specific
    productionStyles: v.optional(v.array(v.string())),
    beatLeasePrice: v.optional(v.number()),
    exclusivePrice: v.optional(v.number()),
    customBeatPrice: v.optional(v.number()),
    acceptsCollabs: v.optional(v.string()),
    // Composer-specific
    compType: v.optional(v.array(v.string())),
    libraries: v.optional(v.string()),
    canOrchestrate: v.optional(v.string()),
    turnaroundTime: v.optional(v.string()),
    reelUrl: v.optional(v.string()),
    // Agent-specific
    agencyName: v.optional(v.string()),
    rosterSize: v.optional(v.number()),
    territory: v.optional(v.string()),
    // Label-specific
    acceptingDemos: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const subProfile = await ctx.db.insert("subProfiles", {
      userId: args.userId,
      role: args.role,
      displayName: args.displayName,
      photoUrl: args.photoUrl,
      bio: args.bio,
      location: args.location,
      address: args.address,
      zipCode: args.zipCode,
      skills: args.skills || [],
      genres: args.genres || [],
      instruments: args.instruments || [],
      software: args.software || [],
      portfolioUrls: args.portfolioUrls,
      demoReelUrl: args.demoReelUrl,
      sampleWorkUrl: args.sampleWorkUrl,
      rates: args.rates,
      sessionRate: args.sessionRate,
      dayRate: args.dayRate,
      hourlyRate: args.hourlyRate,
      projectRate: args.projectRate,
      availabilityStatus: args.availabilityStatus,
      // Talent-specific
      talentSubRole: args.talentSubRole,
      vocalRange: args.vocalRange,
      vocalStyles: args.vocalStyles,
      primaryInstrument: args.primaryInstrument,
      playingExperience: args.playingExperience,
      gearHighlights: args.gearHighlights,
      djStyles: args.djStyles,
      label: args.label,
      touring: args.touring,
      // Studio-specific
      liveRoomDimensions: args.liveRoomDimensions,
      parking: args.parking,
      amenities: args.amenities,
      virtualTourUrl: args.virtualTourUrl,
      gearList: args.gearList,
      // Engineer-specific
      daw: args.daw,
      outboard: args.outboard,
      credits: args.credits,
      hasStudio: args.hasStudio,
      // Producer-specific
      productionStyles: args.productionStyles,
      beatLeasePrice: args.beatLeasePrice,
      exclusivePrice: args.exclusivePrice,
      customBeatPrice: args.customBeatPrice,
      acceptsCollabs: args.acceptsCollabs,
      // Composer-specific
      compType: args.compType,
      libraries: args.libraries,
      canOrchestrate: args.canOrchestrate,
      turnaroundTime: args.turnaroundTime,
      reelUrl: args.reelUrl,
      // Agent-specific
      agencyName: args.agencyName,
      rosterSize: args.rosterSize,
      territory: args.territory,
      // Label-specific
      acceptingDemos: args.acceptingDemos,
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
 * Supports updating role-specific fields
 */
export const updateSubProfile = mutation({
  args: {
    subProfileId: v.id("subProfiles"),
    displayName: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    address: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    genres: v.optional(v.array(v.string())),
    instruments: v.optional(v.array(v.string())),
    software: v.optional(v.array(v.string())),
    portfolioUrls: v.optional(v.array(v.object({
      title: v.string(),
      url: v.string(),
      type: v.string(),
    }))),
    demoReelUrl: v.optional(v.string()),
    sampleWorkUrl: v.optional(v.string()),
    rates: v.optional(v.number()),
    sessionRate: v.optional(v.number()),
    dayRate: v.optional(v.number()),
    hourlyRate: v.optional(v.number()),
    projectRate: v.optional(v.number()),
    availabilityStatus: v.optional(v.string()),
    // Talent-specific
    talentSubRole: v.optional(v.string()),
    vocalRange: v.optional(v.string()),
    vocalStyles: v.optional(v.array(v.string())),
    primaryInstrument: v.optional(v.string()),
    playingExperience: v.optional(v.string()),
    gearHighlights: v.optional(v.string()),
    djStyles: v.optional(v.array(v.string())),
    label: v.optional(v.string()),
    touring: v.optional(v.string()),
    // Studio-specific
    liveRoomDimensions: v.optional(v.string()),
    parking: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
    virtualTourUrl: v.optional(v.string()),
    gearList: v.optional(v.string()),
    // Engineer-specific
    daw: v.optional(v.array(v.string())),
    outboard: v.optional(v.string()),
    credits: v.optional(v.string()),
    hasStudio: v.optional(v.string()),
    // Producer-specific
    productionStyles: v.optional(v.array(v.string())),
    beatLeasePrice: v.optional(v.number()),
    exclusivePrice: v.optional(v.number()),
    customBeatPrice: v.optional(v.number()),
    acceptsCollabs: v.optional(v.string()),
    // Composer-specific
    compType: v.optional(v.array(v.string())),
    libraries: v.optional(v.string()),
    canOrchestrate: v.optional(v.string()),
    turnaroundTime: v.optional(v.string()),
    reelUrl: v.optional(v.string()),
    // Agent-specific
    agencyName: v.optional(v.string()),
    rosterSize: v.optional(v.number()),
    territory: v.optional(v.string()),
    // Label-specific
    acceptingDemos: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (args.displayName !== undefined) updateData.displayName = args.displayName;
    if (args.photoUrl !== undefined) updateData.photoUrl = args.photoUrl;
    if (args.bio !== undefined) updateData.bio = args.bio;
    if (args.location !== undefined) updateData.location = args.location;
    if (args.address !== undefined) updateData.address = args.address;
    if (args.zipCode !== undefined) updateData.zipCode = args.zipCode;
    if (args.skills !== undefined) updateData.skills = args.skills;
    if (args.genres !== undefined) updateData.genres = args.genres;
    if (args.instruments !== undefined) updateData.instruments = args.instruments;
    if (args.software !== undefined) updateData.software = args.software;
    if (args.portfolioUrls !== undefined) updateData.portfolioUrls = args.portfolioUrls;
    if (args.demoReelUrl !== undefined) updateData.demoReelUrl = args.demoReelUrl;
    if (args.sampleWorkUrl !== undefined) updateData.sampleWorkUrl = args.sampleWorkUrl;
    if (args.rates !== undefined) updateData.rates = args.rates;
    if (args.sessionRate !== undefined) updateData.sessionRate = args.sessionRate;
    if (args.dayRate !== undefined) updateData.dayRate = args.dayRate;
    if (args.hourlyRate !== undefined) updateData.hourlyRate = args.hourlyRate;
    if (args.projectRate !== undefined) updateData.projectRate = args.projectRate;
    if (args.availabilityStatus !== undefined) updateData.availabilityStatus = args.availabilityStatus;

    // Talent-specific
    if (args.talentSubRole !== undefined) updateData.talentSubRole = args.talentSubRole;
    if (args.vocalRange !== undefined) updateData.vocalRange = args.vocalRange;
    if (args.vocalStyles !== undefined) updateData.vocalStyles = args.vocalStyles;
    if (args.primaryInstrument !== undefined) updateData.primaryInstrument = args.primaryInstrument;
    if (args.playingExperience !== undefined) updateData.playingExperience = args.playingExperience;
    if (args.gearHighlights !== undefined) updateData.gearHighlights = args.gearHighlights;
    if (args.djStyles !== undefined) updateData.djStyles = args.djStyles;
    if (args.label !== undefined) updateData.label = args.label;
    if (args.touring !== undefined) updateData.touring = args.touring;

    // Studio-specific
    if (args.liveRoomDimensions !== undefined) updateData.liveRoomDimensions = args.liveRoomDimensions;
    if (args.parking !== undefined) updateData.parking = args.parking;
    if (args.amenities !== undefined) updateData.amenities = args.amenities;
    if (args.virtualTourUrl !== undefined) updateData.virtualTourUrl = args.virtualTourUrl;
    if (args.gearList !== undefined) updateData.gearList = args.gearList;

    // Engineer-specific
    if (args.daw !== undefined) updateData.daw = args.daw;
    if (args.outboard !== undefined) updateData.outboard = args.outboard;
    if (args.credits !== undefined) updateData.credits = args.credits;
    if (args.hasStudio !== undefined) updateData.hasStudio = args.hasStudio;

    // Producer-specific
    if (args.productionStyles !== undefined) updateData.productionStyles = args.productionStyles;
    if (args.beatLeasePrice !== undefined) updateData.beatLeasePrice = args.beatLeasePrice;
    if (args.exclusivePrice !== undefined) updateData.exclusivePrice = args.exclusivePrice;
    if (args.customBeatPrice !== undefined) updateData.customBeatPrice = args.customBeatPrice;
    if (args.acceptsCollabs !== undefined) updateData.acceptsCollabs = args.acceptsCollabs;

    // Composer-specific
    if (args.compType !== undefined) updateData.compType = args.compType;
    if (args.libraries !== undefined) updateData.libraries = args.libraries;
    if (args.canOrchestrate !== undefined) updateData.canOrchestrate = args.canOrchestrate;
    if (args.turnaroundTime !== undefined) updateData.turnaroundTime = args.turnaroundTime;
    if (args.reelUrl !== undefined) updateData.reelUrl = args.reelUrl;

    // Agent-specific
    if (args.agencyName !== undefined) updateData.agencyName = args.agencyName;
    if (args.rosterSize !== undefined) updateData.rosterSize = args.rosterSize;
    if (args.territory !== undefined) updateData.territory = args.territory;

    // Label-specific
    if (args.acceptingDemos !== undefined) updateData.acceptingDemos = args.acceptingDemos;

    if (args.isActive !== undefined) updateData.isActive = args.isActive;

    await ctx.db.patch(args.subProfileId, updateData);

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
