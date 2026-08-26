/**
 * Enhanced Convex Functions: Real-Time Presence & Sessions
 *
 * Adds advanced presence features:
 * - Enhanced presence with location tracking
 * - Active sessions for collaboration
 * - Unread counts & dashboard stats
 * - Activity feed
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ============================================================
// ENHANCED PRESENCE
// ============================================================

/**
 * Internal helper to upsert enhanced presence record.
 * Cannot call Convex mutations directly from other handlers.
 */
async function upsertEnhancedPresence(
  ctx: any,
  args: {
    userId: string;
    status: "online" | "offline" | "away" | "busy" | "in_session";
    currentLocation?: {
      type: "studio" | "room" | "session";
      id: string;
      name: string;
    } | null;
    deviceInfo?: {
      type: "desktop" | "mobile" | "tablet";
      browser?: string;
    } | null;
    activeProfile?: string | null;
  }
) {
  const now = Date.now();

  const existing = await ctx.db
    .query("enhancedPresence")
    .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      status: args.status,
      lastSeen: now,
      currentLocation: args.currentLocation ?? undefined,
      deviceInfo: args.deviceInfo ?? undefined,
      activeProfile: args.activeProfile ?? undefined,
    });
  } else {
    await ctx.db.insert("enhancedPresence", {
      userId: args.userId,
      status: args.status,
      lastSeen: now,
      currentLocation: args.currentLocation ?? undefined,
      deviceInfo: args.deviceInfo ?? undefined,
      activeProfile: args.activeProfile ?? undefined,
    });
  }

  // Also update basic presence for compatibility
  const basicPresence = await ctx.db
    .query("presence")
    .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
    .first();

  if (basicPresence) {
    await ctx.db.patch(basicPresence._id, {
      online: args.status !== "offline",
      lastSeen: now,
    });
  } else {
    await ctx.db.insert("presence", {
      userId: args.userId,
      online: args.status !== "offline",
      lastSeen: now,
    });
  }

  return { success: true, timestamp: now };
}

/**
 * Set enhanced user presence (status, location, device, active profile)
 */
export const setEnhancedPresence = mutation({
  args: {
    userId: v.string(),
    status: v.union(
      v.literal("online"),
      v.literal("offline"),
      v.literal("away"),
      v.literal("busy"),
      v.literal("in_session")
    ),
    currentLocation: v.optional(
      v.object({
        type: v.union(v.literal("studio"), v.literal("room"), v.literal("session")),
        id: v.string(),
        name: v.string(),
      })
    ),
    deviceInfo: v.optional(
      v.object({
        type: v.union(v.literal("desktop"), v.literal("mobile"), v.literal("tablet")),
        browser: v.optional(v.string()),
      })
    ),
    activeProfile: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await upsertEnhancedPresence(ctx, {
      userId: args.userId,
      status: args.status,
      currentLocation: args.currentLocation ?? undefined,
      deviceInfo: args.deviceInfo ?? undefined,
      activeProfile: args.activeProfile ?? undefined,
    });
  },
});

/**
 * Get enhanced presence for a user
 */
export const getEnhancedPresence = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const presence = await ctx.db
      .query("enhancedPresence")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return presence || null;
  },
});

/**
 * Get multiple users' enhanced presence
 */
export const getBatchEnhancedPresence = query({
  args: {
    userIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const presenceMap: Record<string, any> = {};

    for (const userId of args.userIds) {
      const presence = await ctx.db
        .query("enhancedPresence")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      presenceMap[userId] = presence;
    }

    return presenceMap;
  },
});

/**
 * Get all online users with enhanced presence
 */
export const getOnlineUsersEnhanced = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allPresence = await ctx.db
      .query("enhancedPresence")
      .withIndex("by_status", (q) => q.eq("status", "online"))
      .collect();

    const onlineUsers = allPresence.filter(p => p.status === "online" || p.status === "in_session");

    return args.limit ? onlineUsers.slice(0, args.limit) : onlineUsers;
  },
});

/**
 * Get users in a specific location (studio, room, session)
 */
export const getUsersInLocation = query({
  args: {
    locationType: v.union(v.literal("studio"), v.literal("room"), v.literal("session")),
    locationId: v.string(),
  },
  handler: async (ctx, args) => {
    const allPresence = await ctx.db
      .query("enhancedPresence")
      .withIndex("by_status", (q) => q.eq("status", "online"))
      .collect();

    return allPresence.filter(p => {
      if (!p.currentLocation) return false;
      return p.currentLocation.type === args.locationType &&
        p.currentLocation.id === args.locationId;
    });
  },
});

// ============================================================
// ACTIVE SESSIONS (COLLABORATION)
// ============================================================

/**
 * Create a new active session
 */
