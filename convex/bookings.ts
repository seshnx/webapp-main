import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get pending bookings for a user (as studio owner)
export const getPendingBookings = query({
  args: { targetId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_target_status", (q) =>
        q.eq("targetId", args.targetId).eq("status", "Pending")
      )
      .order("desc")
      .collect();
  },
});

// Get all bookings for a user
export const getBookingsByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const asSender = await ctx.db
      .query("bookings")
      .withIndex("by_sender", (q) => q.eq("senderId", args.userId))
      .collect();

    const asTarget = await ctx.db
      .query("bookings")
      .withIndex("by_target_status", (q) => q.eq("targetId", args.userId))
      .collect();

    return [...asSender, ...asTarget].sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Get a specific booking
export const getBooking = query({
  args: { bookingId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_booking_id", (q) => q.eq("id", args.bookingId))
      .first();
  },
});

// Sync booking from Neon to Convex (called when booking changes in Neon)
export const syncBooking = mutation({
  args: {
    id: v.string(),
    senderId: v.string(),
    senderName: v.optional(v.string()),
    senderPhoto: v.optional(v.string()),
    targetId: v.string(),
    status: v.string(),
    serviceType: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    duration: v.optional(v.number()),
    offerAmount: v.optional(v.number()),
    message: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("bookings")
      .withIndex("by_booking_id", (q) => q.eq("id", args.id))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing booking
      await ctx.db.patch(existing._id, {
        senderId: args.senderId,
        senderName: args.senderName,
        senderPhoto: args.senderPhoto,
        targetId: args.targetId,
        status: args.status,
        serviceType: args.serviceType,
        date: args.date,
        time: args.time,
        duration: args.duration,
        offerAmount: args.offerAmount,
        message: args.message,
        updatedAt: now,
      });
    } else {
      // Insert new booking
      await ctx.db.insert("bookings", {
        id: args.id,
        senderId: args.senderId,
        senderName: args.senderName,
        senderPhoto: args.senderPhoto,
        targetId: args.targetId,
        status: args.status,
        serviceType: args.serviceType,
        date: args.date,
        time: args.time,
        duration: args.duration,
        offerAmount: args.offerAmount,
        message: args.message,
        createdAt: args.createdAt || now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Remove booking from Convex (when deleted from Neon)
export const removeBooking = mutation({
  args: { bookingId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("bookings")
      .withIndex("by_booking_id", (q) => q.eq("id", args.bookingId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return { success: true };
  },
});
