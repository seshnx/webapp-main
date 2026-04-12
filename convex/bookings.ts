import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// TALENT BOOKINGS - Direct Talent Hire System
// =============================================================================

/**
 * Create a direct hire request for a talent
 */
export const createBooking = mutation({
  args: {
    talentClerkId: v.string(),       // Convex Clerk ID of the talent being hired
    clientClerkId: v.string(),       // Convex Clerk ID of the client doing the hiring
    serviceType: v.optional(v.string()),  // e.g. "Recording Session", "Feature", "Mix & Master"
    date: v.optional(v.string()),    // YYYY-MM-DD
    time: v.optional(v.string()),    // HH:mm
    duration: v.optional(v.number()), // Hours
    location: v.optional(v.string()), // Address or "Remote"
    offerAmount: v.optional(v.number()),
    currency: v.optional(v.string()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Resolve talent user
    const talent = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.talentClerkId))
      .first();

    if (!talent) throw new Error("Talent not found");

    // Resolve client user
    const client = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clientClerkId))
      .first();

    if (!client) throw new Error("Client not found");

    if (talent._id === client._id) {
      throw new Error("Cannot book yourself");
    }

    const now = Date.now();

    const bookingId = await ctx.db.insert("bookings", {
      talentId: talent._id,
      clientId: client._id,
      serviceType: args.serviceType,
      date: args.date,
      time: args.time,
      duration: args.duration,
      location: args.location,
      offerAmount: args.offerAmount,
      currency: args.currency || "USD",
      message: args.message,
      status: "Pending",
      paymentStatus: "Pending",
      createdAt: now,
      updatedAt: now,
    });

    // Notify the talent
    await ctx.db.insert("notifications", {
      userId: talent._id,
      type: "booking_request",
      title: "New Booking Request",
      message: `${client.displayName || client.username || "Someone"} wants to book you${args.serviceType ? ` for ${args.serviceType}` : ""}`,
      actorId: client._id,
      actorName: client.displayName || client.username,
      actorPhoto: client.avatarUrl,
      targetId: bookingId.toString(),
      targetType: "booking",
      read: false,
      createdAt: now,
    });

    return { success: true, bookingId };
  },
});

/**
 * Get all bookings where the user is the talent (incoming requests)
 */
