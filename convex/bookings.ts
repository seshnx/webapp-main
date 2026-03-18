import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// STUDIOS
// =============================================================================

export const getStudios = query({
  args: {},
  handler: async (ctx) => {
    const studios = await ctx.db
      .query("studios")
      .withIndex("by_owner")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    return studios;
  },
});

export const getStudioById = query({
  args: { studioId: v.id("studios") },
  handler: async (ctx, args) => {
    const studio = await ctx.db.get(args.studioId);
    if (!studio || studio.deletedAt) return null;
    return studio;
  },
});

export const getStudiosByOwner = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    const studios = await ctx.db
      .query("studios")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    return studios;
  },
});

export const searchStudios = query({
  args: {
    searchQuery: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    minHourlyRate: v.optional(v.number()),
    maxHourlyRate: v.optional(v.number()),
    amenities: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let studios = await ctx.db
      .query("studios")
      .withIndex("by_owner")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // Filter by search query
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      studios = studios.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.city?.toLowerCase().includes(query)
      );
    }

    // Filter by location
    if (args.city) {
      studios = studios.filter((s) => s.city?.toLowerCase() === args.city?.toLowerCase());
    }
    if (args.state) {
      studios = studios.filter((s) => s.state?.toLowerCase() === args.state?.toLowerCase());
    }

    // Filter by price range
    if (args.minHourlyRate !== undefined) {
      studios = studios.filter((s) => s.minHourlyRate >= args.minHourlyRate!);
    }
    if (args.maxHourlyRate !== undefined) {
      studios = studios.filter((s) => s.maxHourlyRate <= args.maxHourlyRate!);
    }

    // Filter by amenities
    if (args.amenities && args.amenities.length > 0) {
      studios = studios.filter((s) =>
        args.amenities!.every((amenity) => s.amenities?.includes(amenity))
      );
    }

    // Limit results
    if (args.limit) {
      studios = studios.slice(0, args.limit);
    }

    return studios;
  },
});

