import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// SPONSORED POSTS & NATIVE ADS ENGINE
// =============================================================================

/**
 * Get all active sponsored posts matching user's tier
 */
export const getActiveSponsoredPosts = query({
  args: {
    userTier: v.optional(v.string()), // "free" | "basic" | "pro"
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const tier = (args.userTier || "free").toLowerCase();

    // Pro / Studio accounts are ad-free
    if (["pro", "studio", "enterprise"].includes(tier)) {
      return [];
    }

    const now = Date.now();
    const activeAds = await ctx.db
      .query("sponsoredPosts")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .take(args.limit || 10);

    return activeAds.filter((ad) => {
      // Check date bounds if configured
      if (ad.startDate && ad.startDate > now) return false;
      if (ad.endDate && ad.endDate < now) return false;
      // Check tier targeting
      if (ad.targetTiers && ad.targetTiers.length > 0 && !ad.targetTiers.includes(tier)) {
        return false;
      }
      return true;
    });
  },
});

/**
 * Get active retailer affiliate gear deals for Marketplace
 */
export const getActiveAffiliateDeals = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let dealsQuery = ctx.db
      .query("affiliateGearDeals")
      .withIndex("by_status", (q) => q.eq("status", "active"));

    let deals = await dealsQuery.order("desc").take(args.limit || 20);

    if (args.category && args.category !== "all") {
      deals = deals.filter(
        (d) => d.category.toLowerCase() === args.category?.toLowerCase()
      );
    }

    return deals;
  },
});

/**
 * Record an impression for a sponsored ad
 */
export const trackAdImpression = mutation({
  args: {
    adId: v.id("sponsoredPosts"),
  },
  handler: async (ctx, args) => {
    const ad = await ctx.db.get(args.adId);
    if (!ad) return;

    await ctx.db.patch(args.adId, {
      impressionsCount: (ad.impressionsCount || 0) + 1,
    });
  },
});

/**
 * Record an outbound click for a sponsored ad or affiliate gear deal
 */
export const trackAdClick = mutation({
  args: {
    type: v.union(v.literal("sponsored_post"), v.literal("affiliate_gear")),
    id: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.type === "sponsored_post") {
      const adId = ctx.db.normalizeId("sponsoredPosts", args.id);
      if (adId) {
        const ad = await ctx.db.get(adId);
        if (ad) {
          await ctx.db.patch(adId, {
            clicksCount: (ad.clicksCount || 0) + 1,
          });
        }
      }
    } else if (args.type === "affiliate_gear") {
      const dealId = ctx.db.normalizeId("affiliateGearDeals", args.id);
      if (dealId) {
        const deal = await ctx.db.get(dealId);
        if (deal) {
          await ctx.db.patch(dealId, {
            clicksCount: (deal.clicksCount || 0) + 1,
          });
        }
      }
    }
  },
});

// =============================================================================
// USER-FACING PRIORITY & VISIBILITY BOOST ENGINE
// =============================================================================

/**
 * Subscribe or activate Creator Priority Visibility pass ("Blue Checkmark")
 */
export const subscribeToPriorityVisibility = mutation({
  args: {
    clerkId: v.string(),
    tier: v.optional(v.string()), // "creator_priority" | "studio_pro"
    durationDays: v.optional(v.number()), // e.g. 30 days
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    const days = args.durationDays || 30;
    const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;

    await ctx.db.patch(user._id, {
      isPriorityBoosted: true,
      boostTier: args.tier || "creator_priority",
      boostExpiresAt: expiresAt,
      updatedAt: Date.now(),
    });

    return { success: true, expiresAt };
  },
});

/**
 * Boost a specific post (Geo-Radius Expansion or Feed Priority)
 */
export const boostPost = mutation({
  args: {
    postId: v.id("posts"),
    clerkId: v.string(),
    radiusMiles: v.optional(v.number()), // 15, 25, 50, 100
    coordinates: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    boostType: v.optional(v.string()), // "studio_local" | "creator_priority"
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || post.authorId !== user._id) {
      throw new Error("Unauthorized to boost this post");
    }

    await ctx.db.patch(args.postId, {
      isBoosted: true,
      boostRadiusMiles: args.radiusMiles || 25,
      boostCoordinates: args.coordinates,
      boostType: args.boostType || "studio_local",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
