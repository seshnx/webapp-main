import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// MARKET ITEMS
// =============================================================================

export const getMarketItems = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("marketItems")
      .withIndex("by_created")
      .filter((q) =>
        q.and(
          q.eq(q.field("deletedAt"), undefined),
          q.eq(q.field("status"), "available")
        )
      )
      .collect();

    return items;
  },
});

export const getMarketItemById = query({
  args: { itemId: v.id("marketItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item || item.deletedAt) return null;
    return item;
  },
});

export const getMarketItemsBySeller = query({
  args: {
    sellerId: v.string(),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("marketItems")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId));

    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    } else {
      q = q.filter((q) => q.eq(q.field("deletedAt"), undefined));
    }

    let items = await q.collect();

    // Sort by created date (newest first)
    items.sort((a, b) => b.createdAt - a.createdAt);

    if (args.limit) {
      items = items.slice(0, args.limit);
    }

    return items;
  },
});

export const searchMarketItems = query({
  args: {
    searchQuery: v.optional(v.string()),
    category: v.optional(v.string()),
    condition: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    location: v.optional(v.string()),
    itemType: v.optional(v.string()), // 'gear', 'instrument', 'equipment', 'service'
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let items = await ctx.db
      .query("marketItems")
      .withIndex("by_created")
      .filter((q) =>
        q.and(
          q.eq(q.field("deletedAt"), undefined),
          q.eq(q.field("status"), "available")
        )
      )
      .collect();

    // Filter by search query
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query) ||
          item.model?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (args.category) {
      items = items.filter((item) => item.category === args.category);
    }

    // Filter by condition
    if (args.condition) {
      items = items.filter((item) => item.condition === args.condition);
    }

    // Filter by price range
    if (args.minPrice !== undefined) {
      items = items.filter((item) => item.price >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      items = items.filter((item) => item.price <= args.maxPrice!);
    }

    // Filter by location
    if (args.location) {
      items = items.filter((item) =>
        item.location?.toLowerCase().includes(args.location!.toLowerCase())
      );
    }

    // Filter by item type
    if (args.itemType) {
      items = items.filter((item) => item.itemType === args.itemType);
    }

    // Sort by created date (newest first)
    items.sort((a, b) => b.createdAt - a.createdAt);

    if (args.limit) {
      items = items.slice(0, args.limit);
    }

    return items;
  },
});

export const getFeaturedItems = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("marketItems")
      .withIndex("by_created")
      .filter((q) =>
        q.and(
          q.eq(q.field("deletedAt"), undefined),
          q.eq(q.field("status"), "available"),
          q.eq(q.field("featured"), true)
        )
      )
      .collect();

    // Sort by created date
    items.sort((a, b) => b.createdAt - a.createdAt);

    if (args.limit) {
      return items.slice(0, args.limit);
    }

    return items;
  },
});

