/**
 * Enhanced Convex Schema for Real-Time Features
 *
 * Add these tables to your existing convex/schema.ts file
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ============================================================
// ENHANCED PRESENCE TABLE
// ============================================================

export const enhancedPresence = defineTable({
  userId: v.string(),
  status: v.union(
    v.literal("online"),
    v.literal("offline"),
    v.literal("away"),
    v.literal("busy"),
    v.literal("in_session")
  ),
  lastSeen: v.number(),
  currentLocation: v.optional(v.object({
    type: v.union(v.literal("studio"), v.literal("room"), v.literal("session")),
    id: v.string(),
    name: v.string(),
  })),
  deviceInfo: v.optional(v.object({
    type: v.union(v.literal("desktop"), v.literal("mobile"), v.literal("tablet")),
    browser: v.optional(v.string()),
  })),
  activeProfile: v.optional(v.string()), // From MongoDB (active_profile)
})
  .index("by_user", ["userId"])
  .index("by_status", ["status", "lastSeen"])
  .index("by_location", ["currentLocation", "status"]);

// ============================================================
// PUSH NOTIFICATION TOKENS
// ============================================================

export const pushTokens = defineTable({
  userId: v.string(),
  token: v.string(),
  platform: v.union(v.literal("ios"), v.literal("android"), v.literal("web")),
  createdAt: v.number(),
  updatedAt: v.number(),
  isActive: v.boolean(),
})
  .index("by_user", ["userId", "isActive"])
  .index("by_token", ["token"]);

// ============================================================
// UNREAD COUNTS (DASHBOARD STATS)
// ============================================================

export const unreadCounts = defineTable({
  userId: v.string(),
  messages: v.number(),
  notifications: v.number(),
  bookingRequests: v.number(),
  sessionInvites: v.number(),
  lastUpdated: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_last_updated", ["lastUpdated"]);

// ============================================================
// ACTIVE SESSIONS (COLLABORATION)
// ============================================================

export const activeSessions = defineTable({
  sessionId: v.string(),
  bookingId: v.string(),
  status: v.union(v.literal("active"), v.literal("paused"), v.literal("ended")),
  startedAt: v.number(),
  endedAt: v.optional(v.number()),
  hostId: v.string(),
  hostName: v.string(),
  participantCount: v.number(),
})
  .index("by_session", ["sessionId"])
  .index("by_booking", ["bookingId"])
  .index("by_status", ["status", "startedAt"]);

// ============================================================
// SESSION PARTICIPANTS
// ============================================================

export const sessionParticipants = defineTable({
  sessionId: v.string(),
  userId: v.string(),
  displayName: v.string(), // From MongoDB (display_name)
  role: v.union(v.literal("host"), v.literal("guest"), v.literal("observer")),
  joinedAt: v.number(),
  leftAt: v.optional(v.number()),
  isActive: v.boolean(),
  canEdit: v.boolean(),
  canInvite: v.boolean(),
})
  .index("by_session", ["sessionId", "isActive"])
  .index("by_user", ["userId", "isActive"]);

// ============================================================
// NOTIFICATION DELIVERY STATUS
// ============================================================

export const notificationDelivery = defineTable({
  notificationId: v.string(),
  userId: v.string(),
  deliveryStatus: v.union(
    v.literal("pending"),
    v.literal("delivered"),
    v.literal("failed"),
    v.literal("read")
  ),
  pushSent: v.boolean(),
  pushDeliveredAt: v.optional(v.number()),
  readAt: v.optional(v.number()),
  failedReason: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_notification", ["notificationId"])
  .index("by_user_status", ["userId", "deliveryStatus"])
  .index("by_user_created", ["userId", "createdAt"]);

// ============================================================
// REAL-TIME DASHBOARD STATS
// ============================================================

export const dashboardStats = defineTable({
  userId: v.string(),
  todayBookingCount: v.number(),
  todayRevenue: v.number(),
  weekBookingCount: v.number(),
  weekRevenue: v.number(),
  unreadMessages: v.number(),
  activeNotifications: v.number(),
  lastUpdated: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_last_updated", ["lastUpdated"]);

// ============================================================
// TYPING INDICATORS (ENHANCED)
// ============================================================

export const typingIndicators = defineTable({
  conversationId: v.string(),
  userId: v.string(),
  displayName: v.string(), // From MongoDB (display_name)
  isTyping: v.boolean(),
  startedAt: v.number(),
  expiresAt: v.number(), // Auto-expire after 10 seconds
})
  .index("by_conversation", ["conversationId", "expiresAt"])
  .index("by_user", ["userId", "conversationId"]);

// ============================================================
// ACTIVITY FEED (REAL-TIME)
// ============================================================

export const activityFeed = defineTable({
  id: v.string(),
  userId: v.string(), // User who performed the action
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
  targetUserId: v.optional(v.string()), // User affected by action
  metadata: v.optional(v.any()), // Flexible metadata
  createdAt: v.number(),
})
  .index("by_user", ["userId", "createdAt"])
  .index("by_target", ["targetUserId", "createdAt"])
  .index("by_created", ["createdAt"]);

// ============================================================
// COLLABORATIVE EDIT LOCKS
// ============================================================

export const editLocks = defineTable({
  resourceType: v.union(
    v.literal("session"),
    v.literal("document"),
    v.literal("booking")
  ),
  resourceId: v.string(),
  userId: v.string(),
  displayName: v.string(),
  lockedAt: v.number(),
  expiresAt: v.number(),
})
  .index("by_resource", ["resourceType", "resourceId", "expiresAt"])
  .index("by_user", ["userId"]);
