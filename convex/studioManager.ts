import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

// =====================================================
// FLOOR PLAN QUERIES
// =====================================================

/**
 * Get floor plan by studio ID
 * Returns the most recent active floor plan for the studio
 */
export const getFloorplanByStudio = query({
  args: { studioId: v.id("studios") },
  handler: async (ctx, args) => {
    const floorplan = await ctx.db
      .query("studioFloorplans")
      .withIndex("by_studio", (q) => q.eq("studioId", args.studioId))
      .order("desc")
      .filter((q) => q.eq(q.field("roomId"), undefined))
      .first();

    return floorplan;
  },
});

/**
 * Get floor plan by room ID
 * Returns the floor plan for a specific room
 */
export const getFloorplanByRoom = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const floorplan = await ctx.db
      .query("studioFloorplans")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .first();

    return floorplan;
  },
});

/**
 * Get floor plan version history
 */
export const getFloorplanHistory = query({
  args: {
    studioId: v.id("studios"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const floorplans = await ctx.db
      .query("studioFloorplans")
      .withIndex("by_version", (q) => q.eq("studioId", args.studioId))
      .order("desc")
      .take(args.limit || 10);

    return floorplans;
  },
});

// =====================================================
// FLOOR PLAN MUTATIONS
// =====================================================

/**
 * Save or update floor plan
 * Creates a new version each time
 */
export const saveFloorplan = mutation({
  args: {
    clerkId: v.string(),
    studioId: v.id("studios"),
    roomId: v.optional(v.id("rooms")),
    rooms: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.optional(v.string()),
      rate: v.number(),
      capacity: v.number(),
      equipment: v.optional(v.array(v.string())),
      amenities: v.optional(v.array(v.string())),
      minBookingHours: v.optional(v.number()),
      active: v.optional(v.boolean()),
      color: v.optional(v.string()),
      panorama360Url: v.optional(v.string()),
      layout: v.optional(v.object({
        x: v.number(),
        y: v.number(),
        width: v.number(),
        height: v.number(),
        color: v.string(),
      })),
    }))),
    walls: v.optional(v.array(v.object({
      id: v.string(),
      startX: v.number(),
      startY: v.number(),
      endX: v.number(),
      endY: v.number(),
      thickness: v.optional(v.number()),
    }))),
    structures: v.optional(v.array(v.object({
      id: v.string(),
      type: v.string(),
      x: v.number(),
      y: v.number(),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      rotation: v.optional(v.number()),
    }))),
    text: v.optional(v.array(v.object({
      id: v.string(),
      text: v.string(),
      x: v.number(),
      y: v.number(),
      fontSize: v.optional(v.number()),
    }))),
    measurements: v.optional(v.array(v.object({
      id: v.string(),
      startX: v.number(),
      startY: v.number(),
      endX: v.number(),
      endY: v.number(),
      value: v.optional(v.string()),
    }))),
    shapes: v.optional(v.array(v.object({
      id: v.string(),
      type: v.string(),
      x: v.number(),
      y: v.number(),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      radius: v.optional(v.number()),
      points: v.optional(v.array(v.object({
        x: v.number(),
        y: v.number(),
      }))),
      fillColor: v.optional(v.string()),
      strokeColor: v.optional(v.string()),
    }))),
    layerVisibility: v.optional(v.record(v.string(), v.boolean())),
    layerLocks: v.optional(v.record(v.string(), v.boolean())),
  },
  handler: async (ctx, args) => {
    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify studio ownership
    const studio = await ctx.db.get(args.studioId);
    if (!studio || studio.ownerId !== user._id) {
      throw new Error("Not authorized to modify this studio");
    }

    // Get the previous version
    let floorplanQuery = ctx.db
      .query("studioFloorplans")
      .withIndex("by_studio", (q) => q.eq("studioId", args.studioId));

    // Collect all floorplans for the studio
    const allFloorplans = await floorplanQuery.collect();

    // Filter by roomId if specified, otherwise get studio-wide floorplans
    const filteredFloorplans = args.roomId
      ? allFloorplans.filter((fp) => fp.roomId === args.roomId)
      : allFloorplans.filter((fp) => !fp.roomId);

    // Get the most recent one
    const previousFloorplan = filteredFloorplans.length > 0
      ? filteredFloorplans[0]
      : null;

    const now = Date.now();
    const version = (previousFloorplan?.version || 0) + 1;

    // Create new floor plan version
    const floorplanId = await ctx.db.insert("studioFloorplans", {
      studioId: args.studioId,
      roomId: args.roomId,
      rooms: args.rooms,
      walls: args.walls,
      structures: args.structures,
      text: args.text,
      measurements: args.measurements,
      shapes: args.shapes,
      layerVisibility: args.layerVisibility,
      layerLocks: args.layerLocks,
      version,
      previousVersion: previousFloorplan?._id,
      createdAt: now,
      updatedAt: now,
    });

    return floorplanId;
  },
});