export const createMarketItem = mutation({
  args: {
    sellerId: v.string(),
    sellerName: v.string(),
    sellerEmail: v.string(),
    sellerPhone: v.optional(v.string()),
    sellerPhoto: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    itemType: v.string(), // 'gear', 'instrument', 'equipment', 'service'
    category: v.string(),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    condition: v.string(), // 'new', 'like-new', 'good', 'fair', 'poor'
    price: v.number(),
    negotiable: v.optional(v.boolean()),
    location: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    specifications: v.optional(v.object({})), // Flexible object for item-specific specs
    featured: v.optional(v.boolean()),
    shippingAvailable: v.optional(v.boolean()),
    shippingCost: v.optional(v.number()),
    localPickup: v.optional(v.boolean()),
    dimensions: v.optional(v.string()), // e.g., "20x10x5 inches"
    weight: v.optional(v.string()), // e.g., "15 lbs"
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const itemId = await ctx.db.insert("marketItems", {
      ...args,
      negotiable: args.negotiable || false,
      featured: args.featured || false,
      shippingAvailable: args.shippingAvailable || false,
      localPickup: args.localPickup !== false, // Default to true
      status: "available",
      viewCount: 0,
      favoriteCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, itemId };
  },
});

export const updateMarketItem = mutation({
  args: {
    itemId: v.id("marketItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    condition: v.optional(v.string()),
    price: v.optional(v.number()),
    negotiable: v.optional(v.boolean()),
    location: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    specifications: v.optional(v.object({})),
    featured: v.optional(v.boolean()),
    shippingAvailable: v.optional(v.boolean()),
    shippingCost: v.optional(v.number()),
    localPickup: v.optional(v.boolean()),
    dimensions: v.optional(v.string()),
    weight: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(v.string()), // 'available', 'pending', 'sold', 'removed'
  },
  handler: async (ctx, args) => {
    const { itemId, ...updates } = args;
    const item = await ctx.db.get(itemId);

    if (!item) {
      throw new Error("Item not found");
    }

    await ctx.db.patch(itemId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteMarketItem = mutation({
  args: { itemId: v.id("marketItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);

    if (!item) {
      throw new Error("Item not found");
    }

    // Soft delete
    await ctx.db.patch(args.itemId, {
      deletedAt: Date.now(),
    });

    return { success: true };
  },
});

export const incrementViewCount = mutation({
  args: { itemId: v.id("marketItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);

    if (!item) {
      throw new Error("Item not found");
    }

    await ctx.db.patch(args.itemId, {
      viewCount: (item.viewCount || 0) + 1,
    });

    return { success: true };
  },
});

// =============================================================================
// MARKET TRANSACTIONS
// =============================================================================

export const getTransactionsByBuyer = query({
  args: {
    buyerId: v.string(),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("marketTransactions")
      .withIndex("by_buyer", (q) => q.eq("buyerId", args.buyerId));

    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }

    let transactions = await q.collect();

    // Sort by created date (newest first)
    transactions.sort((a, b) => b.createdAt - a.createdAt);

    if (args.limit) {
      transactions = transactions.slice(0, args.limit);
    }

    return transactions;
  },
});

export const getTransactionsBySeller = query({
  args: {
    sellerId: v.string(),
    status: v.optional(v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("marketTransactions")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId));

    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }

    let transactions = await q.collect();

    // Sort by created date (newest first)
    transactions.sort((a, b) => b.createdAt - a.createdAt);

    if (args.limit) {
      transactions = transactions.slice(0, args.limit);
    }

    return transactions;
  },
});

export const getTransactionById = query({
  args: { transactionId: v.id("marketTransactions") },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) return null;
    return transaction;
  },
});

export const getTransactionsByItem = query({
  args: { itemId: v.id("marketItems") },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("marketTransactions")
      .withIndex("by_item", (q) => q.eq("itemId", args.itemId))
      .collect();

    return transactions;
  },
});

export const createTransaction = mutation({
  args: {
    itemId: v.id("marketItems"),
    buyerId: v.string(),
    buyerName: v.string(),
    buyerEmail: v.string(),
    buyerPhone: v.optional(v.string()),
    sellerId: v.string(),
    sellerName: v.string(),
    sellerEmail: v.string(),
    sellerPhone: v.optional(v.string()),
    offerAmount: v.optional(v.number()), // If different from listed price
    message: v.optional(v.string()),
    paymentMethod: v.optional(v.string()), // 'cash', 'card', 'transfer'
    shippingRequired: v.optional(v.boolean()),
    shippingAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);

    if (!item) {
      throw new Error("Item not found");
    }

    if (item.status !== "available") {
      throw new Error("Item is not available");
    }

    // Check if buyer is the seller
    if (args.buyerId === args.sellerId) {
      throw new Error("Cannot purchase your own item");
    }

    const now = Date.now();

    const transactionId = await ctx.db.insert("marketTransactions", {
      ...args,
      offerAmount: args.offerAmount || item.price,
      status: "pending",
      paymentMethod: args.paymentMethod || "cash",
      shippingRequired: args.shippingRequired || false,
      createdAt: now,
      updatedAt: now,
    });

    // Update item status to pending
    await ctx.db.patch(args.itemId, {
      status: "pending",
      updatedAt: now,
    });

    return { success: true, transactionId };
  },
});

export const acceptOffer = mutation({
  args: {
    transactionId: v.id("marketTransactions"),
    counterOffer: v.optional(v.number()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status !== "pending") {
      throw new Error("Cannot accept this transaction");
    }

    const updates: any = {
      status: "accepted",
      updatedAt: Date.now(),
    };

    if (args.counterOffer !== undefined) {
      updates.offerAmount = args.counterOffer;
      updates.status = "countered";
      updates.counterMessage = args.message;
    }

    if (args.message && !args.counterOffer) {
      updates.sellerMessage = args.message;
    }

    await ctx.db.patch(args.transactionId, updates);

    return { success: true };
  },
});

export const rejectOffer = mutation({
  args: {
    transactionId: v.id("marketTransactions"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status !== "pending" && transaction.status !== "countered") {
      throw new Error("Cannot reject this transaction");
    }

    await ctx.db.patch(args.transactionId, {
      status: "rejected",
      rejectionReason: args.reason,
      rejectedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update item status back to available
    await ctx.db.patch(transaction.itemId, {
      status: "available",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const confirmPurchase = mutation({
  args: {
    transactionId: v.id("marketTransactions"),
    paymentConfirmed: v.boolean(),
    trackingNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status !== "accepted") {
      throw new Error("Transaction must be accepted first");
    }

    const updates: any = {
      status: "confirmed",
      updatedAt: Date.now(),
    };

    if (args.paymentConfirmed) {
      updates.paymentConfirmed = true;
      updates.paymentConfirmedAt = Date.now();
    }

    if (args.trackingNumber) {
      updates.trackingNumber = args.trackingNumber;
    }

    await ctx.db.patch(args.transactionId, updates);

    // Update item status to sold
    await ctx.db.patch(transaction.itemId, {
      status: "sold",
      soldAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const completeTransaction = mutation({
  args: {
    transactionId: v.id("marketTransactions"),
    buyerRating: v.optional(v.number()),
    buyerReview: v.optional(v.string()),
    sellerRating: v.optional(v.number()},
    sellerReview: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status !== "confirmed") {
      throw new Error("Transaction must be confirmed first");
    }

    const updates: any = {
      status: "completed",
      completedAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (args.buyerRating !== undefined) {
      updates.buyerRating = args.buyerRating;
    }
    if (args.buyerReview !== undefined) {
      updates.buyerReview = args.buyerReview;
    }
    if (args.sellerRating !== undefined) {
      updates.sellerRating = args.sellerRating;
    }
    if (args.sellerReview !== undefined) {
      updates.sellerReview = args.sellerReview;
    }

    await ctx.db.patch(args.transactionId, updates);

    return { success: true };
  },
});

export const cancelTransaction = mutation({
  args: {
    transactionId: v.id("marketTransactions"),
    cancelledBy: v.string(), // 'buyer' or 'seller'
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status === "completed" || transaction.status === "cancelled") {
      throw new Error("Cannot cancel this transaction");
    }

    await ctx.db.patch(args.transactionId, {
      status: "cancelled",
      cancelledBy: args.cancelledBy,
      cancellationReason: args.reason,
      cancelledAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update item status back to available
    await ctx.db.patch(transaction.itemId, {
      status: "available",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// =============================================================================
// WATCHLIST / FAVORITES
// =============================================================================

export const getWatchlist = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const watchlist = await ctx.db
      .query("marketWatchlist")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return watchlist;
  },
});

export const isInWatchlist = query({
  args: {
    userId: v.string(),
    itemId: v.id("marketItems"),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("marketWatchlist")
      .withIndex("by_user_item", (q) =>
        q.eq("userId", args.userId).eq("itemId", args.itemId)
      )
      .first();

    return entry !== null;
  },
});

export const addToWatchlist = mutation({
  args: {
    userId: v.string(),
    itemId: v.id("marketItems"),
  },
  handler: async (ctx, args) => {
    // Check if already in watchlist
    const existing = await ctx.db
      .query("marketWatchlist")
      .withIndex("by_user_item", (q) =>
        q.eq("userId", args.userId).eq("itemId", args.itemId)
      )
      .first();

    if (existing) {
      return { success: true, alreadyInWatchlist: true };
    }

    const now = Date.now();

    await ctx.db.insert("marketWatchlist", {
      userId: args.userId,
      itemId: args.itemId,
      addedAt: now,
    });

    // Increment favorite count on item
    const item = await ctx.db.get(args.itemId);
    if (item) {
      await ctx.db.patch(args.itemId, {
        favoriteCount: (item.favoriteCount || 0) + 1,
      });
    }

    return { success: true, alreadyInWatchlist: false };
  },
});

export const removeFromWatchlist = mutation({
  args: {
    userId: v.string(),
    itemId: v.id("marketItems"),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("marketWatchlist")
      .withIndex("by_user_item", (q) =>
        q.eq("userId", args.userId).eq("itemId", args.itemId)
      )
      .first();

    if (!entry) {
      return { success: true, notInWatchlist: true };
    }

    await ctx.db.delete(entry._id);

    // Decrement favorite count on item
    const item = await ctx.db.get(args.itemId);
    if (item && item.favoriteCount > 0) {
      await ctx.db.patch(args.itemId, {
        favoriteCount: item.favoriteCount - 1,
      });
    }

    return { success: true, notInWatchlist: false };
  },
});

// =============================================================================
// SELLER RATINGS
// =============================================================================

export const getSellerRating = query({
  args: { sellerId: v.string() },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("marketTransactions")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    if (transactions.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const ratedTransactions = transactions.filter((t) => t.sellerRating !== undefined);

    const totalRating = ratedTransactions.reduce((sum, t) => sum + (t.sellerRating || 0), 0);
    const averageRating = totalRating / ratedTransactions.length;

    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratedTransactions.forEach((t) => {
      const rating = t.sellerRating || 0;
      if (rating >= 1 && rating <= 5) {
        ratingBreakdown[rating as keyof typeof ratingBreakdown]++;
      }
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: ratedTransactions.length,
      ratingBreakdown,
      totalSales: transactions.length,
    };
  },
});

export const getSellerReviews = query({
  args: {
    sellerId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("marketTransactions")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "completed"),
          q.neq(q.field("sellerReview"), undefined)
        )
      )
      .collect();

    // Sort by completed date (newest first)
    transactions.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

    if (args.limit) {
      return transactions.slice(0, args.limit);
    }

    return transactions;
  },
});

export const getMarketStats = query({
  args: {},
  handler: async (ctx) => {
    const allItems = await ctx.db
      .query("marketItems")
      .collect();

    const allTransactions = await ctx.db
      .query("marketTransactions")
      .collect();

    const activeListings = allItems.filter(
      (item) => !item.deletedAt && item.status === "available"
    ).length;

    const soldItems = allItems.filter(
      (item) => !item.deletedAt && item.status === "sold"
    ).length;

    const pendingTransactions = allTransactions.filter(
      (t) => t.status === "pending" || t.status === "accepted"
    ).length;

    const completedTransactions = allTransactions.filter(
      (t) => t.status === "completed"
    ).length;

    const totalValue = allTransactions
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + (t.offerAmount || 0), 0);

    const byCategory = allItems
      .filter((item) => !item.deletedAt)
      .reduce((acc, item) => {
        const category = item.category || "uncategorized";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const byCondition = allItems
      .filter((item) => !item.deletedAt)
      .reduce((acc, item) => {
        const condition = item.condition || "unknown";
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      activeListings,
      soldItems,
      totalListings: allItems.filter((item) => !item.deletedAt).length,
      pendingTransactions,
      completedTransactions,
      totalValue,
      averageItemPrice: activeListings > 0
        ? Math.round(
            allItems
              .filter((item) => !item.deletedAt && item.status === "available")
              .reduce((sum, item) => sum + item.price, 0) / activeListings
          )
        : 0,
      byCategory,
      byCondition,
    };
  },
});
