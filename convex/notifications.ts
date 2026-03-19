import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper to resolve clerkId -> internal user._id
async function getUserByClerkId(ctx: any, clerkId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
    .first();
}

// Get notifications for a user (accepts clerkId string from frontend)
export const getNotifications = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.userId);
    if (!user) return [];

    return await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q: any) => q.eq("userId", user._id))
      .order("desc")
      .take(100)
      .collect();
  },
});

// Get unread notifications for a user
export const getUnreadNotifications = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.userId);
    if (!user) return [];

    return await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q: any) => q.eq("userId", user._id))
      .filter((q: any) => q.eq(q.field("read"), false))
      .order("desc")
      .take(50)
      .collect();
  },
});

// Get unread notification count
export const getUnreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.userId);
    if (!user) return 0;

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q: any) => q.eq("userId", user._id))
      .filter((q: any) => q.eq(q.field("read"), false))
      .collect();

    return notifications.length;
  },
});

// Get a specific notification
export const getNotification = query({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.notificationId);
  },
});

// Create a new notification
export const createNotification = mutation({
  args: {
    userId: v.string(), // clerkId of target user
    type: v.string(),
    title: v.string(),
    message: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.userId);
    if (!user) return { success: false, error: "User not found" };

    await ctx.db.insert("notifications", {
      userId: user._id,
      type: args.type,
      title: args.title,
      message: args.message,
      read: false,
      createdAt: Date.now(),
      metadata: args.metadata,
    });

    return { success: true };
  },
});

// Sync notification from Neon to Convex (legacy compat)
export const syncNotification = mutation({
  args: {
    id: v.optional(v.string()),
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.userId);
    if (!user) return { success: false };

    await ctx.db.insert("notifications", {
      userId: user._id,
      type: args.type,
      title: args.title,
      message: args.message,
      read: args.read,
      createdAt: args.createdAt || Date.now(),
      metadata: args.metadata,
    });

    return { success: true };
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.notificationId);
    if (existing) {
      await ctx.db.patch(args.notificationId, { read: true });
    }
    return { success: true };
  },
});

// Mark all notifications as read for a user
export const markAllAsRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.userId);
    if (!user) return { success: false, marked: 0 };

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q: any) => q.eq("userId", user._id))
      .filter((q: any) => q.eq(q.field("read"), false))
      .collect();

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, { read: true });
    }

    return { success: true, marked: notifications.length };
  },
});

// Delete a single notification
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.notificationId);
    if (existing) {
      await ctx.db.delete(args.notificationId);
    }
    return { success: true };
  },
});

// Clear all notifications for a user
export const clearAll = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.userId);
    if (!user) return { success: false };

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q: any) => q.eq("userId", user._id))
      .collect();

    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    return { success: true, cleared: notifications.length };
  },
});

// Remove a single notification (alias for deleteNotification - legacy compat)
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

import { v } from "convex/values";