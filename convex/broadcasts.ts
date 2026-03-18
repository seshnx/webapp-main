import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// BROADCASTS
// =============================================================================

export const getBroadcasts = query({
  args: {},
  handler: async (ctx) => {
    const broadcasts = await ctx.db
      .query("broadcasts")
      .withIndex("by_school_created")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    return broadcasts;
  },
});

export const getBroadcastById = query({
  args: { broadcastId: v.id("broadcasts") },
  handler: async (ctx, args) => {
    const broadcast = await ctx.db.get(args.broadcastId);
    if (!broadcast || broadcast.deletedAt) return null;
    return broadcast;
  },
});

export const getBroadcastsBySchool = query({
  args: {
    schoolId: v.id("schools"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("broadcasts")
      .withIndex("by_school_created", (q) => q.eq("schoolId", args.schoolId));

    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    } else {
      q = q.filter((q) => q.eq(q.field("deletedAt"), undefined));
    }

    let broadcasts = await q.collect();

    // Sort by created date (newest first)
    broadcasts.sort((a, b) => b.createdAt - a.createdAt);

    if (args.limit) {
      broadcasts = broadcasts.slice(0, args.limit);
    }

    return broadcasts;
  },
});

export const getBroadcastsByTarget = query({
  args: {
    schoolId: v.id("schools"),
    targetType: v.string(), // 'all', 'students', 'staff', 'specific'
    targetId: v.optional(v.string()), // User ID for 'specific' targeting
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("broadcasts")
      .withIndex("by_school_created", (q) => q.eq("schoolId", args.schoolId));

    let broadcasts = await q.collect();

    // Filter by target type
    broadcasts = broadcasts.filter((b) => {
      if (b.targetType === "all") return true;
      if (b.targetType === args.targetType) return true;
      if (b.targetType === "specific" && b.targetId === args.targetId) return true;
      return false;
    });

    // Filter by status if provided
    if (args.status) {
      broadcasts = broadcasts.filter((b) => b.status === args.status);
    }

    // Filter out deleted
    broadcasts = broadcasts.filter((b) => !b.deletedAt);

    // Sort by priority and created date
    broadcasts.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return b.createdAt - a.createdAt;
    });

    if (args.limit) {
      broadcasts = broadcasts.slice(0, args.limit);
    }

    return broadcasts;
  },
});

export const getScheduledBroadcasts = query({
  args: {
    schoolId: v.optional(v.id("schools")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    let q = ctx.db.query("broadcasts");

    if (args.schoolId) {
      q = q.withIndex("by_school_created", (q) => q.eq("schoolId", args.schoolId));
    } else {
      q = q.withIndex("by_school_created");
    }

    const broadcasts = await q
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "scheduled"),
          q.gt(q.field("scheduledFor"), now),
          q.eq(q.field("deletedAt"), undefined)
        )
      )
      .collect();

    // Sort by scheduled date
    broadcasts.sort((a, b) => a.scheduledFor! - b.scheduledFor!);

    return broadcasts;
  },
});

export const getActiveBroadcasts = query({
  args: {
    schoolId: v.id("schools"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const broadcasts = await ctx.db
      .query("broadcasts")
      .withIndex("by_school_created", (q) => q.eq("schoolId", args.schoolId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "published"),
          q.or(
            q.eq(q.field("expiresAt"), undefined),
            q.gt(q.field("expiresAt"), now)
          ),
          q.eq(q.field("deletedAt"), undefined)
        )
      )
      .collect();

    // Sort by priority and created date
    broadcasts.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return b.createdAt - a.createdAt;
    });

    return broadcasts;
  },
});

export const getDraftBroadcasts = query({
  args: {
    schoolId: v.id("schools"),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("broadcasts")
      .withIndex("by_school_created", (q) => q.eq("schoolId", args.schoolId));

    let broadcasts = await q.collect();

    broadcasts = broadcasts.filter((b) =>
      b.status === "draft" &&
      !b.deletedAt &&
      (!args.createdBy || b.createdBy === args.createdBy)
    );

    // Sort by created date (newest first)
    broadcasts.sort((a, b) => b.createdAt - a.createdAt);

    return broadcasts;
  },
});

