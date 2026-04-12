import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { validateSlug } from "./utils/slugs";

// =====================================================
// STUDIO QUERIES
// =====================================================

/**
 * Get studio by owner ID
 */
export const getStudioByOwner = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    const studio = await ctx.db
      .query("studios")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .first();

    return studio;
  },
});

/**
 * Get studio by ID
 */
export const getStudioById = query({
  args: { studioId: v.id("studios") },
  handler: async (ctx, args) => {
    const studio = await ctx.db.get(args.studioId);
    return studio;
  },
});

/**
 * Get all active studios (for public listing)
 */
export const getActiveStudios = query({
  args: {
    city: v.optional(v.string()),
    state: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let studiosQuery = ctx.db
      .query("studios")
      .withIndex("by_city_state", (q) =>
        q.eq("city", args.city || "").eq("state", args.state || "")
      );

    const studios = await studiosQuery.collect();

    // Filter out deleted and inactive studios
    return studios.filter(
      (studio) => studio.deletedAt === undefined && studio.isActive
    );
  },
});

// =====================================================
// STUDIO MUTATIONS
// =====================================================

/**
 * Create a new studio
 */
export const createStudio = mutation({
  args: {
    clerkId: v.string(), // Clerk ID of the owner
    name: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    coordinates: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    email: v.optional(v.string()),
    phoneCell: v.optional(v.string()),
    phoneLand: v.optional(v.string()),
    website: v.optional(v.string()),
    hours: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
    hideAddress: v.optional(v.boolean()),
    kioskModeEnabled: v.optional(v.boolean()),
    kioskEduMode: v.optional(v.boolean()),
    kioskAuthorizedNetworks: v.optional(v.string()),
    kioskNetworkName: v.optional(v.string()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user already has a studio
    const existingStudio = await ctx.db
      .query("studios")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .first();

    if (existingStudio) {
      throw new Error("User already has a studio");
    }

    // Validate slug if provided
    if (args.slug) {
      const validation = validateSlug(args.slug);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      // Check slug uniqueness
      const slugTaken = await ctx.db
        .query("studios")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug))
        .first();
      if (slugTaken) {
        throw new Error("Slug is already in use");
      }
    }

    const now = Date.now();

    // Create the studio
    const studioId = await ctx.db.insert("studios", {
      name: args.name,
      ownerId: user._id,
      slug: args.slug,
      description: args.description,
      location: args.location,
      city: args.city,
      state: args.state,
      zip: args.zip,
      coordinates: args.coordinates,
      email: args.email,
      phoneCell: args.phoneCell,
      phoneLand: args.phoneLand,
      website: args.website,
      hours: args.hours,
      amenities: args.amenities,
      hideAddress: args.hideAddress,
      kioskModeEnabled: args.kioskModeEnabled,
      kioskEduMode: args.kioskEduMode,
      kioskAuthorizedNetworks: args.kioskAuthorizedNetworks,
      kioskNetworkName: args.kioskNetworkName,
      isActive: true,
      requiresApproval: false,
      createdAt: now,
      updatedAt: now,
    });

    return studioId;
  },
});

/**
 * Update studio settings
 */