/**
 * Delete floor plan (soft delete by creating new version with empty data)
 */
export const deleteFloorplan = mutation({
  args: {
    clerkId: v.string(),
    studioId: v.id("studios"),
    roomId: v.optional(v.id("rooms")),
  },
  handler: async (ctx, args) => {
    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify studio ownership
    const studio = await ctx.db.get(args.studioId);
    if (!studio || studio.ownerId !== user._id) {
      throw new Error("Not authorized to modify this studio");
    }

    // Get the previous version
    let floorplanQuery = ctx.db
      .query("studioFloorplans")
      .withIndex("by_studio", (q) => q.eq("studioId", args.studioId));

    // Collect all floorplans for the studio
    const allFloorplans = await floorplanQuery.collect();

    // Filter by roomId if specified, otherwise get studio-wide floorplans
    const filteredFloorplans = args.roomId
      ? allFloorplans.filter((fp) => fp.roomId === args.roomId)
      : allFloorplans.filter((fp) => !fp.roomId);

    // Get the most recent one
    const previousFloorplan = filteredFloorplans.length > 0
      ? filteredFloorplans[0]
      : null;

    if (!previousFloorplan) {
      throw new Error("Floor plan not found");
    }

    const now = Date.now();
    const version = previousFloorplan.version + 1;

    // Create empty floor plan version
    const floorplanId = await ctx.db.insert("studioFloorplans", {
      studioId: args.studioId,
      roomId: args.roomId,
      rooms: [],
      walls: [],
      structures: [],
      text: [],
      measurements: [],
      shapes: [],
      layerVisibility: {},
      layerLocks: {},
      version,
      previousVersion: previousFloorplan._id,
      createdAt: now,
      updatedAt: now,
    });

    return floorplanId;
  },
});

// =====================================================
// EQUIPMENT QUERIES
// =====================================================

/**
 * Get all equipment for a studio
 */
export const getEquipmentByStudio = query({
  args: {
    studioId: v.id("studios"),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let equipmentQuery = ctx.db
      .query("studioEquipment")
      .withIndex("by_studio", (q) => q.eq("studioId", args.studioId));

    const equipment = await equipmentQuery.collect();

    // Filter out deleted equipment
    let filtered = equipment.filter((e) => e.deletedAt === undefined);

    // Optionally include inactive (maintenance/retired) equipment
    if (!args.includeInactive) {
      filtered = filtered.filter((e) => e.status === "Available");
    }

    return filtered;
  },
});

/**
 * Get equipment by category
 */
export const getEquipmentByCategory = query({
  args: {
    studioId: v.id("studios"),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const equipment = await ctx.db
      .query("studioEquipment")
      .withIndex("by_category", (q) =>
        q.eq("studioId", args.studioId).eq("category", args.category)
      )
      .collect();

    // Filter out deleted equipment
    return equipment.filter((e) => e.deletedAt === undefined);
  },
});

/**
 * Get equipment by room
 */
