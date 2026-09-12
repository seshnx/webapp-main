import { MutationCtx } from "./_generated/server";

export interface RateLimitConfig {
  key: string;
  limit: number;
  windowMs: number;
}

/**
 * Enforces rate limits using a sliding window in Convex database.
 * Returns { allowed: boolean, remaining: number, resetAt: number }
 * Throws an Error if allowed === false and throwOnRateLimit is true.
 */
export async function checkRateLimit(
  ctx: MutationCtx,
  config: RateLimitConfig,
  throwOnRateLimit: boolean = true
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", config.key))
    .first();

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + config.windowMs;
    if (existing) {
      await ctx.db.patch(existing._id, {
        count: 1,
        resetAt,
      });
    } else {
      await ctx.db.insert("rateLimits", {
        key: config.key,
        count: 1,
        resetAt,
      });
    }
    return { allowed: true, remaining: config.limit - 1, resetAt };
  }

  if (existing.count >= config.limit) {
    if (throwOnRateLimit) {
      const waitSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      throw new Error(`Rate limit exceeded. Please wait ${waitSeconds} seconds before trying again.`);
    }
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  await ctx.db.patch(existing._id, {
    count: existing.count + 1,
  });

  return {
    allowed: true,
    remaining: config.limit - (existing.count + 1),
    resetAt: existing.resetAt,
  };
}
