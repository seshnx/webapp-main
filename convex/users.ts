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

    if (!user) return null;

    // Fetch and append subprofiles
    const subProfilesList = await ctx.db
      .query("subProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return {
      ...user,
      subProfilesList,
    };
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

    // Get all users
    const allUsers = await ctx.db
      .query("users")
      .take(limit * 3); // Fetch extra to filter

    // Filter by search text (covers name, username, bio, accountTypes)
    const searchTerm = args.searchText.toLowerCase();
    const filtered = searchTerm
      ? allUsers.filter((user) =>
          (user.username || "").toLowerCase().includes(searchTerm) ||
          (user.displayName || "").toLowerCase().includes(searchTerm) ||
          (user.firstName || "").toLowerCase().includes(searchTerm) ||
          (user.lastName || "").toLowerCase().includes(searchTerm) ||
          (user.bio || "").toLowerCase().includes(searchTerm) ||
          (user.accountTypes || []).some((t: string) =>
            t.toLowerCase().includes(searchTerm)
          )
        )
      : allUsers;

    const limited = filtered.slice(0, limit);

    // Enrich each user with their subprofiles for talent info
    const enriched = await Promise.all(
      limited.map(async (user) => {
        const subProfiles = await ctx.db
          .query("subProfiles")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        // Build a subProfilesMap keyed by role
        const subProfilesMap: Record<string, any> = {};
        for (const sp of subProfiles) {
          subProfilesMap[sp.role] = sp;
        }

        // Build a flat talentInfo from the most relevant subprofile
        // Priority: Talent > Producer > Engineer > first accountType
        const talentRoles = ["Talent", "Producer", "Engineer", "Composer"];
        let primarySubProfile: any = null;
        for (const role of talentRoles) {
          if (subProfilesMap[role]) {
            primarySubProfile = subProfilesMap[role];
            break;
          }
        }
        if (!primarySubProfile && subProfiles.length > 0) {
          primarySubProfile = subProfiles[0];
        }

        const talentInfo = primarySubProfile
          ? {
              rate: (primarySubProfile as any).hourlyRate ?? (primarySubProfile as any).rate,
              yearsExperience: (primarySubProfile as any).yearsExperience ?? (primarySubProfile as any).yearsExp,
              genres: (primarySubProfile as any).genres || [],
              skills: (primarySubProfile as any).skills || [],
              vocalRange: (primarySubProfile as any).vocalRange,
              vocalStyles: (primarySubProfile as any).vocalStyles || [],
              djStyles: (primarySubProfile as any).djStyles || [],
              productionStyles: (primarySubProfile as any).productionStyles || [],
              engineeringSpecialty: (primarySubProfile as any).engineeringSpecialty,
              city: (primarySubProfile as any).city || (user as any).city,
              state: (primarySubProfile as any).state || (user as any).state,
              location: (primarySubProfile as any).location,
              bio: (primarySubProfile as any).bio || user.bio,
              portfolio: (primarySubProfile as any).portfolio,
            }
          : {
              rate: (user as any).hourlyRate,
              genres: (user as any).genres || [],
              skills: (user as any).skills || [],
              city: (user as any).city,
              state: (user as any).state,
            };

        const u = user as any;
        return {
          ...user,
          profilePhoto: u.imageUrl || u.avatarUrl || u.profilePhoto,
          subProfiles: subProfilesMap,
          subProfilesList: subProfiles,
          talentInfo,
        };
      })
    );

    return enriched;
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

/**
 * Get user's public display name based on their active role
 * Resolves display name using SubProfile preferences
 */
