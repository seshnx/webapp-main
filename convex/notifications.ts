import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get notifications for a user
export const getNotifications = query({
  args: { userId: v.id("users") },
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
  args: { userId: v.id("users") },
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
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    return notifications.length;
  },
});

// Get a specific notification (Using native db.get instead of index)
export const getNotification = query({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.notificationId);
  },
});

// Sync notification from Neon to Convex (Refactored to ignore legacy IDs)
export const syncNotification = mutation({
  args: {
    id: v.optional(v.string()), // Made optional so old frontend calls don't crash, but we ignore it
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = args.createdAt || Date.now();

    // Insert new notification using purely Convex IDs
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      read: args.read,
      createdAt: now,
      metadata: args.metadata,
    });

    return { success: true };
  },
});

// Mark notification as read (Using native db.patch)
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.notificationId);

    if (existing) {
      await ctx.db.patch(args.notificationId, {
        read: true,
      });
    }

    return { success: true };
  },
});

// Mark all notifications as read for a user
export const markAllAsRead = mutation({
  args: { userId: v.id("users") },
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

// Remove notification from Convex (Using native db.delete)
export const removeNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.notificationId);

    if (existing) {
      await ctx.db.delete(args.notificationId);
    }

    return { success: true };
  },
});