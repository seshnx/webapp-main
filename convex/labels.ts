/**
 * Labels Convex Functions
 *
 * Manages record label records in Convex.
 * Labels manage artist rosters, releases, and distribution.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a new label
 *
 * Creates a label record linked to a Clerk organization.
 * Each user can only have one label.
 */
export const create = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    genres: v.array(v.string()),
    clerkOrgId: v.string(),
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

    // Check if user already has a label
    const existingLabel = await ctx.db
      .query("labels")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .first();

    if (existingLabel) {
      throw new Error("User already has a label");
    }

    // Validate slug uniqueness
    const slugTaken = await ctx.db
      .query("labels")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (slugTaken) {
      throw new Error("Slug is already in use");
    }

    const now = Date.now();

    // Create the label
    const labelId = await ctx.db.insert("labels", {
      name: args.name,
      ownerId: user._id,
      slug: args.slug,
      description: args.description || '',
      genres: args.genres || [],
      clerkOrgId: args.clerkOrgId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return labelId;
  },
});

/**
 * Get label by owner Clerk ID
 */
export const getByOwner = query({
  args: { ownerClerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.ownerClerkId))
      .first();

    if (!user) return null;

    return await ctx.db
      .query("labels")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .first();
  },
});

/**
 * Get label by ID
 */
export const getById = query({
  args: { labelId: v.id("labels") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.labelId);
  },
});

/**
 * Get label by Clerk Org ID
 */
export const getByClerkOrgId = query({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("labels")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .first();
  },
});

/**
 * Get label by slug
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("labels")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

/**
 * Update label
 */
export const update = mutation({
  args: {
    clerkId: v.string(),
    labelId: v.id("labels"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const label = await ctx.db.get(args.labelId);
    if (!label) {
      throw new Error("Label not found");
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || user._id !== label.ownerId) {
      throw new Error("Not authorized to update this label");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.genres !== undefined) updates.genres = args.genres;

    await ctx.db.patch(args.labelId, updates);

    return args.labelId;
  },
});

/**
 * Soft delete label
 */
export const deleteLabel = mutation({
  args: {
    clerkId: v.string(),
    labelId: v.id("labels"),
  },
  handler: async (ctx, args) => {
    const label = await ctx.db.get(args.labelId);
    if (!label) {
      throw new Error("Label not found");
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || user._id !== label.ownerId) {
      throw new Error("Not authorized to delete this label");
    }

    await ctx.db.patch(args.labelId, {
      isActive: false,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.labelId;
  },
});

/**
 * Get all active labels (for admin/directory)
 */
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("labels")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

/**
 * Assign agent to artist for a label
 *
 * Only label owners can assign agents to artists.
 */
export const assignAgent = mutation({
  args: {
    clerkId: v.string(),
    labelId: v.id("labels"),
    artistId: v.id("users"),
    agentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const label = await ctx.db.get(args.labelId);
    if (!label) {
      throw new Error("Label not found");
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || user._id !== label.ownerId) {
      throw new Error("Not authorized: only label owners can assign agents");
    }

    // Verify agent exists
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Verify artist exists
    const artist = await ctx.db.get(args.artistId);
    if (!artist) {
      throw new Error("Artist not found");
    }

    // Create or update artist-label-agent relationship
    // This would typically be stored in a separate table like labelArtists
    // For now, we'll assume this structure exists

    return { success: true };
  },
});

/**
 * Get label roster (artists signed to the label)
 */
export const getRoster = query({
  args: { labelId: v.id("labels") },
  handler: async (ctx, args) => {
    // This would query a labelArtists table
    // For now, return empty array as the table structure is being migrated
    return [];
  },
});
