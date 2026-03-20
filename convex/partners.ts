import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// SCHOOL PARTNERS
// =============================================================================

/**
 * Get all partners for a school
 */
export const getPartnersBySchool = query({
  args: {
    schoolId: v.id("schools"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let partners = await ctx.db
      .query("partners")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .collect();

    // Filter by status if specified
    if (args.status) {
      partners = partners.filter((p) => p.status === args.status);
    }

    // Sort by name
    partners.sort((a, b) => a.name.localeCompare(b.name));

    return partners;
  },
});

/**
 * Get a partner by ID
 */
export const getPartnerById = query({
  args: { partnerId: v.id("partners") },
  handler: async (ctx, args) => {
    const partner = await ctx.db.get(args.partnerId);
    return partner;
  },
});

/**
 * Create a new partner
 */
export const createPartner = mutation({
  args: {
    schoolId: v.id("schools"),
    name: v.string(),
    address: v.optional(v.string()),
    website: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const partnerId = await ctx.db.insert("partners", {
      schoolId: args.schoolId,
      name: args.name,
      address: args.address,
      website: args.website,
      contactEmail: args.contactEmail,
      status: args.status || "Active",
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, partnerId };
  },
});

/**
 * Update a partner
 */
export const updatePartner = mutation({
  args: {
    partnerId: v.id("partners"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    website: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { partnerId, ...updates } = args;
    const partner = await ctx.db.get(partnerId);

    if (!partner) {
      throw new Error("Partner not found");
    }

    await ctx.db.patch(partnerId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete a partner (soft delete by setting status to Inactive)
 */
export const deletePartner = mutation({
  args: { partnerId: v.id("partners") },
  handler: async (ctx, args) => {
    const partner = await ctx.db.get(args.partnerId);

    if (!partner) {
      throw new Error("Partner not found");
    }

    // Soft delete by setting status to Inactive
    await ctx.db.patch(args.partnerId, {
      status: "Inactive",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Permanently delete a partner
 */
export const permanentDeletePartner = mutation({
  args: { partnerId: v.id("partners") },
  handler: async (ctx, args) => {
    const partner = await ctx.db.get(args.partnerId);

    if (!partner) {
      throw new Error("Partner not found");
    }

    await ctx.db.delete(args.partnerId);

    return { success: true };
  },
});

/**
 * Search partners by name
 */
export const searchPartners = query({
  args: {
    schoolId: v.id("schools"),
    searchQuery: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const partners = await ctx.db
      .query("partners")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .collect();

    // Filter by search query
    const query = args.searchQuery.toLowerCase();
    const filtered = partners.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.address?.toLowerCase().includes(query) ||
        p.contactEmail?.toLowerCase().includes(query)
    );

    // Limit results
    if (args.limit) {
      return filtered.slice(0, args.limit);
    }

    return filtered;
  },
});
