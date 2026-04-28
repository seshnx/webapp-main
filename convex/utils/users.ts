import { QueryCtx } from "../_generated/server";

/**
 * Helper function to get native user from Clerk ID
 */
export const getNativeUser = async (ctx: QueryCtx, clerkId: string) => {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();
};

/**
 * Helper function to get native user ID from Clerk ID
 */
export const getNativeUserId = async (ctx: QueryCtx, clerkId: string) => {
  const user = await getNativeUser(ctx, clerkId);
  return user?._id;
};
