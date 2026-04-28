/**
 * Schools Convex Functions
 *
 * Manages educational institution records in Convex.
 * Schools manage students, staff, courses, and programs.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a new school
 *
 * Creates a school record linked to a Clerk organization.
 * Each user can only have one school.
 */
export const create = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
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

    // Check if user already has a school
    const existingSchool = await ctx.db
      .query("schools")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .first();

    if (existingSchool) {
      // If the school isn't linked to this org yet, link it now and update name
      await ctx.db.patch(existingSchool._id, {
        clerkOrgId: args.clerkOrgId,
        name: args.name, // Ensure name matches the Clerk Org name
        updatedAt: Date.now(),
      });
      return existingSchool._id;
    }

    // Validate slug uniqueness
    const slugTaken = await ctx.db
      .query("schools")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (slugTaken) {
      throw new Error("Slug is already in use");
    }

    const now = Date.now();

    // Create the school
    const schoolId = await ctx.db.insert("schools", {
      name: args.name,
      ownerId: user._id,
      adminId: user._id,
      code: args.slug.substring(0, 8).toUpperCase(),
      slug: args.slug,
      description: args.description || '',
      address: args.address || '',
      clerkOrgId: args.clerkOrgId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return schoolId;
  },
});

/**
 * Get school by owner Clerk ID
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
      .query("schools")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .first();
  },
});

/**
 * Get school by ID
 */
export const getById = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.schoolId);
  },
});

/**
 * Get school by Clerk Org ID
 */
export const getByClerkOrgId = query({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("schools")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .first();
  },
});

/**
 * Get school by slug
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("schools")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

/**
 * Update school
 */
export const update = mutation({
  args: {
    clerkId: v.string(),
    schoolId: v.id("schools"),
    name: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    address: v.optional(v.union(v.string(), v.null())),
    primaryColor: v.optional(v.string()),
    website: v.optional(v.union(v.string(), v.null())),
    contactEmail: v.optional(v.union(v.string(), v.null())),
    logoURL: v.optional(v.union(v.string(), v.null())),
    enabledFeatures: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const school = await ctx.db.get(args.schoolId);
    if (!school) {
      throw new Error("School not found");
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || user._id !== school.ownerId) {
      throw new Error("Not authorized to update this school");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.address !== undefined) updates.address = args.address;
    if (args.primaryColor !== undefined) updates.primaryColor = args.primaryColor;
    if (args.website !== undefined) updates.website = args.website;
    if (args.contactEmail !== undefined) updates.contactEmail = args.contactEmail;
    if (args.logoURL !== undefined) updates.logoURL = args.logoURL;
    if (args.enabledFeatures !== undefined) updates.enabledFeatures = args.enabledFeatures;

    await ctx.db.patch(args.schoolId, updates);

    return args.schoolId;
  },
});

/**
 * Soft delete school
 */
export const deleteSchool = mutation({
  args: {
    clerkId: v.string(),
    schoolId: v.id("schools"),
  },
  handler: async (ctx, args) => {
    const school = await ctx.db.get(args.schoolId);
    if (!school) {
      throw new Error("School not found");
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || user._id !== school.ownerId) {
      throw new Error("Not authorized to delete this school");
    }

    await ctx.db.patch(args.schoolId, {
      isActive: false,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.schoolId;
  },
});

/**
 * Get all active schools (for admin/directory)
 */
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("schools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

/**
 * Get school staff members
 */
export const getStaff = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    // This would query a schoolStaff table
    // For now, return empty array
    return [];
  },
});

/**
 * Get school students
 */
export const getStudents = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    // This would query a schoolStudents table
    // For now, return empty array
    return [];
  },
});

/**
 * Add staff member to school
 */
export const addStaff = mutation({
  args: {
    clerkId: v.string(),
    schoolId: v.id("schools"),
    staffUserId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const school = await ctx.db.get(args.schoolId);
    if (!school) {
      throw new Error("School not found");
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || user._id !== school.ownerId) {
      throw new Error("Not authorized: only school owners can add staff");
    }

    // This would insert into a schoolStaff table
    // For now, just return success

    return { success: true };
  },
});
