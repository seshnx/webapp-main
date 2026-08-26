import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get user wallet by Clerk ID.
 * Automatically creates a wallet if one doesn't exist.
 */
export const getOrCreateWallet = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", args.clerkId))
      .first();

    if (wallet) return wallet;

    // Create new wallet
    const walletId = await ctx.db.insert("wallets", {
      userId: args.clerkId,
      balance: 0,
      escrowBalance: 0,
      payoutBalance: 0,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(walletId);
  },
});

/**
 * Get wallet (Query only)
 */
export const getWallet = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", args.clerkId))
      .first();
  },
});

/**
 * Add tokens to a user's wallet (Called by Stripe webhook)
 * Securing this is important - in production, use a shared secret in args.
 */
export const topUpBalance = mutation({
  args: {
    clerkId: v.string(),
    amount: v.number(), // Number of tokens
    stripePaymentIntentId: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", args.clerkId))
      .first();

    if (!wallet) {
      throw new Error(`Wallet not found for user ${args.clerkId}`);
    }

    // Check if this transaction has already been processed
    const existing = await ctx.db
      .query("walletTransactions")
      .withIndex("by_stripe", (q) => q.eq("stripeId", args.stripePaymentIntentId))
      .first();

    if (existing) {
      console.warn("Transaction already processed:", args.stripePaymentIntentId);
      return wallet._id;
    }

    // Update wallet balance
    await ctx.db.patch(wallet._id, {
      balance: wallet.balance + args.amount,
      updatedAt: Date.now(),
    });

    // Record transaction
    await ctx.db.insert("walletTransactions", {
      userId: args.clerkId,
      walletId: wallet._id,
      amount: args.amount,
      currency: "TK", // Using TK as currency for tokens
      type: "purchase",
      status: "Completed",
      description: args.description || `Purchased ${args.amount} tokens`,
      stripeId: args.stripePaymentIntentId,
      createdAt: Date.now(),
    });

    // Update user stats (optional but helpful)
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    
    if (user && user.stats) {
      await ctx.db.patch(user._id, {
        stats: {
          ...user.stats,
          // We could track totalTokensPurchased here if we add it to schema
        }
      });
    }

    return wallet._id;
  },
});

/**
 * Get wallet transactions
 */
export const getTransactions = query({
  args: { clerkId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    return await ctx.db
      .query("walletTransactions")
      .withIndex("by_user", (q) => q.eq("userId", args.clerkId))
      .order("desc")
      .take(limit);
  },
});