export const createStudio = mutation({
  args: {
    ownerId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    country: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
    minHourlyRate: v.number(),
    maxHourlyRate: v.number(),
    photos: v.optional(v.array(v.string())),
    operatingHours: v.optional(
      v.object({
        monday: v.optional(v.string()),
        tuesday: v.optional(v.string()),
        wednesday: v.optional(v.string()),
        thursday: v.optional(v.string()),
        friday: v.optional(v.string()),
        saturday: v.optional(v.string()),
        sunday: v.optional(v.string()),
      })
    ),
    cancellationPolicy: v.optional(v.string()),
    depositPolicy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const studioId = await ctx.db.insert("studios", {
      ...args,
      verified: false,
      averageRating: 0,
      totalReviews: 0,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, studioId };
  },
});

export const updateStudio = mutation({
  args: {
    studioId: v.id("studios"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    country: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
    minHourlyRate: v.optional(v.number()),
    maxHourlyRate: v.optional(v.number()),
    photos: v.optional(v.array(v.string())),
    operatingHours: v.optional(
      v.optional(
        v.object({
          monday: v.optional(v.string()),
          tuesday: v.optional(v.string()),
          wednesday: v.optional(v.string()),
          thursday: v.optional(v.string()),
          friday: v.optional(v.string()),
          saturday: v.optional(v.string()),
          sunday: v.optional(v.string()),
        })
      )
    ),
    cancellationPolicy: v.optional(v.string()),
    depositPolicy: v.optional(v.string()),
    verified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { studioId, ...updates } = args;
    const studio = await ctx.db.get(studioId);

    if (!studio) {
      throw new Error("Studio not found");
    }

    await ctx.db.patch(studioId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteStudio = mutation({
  args: { studioId: v.id("studios") },
  handler: async (ctx, args) => {
    const studio = await ctx.db.get(args.studioId);

    if (!studio) {
      throw new Error("Studio not found");
    }

    // Soft delete
    await ctx.db.patch(args.studioId, {
      deletedAt: Date.now(),
    });

    return { success: true };
  },
});

// =============================================================================
// ROOMS
// =============================================================================

export const getRoomsByStudio = query({
  args: { studioId: v.id("studios") },
  handler: async (ctx, args) => {
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_studio", (q) => q.eq("studioId", args.studioId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    return rooms;
  },
});

export const getRoomById = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.deletedAt) return null;
    return room;
  },
});

export const getAvailableRooms = query({
  args: {
    studioId: v.id("studios"),
    date: v.string(), // YYYY-MM-DD format
    startTime: v.string(), // HH:mm format
    endTime: v.string(), // HH:mm format
    minCapacity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all rooms for the studio
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_studio", (q) => q.eq("studioId", args.studioId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // Filter by capacity if specified
    let availableRooms = rooms;
    if (args.minCapacity) {
      availableRooms = rooms.filter((r) => r.capacity >= args.minCapacity!);
    }

    // Get bookings for this date
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_studio_date", (q) =>
        q.eq("studioId", args.studioId).eq("date", args.date)
      )
      .collect();

    // Filter out booked rooms
    const bookedRoomIds = new Set(
      bookings
        .filter((b) => {
          if (b.status === "Cancelled" || b.status === "Rejected") return false;
          // Check time overlap
          return (
            (args.startTime >= b.startTime && args.startTime < b.endTime) ||
            (args.endTime > b.startTime && args.endTime <= b.endTime) ||
            (args.startTime <= b.startTime && args.endTime >= b.endTime)
          );
        })
        .map((b) => b.roomId)
    );

    return availableRooms.filter((r) => !bookedRoomIds.has(r._id));
  },
});

export const createRoom = mutation({
  args: {
    studioId: v.id("studios"),
    name: v.string(),
    description: v.optional(v.string()),
    capacity: v.number(),
    hourlyRate: v.number(),
    size: v.optional(v.number()), // square feet
      v.array(v.string())),
    photos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const roomId = await ctx.db.insert("rooms", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, roomId };
  },
});

export const updateRoom = mutation({
  args: {
    roomId: v.id("rooms"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    capacity: v.optional(v.number()),
    hourlyRate: v.optional(v.number()),
    size: v.optional(v.number()),
      v.optional(v.array(v.string())),
    photos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { roomId, ...updates } = args;
    const room = await ctx.db.get(roomId);

    if (!room) {
      throw new Error("Room not found");
    }

    await ctx.db.patch(roomId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteRoom = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);

    if (!room) {
      throw new Error("Room not found");
    }

    // Soft delete
    await ctx.db.patch(args.roomId, {
      deletedAt: Date.now(),
    });

    return { success: true };
  },
});

// =============================================================================
// BOOKINGS
// =============================================================================

export const getBookingsByStudio = query({
  args: {
    studioId: v.id("studios"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("bookings")
      .withIndex("by_studio_date", (q) => q.eq("studioId", args.studioId));

    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }

    let bookings = await q.collect();

    // Sort by date and time
    bookings.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.endTime.localeCompare(a.endTime);
    });

    if (args.limit) {
      bookings = bookings.slice(0, args.limit);
    }

    return bookings;
  },
});

export const getBookingsByClient = query({
  args: {
    clientId: v.string(),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("bookings")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId));

    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }

    let bookings = await q.collect();

    // Sort by date and time
    bookings.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.endTime.localeCompare(a.endTime);
    });

    if (args.limit) {
      bookings = bookings.slice(0, args.limit);
    }

    return bookings;
  },
});

export const getBookingById = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    return booking;
  },
});

export const getBookingsByDate = query({
  args: {
    studioId: v.id("studios"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_studio_date", (q) =>
        q.eq("studioId", args.studioId).eq("date", args.date)
      )
      .collect();

    return bookings;
  },
});