export const updateStudio = mutation({
  args: {
    clerkId: v.string(),
    studioId: v.id("studios"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    coordinates: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    email: v.optional(v.string()),
    phoneCell: v.optional(v.string()),
    phoneLand: v.optional(v.string()),
    website: v.optional(v.string()),
    hours: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
    hideAddress: v.optional(v.boolean()),
    kioskModeEnabled: v.optional(v.boolean()),
    kioskEduMode: v.optional(v.boolean()),
    kioskAuthorizedNetworks: v.optional(v.string()),
    kioskNetworkName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the studio
    const studio = await ctx.db.get(args.studioId);

    if (!studio) {
      throw new Error("Studio not found");
    }

    // Verify ownership
    if (studio.ownerId !== user._id) {
      throw new Error("Not authorized to update this studio");
    }

    // Prepare update data (only include provided fields)
    const updateData: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.location !== undefined) updateData.location = args.location;
    if (args.city !== undefined) updateData.city = args.city;
    if (args.state !== undefined) updateData.state = args.state;
    if (args.zip !== undefined) updateData.zip = args.zip;
    if (args.coordinates !== undefined) updateData.coordinates = args.coordinates;
    if (args.email !== undefined) updateData.email = args.email;
    if (args.phoneCell !== undefined) updateData.phoneCell = args.phoneCell;
    if (args.phoneLand !== undefined) updateData.phoneLand = args.phoneLand;
    if (args.website !== undefined) updateData.website = args.website;
    if (args.hours !== undefined) updateData.hours = args.hours;
    if (args.amenities !== undefined) updateData.amenities = args.amenities;
    if (args.hideAddress !== undefined) updateData.hideAddress = args.hideAddress;
    if (args.kioskModeEnabled !== undefined)
      updateData.kioskModeEnabled = args.kioskModeEnabled;
    if (args.kioskEduMode !== undefined) updateData.kioskEduMode = args.kioskEduMode;
    if (args.kioskAuthorizedNetworks !== undefined)
      updateData.kioskAuthorizedNetworks = args.kioskAuthorizedNetworks;
    if (args.kioskNetworkName !== undefined)
      updateData.kioskNetworkName = args.kioskNetworkName;

    // Update the studio
    await ctx.db.patch(args.studioId, updateData);

    return args.studioId;
  },
});

/**
 * Update studio settings by clerk ID (convenience function)
 * This finds the studio by owner and updates it
 */
export const updateStudioByOwner = mutation({
  args: {
    clerkId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    coordinates: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    email: v.optional(v.string()),
    phoneCell: v.optional(v.string()),
    phoneLand: v.optional(v.string()),
    website: v.optional(v.string()),
    hours: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
    hideAddress: v.optional(v.boolean()),
    kioskModeEnabled: v.optional(v.boolean()),
    kioskEduMode: v.optional(v.boolean()),
    kioskAuthorizedNetworks: v.optional(v.string()),
    kioskNetworkName: v.optional(v.string()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the studio by owner
    const studio = await ctx.db
      .query("studios")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .first();

    if (!studio) {
      // Create a new studio if one doesn't exist
      const now = Date.now();
      const studioId = await ctx.db.insert("studios", {
        name: args.name || "My Studio",
        ownerId: user._id,
        description: args.description,
        location: args.location,
        city: args.city,
        state: args.state,
        zip: args.zip,
        coordinates: args.coordinates,
        email: args.email,
        phoneCell: args.phoneCell,
        phoneLand: args.phoneLand,
        website: args.website,
        hours: args.hours,
        amenities: args.amenities,
        hideAddress: args.hideAddress,
        kioskModeEnabled: args.kioskModeEnabled,
        kioskEduMode: args.kioskEduMode,
        kioskAuthorizedNetworks: args.kioskAuthorizedNetworks,
        kioskNetworkName: args.kioskNetworkName,
        isActive: true,
        requiresApproval: false,
        createdAt: now,
        updatedAt: now,
      });

      return studioId;
    }

    // Prepare update data (only include provided fields)
    const updateData: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.location !== undefined) updateData.location = args.location;
    if (args.city !== undefined) updateData.city = args.city;
    if (args.state !== undefined) updateData.state = args.state;
    if (args.zip !== undefined) updateData.zip = args.zip;
    if (args.coordinates !== undefined) updateData.coordinates = args.coordinates;
    if (args.email !== undefined) updateData.email = args.email;
    if (args.phoneCell !== undefined) updateData.phoneCell = args.phoneCell;
    if (args.phoneLand !== undefined) updateData.phoneLand = args.phoneLand;
    if (args.website !== undefined) updateData.website = args.website;
    if (args.hours !== undefined) updateData.hours = args.hours;
    if (args.amenities !== undefined) updateData.amenities = args.amenities;
    if (args.hideAddress !== undefined) updateData.hideAddress = args.hideAddress;
    if (args.kioskModeEnabled !== undefined)
      updateData.kioskModeEnabled = args.kioskModeEnabled;
    if (args.kioskEduMode !== undefined) updateData.kioskEduMode = args.kioskEduMode;
    if (args.kioskAuthorizedNetworks !== undefined)
      updateData.kioskAuthorizedNetworks = args.kioskAuthorizedNetworks;
    if (args.kioskNetworkName !== undefined)
      updateData.kioskNetworkName = args.kioskNetworkName;
    if (args.slug !== undefined) {
      // Validate slug before updating
      const { validateSlug } = await import("./utils/slugs");
      const validation = validateSlug(args.slug);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      // Check uniqueness
      const existing = await ctx.db
        .query("studios")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug))
        .first();
      if (existing && existing._id !== studio._id) {
        throw new Error("Slug is already in use by another studio");
      }
      updateData.slug = args.slug;
    }

    // Update the studio
    await ctx.db.patch(studio._id, updateData);

    return studio._id;
  },
});

