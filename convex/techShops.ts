/**
 * Tech Shop Convex Functions
 *
 * Manages tech shop (technical services business) records in Convex.
 * Tech shops offer services like equipment repair, studio installation, consulting, etc.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a new tech shop
 *
 * Creates a tech shop record linked to a Clerk organization.
 * Each user can only have one tech shop.
 */
export const create = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    services: v.array(v.string()),
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

    // Check if user already has a tech shop
    const existingShop = await ctx.db
      .query("techShops")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .first();

    if (existingShop) {
      throw new Error("User already has a tech shop");
    }

    // Validate slug uniqueness
    const slugTaken = await ctx.db
      .query("techShops")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (slugTaken) {
      throw new Error("Slug is already in use");
    }

    const now = Date.now();

    // Create the tech shop
    const shopId = await ctx.db.insert("techShops", {
      name: args.name,
      ownerId: user._id,
      slug: args.slug,
      description: args.description || '',
      services: args.services || [],
      clerkOrgId: args.clerkOrgId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return shopId;
  },
});

/**
 * Get tech shop by owner Clerk ID
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
      .query("techShops")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .first();
  },
});

/**
 * Get tech shop by ID
 */
export const getById = query({
  args: { shopId: v.id("techShops") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.shopId);
  },
});

/**
 * Get tech shop by Clerk Org ID
 */
export const getByClerkOrgId = query({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("techShops")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .first();
  },
});

/**
 * Get tech shop by slug
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("techShops")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

/**
 * Update tech shop
 */
export const update = mutation({
  args: {
    clerkId: v.string(),
    shopId: v.id("techShops"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    services: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const shop = await ctx.db.get(args.shopId);
    if (!shop) {
      throw new Error("Tech shop not found");
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || user._id !== shop.ownerId) {
      throw new Error("Not authorized to update this tech shop");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.services !== undefined) updates.services = args.services;

    await ctx.db.patch(args.shopId, updates);

    return args.shopId;
  },
});

/**
 * Soft delete tech shop
 */
export const deleteShop = mutation({
  args: {
    clerkId: v.string(),
    shopId: v.id("techShops"),
  },
  handler: async (ctx, args) => {
    const shop = await ctx.db.get(args.shopId);
    if (!shop) {
      throw new Error("Tech shop not found");
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || user._id !== shop.ownerId) {
      throw new Error("Not authorized to delete this tech shop");
    }

    await ctx.db.patch(args.shopId, {
      isActive: false,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.shopId;
  },
});

/**
 * Get all active tech shops (for admin/directory)
 */
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("techShops")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});
