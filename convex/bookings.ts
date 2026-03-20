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
  args: { ownerId: v.id("users") },
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
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let studios = await ctx.db
      .query("studios")
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
      studios = studios.filter((s) => s.minHourlyRate !== undefined && s.minHourlyRate >= args.minHourlyRate!);
    }
    if (args.maxHourlyRate !== undefined) {
      studios = studios.filter((s) => s.maxHourlyRate !== undefined && s.maxHourlyRate <= args.maxHourlyRate!);
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
    ownerId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    photos: v.optional(v.array(v.string())),
    logoUrl: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    minHourlyRate: v.optional(v.number()),
    maxHourlyRate: v.optional(v.number()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const studioId = await ctx.db.insert("studios", {
      name: args.name,
      ownerId: args.ownerId,
      description: args.description,
      location: args.location,
      city: args.city,
      state: args.state,
      coordinates: args.coordinates,
      photos: args.photos,
      logoUrl: args.logoUrl,
      hourlyRate: args.hourlyRate,
      minHourlyRate: args.minHourlyRate,
      maxHourlyRate: args.maxHourlyRate,
      currency: args.currency,
      isActive: true,
      requiresApproval: false,
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
    location: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    photos: v.optional(v.array(v.string())),
    logoUrl: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    minHourlyRate: v.optional(v.number()),
    maxHourlyRate: v.optional(v.number()),
    currency: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
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
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return rooms;
  },
});

export const getRoomById = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || !room.isActive) return null;
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
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_studio", (q) => q.eq("studioId", args.studioId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Filter by capacity if specified
    let availableRooms = rooms;
    if (args.minCapacity !== undefined) {
      availableRooms = rooms.filter((r) => r.capacity !== undefined && r.capacity >= args.minCapacity!);
    }

    // Filter out rooms that have conflicting bookings
    // For now, return all active rooms - conflict checking would require booking queries
    return availableRooms;
  },
});

export const createRoom = mutation({
  args: {
    studioId: v.id("studios"),
    name: v.string(),
    description: v.optional(v.string()),
    capacity: v.optional(v.number()),
    hourlyRate: v.optional(v.number()),
    amenities: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const roomId = await ctx.db.insert("rooms", {
      studioId: args.studioId,
      name: args.name,
      description: args.description,
      capacity: args.capacity,
      hourlyRate: args.hourlyRate,
      amenities: args.amenities,
      isActive: true,
      createdAt: Date.now(),
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
    amenities: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { roomId, ...updates } = args;
    const room = await ctx.db.get(roomId);

    if (!room) {
      throw new Error("Room not found");
    }

    await ctx.db.patch(roomId, updates);

    return { success: true };
  },
});

export const deleteRoom = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.roomId, { isActive: false });
    return { success: true };
  },
});

// =============================================================================
// BOOKINGS
// =============================================================================

export const getBookings = query({
  args: {
    studioId: v.optional(v.id("studios")),
    clientId: v.optional(v.id("users")),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let bookings;

    if (args.studioId) {
      bookings = await ctx.db
        .query("bookings")
        .withIndex("by_studio", (q) => q.eq("studioId", args.studioId!))
        .take(args.limit || 50);
    } else if (args.clientId) {
      bookings = await ctx.db
        .query("bookings")
        .withIndex("by_client", (q) => q.eq("clientId", args.clientId!))
        .take(args.limit || 50);
    } else {
      bookings = await ctx.db
        .query("bookings")
        .take(args.limit || 50);
    }

    // Filter by status if specified
    if (args.status) {
      bookings = bookings.filter((b) => b.status === args.status);
    }

    return bookings;
  },
});

export const getBookingById = query({
  args: { bookingId: v.string() },
  handler: async (ctx, args) => {
    // Try to find by string ID
    const bookings = await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("id"), args.bookingId))
      .take(1);

    return bookings[0] || null;
  },
});

export const getBookingsByStudio = query({
  args: {
    studioId: v.id("studios"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let bookings = await ctx.db
      .query("bookings")
      .withIndex("by_studio", (q) => q.eq("studioId", args.studioId))
      .take(args.limit || 50);

    if (args.status) {
      bookings = bookings.filter((b) => b.status === args.status);
    }

    return bookings;
  },
});

export const getBookingsByClient = query({
  args: {
    clientId: v.id("users"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let bookings = await ctx.db
      .query("bookings")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .take(args.limit || 50);

    if (args.status) {
      bookings = bookings.filter((b) => b.status === args.status);
    }

    return bookings;
  },
});

export const getUpcomingBookings = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_client", (q) => q.eq("clientId", args.userId))
      .filter((q) =>
        q.eq(q.field("status"), "Confirmed")
      )
      .take(args.limit || 10);

    // Filter for upcoming bookings (date >= today)
    return bookings.filter((b) => b.date && b.date >= now);
  },
});

