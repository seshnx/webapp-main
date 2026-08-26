import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// BOOKING REMINDERS
// =============================================================================

/**
 * Schedule booking reminders
 * Creates reminder entries for a booking
 */
export const scheduleReminders = mutation({
  args: {
    bookingId: v.string(),           // ID of either sbookings or bookings record
    bookingType: v.union(v.literal("studio"), v.literal("talent")),
    userId: v.string(), // Clerk ID of user to remind
    reminderHours: v.array(v.number()), // [24, 2] for 24 hours and 2 hours before
    bookingDate: v.number(), // Timestamp of booking
  },
  handler: async (ctx, args) => {
    // Get the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Note: bookingId is a string referencing sbookings or bookings table
    // We trust the caller provides a valid ID

    // Create reminder entries
    const reminderIds = await Promise.all(
      args.reminderHours.map(async (hours) => {
        const scheduledFor = args.bookingDate - hours * 60 * 60 * 1000;

        // Only schedule if it's in the future
        if (scheduledFor <= Date.now()) {
          return null;
        }

        const reminderId = await ctx.db.insert("bookingReminders", {
          bookingId: args.bookingId,
          bookingType: args.bookingType,
          userId: user._id,
          reminderType: hours >= 24 ? "day_before" : "hours_before",
          reminderHours: hours,
          scheduledFor,
          sent: false,
          cancelled: false,
          createdAt: Date.now(),
        });

        return reminderId;
      })
    );

    return {
      success: true,
      reminderIds: reminderIds.filter((id) => id !== null),
    };
  },
});

/**
 * Get pending reminders that need to be sent
 * Used by cron job or background worker
 */
export const getPendingReminders = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const limit = args.limit || 100;

    // Get reminders that are due but not sent
    const reminders = await ctx.db
      .query("bookingReminders")
      .withIndex("by_pending", (q) => q.eq("sent", false))
      .filter((q) =>
        q.and(
          q.lt(q.field("scheduledFor"), now),
          q.eq(q.field("cancelled"), undefined)
        )
      )
      .take(limit);

    // Fetch user details for each reminder
    // Note: bookingId is a string - we skip enriching booking since it could be sbookings or bookings
    const remindersWithDetails = await Promise.all(
      reminders.map(async (reminder) => {
        const user = await ctx.db.get(reminder.userId);

        return {
          ...reminder,
          user,
        };
      })
    );

    return remindersWithDetails;
  },
});

/**
 * Get reminders for a booking
 */
export const getRemindersByBooking = query({
  args: {
    bookingId: v.string(),
  },
  handler: async (ctx, args) => {
    const reminders = await ctx.db
      .query("bookingReminders")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .collect();

    return reminders;
  },
});

/**
 * Get reminders for a user
 */
export const getRemindersByUser = query({
  args: {
    userId: v.string(), // Clerk ID
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!user) return [];

    const reminders = await ctx.db
      .query("bookingReminders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);

    return reminders;
  },
});

/**
 * Mark reminder as sent
 */
export const markReminderSent = mutation({
  args: {
    reminderId: v.id("bookingReminders"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reminderId, {
      sent: true,
      sentAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Cancel reminder(s) for a booking
 */
export const cancelReminders = mutation({
  args: {
    bookingId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all pending reminders for this booking
    const reminders = await ctx.db
      .query("bookingReminders")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .filter((q) => q.eq(q.field("sent"), false))
      .collect();

    // Mark all as cancelled
    await Promise.all(
      reminders.map(async (reminder) => {
        await ctx.db.patch(reminder._id, {
          cancelled: true,
        });
      })
    );

    return {
      success: true,
      cancelledCount: reminders.length,
    };
  },
});

/**
 * Cancel specific reminder
 */
export const cancelReminder = mutation({
  args: {
    reminderId: v.id("bookingReminders"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reminderId, {
      cancelled: true,
    });

    return { success: true };
  },
});

/**
 * Delete sent reminders (cleanup)
 */
export const deleteSentReminders = mutation({
  args: {
    olderThan: v.number(), // Timestamp
  },
  handler: async (ctx, args) => {
    // Get all sent reminders older than specified time
    const reminders = await ctx.db
      .query("bookingReminders")
      .withIndex("by_pending", (q) => q.eq("sent", true))
      .filter((q) => q.lt(q.field("sentAt"), args.olderThan))
      .collect();

    // Delete them
    await Promise.all(
      reminders.map(async (reminder) => {
        await ctx.db.delete(reminder._id);
      })
    );

    return {
      success: true,
      deletedCount: reminders.length,
    };
  },
});