export const getTalentBookings = query({
  args: {
    talentClerkId: v.string(),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const talent = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.talentClerkId))
      .first();

    if (!talent) return [];

    let bookings = await ctx.db
      .query("bookings")
      .withIndex("by_talent", (q) => q.eq("talentId", talent._id))
      .order("desc")
      .take(args.limit || 50);

    if (args.status) {
      bookings = bookings.filter((b) => b.status === args.status);
    }

    // Enrich with client info
    const enriched = await Promise.all(
      bookings.map(async (booking) => {
        const client = await ctx.db.get(booking.clientId);
        return {
          ...booking,
          clientName: client?.displayName || client?.username || "Unknown",
          clientPhoto: client?.avatarUrl,
          clientClerkId: client?.clerkId,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get all bookings where the user is the client (outgoing requests)
 */
export const getClientBookings = query({
  args: {
    clientClerkId: v.string(),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clientClerkId))
      .first();

    if (!client) return [];

    let bookings = await ctx.db
      .query("bookings")
      .withIndex("by_client", (q) => q.eq("clientId", client._id))
      .order("desc")
      .take(args.limit || 50);

    if (args.status) {
      bookings = bookings.filter((b) => b.status === args.status);
    }

    // Enrich with talent info
    const enriched = await Promise.all(
      bookings.map(async (booking) => {
        const talent = await ctx.db.get(booking.talentId);
        return {
          ...booking,
          talentName: talent?.displayName || talent?.username || "Unknown",
          talentPhoto: talent?.avatarUrl,
          talentClerkId: talent?.clerkId,
          talentRole: talent?.talentSubRole || talent?.activeRole,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get a single booking by its Convex ID
 */
export const getBookingById = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) return null;

    const talent = await ctx.db.get(booking.talentId);
    const client = await ctx.db.get(booking.clientId);

    return {
      ...booking,
      talentName: talent?.displayName || talent?.username || "Unknown",
      talentPhoto: talent?.avatarUrl,
      talentClerkId: talent?.clerkId,
      talentRole: talent?.talentSubRole || talent?.activeRole,
      clientName: client?.displayName || client?.username || "Unknown",
      clientPhoto: client?.avatarUrl,
      clientClerkId: client?.clerkId,
    };
  },
});

/**
 * Get upcoming bookings for a user (as either talent or client)
 */
export const getUpcomingBookings = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return [];

    const now = new Date().toISOString().split('T')[0];

    // Get bookings as talent
    const astalent = await ctx.db
      .query("bookings")
      .withIndex("by_talent_status", (q) =>
        q.eq("talentId", user._id).eq("status", "Accepted")
      )
      .take(args.limit || 10);

    // Get bookings as client
    const asclient = await ctx.db
      .query("bookings")
      .withIndex("by_client", (q) => q.eq("clientId", user._id))
      .filter((q) => q.eq(q.field("status"), "Accepted"))
      .take(args.limit || 10);

    const combined = [...astalent, ...asclient];
    return combined.filter((b) => b.date && b.date >= now);
  },
});

/**
 * Accept a booking request (talent accepts)
 */
export const acceptBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    talentClerkId: v.string(),
    talentNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    const talent = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.talentClerkId))
      .first();

    if (!talent || booking.talentId !== talent._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.bookingId, {
      status: "Accepted",
      talentNotes: args.talentNotes,
      updatedAt: Date.now(),
    });

    // Notify client
    const client = await ctx.db.get(booking.clientId);
    if (client) {
      await ctx.db.insert("notifications", {
        userId: booking.clientId,
        type: "booking_accepted",
        title: "Booking Accepted!",
        message: `${talent.displayName || talent.username || "Your talent"} accepted your booking request`,
        actorId: talent._id,
        actorName: talent.displayName || talent.username,
        actorPhoto: talent.avatarUrl,
        targetId: args.bookingId.toString(),
        targetType: "booking",
        read: false,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

/**
 * Decline a booking request (talent declines)
 */
export const declineBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    talentClerkId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    const talent = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.talentClerkId))
      .first();

    if (!talent || booking.talentId !== talent._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.bookingId, {
      status: "Declined",
      cancellationReason: args.reason,
      cancelledBy: talent._id,
      cancelledAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Notify client
    await ctx.db.insert("notifications", {
      userId: booking.clientId,
      type: "booking_declined",
      title: "Booking Declined",
      message: `${talent.displayName || talent.username || "Your talent"} declined your booking request${args.reason ? `: ${args.reason}` : ""}`,
      actorId: talent._id,
      actorName: talent.displayName || talent.username,
      actorPhoto: talent.avatarUrl,
      targetId: args.bookingId.toString(),
      targetType: "booking",
      read: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Cancel a booking (either party can cancel)
 */
export const cancelBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    clerkId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    if (booking.talentId !== user._id && booking.clientId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.bookingId, {
      status: "Cancelled",
      cancelledBy: user._id,
      cancelledAt: Date.now(),
      cancellationReason: args.reason,
      updatedAt: Date.now(),
    });

    // Notify the other party
    const notifyUserId = booking.talentId === user._id ? booking.clientId : booking.talentId;
    await ctx.db.insert("notifications", {
      userId: notifyUserId,
      type: "booking_cancelled",
      title: "Booking Cancelled",
      message: `${user.displayName || user.username || "A user"} cancelled the booking`,
      actorId: user._id,
      actorName: user.displayName || user.username,
      actorPhoto: user.avatarUrl,
      targetId: args.bookingId.toString(),
      targetType: "booking",
      read: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Complete a booking
 */
export const completeBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");
    if (booking.talentId !== user._id && booking.clientId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.bookingId, {
      status: "Completed",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update booking details (client can edit before acceptance)
 */
export const updateBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    clientClerkId: v.string(),
    serviceType: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    duration: v.optional(v.number()),
    location: v.optional(v.string()),
    offerAmount: v.optional(v.number()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    const client = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clientClerkId))
      .first();

    if (!client || booking.clientId !== client._id) throw new Error("Unauthorized");
    if (booking.status !== "Pending") throw new Error("Can only edit pending bookings");

    const { bookingId, clientClerkId, ...updates } = args;
    await ctx.db.patch(bookingId, { ...updates, updatedAt: Date.now() });
    return { success: true };
  },
});