export const createBooking = mutation({
  args: {
    studioId: v.id("studios"),
    clientId: v.id("users"),
    serviceType: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    duration: v.optional(v.number()),
    offerAmount: v.optional(v.number()),
    currency: v.optional(v.string()),
    roomId: v.optional(v.id("rooms")),
    message: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const bookingId = crypto.randomUUID();
    const now = Date.now();

    const bookingId_internal = await ctx.db.insert("bookings", {
      id: bookingId,
      studioId: args.studioId,
      clientId: args.clientId,
      serviceType: args.serviceType,
      date: args.date,
      time: args.time,
      duration: args.duration,
      offerAmount: args.offerAmount,
      currency: args.currency || "USD",
      roomId: args.roomId,
      status: "Pending",
      message: args.message,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, bookingId, internalId: bookingId_internal };
  },
});

export const updateBookingStatus = mutation({
  args: {
    bookingId: v.string(),
    status: v.string(),
    cancelledBy: v.optional(v.id("users")),
    cancellationReason: v.optional(v.string()),
    studioNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find booking by string ID
    const bookings = await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("id"), args.bookingId))
      .take(1);

    if (!bookings[0]) {
      throw new Error("Booking not found");
    }

    const updateData: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.cancelledBy) {
      updateData.cancelledBy = args.cancelledBy;
      updateData.cancelledAt = Date.now();
    }

    if (args.cancellationReason) {
      updateData.cancellationReason = args.cancellationReason;
    }

    if (args.studioNotes) {
      updateData.studioNotes = args.studioNotes;
    }

    await ctx.db.patch(bookings[0]._id, updateData);

    return { success: true };
  },
});

export const confirmBooking = mutation({
  args: {
    bookingId: v.string(),
    finalAmount: v.optional(v.number()),
    depositRequired: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Find booking by string ID
    const bookings = await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("id"), args.bookingId))
      .take(1);

    if (!bookings[0]) {
      throw new Error("Booking not found");
    }

    const updateData: any = {
      status: "Confirmed",
      updatedAt: Date.now(),
    };

    if (args.finalAmount !== undefined) {
      updateData.finalAmount = args.finalAmount;
    }

    if (args.depositRequired !== undefined) {
      updateData.depositRequired = args.depositRequired;
    }

    await ctx.db.patch(bookings[0]._id, updateData);

    return { success: true };
  },
});

export const completeBooking = mutation({
  args: {
    bookingId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find booking by string ID
    const bookings = await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("id"), args.bookingId))
      .take(1);

    if (!bookings[0]) {
      throw new Error("Booking not found");
    }

    await ctx.db.patch(bookings[0]._id, {
      status: "Completed",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const cancelBooking = mutation({
  args: {
    bookingId: v.string(),
    cancelledBy: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find booking by string ID
    const bookings = await ctx
      .db.query("bookings")
      .filter((q) => q.eq(q.field("id"), args.bookingId))
      .take(1);

    if (!bookings[0]) {
      throw new Error("Booking not found");
    }

    await ctx.db.patch(bookings[0]._id, {
      status: "Cancelled",
      cancelledBy: args.cancelledBy,
      cancelledAt: Date.now(),
      cancellationReason: args.reason,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// =============================================================================
// BOOKING PAYMENTS
// =============================================================================

export const createPayment = mutation({
  args: {
    bookingId: v.id("bookings"),
    amount: v.number(),
    currency: v.string(),
    paymentMethodId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const paymentId = await ctx.db.insert("bookingPayments", {
      bookingId: args.bookingId,
      amount: args.amount,
      currency: args.currency,
      status: "Pending",
      paymentMethodId: args.paymentMethodId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, paymentId };
  },
});

export const updatePaymentStatus = mutation({
  args: {
    paymentId: v.id("bookingPayments"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);

    if (!payment) {
      throw new Error("Payment not found");
    }

    const updateData: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.status === "Completed") {
      updateData.completedAt = Date.now();
    }

    await ctx.db.patch(args.paymentId, updateData);

    return { success: true };
  },
});

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

// =============================================================================
// BOOKING TEMPLATES
// =============================================================================

export const getBookingTemplates = query({
  args: { studioId: v.id("studios") },
  handler: async (ctx, args) => {
    const templates = await ctx.db
      .query("bookingTemplates")
      .withIndex("by_studio", (q) => q.eq("studioId", args.studioId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return templates;
  },
});

export const createBookingTemplate = mutation({
  args: {
    studioId: v.id("studios"),
    name: v.string(),
    description: v.optional(v.string()),
    duration: v.number(),
    price: v.number(),
    requirements: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const templateId = await ctx.db.insert("bookingTemplates", {
      studioId: args.studioId,
      name: args.name,
      description: args.description,
      duration: args.duration,
      price: args.price,
      requirements: args.requirements,
      isActive: true,
      createdAt: Date.now(),
    });

    return { success: true, templateId };
  },
});

export const updateBookingTemplate = mutation({
  args: {
    templateId: v.id("bookingTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    duration: v.optional(v.number()),
    price: v.optional(v.number()),
    requirements: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { templateId, ...updates } = args;
    const template = await ctx.db.get(templateId);

    if (!template) {
      throw new Error("Booking template not found");
    }

    await ctx.db.patch(templateId, updates);

    return { success: true };
  },
});

export const deleteBookingTemplate = mutation({
  args: { templateId: v.id("bookingTemplates") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.templateId, { isActive: false });
    return { success: true };
  },
});
