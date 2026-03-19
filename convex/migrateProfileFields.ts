import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Migration script to backfill missing profile fields
 * Run this after deploying the updated schema
 */
export const migrateProfileFields = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all users
    const allUsers = await ctx.db.query("users").collect();

    let migrated = 0;
    const updates: any = {};

    for (const user of allUsers) {
      updates.migratedFields = [];

      // Migrate name fields if missing
      if (!user.profileName && user.displayName) {
        updates.profileName = user.displayName;
        updates.migratedFields.push("profileName");
      }

      // Migrate firstName/lastName if not set but displayName exists
      if (!user.firstName && !user.lastName && user.displayName) {
        const nameParts = user.displayName.split(" ");
        if (nameParts.length > 1) {
          updates.firstName = nameParts[0];
          updates.lastName = nameParts.slice(1).join(" ");
          updates.migratedFields.push("firstName", "lastName");
        }
      }

      // Migrate availability status if using old format
      // Add any other field migrations as needed

      if (updates.migratedFields.length > 0) {
        await ctx.db.patch(user._id, updates);
        migrated++;
      }
    }

    return {
      migrated,
      total: allUsers.length,
      message: `Migrated ${migrated} out of ${allUsers.length} users`
    };
  },
});

/**
 * Reset migration (for testing)
 * WARNING: This will clear migrated fields
 */
export const resetMigration = mutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();

    for (const user of allUsers) {
      const updates: any = {};

      // Only clear fields that were auto-migrated, not user-entered data
      if (user.profileName === user.displayName) {
        updates.profileName = undefined;
      }

      // Don't clear firstName/lastName as they may have been set manually

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(user._id, updates);
      }
    }

    return { success: true, total: allUsers.length };
  },
});
