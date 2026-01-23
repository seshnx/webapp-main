import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get notifications for a user
export const getNotifications = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(100)
      .collect();
  },
});

// Get unread notifications for a user
export const getUnreadNotifications = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("read"), false))
      .order("desc")
      .take(50)
      .collect();
  },
});

// Get unread notification count
export const getUnreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    return notifications.length;
  },
});

// Get a specific notification
export const getNotification = query({
  args: { notificationId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_id", (q) => q.eq("id", args.notificationId))
      .first();
  },
});

// Sync notification from Neon to Convex
export const syncNotification = mutation({
  args: {
    id: v.string(),
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("notifications")
      .withIndex("by_id", (q) => q.eq("id", args.id))
      .first();

    const now = args.createdAt || Date.now();

    if (existing) {
      // Update existing notification
      await ctx.db.patch(existing._id, {
        read: args.read,
        metadata: args.metadata,
      });
    } else {
      // Insert new notification
      await ctx.db.insert("notifications", {
        id: args.id,
        userId: args.userId,
        type: args.type,
        title: args.title,
        message: args.message,
        read: args.read,
        createdAt: now,
        metadata: args.metadata,
      });
    }

    return { success: true };
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: { notificationId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("notifications")
      .withIndex("by_id", (q) => q.eq("id", args.notificationId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        read: true,
      });
    }

    return { success: true };
  },
});

// Mark all notifications as read for a user
export const markAllAsRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, { read: true });
    }

    return { success: true, marked: notifications.length };
  },
});

// Remove notification from Convex
export const removeNotification = mutation({
  args: { notificationId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("notifications")
      .withIndex("by_id", (q) => q.eq("id", args.notificationId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return { success: true };
  },
});