export const getBookingsByDateRange = query({
  args: {
    studioId: v.id("studios"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_studio_date", (q) => q.eq("studioId", args.studioId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    return bookings;
  },
});

export const getUpcomingBookings = query({
  args: {
    clientId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), today),
          q.neq(q.field("status"), "Cancelled"),
          q.neq(q.field("status"), "Rejected"),
          q.neq(q.field("status"), "Completed")
        )
      )
      .collect();

    // Sort by date and time
    bookings.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

    if (args.limit) {
      return bookings.slice(0, args.limit);
    }

    return bookings;
  },
});

export const createBooking = mutation({
  args: {
    studioId: v.id("studios"),
    roomId: v.id("rooms"),
    clientId: v.string(),
    clientName: v.string(),
    clientEmail: v.string(),
    clientPhone: v.optional(v.string()),
    date: v.string(), // YYYY-MM-DD
    startTime: v.string(), // HH:mm
    endTime: v.string(), // HH:mm
    numberOfPeople: v.optional(v.number()),
    purpose: v.optional(v.string()),
    specialRequests: v.optional(v.string()),
    totalAmount: v.number(),
    depositAmount: v.optional(v.number()),
    depositRequired: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if room is available
    const existingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_studio_date", (q) =>
        q.eq("studioId", args.studioId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("roomId"), args.roomId))
      .collect();

    // Check for time overlap
    const hasOverlap = existingBookings.some((booking) => {
      if (booking.status === "Cancelled" || booking.status === "Rejected") {
        return false;
      }
      return (
        (args.startTime >= booking.startTime && args.startTime < booking.endTime) ||
        (args.endTime > booking.startTime && args.endTime <= booking.endTime) ||
        (args.startTime <= booking.startTime && args.endTime >= booking.endTime)
      );
    });

    if (hasOverlap) {
      throw new Error("Room is not available for the selected time slot");
    }

    const bookingId = await ctx.db.insert("bookings", {
      ...args,
      status: "Pending",
      paymentStatus: args.depositRequired ? "DepositPending" : "PendingPayment",
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, bookingId };
  },
});

export const updateBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    date: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    numberOfPeople: v.optional(v.number()),
    purpose: v.optional(v.string()),
    specialRequests: v.optional(v.string()),
    totalAmount: v.optional(v.number()),
    depositAmount: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { bookingId, ...updates } = args;
    const booking = await ctx.db.get(bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Can only update pending bookings
    if (booking.status !== "Pending") {
      throw new Error("Can only update pending bookings");
    }

    await ctx.db.patch(bookingId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const confirmBooking = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status !== "Pending") {
      throw new Error("Booking can only be confirmed from pending status");
    }

    await ctx.db.patch(args.bookingId, {
      status: "Confirmed",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const startBooking = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status !== "Confirmed") {
      throw new Error("Booking must be confirmed before starting");
    }

    await ctx.db.patch(args.bookingId, {
      status: "InProgress",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const completeBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    actualEndTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status !== "InProgress") {
      throw new Error("Booking must be in progress to complete");
    }

    const updates: any = {
      status: "Completed",
      updatedAt: Date.now(),
    };

    if (args.actualEndTime) {
      updates.actualEndTime = args.actualEndTime;
    }

    await ctx.db.patch(args.bookingId, updates);

    return { success: true };
  },
});

export const cancelBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    cancelledBy: v.string(), // 'client' or 'studio'
    reason: v.optional(v.string()),
    refundAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status === "Cancelled" || booking.status === "Completed") {
      throw new Error("Cannot cancel this booking");
    }

    await ctx.db.patch(args.bookingId, {
      status: "Cancelled",
      cancelledBy: args.cancelledBy,
      cancellationReason: args.reason,
      refundAmount: args.refundAmount,
      cancelledAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteBooking = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    await ctx.db.delete(args.bookingId);

    return { success: true };
  },
});

// =============================================================================
// BLOCKED DATES
// =============================================================================