/**
 * Delete studio (soft delete)
 */
export const deleteStudio = mutation({
  args: {
    clerkId: v.string(),
    studioId: v.id("studios"),
  },
  handler: async (ctx, args) => {
    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the studio
    const studio = await ctx.db.get(args.studioId);

    if (!studio) {
      throw new Error("Studio not found");
    }

    // Verify ownership
    if (studio.ownerId !== user._id) {
      throw new Error("Not authorized to delete this studio");
    }

    // Soft delete by setting deletedAt
    await ctx.db.patch(args.studioId, {
      deletedAt: Date.now(),
      isActive: false,
    });

    return { success: true };
  },
});

// =====================================================
// PUBLIC PROFILE & SLUG MANAGEMENT
// =====================================================

/**
 * Get studio public profile by slug - returns only public fields
 */
export const getStudioPublicProfile = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const studio = await ctx.db
      .query("studios")
      .withIndex("by_slug", q => q.eq("slug", args.slug))
      .first();

    if (!studio) {
      return null;
    }

    // Return only public fields (no sensitive data like ownerId, clerkOrgId, etc.)
    return {
      _id: studio._id,
      name: studio.name,
      slug: studio.slug,
      description: studio.description,
      city: studio.city,
      state: studio.state,
      location: studio.location,
      coordinates: studio.hideAddress ? undefined : studio.coordinates,
      photos: studio.photos,
      studioPhotos: studio.studioPhotos,
      logoUrl: studio.logoUrl,
      hourlyRate: studio.hourlyRate,
      minHourlyRate: studio.minHourlyRate,
      maxHourlyRate: studio.maxHourlyRate,
      currency: studio.currency,
      email: studio.email,
      phoneCell: studio.phoneCell,
      phoneLand: studio.phoneLand,
      website: studio.website,
      hours: studio.hours,
      amenities: studio.amenities,
      hideAddress: studio.hideAddress,
      isActive: studio.isActive,
      createdAt: studio.createdAt,
    };
  },
});

/**
 * Get studio ID by slug - lightweight lookup for auth checks
 */
export const getStudioIdBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const studio = await ctx.db
      .query("studios")
      .withIndex("by_slug", q => q.eq("slug", args.slug))
      .first();

    if (!studio) {
      return null;
    }

    return {
      _id: studio._id,
      name: studio.name,
    };
  },
});

/**
 * Get studio auth info by slug - returns owner/org data for access checks
 * Used by useStudioAuth hook (not exposed publicly)
 */
export const getStudioAuthInfo = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const studio = await ctx.db
      .query("studios")
      .withIndex("by_slug", q => q.eq("slug", args.slug))
      .first();

    if (!studio) {
      return null;
    }

    // Resolve owner's Clerk ID through the ownerId user reference
    const owner = await ctx.db.get(studio.ownerId);
    const ownerClerkId = owner?.clerkId ?? null;

    return {
      _id: studio._id,
      name: studio.name,
      ownerClerkId,
      clerkOrgId: studio.clerkOrgId ?? null,
    };
  },
});

/**
 * Check if a slug is available for use
 */
export const checkSlugAvailability = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    // Check reserved slugs
    const reservedSlug = await ctx.db
      .query("reservedSlugs")
      .withIndex("by_slug", q => q.eq("slug", args.slug))
      .first();

    if (reservedSlug) {
      return {
        available: false,
        reason: "reserved",
        requiresVerification: true,
      };
    }

    // Check if already claimed by another studio
    const existingStudio = await ctx.db
      .query("studios")
      .withIndex("by_slug", q => q.eq("slug", args.slug))
      .first();

    if (existingStudio) {
      return {
        available: false,
        reason: "claimed",
      };
    }

    return {
      available: true,
    };
  },
});

