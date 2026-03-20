import { query, mutation } from "./_generated/server";
import { v } from "convex-values";

// =============================================================================
// EDU ANNOUNCEMENTS (School Communication System)
// =============================================================================

export const getEduAnnouncements = query({
  args: {},
  handler: async (ctx) => {
    const announcements = await ctx.db
      .query("eduAnnouncements")
      .withIndex("by_school_created")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    return announcements;
  },
});

export const getEduAnnouncementById = query({
  args: { announcementId: v.id("eduAnnouncements") },
  handler: async (ctx, args) => {
    const announcement = await ctx.db.get(args.announcementId);
    if (!announcement || announcement.deletedAt) return null;
    return announcement;
  },
});

export const getEduAnnouncementsBySchool = query({
  args: {
    schoolId: v.id("schools"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("eduAnnouncements")
      .withIndex("by_school_created", (q) => q.eq("schoolId", args.schoolId));

    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    } else {
      q = q.filter((q) => q.eq(q.field("deletedAt"), undefined));
    }

    let announcements = await q.collect();

    // Sort by created date (newest first)
    announcements.sort((a, b) => b.createdAt - a.createdAt);

    if (args.limit) {
      announcements = announcements.slice(0, args.limit);
    }

    return announcements;
  },
});

export const getEduAnnouncementsByTarget = query({
  args: {
    schoolId: v.id("schools"),
    targetType: v.string(), // 'all', 'students', 'staff', 'specific'
    targetId: v.optional(v.string()), // User ID for 'specific' targeting
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("eduAnnouncements")
      .withIndex("by_school_created", (q) => q.eq("schoolId", args.schoolId));

    let announcements = await q.collect();

    // Filter by target type
    announcements = announcements.filter((a) => {
      if (a.targetType === "all") return true;
      if (a.targetType === args.targetType) return true;
      if (a.targetType === "specific" && a.targetId === args.targetId) return true;
      return false;
    });

    // Filter by status if provided
    if (args.status) {
      announcements = announcements.filter((a) => a.status === args.status);
    }

    // Filter out deleted
    announcements = announcements.filter((a) => !a.deletedAt);

    // Sort by priority and created date
    announcements.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return b.createdAt - a.createdAt;
    });

    if (args.limit) {
      announcements = announcements.slice(0, args.limit);
    }

    return announcements;
  },
});

export const getScheduledEduAnnouncements = query({
  args: {
    schoolId: v.optional(v.id("schools")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    let q = ctx.db.query("eduAnnouncements");

    if (args.schoolId) {
      q = q.withIndex("by_school_created", (q) => q.eq("schoolId", args.schoolId));
    } else {
      q = q.withIndex("by_school_created");
    }

    const announcements = await q
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "scheduled"),
          q.gt(q.field("scheduledFor"), now),
          q.eq(q.field("deletedAt"), undefined)
        )
      )
      .collect();

    // Sort by scheduled date
    announcements.sort((a, b) => a.scheduledFor! - b.scheduledFor!);

    return announcements;
  },
});

export const getActiveEduAnnouncements = query({
  args: {
    schoolId: v.id("schools"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const announcements = await ctx.db
      .query("eduAnnouncements")
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
    announcements.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return b.createdAt - a.createdAt;
    });

    return announcements;
  },
});

export const getDraftEduAnnouncements = query({
  args: {
    schoolId: v.id("schools"),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("eduAnnouncements")
      .withIndex("by_school_created", (q) => q.eq("schoolId", args.schoolId));

    let announcements = await q.collect();

    announcements = announcements.filter((a) =>
      a.status === "draft" &&
      !a.deletedAt &&
      (!args.createdBy || a.createdBy === args.createdBy)
    );

    // Sort by created date (newest first)
    announcements.sort((a, b) => b.createdAt - a.createdAt);

    return announcements;
  },
});