export const getPublicDisplayName = query({
  args: {
    clerkId: v.string(),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return null;

    // Determine target role
    const targetRole = args.role || user.activeRole || user.accountTypes?.[0];
    if (!targetRole) {
      // Fallback to main profile display name
      return user.displayName || `${user.firstName} ${user.lastName}`.trim() || user.username;
    }

    // Find subprofile for the target role
    const subProfile = await ctx.db
      .query("subProfiles")
      .withIndex("by_user_role", (q) =>
        q.eq("userId", user._id).eq("role", targetRole)
      )
      .first();

    if (!subProfile) {
      // Fallback to main profile display name
      return user.displayName || `${user.firstName} ${user.lastName}`.trim() || user.username;
    }

    // Resolve display name based on subprofile preference
    switch (subProfile.displayNamePreference) {
      case "legal":
        return `${user.firstName} ${user.lastName}`.trim();
      case "username":
        return user.username || "";
      case "custom":
        return subProfile.customDisplayName ||
               subProfile.displayName ||
               `${user.firstName} ${user.lastName}`.trim();
      default:
        return subProfile.displayName || user.displayName;
    }
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
      const updateData: any = {
        email: args.email,
        emailVerified: args.emailVerified ?? existing.emailVerified,
        firstName: args.firstName,
        lastName: args.lastName,
        // Prioritize existing displayName over constructed one to preserve user's choice
        displayName: existing.displayName || displayName,
        avatarUrl: args.imageUrl || existing.avatarUrl,
        // Initialize profileName if not set
        profileName: existing.profileName || displayName,
        lastActiveAt: Date.now(),
      };

      // Only set username if it's not already set (set-once from Clerk)
      if (!existing.username && args.username) {
        updateData.username = args.username;
      }

      await ctx.db.patch(existing._id, updateData);
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

    // Settings - accept any object to support complex settings structure
    settings: v.optional(v.any()),

    // NEW: Account type and role fields
    accountTypes: v.optional(v.array(v.string())),
    activeProfileRole: v.optional(v.string()),
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

    // Settings
    if (args.settings !== undefined) updateData.settings = args.settings;

    // NEW: Account type and role fields
    if (args.accountTypes !== undefined) updateData.accountTypes = args.accountTypes;
    if (args.activeProfileRole !== undefined) updateData.activeRole = args.activeProfileRole;

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
        privacy: args.privacy ?? user.settings?.privacy ?? "public",
        notificationsEnabled: args.notificationsEnabled ?? user.settings?.notificationsEnabled ?? true,
        showEmail: args.showEmail ?? user.settings?.showEmail ?? false,
        showLocation: args.showLocation ?? user.settings?.showLocation ?? false,
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
    clerkId: v.string(), // Changed from userId to clerkId for easier frontend use
    role: v.string(),
    // NEW: Display name preferences
    displayNamePreference: v.optional(v.string()), // "legal" | "username" | "custom"
    customDisplayName: v.optional(v.string()),
    displayName: v.optional(v.string()), // Now optional - will be computed
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
    // Get user from clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Compute display name based on preference
    let computedDisplayName = args.displayName || "";
    const preference = args.displayNamePreference || "legal";

    switch (preference) {
      case "legal":
        computedDisplayName = `${user.firstName} ${user.lastName}`.trim();
        break;
      case "username":
        computedDisplayName = user.username || "";
        break;
      case "custom":
        computedDisplayName = args.customDisplayName ||
                           args.displayName ||
                           `${user.firstName} ${user.lastName}`.trim();
        break;
      default:
        computedDisplayName = args.displayName || `${user.firstName} ${user.lastName}`.trim();
    }

    const subProfile = await ctx.db.insert("subProfiles", {
      userId: user._id,
      role: args.role,
      // NEW: Store display preferences
      displayNamePreference: preference,
      customDisplayName: args.customDisplayName,
      displayName: computedDisplayName,
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
    // NEW: Display name preferences
    displayNamePreference: v.optional(v.string()), // "legal" | "username" | "custom"
    customDisplayName: v.optional(v.string()),
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
    // Get the subprofile to check if display preferences are changing
    const existingProfile = await ctx.db.get(args.subProfileId);
    if (!existingProfile) {
      throw new Error("SubProfile not found");
    }

    // Get the user to compute display name
    const user = await ctx.db.get(existingProfile.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: Date.now(),
    };

    // NEW: Handle display preferences
    const newPreference = args.displayNamePreference !== undefined
      ? args.displayNamePreference
      : existingProfile.displayNamePreference;

    const newCustomName = args.customDisplayName !== undefined
      ? args.customDisplayName
      : existingProfile.customDisplayName;

    // Store display preferences
    if (args.displayNamePreference !== undefined) {
      updateData.displayNamePreference = args.displayNamePreference;
    }
    if (args.customDisplayName !== undefined) {
      updateData.customDisplayName = args.customDisplayName;
    }

    // Recompute display name if preferences changed or displayName explicitly set
    const shouldRecomputeDisplayName =
      args.displayNamePreference !== undefined ||
      args.customDisplayName !== undefined ||
      args.displayName !== undefined;

    if (shouldRecomputeDisplayName) {
      // Use explicit displayName if provided, otherwise compute based on preference
      if (args.displayName !== undefined) {
        updateData.displayName = args.displayName;
      } else {
        // Compute based on preference
        switch (newPreference) {
          case "legal":
            updateData.displayName = `${user.firstName} ${user.lastName}`.trim();
            break;
          case "username":
            updateData.displayName = user.username || "";
            break;
          case "custom":
            updateData.displayName = newCustomName ||
                                   existingProfile.displayName ||
                                   `${user.firstName} ${user.lastName}`.trim();
            break;
          default:
            updateData.displayName = existingProfile.displayName;
        }
      }
    }

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

    // Check if already following
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", follower._id).eq("followingId", following._id)
      )
      .first();

    if (existing) {
      return { success: true, alreadyFollowing: true };
    }

    // Create follow relationship
    await ctx.db.insert("follows", {
      followerId: follower._id,
      followingId: following._id,
      createdAt: Date.now(),
    });

    // Update follower counts
    await ctx.db.patch(follower._id, {
      stats: {
        followersCount: follower.stats?.followersCount || 0,
        followingCount: (follower.stats?.followingCount || 0) + 1,
        postsCount: follower.stats?.postsCount || 0,
        bookingsCount: follower.stats?.bookingsCount || 0,
      },
    });

    await ctx.db.patch(following._id, {
      stats: {
        followersCount: (following.stats?.followersCount || 0) + 1,
        followingCount: following.stats?.followingCount || 0,
        postsCount: following.stats?.postsCount || 0,
        bookingsCount: following.stats?.bookingsCount || 0,
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

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", follower._id).eq("followingId", following._id)
      )
      .first();

    if (!follow) {
      return { success: true, wasNotFollowing: true };
    }

    await ctx.db.delete(follow._id);

    // Update follower counts
    await ctx.db.patch(follower._id, {
      stats: {
        followersCount: follower.stats?.followersCount || 0,
        followingCount: Math.max(0, (follower.stats?.followingCount || 1) - 1),
        postsCount: follower.stats?.postsCount || 0,
        bookingsCount: follower.stats?.bookingsCount || 0,
      },
    });

    await ctx.db.patch(following._id, {
      stats: {
        followersCount: Math.max(0, (following.stats?.followersCount || 1) - 1),
        followingCount: following.stats?.followingCount || 0,
        postsCount: following.stats?.postsCount || 0,
        bookingsCount: following.stats?.bookingsCount || 0,
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
    const currentStats = user.stats || {
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      bookingsCount: 0,
    };

    // Update specific stat based on args.stat
    let newStats;
    switch (args.stat) {
      case "followersCount":
        newStats = {
          ...currentStats,
          followersCount: currentStats.followersCount + amount,
        };
        break;
      case "followingCount":
        newStats = {
          ...currentStats,
          followingCount: currentStats.followingCount + amount,
        };
        break;
      case "postsCount":
        newStats = {
          ...currentStats,
          postsCount: currentStats.postsCount + amount,
        };
        break;
      case "bookingsCount":
        newStats = {
          ...currentStats,
          bookingsCount: currentStats.bookingsCount + amount,
        };
        break;
      default:
        throw new Error(`Invalid stat: ${args.stat}`);
    }

    await ctx.db.patch(args.userId, {
      stats: newStats,
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
    const currentStats = user.stats || {
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      bookingsCount: 0,
    };

    // Update specific stat based on args.stat
    let newStats;
    switch (args.stat) {
      case "followersCount":
        newStats = {
          ...currentStats,
          followersCount: Math.max(0, currentStats.followersCount - amount),
        };
        break;
      case "followingCount":
        newStats = {
          ...currentStats,
          followingCount: Math.max(0, currentStats.followingCount - amount),
        };
        break;
      case "postsCount":
        newStats = {
          ...currentStats,
          postsCount: Math.max(0, currentStats.postsCount - amount),
        };
        break;
      case "bookingsCount":
        newStats = {
          ...currentStats,
          bookingsCount: Math.max(0, currentStats.bookingsCount - amount),
        };
        break;
      default:
        throw new Error(`Invalid stat: ${args.stat}`);
    }

    await ctx.db.patch(args.userId, {
      stats: newStats,
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
        .query("sbookings")
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
      activeProfileRole: user.activeRole,
      subProfiles: subProfilesMap,
      bookingCount: bookings.length,
      tokenBalance: 0, // Placeholder until Wallet logic is explicitly migrated
    };
  },
});

// =====================================================
// ADVANCED SUB-PROFILE QUERIES
// =====================================================

/**
 * Get sub-profile by user and role
 * Useful for getting a specific role profile for a user
 */
export const getSubProfileByRole = query({
  args: {
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const subProfile = await ctx.db
      .query("subProfiles")
      .withIndex("by_user_role", (q) =>
        q.eq("userId", args.userId).eq("role", args.role)
      )
      .first();

    return subProfile;
  },
});

/**
 * Search sub-profiles by role with filters
 * Useful for discovering talent, studios, labels, etc.
 */
export const searchSubProfiles = query({
  args: {
    role: v.string(),
    genres: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    availabilityStatus: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    // Get all sub-profiles for the role
    let subProfiles = await ctx.db
      .query("subProfiles")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .take(limit * 2);

    // Filter by provided criteria
    if (args.genres && args.genres.length > 0) {
      subProfiles = subProfiles.filter(sp =>
        sp.genres && args.genres!.some(g => sp.genres!.includes(g))
      );
    }

    if (args.skills && args.skills.length > 0) {
      subProfiles = subProfiles.filter(sp =>
        sp.skills && args.skills!.some(s => sp.skills!.includes(s))
      );
    }

    if (args.location) {
      subProfiles = subProfiles.filter(sp => sp.location === args.location);
    }

    if (args.availabilityStatus) {
      subProfiles = subProfiles.filter(sp => sp.availabilityStatus === args.availabilityStatus);
    }

    return subProfiles.slice(0, limit);
  },
});

/**
 * Get featured sub-profiles by role
 * Returns top sub-profiles based on follower count and activity
 */
export const getFeaturedSubProfiles = query({
  args: {
    role: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const subProfiles = await ctx.db
      .query("subProfiles")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .take(limit * 2);

    // Sort by followers count and return top
    return subProfiles
      .filter(sp => sp.isActive)
      .sort((a, b) => (b.stats?.followersCount || 0) - (a.stats?.followersCount || 0))
      .slice(0, limit);
  },
});

/**
 * Get sub-profiles by multiple roles
 * Useful for users with multiple account types
 */
export const getSubProfilesByRoles = query({
  args: {
    userId: v.id("users"),
    roles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const subProfiles = await ctx.db
      .query("subProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return subProfiles.filter(sp => args.roles.includes(sp.role));
  },
});

// =====================================================
// ACTIVE ROLE MANAGEMENT
// =====================================================

/**
 * Set active role for user
 * Updates which role/sub-profile the user is currently using
 */
export const setActiveRole = mutation({
  args: {
    clerkId: v.string(),
    activeRole: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify the user has this role or sub-profile
    const hasRole = user.accountTypes?.includes(args.activeRole);
    const hasSubProfile = await ctx.db
      .query("subProfiles")
      .withIndex("by_user_role", (q) =>
        q.eq("userId", user._id).eq("role", args.activeRole)
      )
      .first();

    if (!hasRole && !hasSubProfile) {
      throw new Error("User does not have this role");
    }

    await ctx.db.patch(user._id, {
      activeRole: args.activeRole,
      lastActiveAt: Date.now(),
    });

    return { success: true, activeRole: args.activeRole };
  },
});

/**
 * Get user's active profile data
 * Returns main profile or sub-profile based on active role
 */
export const getActiveProfile = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return null;

    // If no active role or active role is primary, return main profile
    if (!user.activeRole || user.activeRole === "primary") {
      return user;
    }

    // Try to get sub-profile for active role
    const subProfile = await ctx.db
      .query("subProfiles")
      .withIndex("by_user_role", (q) =>
        q.eq("userId", user._id).eq("role", user.activeRole!)
      )
      .first();

    return subProfile || user;
  },
});

// =====================================================
// PROFILE COMPLETION
// =====================================================

/**
 * Calculate profile completion percentage
 * Helps users understand how complete their profile is
 */
export const getProfileCompletion = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    let completedFields = 0;
    let totalFields = 0;

    // Essential fields (weighted more heavily)
    const essentialFields = [
      user.displayName,
      user.bio,
      user.avatarUrl,
      user.location,
      user.username,
    ];
    totalFields += essentialFields.length * 2; // Weight: 2x
    completedFields += essentialFields.filter(f => f && f.length > 0).length * 2;

    // Professional fields
    const professionalFields = [
      user.skills,
      user.genres,
      user.portfolioUrls,
    ];
    totalFields += professionalFields.length;
    completedFields += professionalFields.filter(f => f && f.length > 0).length;

    // Role-specific fields (based on account types)
    if (user.accountTypes?.includes("Talent")) {
      totalFields += 3;
      if (user.talentSubRole) completedFields++;
      if (user.primaryInstrument) completedFields++;
      if (user.vocalRange || user.playingExperience) completedFields++;
    }

    if (user.accountTypes?.includes("Studio")) {
      totalFields += 2;
      if (user.studioHours) completedFields++;
      if (user.gearList) completedFields++;
    }

    if (user.accountTypes?.includes("Engineer")) {
      totalFields += 2;
      if (user.daw && user.daw.length > 0) completedFields++;
      if (user.credits) completedFields++;
    }

    if (user.accountTypes?.includes("Producer")) {
      totalFields += 2;
      if (user.productionStyles && user.productionStyles.length > 0) completedFields++;
      if (user.beatLeasePrice || user.exclusivePrice) completedFields++;
    }

    // Calculate percentage
    const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

    return {
      percentage,
      completedFields,
      totalFields,
      isComplete: percentage >= 80,
    };
  },
});

// =====================================================
// BATCH OPERATIONS
// =====================================================

/**
 * Create multiple sub-profiles at once
 * Useful for initial user setup with multiple roles
 */
export const createMultipleSubProfiles = mutation({
  args: {
    userId: v.id("users"),
    subProfiles: v.array(v.object({
      role: v.string(),
      displayName: v.string(),
      photoUrl: v.optional(v.string()),
      bio: v.optional(v.string()),
      location: v.optional(v.string()),
      skills: v.optional(v.array(v.string())),
      genres: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const createdProfiles = [];

    for (const profileData of args.subProfiles) {
      const subProfileId = await ctx.db.insert("subProfiles", {
        userId: args.userId,
        ...profileData,
        stats: {
          followersCount: 0,
          postsCount: 0,
        },
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      createdProfiles.push(subProfileId);
    }

    return {
      success: true,
      createdCount: createdProfiles.length,
      profileIds: createdProfiles,
    };
  },
});

/**
 * Update user and sub-profiles in one operation
 * Ensures consistency across all profiles
 */
export const updateAllProfiles = mutation({
  args: {
    clerkId: v.string(),
    // Common fields that apply to all profiles
    commonFields: v.optional(v.object({
      avatarUrl: v.optional(v.string()),
      location: v.optional(v.string()),
      skills: v.optional(v.array(v.string())),
      genres: v.optional(v.array(v.string())),
    })),
    // Main profile updates
    mainProfileUpdates: v.optional(v.any()),
    // Sub-profile specific updates
    subProfileUpdates: v.optional(v.array(v.object({
      role: v.string(),
      updates: v.any(),
    }))),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Update main profile
    if (args.mainProfileUpdates) {
      await ctx.db.patch(user._id, {
        ...args.mainProfileUpdates,
        updatedAt: Date.now(),
      });
    }

    // Apply common fields to main profile
    if (args.commonFields) {
      await ctx.db.patch(user._id, {
        ...args.commonFields,
        updatedAt: Date.now(),
      });
    }

    // Update sub-profiles
    if (args.subProfileUpdates) {
      for (const update of args.subProfileUpdates) {
        const subProfile = await ctx.db
          .query("subProfiles")
          .withIndex("by_user_role", (q) =>
            q.eq("userId", user._id).eq("role", update.role)
          )
          .first();

        if (subProfile) {
          await ctx.db.patch(subProfile._id, {
            ...args.commonFields, // Apply common fields
            ...update.updates, // Apply specific updates
            updatedAt: Date.now(),
          });
        }
      }
    }

    return { success: true };
  },
});

// =====================================================
// DISCOVERY & SEARCH
// =====================================================

/**
 * Discover users by multiple criteria
 * Advanced search for finding users matching complex criteria
 */
export const discoverUsers = query({
  args: {
    accountTypes: v.optional(v.array(v.string())),
    genres: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    availabilityStatus: v.optional(v.string()),
    talentSubRole: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    let users = await ctx.db.query("users").take(limit * 2);

    // Apply filters
    if (args.accountTypes && args.accountTypes.length > 0) {
      users = users.filter(u =>
        u.accountTypes && args.accountTypes!.some(at => u.accountTypes!.includes(at))
      );
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

    if (args.talentSubRole) {
      users = users.filter(u => u.talentSubRole === args.talentSubRole);
    }

    return users.slice(0, limit);
  },
});

/**
 * Get similar users based on profile
 * Useful for recommendations ("You might also like...")
 */
export const getSimilarUsers = query({
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

    const allUsers = await ctx.db.query("users").take(100);

    // Calculate similarity score based on genres, skills, account types
    const scoredUsers = allUsers
      .filter(u => u._id !== user._id) // Exclude self
      .map(u => {
        let score = 0;

        // Match genres
        if (user.genres && u.genres) {
          const commonGenres = user.genres.filter(g => u.genres!.includes(g));
          score += commonGenres.length * 2;
        }

        // Match skills
        if (user.skills && u.skills) {
          const commonSkills = user.skills.filter(s => u.skills!.includes(s));
          score += commonSkills.length * 1.5;
        }

        // Match account types
        if (user.accountTypes && u.accountTypes) {
          const commonTypes = user.accountTypes.filter(at => u.accountTypes!.includes(at));
          score += commonTypes.length;
        }

        // Match location
        if (user.location && u.location === user.location) {
          score += 3;
        }

        return { user: u, score };
      })
      .filter(item => item.score > 0) // Only return users with some similarity
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.user);

    return scoredUsers;
  },
});

/**
 * Update user subscription tier
 * Called by Stripe webhook upon checkout session or subscription completion
 */
export const updateUserTier = mutation({
  args: {
    clerkId: v.string(),
    tier: v.string(), // e.g., 'BASIC', 'PRO', 'STUDIO'
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
      activeRole: args.tier,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
