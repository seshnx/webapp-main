import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// SPONSORED POSTS & NATIVE ADS ENGINE
// =============================================================================

/**
 * Get all active sponsored posts matching user's tier (Feed Image/Post Ads)
 */
export const getActiveSponsoredPosts = query({
  args: {
    userTier: v.optional(v.string()), // "free" | "basic" | "pro" | "studio"
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const tier = (args.userTier || "free").toLowerCase();

    const now = Date.now();
    const activeAds = await ctx.db
      .query("sponsoredPosts")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .take(args.limit || 10);

    return activeAds.filter((ad) => {
      // Exclude dedicated shorts from standard static feed if marked as short
      if (ad.isShort === true) return false;
      // Check date bounds if configured
      if (ad.startDate && ad.startDate > now) return false;
      if (ad.endDate && ad.endDate < now) return false;
      // Check tier targeting if configured
      if (
        ad.targetTiers &&
        ad.targetTiers.length > 0 &&
        !ad.targetTiers.map((t) => t.toLowerCase()).includes(tier)
      ) {
        return false;
      }
      return true;
    });
  },
});

/**
 * Get active sponsored video shorts / reels
 */
export const getActiveSponsoredShorts = query({
  args: {
    userTier: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const tier = (args.userTier || "free").toLowerCase();
    const now = Date.now();

    const activeAds = await ctx.db
      .query("sponsoredPosts")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .take(args.limit || 10);

    return activeAds.filter((ad) => {
      // Must be marked as short or video
      if (!ad.isShort && ad.mediaType !== "video") return false;
      if (ad.startDate && ad.startDate > now) return false;
      if (ad.endDate && ad.endDate < now) return false;
      if (
        ad.targetTiers &&
        ad.targetTiers.length > 0 &&
        !ad.targetTiers.map((t) => t.toLowerCase()).includes(tier)
      ) {
        return false;
      }
      return true;
    });
  },
});

/**
 * Seed "Your Brand Here" placeholder ads for Feed, Shorts, and Gear listings
 */
export const seedPlaceholderAds = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // 1. Check or seed Feed Sponsored Post
    const existingFeedAd = await ctx.db
      .query("sponsoredPosts")
      .filter((q) => q.eq(q.field("sponsorName"), "Your Brand Here"))
      .first();

    if (!existingFeedAd) {
      await ctx.db.insert("sponsoredPosts", {
        title: "Your Brand Here • Elevate Your Music & Studio Reach",
        content:
          "Put your recording studio, audio plugins, hardware gear, or music services directly in front of thousands of creators and producers on SeshNx.",
        mediaUrl:
          "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80",
        sponsorName: "Your Brand Here",
        sponsorLogo:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80",
        sponsorUrl: "https://seshnx.com/business-center",
        ctaText: "Promote Your Brand ↗",
        category: "Studio & Production",
        targetTiers: ["free", "basic", "pro", "studio"],
        status: "active",
        impressionsCount: 0,
        clicksCount: 0,
        startDate: now - 86400000,
        createdAt: now,
        isShort: false,
        mediaType: "image",
      });

      // 2. Seed Sponsored Video Short
      await ctx.db.insert("sponsoredPosts", {
        title: "Your Brand Here • Featured Studio Showcase",
        content:
          "Showcase your plugins, mic shootouts, and workflow highlights in full-screen sponsored video shorts across the creator community.",
        mediaUrl:
          "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-playing-the-piano-41772-large.mp4",
        videoUrl:
          "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-playing-the-piano-41772-large.mp4",
        sponsorName: "Your Brand Here",
        sponsorLogo:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80",
        sponsorUrl: "https://seshnx.com/business-center",
        ctaText: "Advertise in Shorts ↗",
        category: "Video Showcase",
        targetTiers: ["free", "basic", "pro", "studio"],
        status: "active",
        impressionsCount: 0,
        clicksCount: 0,
        startDate: now - 86400000,
        createdAt: now,
        isShort: true,
        mediaType: "video",
      });
    }

    // 3. Check or seed Gear Listing
    const existingGearDeal = await ctx.db
      .query("affiliateGearDeals")
      .filter((q) => q.eq(q.field("brand"), "Your Brand Here"))
      .first();

    if (!existingGearDeal) {
      await ctx.db.insert("affiliateGearDeals", {
        retailer: "Your Brand Here",
        title: "Your Brand Flagship Studio Condenser Microphone & Interface",
        brand: "Your Brand Here",
        category: "Microphones",
        price: 299,
        originalPrice: 399,
        imageUrl:
          "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80",
        productUrl: "https://seshnx.com/marketplace",
        affiliateCode: "YOURBRAND2026",
        status: "active",
        clicksCount: 0,
        createdAt: now,
      });
    }

    return { success: true };
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
 * Protected by webhook secret — must be invoked following a verified payment webhook.
 */
export const subscribeToPriorityVisibility = mutation({
  args: {
    clerkId: v.string(),
    tier: v.optional(v.string()), // "creator_priority" | "studio_pro"
    durationDays: v.optional(v.number()), // e.g. 30 days
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.CONVEX_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
    if (!expectedSecret || args.secret !== expectedSecret) {
      throw new Error("Unauthorized: Invalid webhook secret");
    }

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
