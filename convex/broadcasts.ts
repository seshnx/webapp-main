import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// GIG BROADCASTS QUERIES & MUTATIONS
// =============================================================================

export const getActiveBroadcasts = query({
  args: {
    serviceType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    let broadcasts = await ctx.db
      .query("broadcasts")
      .withIndex("by_status", (q) => q.eq("status", "Broadcasting"))
      .order("desc")
      .take(limit);

    if (args.serviceType && args.serviceType !== 'all') {
      broadcasts = broadcasts.filter(b => b.serviceType.toLowerCase().includes(args.serviceType!.toLowerCase()));
    }

    return broadcasts;
  },
});

export const getBroadcastById = query({
  args: { broadcastId: v.id("broadcasts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.broadcastId);
  },
});

export const createBroadcast = mutation({
  args: {
    senderClerkId: v.string(),
    serviceType: v.string(),
    targetName: v.optional(v.string()),
    offerAmount: v.optional(v.number()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    duration: v.optional(v.number()),
    requirements: v.optional(v.array(v.string())),
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    locationName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.senderClerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const senderName = user.displayName || user.profileName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || "Creative";
    const now = Date.now();

    const broadcastId = await ctx.db.insert("broadcasts", {
      senderId: user._id,
      senderName,
      senderPhoto: user.avatarUrl,
      targetName: args.targetName,
      serviceType: args.serviceType,
      offerAmount: args.offerAmount,
      date: args.date,
      time: args.time,
      duration: args.duration,
      requirements: args.requirements,
      location: args.location,
      locationName: args.locationName,
      status: "Broadcasting",
      type: "Broadcast",
      timestamp: now,
      createdAt: now,
      updatedAt: now,
    });

    return broadcastId;
  },
});

export const cancelBroadcast = mutation({
  args: {
    broadcastId: v.id("broadcasts"),
    userClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userClerkId))
      .first();

    if (!user) throw new Error("Unauthorized");

    const broadcast = await ctx.db.get(args.broadcastId);
    if (!broadcast) throw new Error("Broadcast not found");

    if (broadcast.senderId !== user._id) {
      throw new Error("Unauthorized: Only the creator can cancel this broadcast");
    }

    await ctx.db.patch(args.broadcastId, {
      status: "Cancelled",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const submitBroadcastBid = mutation({
  args: {
    broadcastId: v.id("broadcasts"),
    bidderClerkId: v.string(),
    offerAmount: v.number(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const bidder = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.bidderClerkId))
      .first();

    if (!bidder) throw new Error("Bidder not found");

    const broadcast = await ctx.db.get(args.broadcastId);
    if (!broadcast) throw new Error("Broadcast not found");

    if (broadcast.senderId === bidder._id) {
      throw new Error("Cannot bid on your own broadcast");
    }

    const bidderName = bidder.displayName || bidder.profileName || `${bidder.firstName || ''} ${bidder.lastName || ''}`.trim() || "Creative";

    // Notify the broadcast owner of the incoming bid
    await ctx.db.insert("notifications", {
      userId: broadcast.senderId,
      type: "broadcast_bid",
      title: "New Bid on Broadcast!",
      message: `${bidderName} submitted a bid of $${args.offerAmount} on your broadcast: "${broadcast.serviceType}"`,
      actorId: bidder._id,
      actorName: bidderName,
      actorPhoto: bidder.avatarUrl,
      targetId: args.broadcastId.toString(),
      targetType: "broadcast",
      read: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