export const searchBroadcasts = query({
  args: {
    schoolId: v.id("schools"),
    searchQuery: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allBroadcasts = await ctx.db
      .query("broadcasts")
      .withIndex("by_school_created", (q) => q.eq("schoolId", args.schoolId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    const query = args.searchQuery.toLowerCase();
    const filtered = allBroadcasts.filter(
      (b) =>
        b.title.toLowerCase().includes(query) ||
        b.content.toLowerCase().includes(query) ||
        b.createdByName?.toLowerCase().includes(query)
    );

    if (args.limit) {
      return filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

export const createBroadcast = mutation({
  args: {
    schoolId: v.id("schools"),
    createdBy: v.string(),
    createdByName: v.string(),
    createdByPhoto: v.optional(v.string()),
    title: v.string(),
    content: v.string(),
    targetType: v.string(), // 'all', 'students', 'staff', 'specific'
    targetId: v.optional(v.string()), // User ID for 'specific' targeting
    priority: v.optional(v.string()), // 'urgent', 'high', 'normal', 'low'
    status: v.optional(v.string()), // 'draft', 'published', 'scheduled', 'archived'
    scheduledFor: v.optional(v.number()), // Timestamp for scheduled broadcasts
    expiresAt: v.optional(v.number()), // Timestamp for expiration
    category: v.optional(v.string()), // 'announcement', 'emergency', 'event', 'reminder', 'news'
    attachments: v.optional(v.array(v.string())), // URLs to files/images
    linkUrl: v.optional(v.string()),
    linkLabel: v.optional(v.string()),
    sendPush: v.optional(v.boolean()),
    sendEmail: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const broadcastId = await ctx.db.insert("broadcasts", {
      ...args,
      priority: args.priority || "normal",
      status: args.status || "draft",
      readCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, broadcastId };
  },
});

export const updateBroadcast = mutation({
  args: {
    broadcastId: v.id("broadcasts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    targetType: v.optional(v.string()),
    targetId: v.optional(v.string()),
    priority: v.optional(v.string()),
    status: v.optional(v.string()),
    scheduledFor: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    category: v.optional(v.string()),
    attachments: v.optional(v.array(v.string())),
    linkUrl: v.optional(v.string()),
    linkLabel: v.optional(v.string()),
    sendPush: v.optional(v.boolean()),
    sendEmail: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { broadcastId, ...updates } = args;
    const broadcast = await ctx.db.get(broadcastId);

    if (!broadcast) {
      throw new Error("Broadcast not found");
    }

    await ctx.db.patch(broadcastId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const publishBroadcast = mutation({
  args: {
    broadcastId: v.id("broadcasts"),
    publishImmediately: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const broadcast = await ctx.db.get(args.broadcastId);

    if (!broadcast) {
      throw new Error("Broadcast not found");
    }

    if (broadcast.status === "published") {
      throw new Error("Broadcast is already published");
    }

    const now = Date.now();
    const updates: any = {
      status: "published",
      publishedAt: now,
      updatedAt: now,
    };

    // If scheduled, keep as scheduled until time comes
    if (broadcast.scheduledFor && broadcast.scheduledFor > now && !args.publishImmediately) {
      updates.status = "scheduled";
    }

    await ctx.db.patch(args.broadcastId, updates);

    return { success: true };
  },
});

export const archiveBroadcast = mutation({
  args: { broadcastId: v.id("broadcasts") },
  handler: async (ctx, args) => {
    const broadcast = await ctx.db.get(args.broadcastId);

    if (!broadcast) {
      throw new Error("Broadcast not found");
    }

    await ctx.db.patch(args.broadcastId, {
      status: "archived",
      archivedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteBroadcast = mutation({
  args: { broadcastId: v.id("broadcasts") },
  handler: async (ctx, args) => {
    const broadcast = await ctx.db.get(args.broadcastId);

    if (!broadcast) {
      throw new Error("Broadcast not found");
    }

    // Soft delete
    await ctx.db.patch(args.broadcastId, {
      deletedAt: Date.now(),
    });

    return { success: true };
  },
});

export const incrementReadCount = mutation({
  args: {
    broadcastId: v.id("broadcasts"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const broadcast = await ctx.db.get(args.broadcastId);

    if (!broadcast) {
      throw new Error("Broadcast not found");
    }

    // Check if user already read this broadcast
    const existingRead = await ctx.db
      .query("broadcastReads")
      .withIndex("by_broadcast_user", (q) =>
        q.eq("broadcastId", args.broadcastId).eq("userId", args.userId)
      )
      .first();

    if (existingRead) {
      // Already read, just return
      return { success: true, alreadyRead: true };
    }

    // Mark as read
    await ctx.db.insert("broadcastReads", {
      broadcastId: args.broadcastId,
      userId: args.userId,
      readAt: Date.now(),
    });

    // Increment read count
    await ctx.db.patch(args.broadcastId, {
      readCount: (broadcast.readCount || 0) + 1,
    });

    return { success: true, alreadyRead: false };
  },
});

export const markBroadcastAsRead = mutation({
  args: {
    broadcastId: v.id("broadcasts"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already read
    const existingRead = await ctx.db
      .query("broadcastReads")
      .withIndex("by_broadcast_user", (q) =>
        q.eq("broadcastId", args.broadcastId).eq("userId", args.userId)
      )
      .first();

    if (existingRead) {
      return { success: true, alreadyRead: true };
    }

    // Mark as read
    await ctx.db.insert("broadcastReads", {
      broadcastId: args.broadcastId,
      userId: args.userId,
      readAt: Date.now(),
    });

    return { success: true, alreadyRead: false };
  },
});

export const getBroadcastReads = query({
  args: {
    broadcastId: v.id("broadcasts"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("broadcastReads")
      .withIndex("by_broadcast", (q) => q.eq("broadcastId", args.broadcastId));

    let reads = await q.collect();

    // Sort by read date
    reads.sort((a, b) => b.readAt - a.readAt);

    if (args.limit) {
      reads = reads.slice(0, args.limit);
    }

    return reads;
  },
});

export const getUserReadBroadcasts = query({
  args: {
    userId: v.string(),
    schoolId: v.optional(v.id("schools")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("broadcastReads")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    let reads = await q.collect();

    // Get broadcast details
    const broadcasts = await Promise.all(
      reads.map(async (read) => {
        const broadcast = await ctx.db.get(read.broadcastId);
        if (!broadcast || broadcast.deletedAt) return null;
        if (args.schoolId && broadcast.schoolId !== args.schoolId) return null;
        return {
          ...read,
          broadcast,
        };
      })
    );

    const validBroadcasts = broadcasts.filter((b) => b !== null);

    // Sort by read date
    validBroadcasts.sort((a, b) => b!.readAt - a!.readAt);

    if (args.limit) {
      return validBroadcasts.slice(0, args.limit);
    }

    return validBroadcasts;
  },
});

export const getUnreadBroadcasts = query({
  args: {
    userId: v.string(),
    schoolId: v.id("schools"),
    userType: v.string(), // 'student', 'staff', or 'admin'
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get all published broadcasts for this school
    const allBroadcasts = await ctx.db
      .query("broadcasts")
      .withIndex("by_school_created", (q) => q.eq("schoolId", args.schoolId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "published"),
          q.or(
            q.eq(q.field("expiresAt"), undefined),
            q.gt(q.field("expiresAt"), now)
          ),
          q.eq(q.field("deletedAt"), undefined)
        )
      )
      .collect();

    // Get broadcasts that target this user
    const targetedBroadcasts = allBroadcasts.filter((broadcast) => {
      if (broadcast.targetType === "all") return true;
      if (broadcast.targetType === args.userType) return true;
      if (broadcast.targetType === "specific" && broadcast.targetId === args.userId) return true;
      return false;
    });

    // Get user's read broadcasts
    const readBroadcasts = await ctx.db
      .query("broadcastReads")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const readBroadcastIds = new Set(readBroadcasts.map((r) => r.broadcastId.toString()));

    // Filter out read broadcasts
    const unreadBroadcasts = targetedBroadcasts.filter(
      (b) => !readBroadcastIds.has(b._id.toString())
    );

    // Sort by priority and created date
    unreadBroadcasts.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return b.createdAt - a.createdAt;
    });

    return unreadBroadcasts;
  },
});

export const getBroadcastStats = query({
  args: {
    schoolId: v.id("schools"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("broadcasts")
      .withIndex("by_school_created", (q) => q.eq("schoolId", args.schoolId));

    let broadcasts = await q.collect();

    // Filter by date range if provided
    if (args.startDate || args.endDate) {
      broadcasts = broadcasts.filter((b) => {
        if (args.startDate && b.createdAt < args.startDate!) return false;
        if (args.endDate && b.createdAt > args.endDate!) return false;
        return true;
      });
    }

    // Filter out deleted
    broadcasts = broadcasts.filter((b) => !b.deletedAt);

    // Calculate stats
    const total = broadcasts.length;
    const published = broadcasts.filter((b) => b.status === "published").length;
    const draft = broadcasts.filter((b) => b.status === "draft").length;
    const scheduled = broadcasts.filter((b) => b.status === "scheduled").length;
    const archived = broadcasts.filter((b) => b.status === "archived").length;

    const byPriority = {
      urgent: broadcasts.filter((b) => b.priority === "urgent").length,
      high: broadcasts.filter((b) => b.priority === "high").length,
      normal: broadcasts.filter((b) => b.priority === "normal").length,
      low: broadcasts.filter((b) => b.priority === "low").length,
    };

    const byCategory = broadcasts.reduce((acc, b) => {
      const category = b.category || "uncategorized";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalReads = broadcasts.reduce((sum, b) => sum + (b.readCount || 0), 0);

    const byTargetType = {
      all: broadcasts.filter((b) => b.targetType === "all").length,
      students: broadcasts.filter((b) => b.targetType === "students").length,
      staff: broadcasts.filter((b) => b.targetType === "staff").length,
      specific: broadcasts.filter((b) => b.targetType === "specific").length,
    };

    return {
      total,
      byStatus: {
        published,
        draft,
        scheduled,
        archived,
      },
      byPriority,
      byCategory,
      byTargetType,
      totalReads,
      avgReadsPerBroadcast: total > 0 ? Math.round(totalReads / total) : 0,
    };
  },
});