export const getEquipmentByRoom = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const equipment = await ctx.db
      .query("studioEquipment")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    // Filter out deleted equipment
    return equipment.filter((e) => e.deletedAt === undefined);
  },
});

/**
 * Get equipment by status
 */
export const getEquipmentByStatus = query({
  args: {
    studioId: v.id("studios"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const equipment = await ctx.db
      .query("studioEquipment")
      .withIndex("by_status", (q) =>
        q.eq("studioId", args.studioId).eq("status", args.status)
      )
      .collect();

    // Filter out deleted equipment
    return equipment.filter((e) => e.deletedAt === undefined);
  },
});

// =====================================================
// EQUIPMENT MUTATIONS
// =====================================================

/**
 * Create new equipment
 */
export const createEquipment = mutation({
  args: {
    clerkId: v.string(),
    studioId: v.id("studios"),
    roomId: v.optional(v.id("rooms")),
    name: v.string(),
    category: v.string(),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    status: v.optional(v.string()),
    condition: v.optional(v.string()),
    purchasePrice: v.optional(v.number()),
    currentValue: v.optional(v.number()),
    dailyRentalRate: v.optional(v.number()),
    description: v.optional(v.string()),
    purchaseDate: v.optional(v.string()),
    warrantyExpiry: v.optional(v.string()),
    lastMaintenanceDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify studio ownership
    const studio = await ctx.db.get(args.studioId);
    if (!studio || studio.ownerId !== user._id) {
      throw new Error("Not authorized to modify this studio");
    }

    const now = Date.now();

    const equipmentId = await ctx.db.insert("studioEquipment", {
      studioId: args.studioId,
      roomId: args.roomId,
      name: args.name,
      category: args.category,
      brand: args.brand,
      model: args.model,
      serialNumber: args.serialNumber,
      status: args.status || "Available",
      condition: args.condition,
      purchasePrice: args.purchasePrice,
      currentValue: args.currentValue,
      dailyRentalRate: args.dailyRentalRate,
      description: args.description,
      purchaseDate: args.purchaseDate,
      warrantyExpiry: args.warrantyExpiry,
      lastMaintenanceDate: args.lastMaintenanceDate,
      notes: args.notes,
      photos: args.photos,
      createdAt: now,
      updatedAt: now,
    });

    return equipmentId;
  },
});

/**
 * Update equipment
 */
export const updateEquipment = mutation({
  args: {
    clerkId: v.string(),
    equipmentId: v.id("studioEquipment"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    status: v.optional(v.string()),
    condition: v.optional(v.string()),
    purchasePrice: v.optional(v.number()),
    currentValue: v.optional(v.number()),
    dailyRentalRate: v.optional(v.number()),
    description: v.optional(v.string()),
    purchaseDate: v.optional(v.string()),
    warrantyExpiry: v.optional(v.string()),
    lastMaintenanceDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    roomId: v.optional(v.id("rooms")),
  },
  handler: async (ctx, args) => {
    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the equipment
    const equipment = await ctx.db.get(args.equipmentId);
    if (!equipment) {
      throw new Error("Equipment not found");
    }

    // Verify studio ownership
    const studio = await ctx.db.get(equipment.studioId);
    if (!studio || studio.ownerId !== user._id) {
      throw new Error("Not authorized to modify this equipment");
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updateData.name = args.name;
    if (args.category !== undefined) updateData.category = args.category;
    if (args.brand !== undefined) updateData.brand = args.brand;
    if (args.model !== undefined) updateData.model = args.model;
    if (args.serialNumber !== undefined) updateData.serialNumber = args.serialNumber;
    if (args.status !== undefined) updateData.status = args.status;
    if (args.condition !== undefined) updateData.condition = args.condition;
    if (args.purchasePrice !== undefined) updateData.purchasePrice = args.purchasePrice;
    if (args.currentValue !== undefined) updateData.currentValue = args.currentValue;
    if (args.dailyRentalRate !== undefined) updateData.dailyRentalRate = args.dailyRentalRate;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.purchaseDate !== undefined) updateData.purchaseDate = args.purchaseDate;
    if (args.warrantyExpiry !== undefined) updateData.warrantyExpiry = args.warrantyExpiry;
    if (args.lastMaintenanceDate !== undefined) updateData.lastMaintenanceDate = args.lastMaintenanceDate;
    if (args.notes !== undefined) updateData.notes = args.notes;
    if (args.photos !== undefined) updateData.photos = args.photos;
    if (args.roomId !== undefined) updateData.roomId = args.roomId;

    await ctx.db.patch(args.equipmentId, updateData);

    return args.equipmentId;
  },
});

/**
 * Delete equipment (soft delete)
 */
export const deleteEquipment = mutation({
  args: {
    clerkId: v.string(),
    equipmentId: v.id("studioEquipment"),
  },
  handler: async (ctx, args) => {
    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the equipment
    const equipment = await ctx.db.get(args.equipmentId);
    if (!equipment) {
      throw new Error("Equipment not found");
    }

    // Verify studio ownership
    const studio = await ctx.db.get(equipment.studioId);
    if (!studio || studio.ownerId !== user._id) {
      throw new Error("Not authorized to delete this equipment");
    }

    // Soft delete
    await ctx.db.patch(args.equipmentId, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// =====================================================
// CLIENT QUERIES
// =====================================================

/**
 * Get all clients for a studio
 */
export const getClientsByStudio = query({
  args: {
    studioId: v.id("studios"),
    clientType: v.optional(v.string()),
    includeBlacklisted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let clientsQuery = ctx.db
      .query("studioClients")
      .withIndex("by_studio", (q) => q.eq("studioId", args.studioId));

    const clients = await clientsQuery.collect();

    // Filter out deleted clients
    let filtered = clients.filter((c) => c.deletedAt === undefined);

    // Filter by client type if specified
    if (args.clientType) {
      filtered = filtered.filter((c) => c.clientType === args.clientType);
    }

    // Optionally exclude blacklisted clients
    if (!args.includeBlacklisted) {
      filtered = filtered.filter((c) => !c.isBlacklisted);
    }

    return filtered;
  },
});

/**
 * Get client profile by user ID
 */
export const getClientByUser = query({
  args: {
    studioId: v.id("studios"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db
      .query("studioClients")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("studioId"), args.studioId))
      .first();

    return client;
  },
});

/**
 * Get blacklisted clients
 */
export const getBlacklistedClients = query({
  args: { studioId: v.id("studios") },
  handler: async (ctx, args) => {
    const clients = await ctx.db
      .query("studioClients")
      .withIndex("by_blacklist", (q) =>
        q.eq("studioId", args.studioId).eq("isBlacklisted", true)
      )
      .collect();

    return clients.filter((c) => c.deletedAt === undefined);
  },
});

// =====================================================
// CLIENT MUTATIONS
// =====================================================

/**
 * Create new client
 */
export const createClient = mutation({
  args: {
    clerkId: v.string(),
    studioId: v.id("studios"),
    userId: v.id("users"),
    clientType: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    preferences: v.optional(v.object({
      preferredRoom: v.optional(v.id("rooms")),
      preferredServices: v.optional(v.array(v.string())),
      specialRequests: v.optional(v.array(v.string())),
      notes: v.optional(v.string()),
    })),
    rating: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify studio ownership
    const studio = await ctx.db.get(args.studioId);
    if (!studio || studio.ownerId !== user._id) {
      throw new Error("Not authorized to modify this studio");
    }

    // Check if client already exists
    const existingClient = await ctx.db
      .query("studioClients")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("studioId"), args.studioId))
      .first();

    if (existingClient) {
      throw new Error("Client already exists for this user");
    }

    const now = Date.now();

    const clientId = await ctx.db.insert("studioClients", {
      studioId: args.studioId,
      userId: args.userId,
      clientType: args.clientType || "Regular",
      tags: args.tags,
      totalBookings: 0,
      totalRevenue: 0,
      preferences: args.preferences,
      rating: args.rating,
      notes: args.notes,
      isBlacklisted: false,
      createdAt: now,
      updatedAt: now,
    });

    return clientId;
  },
});

/**
 * Update client
 */
export const updateClient = mutation({
  args: {
    clerkId: v.string(),
    clientId: v.id("studioClients"),
    clientType: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    preferences: v.optional(v.object({
      preferredRoom: v.optional(v.id("rooms")),
      preferredServices: v.optional(v.array(v.string())),
      specialRequests: v.optional(v.array(v.string())),
      notes: v.optional(v.string()),
    })),
    rating: v.optional(v.number()),
    notes: v.optional(v.string()),
    isBlacklisted: v.optional(v.boolean()),
    blacklistReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the client
    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    // Verify studio ownership
    const studio = await ctx.db.get(client.studioId);
    if (!studio || studio.ownerId !== user._id) {
      throw new Error("Not authorized to modify this client");
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.clientType !== undefined) updateData.clientType = args.clientType;
    if (args.tags !== undefined) updateData.tags = args.tags;
    if (args.preferences !== undefined) updateData.preferences = args.preferences;
    if (args.rating !== undefined) updateData.rating = args.rating;
    if (args.notes !== undefined) updateData.notes = args.notes;
    if (args.isBlacklisted !== undefined) updateData.isBlacklisted = args.isBlacklisted;
    if (args.blacklistReason !== undefined) updateData.blacklistReason = args.blacklistReason;

    await ctx.db.patch(args.clientId, updateData);

    return args.clientId;
  },
});

/**
 * Update client metrics (called when bookings are made/completed)
 */
export const updateClientMetrics = mutation({
  args: {
    clientId: v.id("studioClients"),
    bookingRevenue: v.optional(v.number()),
    newBooking: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    const updateData: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.newBooking) {
      updateData.totalBookings = client.totalBookings + 1;
      updateData.lastBookingDate = new Date().toISOString().split('T')[0];
      if (!client.firstBookingDate) {
        updateData.firstBookingDate = updateData.lastBookingDate;
      }
    }

    if (args.bookingRevenue !== undefined) {
      updateData.totalRevenue = client.totalRevenue + args.bookingRevenue;
    }

    await ctx.db.patch(args.clientId, updateData);

    return args.clientId;
  },
});

/**
 * Delete client (soft delete)
 */
export const deleteClient = mutation({
  args: {
    clerkId: v.string(),
    clientId: v.id("studioClients"),
  },
  handler: async (ctx, args) => {
    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the client
    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    // Verify studio ownership
    const studio = await ctx.db.get(client.studioId);
    if (!studio || studio.ownerId !== user._id) {
      throw new Error("Not authorized to delete this client");
    }

    // Soft delete
    await ctx.db.patch(args.clientId, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// =====================================================
// STAFF QUERIES
// =====================================================

/**
 * Get all staff for a studio
 */
export const getStaffByStudio = query({
  args: {
    studioId: v.id("studios"),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const staff = await ctx.db
      .query("studioStaff")
      .withIndex("by_studio", (q) => q.eq("studioId", args.studioId))
      .collect();

    // Filter out deleted staff
    let filtered = staff.filter((s) => s.deletedAt === undefined);

    // Optionally include inactive staff
    if (!args.includeInactive) {
      filtered = filtered.filter((s) => s.isActive);
    }

    return filtered;
  },
});

/**
 * Get staff by role
 */
export const getStaffByRole = query({
  args: {
    studioId: v.id("studios"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const staff = await ctx.db
      .query("studioStaff")
      .withIndex("by_role", (q) =>
        q.eq("studioId", args.studioId).eq("role", args.role)
      )
      .collect();

    return staff.filter((s) => s.deletedAt === undefined && s.isActive);
  },
});

/**
 * Get staff member by user ID
 */
export const getStaffByUser = query({
  args: {
    studioId: v.id("studios"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const staff = await ctx.db
      .query("studioStaff")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("studioId"), args.studioId))
      .first();

    return staff;
  },
});

// =====================================================
// STAFF MUTATIONS
// =====================================================

/**
 * Create new staff member
 */
export const createStaff = mutation({
  args: {
    clerkId: v.string(),
    studioId: v.id("studios"),
    userId: v.id("users"),
    role: v.string(),
    permissions: v.optional(v.array(v.string())),
    availability: v.optional(v.object({
      monday: v.optional(v.array(v.string())),
      tuesday: v.optional(v.array(v.string())),
      wednesday: v.optional(v.array(v.string())),
      thursday: v.optional(v.array(v.string())),
      friday: v.optional(v.array(v.string())),
      saturday: v.optional(v.array(v.string())),
      sunday: v.optional(v.array(v.string())),
    })),
    hourlyRate: v.optional(v.number()),
    salary: v.optional(v.number()),
    commissionRate: v.optional(v.number()),
    hireDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    certifications: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify studio ownership
    const studio = await ctx.db.get(args.studioId);
    if (!studio || studio.ownerId !== user._id) {
      throw new Error("Not authorized to modify this studio");
    }

    // Check if staff already exists
    const existingStaff = await ctx.db
      .query("studioStaff")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("studioId"), args.studioId))
      .first();

    if (existingStaff) {
      throw new Error("Staff member already exists for this user");
    }

    const now = Date.now();

    const staffId = await ctx.db.insert("studioStaff", {
      studioId: args.studioId,
      userId: args.userId,
      role: args.role,
      permissions: args.permissions,
      availability: args.availability,
      hourlyRate: args.hourlyRate,
      salary: args.salary,
      commissionRate: args.commissionRate,
      isActive: true,
      hireDate: args.hireDate,
      notes: args.notes,
      skills: args.skills,
      certifications: args.certifications,
      createdAt: now,
      updatedAt: now,
    });

    return staffId;
  },
});

/**
 * Update staff member
 */
export const updateStaff = mutation({
  args: {
    clerkId: v.string(),
    staffId: v.id("studioStaff"),
    role: v.optional(v.string()),
    permissions: v.optional(v.array(v.string())),
    availability: v.optional(v.object({
      monday: v.optional(v.array(v.string())),
      tuesday: v.optional(v.array(v.string())),
      wednesday: v.optional(v.array(v.string())),
      thursday: v.optional(v.array(v.string())),
      friday: v.optional(v.array(v.string())),
      saturday: v.optional(v.array(v.string())),
      sunday: v.optional(v.array(v.string())),
    })),
    hourlyRate: v.optional(v.number()),
    salary: v.optional(v.number()),
    commissionRate: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    hireDate: v.optional(v.string()),
    terminationDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    certifications: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the staff member
    const staff = await ctx.db.get(args.staffId);
    if (!staff) {
      throw new Error("Staff member not found");
    }

    // Verify studio ownership
    const studio = await ctx.db.get(staff.studioId);
    if (!studio || studio.ownerId !== user._id) {
      throw new Error("Not authorized to modify this staff member");
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.role !== undefined) updateData.role = args.role;
    if (args.permissions !== undefined) updateData.permissions = args.permissions;
    if (args.availability !== undefined) updateData.availability = args.availability;
    if (args.hourlyRate !== undefined) updateData.hourlyRate = args.hourlyRate;
    if (args.salary !== undefined) updateData.salary = args.salary;
    if (args.commissionRate !== undefined) updateData.commissionRate = args.commissionRate;
    if (args.isActive !== undefined) updateData.isActive = args.isActive;
    if (args.hireDate !== undefined) updateData.hireDate = args.hireDate;
    if (args.terminationDate !== undefined) updateData.terminationDate = args.terminationDate;
    if (args.notes !== undefined) updateData.notes = args.notes;
    if (args.skills !== undefined) updateData.skills = args.skills;
    if (args.certifications !== undefined) updateData.certifications = args.certifications;

    await ctx.db.patch(args.staffId, updateData);

    return args.staffId;
  },
});

/**
 * Delete staff member (soft delete)
 */
export const deleteStaff = mutation({
  args: {
    clerkId: v.string(),
    staffId: v.id("studioStaff"),
  },
  handler: async (ctx, args) => {
    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the staff member
    const staff = await ctx.db.get(args.staffId);
    if (!staff) {
      throw new Error("Staff member not found");
    }

    // Verify studio ownership
    const studio = await ctx.db.get(staff.studioId);
    if (!studio || studio.ownerId !== user._id) {
      throw new Error("Not authorized to delete this staff member");
    }

    // Soft delete
    await ctx.db.patch(args.staffId, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// =====================================================
// ANALYTICS QUERIES
// =====================================================

/**
 * Get analytics for a studio
 */
export const getAnalytics = query({
  args: {
    studioId: v.id("studios"),
    period: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let analyticsQuery = ctx.db
      .query("studioAnalytics")
      .withIndex("by_studio", (q) => q.eq("studioId", args.studioId));

    // If period specified, filter by period
    if (args.period) {
      analyticsQuery = analyticsQuery.filter((q) =>
        q.eq(q.field("period"), args.period!)
      );
    }

    // If date range specified, filter by date range
    if (args.startDate && args.endDate) {
      analyticsQuery = analyticsQuery
        .filter((q) => q.eq(q.field("startDate"), args.startDate!))
        .filter((q) => q.eq(q.field("endDate"), args.endDate!));
    }

    const analytics = await analyticsQuery.order("desc").first();

    return analytics;
  },
});

/**
 * Get all analytics for a studio (all periods)
 */
export const getAllAnalytics = query({
  args: { studioId: v.id("studios") },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query("studioAnalytics")
      .withIndex("by_studio", (q) => q.eq("studioId", args.studioId))
      .order("desc")
      .take(100); // Limit to most recent 100

    return analytics;
  },
});

// =====================================================
// ANALYTICS MUTATIONS
// =====================================================

/**
 * Generate analytics from bookings
 * Calculates metrics for the specified period
 */
export const generateAnalytics = mutation({
  args: {
    clerkId: v.string(),
    studioId: v.id("studios"),
    period: v.string(), // 'daily', 'weekly', 'monthly', 'yearly'
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify studio ownership
    const studio = await ctx.db.get(args.studioId);
    if (!studio || studio.ownerId !== user._id) {
      throw new Error("Not authorized to access this studio");
    }

    // Get all bookings for the studio
    const allBookings = await ctx.db
      .query("sbookings")
      .withIndex("by_studio", (q) => q.eq("studioId", args.studioId))
      .collect();

    // Filter bookings by date range
    const bookings = allBookings.filter((booking) => {
      if (!booking.date) return false;
      const bookingDate = new Date(booking.date);
      const start = new Date(args.startDate);
      const end = new Date(args.endDate);
      return bookingDate >= start && bookingDate <= end;
    });

    // Calculate metrics
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter((b) => b.status === "Confirmed").length;
    const cancelledBookings = bookings.filter((b) => b.status === "Cancelled").length;
    const completedBookings = bookings.filter((b) => b.status === "Completed").length;

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.finalAmount || 0), 0);
    const depositRevenue = bookings.reduce((sum, b) => sum + (b.depositAmount || 0), 0);
    const pendingRevenue = bookings
      .filter((b) => b.paymentStatus !== "FullyPaid")
      .reduce((sum, b) => sum + (b.finalAmount || 0), 0);

    // Calculate room utilization
    const totalRoomHours = bookings.reduce((sum, b) => sum + (b.duration || 0), 0);
    const averageBookingDuration = totalBookings > 0 ? totalRoomHours / totalBookings : 0;

    // Calculate utilization rate (simplified - based on 8hr/day * days in period)
    const daysInPeriod = Math.ceil(
      (new Date(args.endDate).getTime() - new Date(args.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const maxPossibleHours = daysInPeriod * 8; // Assume 8 hours per day
    const utilizationRate = maxPossibleHours > 0 ? (totalRoomHours / maxPossibleHours) * 100 : 0;

    // Get top services
    const serviceCounts = bookings.reduce((acc, b) => {
      const service = b.serviceType || "Other";
      acc[service] = acc[service] || { count: 0, revenue: 0 };
      acc[service].count++;
      acc[service].revenue += b.finalAmount || 0;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    const topServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([serviceName, data]) => ({
        serviceName,
        bookingCount: data.count,
        revenue: data.revenue,
      }));

    // Get top clients
    const clientCounts = bookings.reduce((acc, b) => {
      if (!b.clientId) return acc;
      const clientId = b.clientId;
      acc[clientId] = acc[clientId] || { count: 0, spent: 0 };
      acc[clientId].count++;
      acc[clientId].spent += b.finalAmount || 0;
      return acc;
    }, {} as Record<string, { count: number; spent: number }>);

    const topClients = await Promise.all(
      Object.entries(clientCounts)
        .sort((a, b) => b[1].spent - a[1].spent)
        .slice(0, 10)
        .map(async ([clientId, data]) => {
          const clientUser = await ctx.db.get(clientId as Id<"users">);
          const userName =
            (clientUser && "displayName" in clientUser && clientUser.displayName) ||
            (clientUser && "username" in clientUser && clientUser.username) ||
            "Unknown";
          return {
            clientName: userName,
            clientId: clientId as Id<"users">,
            bookingCount: data.count,
            totalSpent: data.spent,
          };
        })
    );

    // Count new vs returning clients
    const clientIds = new Set(bookings.map((b) => b.clientId)?.filter(Boolean));
    const newClientCount = clientIds.size;
    const returningClientCount = bookings.filter((b) => {
      // Check if client had bookings before this period
      return allBookings.some((ob) => {
        if (ob.clientId === b.clientId && ob.date) {
          const obDate = new Date(ob.date);
          const periodStart = new Date(args.startDate);
          return obDate < periodStart;
        }
        return false;
      });
    }).length;

    const generatedAt = Date.now();

    // Create analytics record
    const analyticsId = await ctx.db.insert("studioAnalytics", {
      studioId: args.studioId,
      period: args.period,
      startDate: args.startDate,
      endDate: args.endDate,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      totalRevenue,
      depositRevenue,
      finalRevenue: totalRevenue - depositRevenue,
      pendingRevenue,
      totalRoomHours,
      averageBookingDuration,
      utilizationRate,
      topServices,
      topClients,
      newClientCount,
      returningClientCount,
      generatedAt,
    });

    return analyticsId;
  },
});

/**
 * Delete analytics
 */
export const deleteAnalytics = mutation({
  args: {
    clerkId: v.string(),
    analyticsId: v.id("studioAnalytics"),
  },
  handler: async (ctx, args) => {
    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the analytics
    const analytics = await ctx.db.get(args.analyticsId);
    if (!analytics) {
      throw new Error("Analytics not found");
    }

    // Verify studio ownership
    const studio = await ctx.db.get(analytics.studioId);
    if (!studio || studio.ownerId !== user._id) {
      throw new Error("Not authorized to delete this analytics");
    }

    await ctx.db.delete(args.analyticsId);

    return { success: true };
  },
});

// =====================================================
// GALLERY MUTATIONS
// =====================================================

/**
 * Update studio photos (gallery)
 */
export const updateStudioPhotos = mutation({
  args: {
    clerkId: v.string(),
    studioId: v.id("studios"),
    photos: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the studio
    const studio = await ctx.db.get(args.studioId);
    if (!studio) {
      throw new Error("Studio not found");
    }

    // Verify ownership
    if (studio.ownerId !== user._id) {
      throw new Error("Not authorized to update this studio");
    }

    // Update studio photos
    await ctx.db.patch(args.studioId, {
      studioPhotos: args.photos,
      updatedAt: Date.now(),
    });

    return args.studioId;
  },
});