export const createActiveSession = mutation({
  args: {
    sessionId: v.string(),
    bookingId: v.string(),
    hostId: v.string(),
    hostName: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert("activeSessions", {
      sessionId: args.sessionId,
      bookingId: args.bookingId,
      status: "active",
      startedAt: now,
      hostId: args.hostId,
      hostName: args.hostName,
      participantCount: 1,
    });

    // Add host as participant
    await ctx.db.insert("sessionParticipants", {
      sessionId: args.sessionId,
      userId: args.hostId,
      displayName: args.hostName,
      role: "host",
      joinedAt: now,
      isActive: true,
      canEdit: true,
      canInvite: true,
    });

    // Update host's presence to in_session
    await upsertEnhancedPresence(ctx, {
      userId: args.hostId,
      status: "in_session",
      currentLocation: {
        type: "session",
        id: args.sessionId,
        name: `${args.hostName}'s Session`,
      },
    });

    return { sessionId: args.sessionId };
  },
});

/**
 * Join an active session
 */
export const joinActiveSession = mutation({
  args: {
    sessionId: v.string(),
    userId: v.string(),
    displayName: v.string(),
    role: v.union(v.literal("guest"), v.literal("observer")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if session exists and is active
    const session = await ctx.db
      .query("activeSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session || session.status !== "active") {
      throw new Error("Session not found or not active");
    }

    // Check if user is already a participant
    const existingParticipant = await ctx.db
      .query("sessionParticipants")
      .withIndex("by_session", (q) =>
        q.eq("sessionId", args.sessionId).eq("isActive", true)
      )
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existingParticipant) {
      return { alreadyInSession: true };
    }

    // Add participant
    await ctx.db.insert("sessionParticipants", {
      sessionId: args.sessionId,
      userId: args.userId,
      displayName: args.displayName,
      role: args.role,
      joinedAt: now,
      isActive: true,
      canEdit: args.role === "guest",
      canInvite: false,
    });

    // Update participant count
    await ctx.db.patch(session._id, {
      participantCount: session.participantCount + 1,
    });

    // Update user's presence
    await upsertEnhancedPresence(ctx, {
      userId: args.userId,
      status: "in_session",
      currentLocation: {
        type: "session",
        id: args.sessionId,
        name: session.hostName,
      },
    });

    return { joined: true };
  },
});

/**
 * Leave an active session
 */
export const leaveActiveSession = mutation({
  args: {
    sessionId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find participant
    const participant = await ctx.db
      .query("sessionParticipants")
      .withIndex("by_session", (q) =>
        q.eq("sessionId", args.sessionId).eq("isActive", true)
      )
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!participant) {
      return { notInSession: true };
    }

    // Update participant (mark as left)
    await ctx.db.patch(participant._id, {
      isActive: false,
      leftAt: now,
    });

    // Update session participant count
    const session = await ctx.db
      .query("activeSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        participantCount: Math.max(0, session.participantCount - 1),
      });
    }

    // Update user's presence
    await upsertEnhancedPresence(ctx, {
      userId: args.userId,
      status: "online",
      currentLocation: undefined,
    });

    return { left: true };
  },
});

/**
 * End an active session (host only)
 */
export const endActiveSession = mutation({
  args: {
    sessionId: v.string(),
    hostId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find session
    const session = await ctx.db
      .query("activeSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.hostId !== args.hostId) {
      throw new Error("Only host can end session");
    }

    // End session
    await ctx.db.patch(session._id, {
      status: "ended",
      endedAt: now,
    });

    // Mark all participants as inactive
    const participants = await ctx.db
      .query("sessionParticipants")
      .withIndex("by_session", (q) =>
        q.eq("sessionId", args.sessionId).eq("isActive", true)
      )
      .collect();

    for (const participant of participants) {
      await ctx.db.patch(participant._id, {
        isActive: false,
        leftAt: now,
      });
      // Update all participants' presence
      await upsertEnhancedPresence(ctx, {
        userId: participant.userId,
        status: "online",
        currentLocation: undefined,
      });
    }

    return { ended: true };
  },
});

/**
 * Get active session details
 */
export const getActiveSession = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("activeSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      return null;
    }

    // Get participants
    const participants = await ctx.db
      .query("sessionParticipants")
      .withIndex("by_session", (q) =>
        q.eq("sessionId", args.sessionId).eq("isActive", true)
      )
      .collect();

    return {
      ...session,
      participants,
    };
  },
});

/**
 * Get user's current active session
 */
export const getUserActiveSession = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("sessionParticipants")
      .withIndex("by_user", (q) =>
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .first();

    if (!participant) {
      return null;
    }

    const session = await ctx.db
      .query("activeSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", participant.sessionId))
      .first();

    return session;
  },
});

// ============================================================
// UNREAD COUNTS
// ============================================================