export const searchEduAnnouncements = query({
  args: {
    schoolId: v.id("schools"),
    searchQuery: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allAnnouncements = await ctx.db
      .query("eduAnnouncements")
      .withIndex("by_school_created", (q) => q.eq("schoolId", args.schoolId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    const query = args.searchQuery.toLowerCase();
    const filtered = allAnnouncements.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.content.toLowerCase().includes(query) ||
        a.createdByName?.toLowerCase().includes(query)
    );

    if (args.limit) {
      return filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

export const createEduAnnouncement = mutation({
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
    scheduledFor: v.optional(v.number()), // Timestamp for scheduled announcements
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

    const announcementId = await ctx.db.insert("eduAnnouncements", {
      ...args,
      priority: args.priority || "normal",
      status: args.status || "draft",
      readCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, announcementId };
  },
});

export const updateEduAnnouncement = mutation({
  args: {
    announcementId: v.id("eduAnnouncements"),
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
    const { announcementId, ...updates } = args;
    const announcement = await ctx.db.get(announcementId);

    if (!announcement) {
      throw new Error("Announcement not found");
    }

    await ctx.db.patch(announcementId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const publishEduAnnouncement = mutation({
  args: {
    announcementId: v.id("eduAnnouncements"),
    publishImmediately: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const announcement = await ctx.db.get(args.announcementId);

    if (!announcement) {
      throw new Error("Announcement not found");
    }

    if (announcement.status === "published") {
      throw new Error("Announcement is already published");
    }

    const now = Date.now();
    const updates: any = {
      status: "published",
      publishedAt: now,
      updatedAt: now,
    };

    // If scheduled, keep as scheduled until time comes
    if (announcement.scheduledFor && announcement.scheduledFor > now && !args.publishImmediately) {
      updates.status = "scheduled";
    }

    await ctx.db.patch(args.announcementId, updates);

    return { success: true };
  },
});

export const archiveEduAnnouncement = mutation({
  args: { announcementId: v.id("eduAnnouncements") },
  handler: async (ctx, args) => {
    const announcement = await ctx.db.get(args.announcementId);

    if (!announcement) {
      throw new Error("Announcement not found");
    }

    await ctx.db.patch(args.announcementId, {
      status: "archived",
      archivedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteEduAnnouncement = mutation({
  args: { announcementId: v.id("eduAnnouncements") },
  handler: async (ctx, args) => {
    const announcement = await ctx.db.get(args.announcementId);

    if (!announcement) {
      throw new Error("Announcement not found");
    }

    // Soft delete
    await ctx.db.patch(args.announcementId, {
      deletedAt: Date.now(),
    });

    return { success: true };
  },
});

export const incrementReadCount = mutation({
  args: {
    announcementId: v.id("eduAnnouncements"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const announcement = await ctx.db.get(args.announcementId);

    if (!announcement) {
      throw new Error("Announcement not found");
    }

    // Check if user already read this announcement
    const existingRead = await ctx.db
      .query("eduAnnouncementReads")
      .withIndex("by_announcement_user", (q) =>
        q.eq("announcementId", args.announcementId).eq("userId", args.userId)
      )
      .first();

    if (existingRead) {
      // Already read, just return
      return { success: true, alreadyRead: true };
    }

    // Mark as read
    await ctx.db.insert("eduAnnouncementReads", {
      announcementId: args.announcementId,
      userId: args.userId,
      readAt: Date.now(),
    });

    // Increment read count
    await ctx.db.patch(args.announcementId, {
      readCount: (announcement.readCount || 0) + 1,
    });

    return { success: true, alreadyRead: false };
  },
});

export const markEduAnnouncementAsRead = mutation({
  args: {
    announcementId: v.id("eduAnnouncements"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already read
    const existingRead = await ctx.db
      .query("eduAnnouncementReads")
      .withIndex("by_announcement_user", (q) =>
        q.eq("announcementId", args.announcementId).eq("userId", args.userId)
      )
      .first();

    if (existingRead) {
      return { success: true, alreadyRead: true };
    }

    // Mark as read
    await ctx.db.insert("eduAnnouncementReads", {
      announcementId: args.announcementId,
      userId: args.userId,
      readAt: Date.now(),
    });

    return { success: true, alreadyRead: false };
  },
});

export const getEduAnnouncementReads = query({
  args: {
    announcementId: v.id("eduAnnouncements"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("eduAnnouncementReads")
      .withIndex("by_announcement", (q) => q.eq("announcementId", args.announcementId));

    let reads = await q.collect();

    // Sort by read date
    reads.sort((a, b) => b.readAt - a.readAt);

    if (args.limit) {
      reads = reads.slice(0, args.limit);
    }

    return reads;
  },
});

export const getUserReadEduAnnouncements = query({
  args: {
    userId: v.string(),
    schoolId: v.optional(v.id("schools")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("eduAnnouncementReads")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    let reads = await q.collect();

    // Get announcement details
    const announcements = await Promise.all(
      reads.map(async (read) => {
        const announcement = await ctx.db.get(read.announcementId);
        if (!announcement || announcement.deletedAt) return null;
        if (args.schoolId && announcement.schoolId !== args.schoolId) return null;
        return {
          ...read,
          announcement,
        };
      })
    );

    const validAnnouncements = announcements.filter((a) => a !== null);

    // Sort by read date
    validAnnouncements.sort((a, b) => b!.readAt - a!.readAt);

    if (args.limit) {
      return validAnnouncements.slice(0, args.limit);
    }

    return validAnnouncements;
  },
});

export const getUnreadEduAnnouncements = query({
  args: {
    userId: v.string(),
    schoolId: v.id("schools"),
    userType: v.string(), // 'student', 'staff', or 'admin'
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get all published announcements for this school
    const allAnnouncements = await ctx.db
      .query("eduAnnouncements")
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

    // Get announcements that target this user
    const targetedAnnouncements = allAnnouncements.filter((announcement) => {
      if (announcement.targetType === "all") return true;
      if (announcement.targetType === args.userType) return true;
      if (announcement.targetType === "specific" && announcement.targetId === args.userId) return true;
      return false;
    });

    // Get user's read announcements
    const readAnnouncements = await ctx.db
      .query("eduAnnouncementReads")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const readAnnouncementIds = new Set(readAnnouncements.map((r) => r.announcementId.toString()));

    // Filter out read announcements
    const unreadAnnouncements = targetedAnnouncements.filter(
      (a) => !readAnnouncementIds.has(a._id.toString())
    );

    // Sort by priority and created date
    unreadAnnouncements.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return b.createdAt - a.createdAt;
    });

    return unreadAnnouncements;
  },
});

export const getEduAnnouncementStats = query({
  args: {
    schoolId: v.id("schools"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("eduAnnouncements")
      .withIndex("by_school_created", (q) => q.eq("schoolId", args.schoolId));

    let announcements = await q.collect();

    // Filter by date range if provided
    if (args.startDate || args.endDate) {
      announcements = announcements.filter((a) => {
        if (args.startDate && a.createdAt < args.startDate!) return false;
        if (args.endDate && a.createdAt > args.endDate!) return false;
        return true;
      });
    }

    // Filter out deleted
    announcements = announcements.filter((a) => !a.deletedAt);

    // Calculate stats
    const total = announcements.length;
    const published = announcements.filter((a) => a.status === "published").length;
    const draft = announcements.filter((a) => a.status === "draft").length;
    const scheduled = announcements.filter((a) => a.status === "scheduled").length;
    const archived = announcements.filter((a) => a.status === "archived").length;

    const byPriority = {
      urgent: announcements.filter((a) => a.priority === "urgent").length,
      high: announcements.filter((a) => a.priority === "high").length,
      normal: announcements.filter((a) => a.priority === "normal").length,
      low: announcements.filter((a) => a.priority === "low").length,
    };

    const byCategory = announcements.reduce((acc, a) => {
      const category = a.category || "uncategorized";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalReads = announcements.reduce((sum, a) => sum + (a.readCount || 0), 0);

    const byTargetType = {
      all: announcements.filter((a) => a.targetType === "all").length,
      students: announcements.filter((a) => a.targetType === "students").length,
      staff: announcements.filter((a) => a.targetType === "staff").length,
      specific: announcements.filter((a) => a.targetType === "specific").length,
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
      avgReadsPerAnnouncement: total > 0 ? Math.round(totalReads / total) : 0,
    };
  },
});