/**
 * Claim a reserved slug (verification flow)
 */
export const claimReservedSlug = mutation({
  args: {
    slug: v.string(),
    studioId: v.id("studios"),
    verificationMethod: v.string(), // "in_person" | "phone" | "mailer"
    claimantClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify the slug is actually reserved
    const reservedSlug = await ctx.db
      .query("reservedSlugs")
      .withIndex("by_slug", q => q.eq("slug", args.slug))
      .first();

    if (!reservedSlug) {
      throw new Error("Slug is not reserved");
    }

    // Check if there's already a pending claim for this slug
    const existingClaim = await ctx.db
      .query("slugClaims")
      .withIndex("by_slug", q => q.eq("slug", args.slug))
      .filter(q => q.eq(q.field("status"), "pending"))
      .first();

    if (existingClaim) {
      throw new Error("There is already a pending claim for this slug");
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create a new claim
    const claimId = await ctx.db.insert("slugClaims", {
      slug: args.slug,
      studioId: args.studioId,
      claimantClerkId: args.claimantClerkId,
      status: "pending",
      verificationMethod: args.verificationMethod,
      verificationCode,
      createdAt: Date.now(),
    });

    return { claimId, verificationCode };
  },
});

/**
 * Verify a slug claim
 */
export const verifySlugClaim = mutation({
  args: {
    claimId: v.id("slugClaims"),
    verificationCode: v.string(),
  },
  handler: async (ctx, args) => {
    const claim = await ctx.db.get(args.claimId);

    if (!claim) {
      throw new Error("Claim not found");
    }

    if (claim.status !== "pending") {
      throw new Error("Claim is no longer pending");
    }

    // Verify the code
    if (claim.verificationCode !== args.verificationCode) {
      throw new Error("Invalid verification code");
    }

    // Mark claim as verified
    await ctx.db.patch(args.claimId, {
      status: "verified",
      verifiedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Finalize slug claim - assign slug to studio
 */
export const finalizeSlugClaim = mutation({
  args: {
    studioId: v.id("studios"),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the claimant's auth info
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Get the claim for verification
    const claim = await ctx.db
      .query("slugClaims")
      .withIndex("by_slug", q => q.eq("slug", args.slug))
      .filter(q => q.eq(q.field("status"), "verified"))
      .first();

    if (!claim || claim.studioId !== args.studioId) {
      throw new Error("Invalid or unverified claim");
    }

    // Update studio with slug
    await ctx.db.patch(args.studioId, {
      slug: args.slug,
      updatedAt: Date.now(),
    });

    // Update claim status to claimed
    await ctx.db.patch(claim._id, {
      status: "claimed",
    });

    return { success: true };
  },
});

/**
 * Update studio slug (owner action)
 */
export const updateStudioSlug = mutation({
  args: {
    studioId: v.id("studios"),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the owner's auth info
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Not authenticated");
    }

    const studio = await ctx.db.get(args.studioId);

    if (!studio) {
      throw new Error("Studio not found");
    }

    // Verify ownership
    if (studio.ownerId !== user.subject) {
      throw new Error("Not authorized to update this studio");
    }

    // Validate the slug
    const validation = validateSlug(args.slug);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Check availability (except for current studio)
    const check = await ctx.db
      .query("studios")
      .withIndex("by_slug", q => q.eq("slug", args.slug))
      .first();

    if (check && check._id !== args.studioId) {
      throw new Error("Slug is already in use");
    }

    // Update the studio
    await ctx.db.patch(args.studioId, {
      slug: args.slug,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update studio last activity timestamp
 */
export const updateStudioActivity = mutation({
  args: {
    studioId: v.id("studios"),
  },
  handler: async (ctx, args) => {
    // Get user from auth context
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Not authenticated");
    }

    const studio = await ctx.db.get(args.studioId);

    if (!studio) {
      throw new Error("Studio not found");
    }

    // Verify they have access to this studio (owner, staff, etc.)
    // This could be extended to check membership in Clerk orgs later

    // Update last activity timestamp
    await ctx.db.patch(args.studioId, {
      lastActivityAt: Date.now(),
    });

    return { success: true };
  },
});

// =====================================================
// CLERK ORGANIZATION INTEGRATION
// =====================================================

/**
 * Link a Clerk Organization to a studio (called after org creation)
 */
export const linkClerkOrg = mutation({
  args: {
    clerkId: v.string(),
    studioId: v.id("studios"),
    clerkOrgId: v.string(),
  },
  handler: async (ctx, args) => {
    // Look up user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const studio = await ctx.db.get(args.studioId);
    if (!studio) {
      throw new Error("Studio not found");
    }

    // Verify ownership
    if (studio.ownerId !== user._id) {
      throw new Error("Only the studio owner can link a Clerk Organization");
    }

    await ctx.db.patch(args.studioId, {
      clerkOrgId: args.clerkOrgId,
      updatedAt: Date.now(),
    });

    return { success: true, clerkOrgId: args.clerkOrgId };
  },
});

/**
 * Get studio by Clerk org ID (for webhook lookups)
 */
export const getStudioByClerkOrgId = query({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, args) => {
    const studio = await ctx.db
      .query("studios")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .first();

    return studio;
  },
});

/**
 * Sync an org member to the studioStaff table (called by webhook)
 */
export const syncOrgMemberToStaff = mutation({
  args: {
    clerkOrgId: v.string(),
    clerkUserId: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    // Find studio by Clerk org ID
    const studio = await ctx.db
      .query("studios")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .first();

    if (!studio) {
      throw new Error("No studio found for this Clerk Organization");
    }

    // Find user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkUserId))
      .first();

    if (!user) {
      // User hasn't been synced yet — skip, they'll be added on next login sync
      console.log(`User ${args.clerkUserId} not found in Convex, skipping staff sync`);
      return { skipped: true, reason: "user_not_found" };
    }

    // Check if staff record already exists
    const existing = await ctx.db
      .query("studioStaff")
      .withIndex("by_studio", (q) => q.eq("studioId", studio._id))
      .collect();

    const existingStaff = existing.find(
      (s) => s.userId === user._id && !s.deletedAt
    );

    if (existingStaff) {
      // Update existing record
      await ctx.db.patch(existingStaff._id, {
        role: args.role,
        isActive: true,
        updatedAt: Date.now(),
      });
      return { success: true, action: "updated" };
    }

    // Create new staff record
    await ctx.db.insert("studioStaff", {
      studioId: studio._id,
      userId: user._id,
      role: args.role,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, action: "created" };
  },
});

/**
 * Remove an org member from the studioStaff table (called by webhook)
 */
export const removeOrgMemberFromStaff = mutation({
  args: {
    clerkOrgId: v.string(),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const studio = await ctx.db
      .query("studios")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .first();

    if (!studio) {
      throw new Error("No studio found for this Clerk Organization");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkUserId))
      .first();

    if (!user) {
      return { skipped: true, reason: "user_not_found" };
    }

    const staffRecords = await ctx.db
      .query("studioStaff")
      .withIndex("by_studio", (q) => q.eq("studioId", studio._id))
      .collect();

    const staffRecord = staffRecords.find(
      (s) => s.userId === user._id && !s.deletedAt
    );

    if (staffRecord) {
      await ctx.db.patch(staffRecord._id, {
        isActive: false,
        terminationDate: new Date().toISOString().split("T")[0],
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

/**
 * Sync org updates (name, slug) back to the studio record
 */
export const syncOrgUpdates = mutation({
  args: {
    clerkOrgId: v.string(),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const studio = await ctx.db
      .query("studios")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .first();

    if (!studio) {
      return { skipped: true, reason: "studio_not_found" };
    }

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name) updates.name = args.name;
    if (args.slug) {
      // Validate slug before updating
      const validation = validateSlug(args.slug);
      if (validation.valid) updates.slug = args.slug;
    }

    await ctx.db.patch(studio._id, updates);
    return { success: true };
  },
});