async function updateUnreadCounts(
  ctx: any,
  userId: string
): Promise<void> {
  const now = Date.now();

  const existing = await ctx.db
    .query("unreadCounts")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  // Count unread messages from conversations
  let unreadMessages = 0;
  try {
    const convos = await ctx.db
      .query("conversations")
      .filter((q: any) => q.eq(q.field("userId"), userId))
      .collect();
    unreadMessages = convos.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);
  } catch {
    // conversations table may not have the index yet
  }

  // Count unread notifications
  let unreadNotifications = 0;
  try {
    const notifs = await ctx.db
      .query("notifications")
      .filter((q: any) => q.eq(q.field("userId"), userId).eq(q.field("read"), false))
      .collect();
    unreadNotifications = notifs.length;
  } catch {
    // notifications table may not have expected fields
  }

  // Count pending booking requests
  let pendingBookings = 0;
  try {
    const bookings = await ctx.db
      .query("sbookings")
      .filter((q: any) => q.eq(q.field("status"), "Pending"))
      .collect();
    // Filter to bookings where user is the studio owner
    pendingBookings = bookings.length;
  } catch {
    // bookings table may not have expected fields
  }

  if (existing) {
    await ctx.db.patch(existing._id, {
      messages: unreadMessages,
      notifications: unreadNotifications,
      bookingRequests: pendingBookings,
      sessionInvites: 0,
      lastUpdated: now,
    });
  } else {
    await ctx.db.insert("unreadCounts", {
      userId,
      messages: unreadMessages,
      notifications: unreadNotifications,
      bookingRequests: pendingBookings,
      sessionInvites: 0,
      lastUpdated: now,
    });
  }
}

/**
 * Get unread counts for a user
 */
export const getUnreadCounts = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const counts = await ctx.db
      .query("unreadCounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return counts || {
      userId: args.userId,
      messages: 0,
      notifications: 0,
      bookingRequests: 0,
      sessionInvites: 0,
      lastUpdated: Date.now(),
    };
  },
});

/**
 * Force refresh unread counts
 */
export const refreshUnreadCounts = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await updateUnreadCounts(ctx, args.userId);
    return { success: true };
  },
});

// ============================================================
// DASHBOARD STATS
// ============================================================

/**
 * Update dashboard stats for a user
 */
export const updateDashboardStats = mutation({
  args: {
    userId: v.string(),
    todayBookingCount: v.optional(v.number()),
    todayRevenue: v.optional(v.number()),
    weekBookingCount: v.optional(v.number()),
    weekRevenue: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("dashboardStats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        todayBookingCount: args.todayBookingCount ?? existing.todayBookingCount,
        todayRevenue: args.todayRevenue ?? existing.todayRevenue,
        weekBookingCount: args.weekBookingCount ?? existing.weekBookingCount,
        weekRevenue: args.weekRevenue ?? existing.weekRevenue,
        lastUpdated: now,
      });
    } else {
      await ctx.db.insert("dashboardStats", {
        userId: args.userId,
        todayBookingCount: args.todayBookingCount ?? 0,
        todayRevenue: args.todayRevenue ?? 0,
        weekBookingCount: args.weekBookingCount ?? 0,
        weekRevenue: args.weekRevenue ?? 0,
        unreadMessages: 0,
        activeNotifications: 0,
        lastUpdated: now,
      });
    }

    return { success: true };
  },
});

/**
 * Get dashboard stats for a user
 */
export const getDashboardStats = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("dashboardStats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return stats || {
      userId: args.userId,
      todayBookingCount: 0,
      todayRevenue: 0,
      weekBookingCount: 0,
      weekRevenue: 0,
      unreadMessages: 0,
      activeNotifications: 0,
      lastUpdated: Date.now(),
    };
  },
});

// ============================================================
// ACTIVITY FEED
// ============================================================

/**
 * Add activity to feed
 */
export const addActivity = mutation({
  args: {
    userId: v.string(),
    actionType: v.union(
      v.literal("booking_created"),
      v.literal("booking_confirmed"),
      v.literal("booking_completed"),
      v.literal("booking_cancelled"),
      v.literal("profile_updated"),
      v.literal("session_started"),
      v.literal("message_sent"),
      v.literal("follow"),
      v.literal("like")
    ),
    targetUserId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const activityId = `${args.userId}-${args.actionType}-${now}`;
    await ctx.db.insert("activityFeed", {
      id: activityId,
      userId: args.userId,
      actionType: args.actionType,
      targetUserId: args.targetUserId,
      metadata: args.metadata,
      createdAt: now,
    });
    return { activityId };
  },
});

/**
 * Get activity feed for a user
 */
export const getActivityFeed = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let activities = await ctx.db
      .query("activityFeed")
      .withIndex("by_target", (q) => q.eq("targetUserId", args.userId))
      .collect();

    // Sort by createdAt descending
    activities.sort((a, b) => b.createdAt - a.createdAt);

    return args.limit ? activities.slice(0, args.limit) : activities;
  },
});

/**
 * Get recent activity across all users (admin)
 */
export const getRecentActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allActivities = await ctx.db
      .query("activityFeed")
      .order("desc")
      .collect();

    return args.limit ? allActivities.slice(0, args.limit) : allActivities;
  },
});
