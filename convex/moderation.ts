import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// CONTENT MODERATION
// =============================================================================

/**
 * Submit a content report
 * Creates a new report in the contentReports table
 */
export const submitReport = mutation({
  args: {
    reporterId: v.string(), // Clerk ID of reporter
    targetType: v.string(), // post, comment, user
    targetId: v.string(), // ID of the reported content
    reason: v.string(), // spam, harassment, hate_speech, misinformation, explicit_content, other
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the reporter's user record
    const reporter = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.reporterId))
      .first();

    if (!reporter) {
      return { success: false, error: "Reporter not found" };
    }

    // Check if this user has already reported this content
    const existingReports = await ctx.db
      .query("contentReports")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.targetId).eq("targetType", args.targetType)
      )
      .filter((q) => q.eq(q.field("reporterId"), reporter._id))
      .collect();

    if (existingReports.length > 0) {
      return { success: false, error: "You have already reported this content" };
    }

    // Create the report
    const reportId = await ctx.db.insert("contentReports", {
      reporterId: reporter._id,
      targetId: args.targetId,
      targetType: args.targetType as any,
      reason: args.reason as any,
      description: args.description,
      status: "pending",
      reviewedBy: undefined,
      reviewedAt: undefined,
      reviewNotes: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, reportId };
  },
});

/**
 * Get reports for admin review
 * Supports filtering by status, type, and pagination
 */
export const getReports = query({
  args: {
    status: v.optional(v.string()), // pending, reviewing, resolved, dismissed
    targetType: v.optional(v.string()), // post, comment, user
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let reportsQuery = ctx.db.query("contentReports");

    // Filter by status if provided
    if (args.status) {
      reportsQuery = reportsQuery.withIndex("by_status", (q) =>
        q.eq("status", args.status!)
      );
    } else {
      reportsQuery = reportsQuery.withIndex("by_created");
    }

    // Fetch reports
    let reports = await reportsQuery.order("desc").take(args.limit || 50);

    // Filter by targetType if provided (post-filter since no composite index)
    if (args.targetType) {
      reports = reports.filter((r) => r.targetType === args.targetType);
    }

    // Fetch reporter details for each report
    const reportsWithDetails = await Promise.all(
      reports.map(async (report) => {
        const reporter = await ctx.db.get(report.reporterId);
        return {
          ...report,
          reporterName: reporter?.displayName || reporter?.username || "Unknown",
          reporterEmail: reporter?.email,
        };
      })
    );

    return reportsWithDetails;
  },
});

/**
 * Get reports for a specific content item
 */
export const getReportsByContent = query({
  args: {
    targetId: v.string(),
    targetType: v.string(),
  },
  handler: async (ctx, args) => {
    const reports = await ctx.db
      .query("contentReports")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.targetId).eq("targetType", args.targetType as any)
      )
      .collect();

    return reports;
  },
});

/**
 * Check if a specific user has reported content
 */
export const hasUserReported = query({
  args: {
    userId: v.string(), // Clerk ID
    targetId: v.string(),
    targetType: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!user) return false;

    const reports = await ctx.db
      .query("contentReports")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.targetId).eq("targetType", args.targetType as any)
      )
      .filter((q) => q.eq(q.field("reporterId"), user._id))
      .collect();

    return reports.length > 0;
  },
});

/**
 * Check if content has any reports
 */
export const getContentReports = query({
  args: {
    targetId: v.string(),
    targetType: v.string(),
  },
  handler: async (ctx, args) => {
    const reports = await ctx.db
      .query("contentReports")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.targetId).eq("targetType", args.targetType as any)
      )
      .collect();

    // Return summary of reports
    return {
      total: reports.length,
      pending: reports.filter((r) => r.status === "pending").length,
      reviewing: reports.filter((r) => r.status === "reviewing").length,
      resolved: reports.filter((r) => r.status === "resolved").length,
      hasReports: reports.length > 0,
      isHidden: reports.some((r) => r.status === "resolved" && r.actionTaken === "hidden"),
    };
  },
});

/**
 * Update report status
 * Admin-only mutation to review and take action on reports
 */
export const updateReportStatus = mutation({
  args: {
    reportId: v.id("contentReports"),
    status: v.string(), // pending, reviewing, resolved, dismissed
    reviewedBy: v.string(), // Clerk ID of admin
    reviewNotes: v.optional(v.string()),
    actionTaken: v.optional(v.string()), // hidden, removed, warned, none
  },
  handler: async (ctx, args) => {
    // Get the admin user
    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.reviewedBy))
      .first();

    if (!admin) {
      return { success: false, error: "Admin not found" };
    }

    // Update the report
    await ctx.db.patch(args.reportId, {
      status: args.status as any,
      reviewedBy: admin._id,
      reviewedAt: Date.now(),
      reviewNotes: args.reviewNotes,
      actionTaken: args.actionTaken as any,
      updatedAt: Date.now(),
    });

    // If action is to hide or remove content, update the content
    if (args.actionTaken === "hidden" || args.actionTaken === "removed") {
      const report = await ctx.db.get(args.reportId);
      if (!report) return { success: false, error: "Report not found" };

      // Handle different content types
      if (report.targetType === "post") {
        // Mark post as deleted (soft delete)
        const post = await ctx.db
          .query("posts")
          .filter((q) => q.eq(q.field("_id"), report.targetId))
          .first();

        if (post) {
          await ctx.db.patch(post._id, { deletedAt: Date.now() });
        }
      } else if (report.targetType === "comment") {
        // Mark comment as deleted
        const comment = await ctx.db
          .query("comments")
          .filter((q) => q.eq(q.field("_id"), report.targetId))
          .first();

        if (comment) {
          await ctx.db.patch(comment._id, { deletedAt: Date.now() });
        }
      }
    }

    return { success: true };
  },
});

/**
 * Get moderation statistics
 */
export const getModerationStats = query({
  args: {},
  handler: async (ctx) => {
    const allReports = await ctx.db.query("contentReports").collect();

    return {
      total: allReports.length,
      pending: allReports.filter((r) => r.status === "pending").length,
      reviewing: allReports.filter((r) => r.status === "reviewing").length,
      resolved: allReports.filter((r) => r.status === "resolved").length,
      dismissed: allReports.filter((r) => r.status === "dismissed").length,
      byReason: allReports.reduce((acc, report) => {
        acc[report.reason] = (acc[report.reason] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byType: allReports.reduce((acc, report) => {
        acc[report.targetType] = (acc[report.targetType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  },
});