export const getBlockedDates = query({
  args: {
    studioId: v.id("studios"),
    roomId: v.optional(v.id("rooms")),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("blockedDates")
      .withIndex("by_studio", (q) => q.eq("studioId", args.studioId));

    if (args.roomId) {
      q = q.filter((q) => q.eq(q.field("roomId"), args.roomId));
    }

    if (args.startDate && args.endDate) {
      q = q.filter((q) =>
        q.and(
          q.gte(q.field("startDate"), args.startDate!),
          q.lte(q.field("endDate"), args.endDate!)
        )
      );
    }

    const blockedDates = await q.collect();

    return blockedDates;
  },
});

export const addBlockedDate = mutation({
  args: {
    studioId: v.id("studios"),
    roomId: v.optional(v.id("rooms")),
    startDate: v.string(), // YYYY-MM-DD
    endDate: v.string(), // YYYY-MM-DD
    reason: v.optional(v.string()),
    recurring: v.optional(v.boolean()),
    recurringType: v.optional(v.string()), // 'daily', 'weekly', 'monthly'
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const blockedDateId = await ctx.db.insert("blockedDates", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, blockedDateId };
  },
});

export const removeBlockedDate = mutation({
  args: { blockedDateId: v.id("blockedDates") },
  handler: async (ctx, args) => {
    const blockedDate = await ctx.db.get(args.blockedDateId);

    if (!blockedDate) {
      throw new Error("Blocked date not found");
    }

    await ctx.db.delete(args.blockedDateId);

    return { success: true };
  },
});

// =============================================================================
// PAYMENTS
// =============================================================================

export const getPaymentsByBooking = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const payments = await ctx.db
      .query("bookingPayments")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .collect();

    return payments;
  },
});

export const createPayment = mutation({
  args: {
    bookingId: v.id("bookings"),
    amount: v.number(),
    paymentMethod: v.string(), // 'card', 'cash', 'transfer'
    paymentType: v.string(), // 'deposit', 'full', 'remainder'
    transactionId: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    const now = Date.now();

    const paymentId = await ctx.db.insert("bookingPayments", {
      ...args,
      status: "Pending",
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, paymentId };
  },
});

export const updatePaymentStatus = mutation({
  args: {
    paymentId: v.id("bookingPayments"),
    status: v.string(), // 'Pending', 'Completed', 'Failed', 'Refunded'
    failureReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { paymentId, status, failureReason } = args;

    const payment = await ctx.db.get(paymentId);

    if (!payment) {
      throw new Error("Payment not found");
    }

    const updates: any = {
      status,
      updatedAt: Date.now(),
    };

    if (status === "Completed") {
      updates.completedAt = Date.now();
    }

    if (failureReason) {
      updates.failureReason = failureReason;
    }

    await ctx.db.patch(paymentId, updates);

    // Update booking payment status
    const booking = await ctx.db.get(payment.bookingId);
    if (booking) {
      const allPayments = await ctx.db
        .query("bookingPayments")
        .withIndex("by_booking", (q) => q.eq("bookingId", payment.bookingId))
        .collect();

      const totalPaid = allPayments
        .filter((p) => p.status === "Completed")
        .reduce((sum, p) => sum + p.amount, 0);

      let newPaymentStatus = booking.paymentStatus;
      if (totalPaid >= booking.totalAmount) {
        newPaymentStatus = "Paid";
      } else if (totalPaid >= (booking.depositAmount || 0)) {
        newPaymentStatus = "DepositPaid";
      }

      await ctx.db.patch(payment.bookingId, {
        paymentStatus: newPaymentStatus,
      });
    }

    return { success: true };
  },
});

export const refundPayment = mutation({
  args: {
    paymentId: v.id("bookingPayments"),
    refundAmount: v.number(),
    refundReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);

    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.status !== "Completed") {
      throw new Error("Can only refund completed payments");
    }

    await ctx.db.patch(args.paymentId, {
      status: "Refunded",
      refundAmount: args.refundAmount,
      refundReason: args.refundReason,
      refundedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
