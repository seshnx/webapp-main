import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Expanded Convex Schema for Real-time Features
 *
 * This schema extends Convex beyond just chat to handle real-time updates for:
 * - Social Feed (posts, comments, reactions)
 * - Notifications
 * - Presence
 * - Chat (existing)
 *
 * Data is still persisted in Neon PostgreSQL, but Convex provides:
 * - Real-time subscriptions via useQuery
 * - Automatic sync across clients
 * - Low-latency updates
 *
 * Architecture:
 * 1. Neon is source of truth (persistent storage)
 * 2. Convex syncs recent data for real-time features
 * 3. Webhooks/background jobs keep Convex in sync with Neon
 */

export default defineSchema({
  // =====================================================
  // SOCIAL FEED (Real-time mirror of Neon posts table)
  // =====================================================

  // Recent posts (kept in sync via webhooks)
  posts: defineTable({
    // Post ID from Neon (for reference)
    postId: v.string(),

    // Author info (denormalized for speed)
    authorId: v.string(),
    authorName: v.string(),
    authorPhoto: v.optional(v.string()),
    authorUsername: v.optional(v.string()),

    // Content
    content: v.optional(v.string()),
    media: v.optional(
      v.array(
        v.object({
          type: v.string(),
          url: v.string(),
          thumbnail: v.optional(v.string()),
          name: v.optional(v.string()),
          isGif: v.optional(v.boolean()),
        })
      )
    ),

    // Engagement counts (updated via webhooks)
    commentCount: v.number(),
    reactionCount: v.number(),
    saveCount: v.number(),

    // Timestamp (for sorting)
    timestamp: v.number(),

    // Optional fields
    hashtags: v.optional(v.array(v.string())),
    mentions: v.optional(v.array(v.string())),
    location: v.optional(
      v.object({
        name: v.optional(v.string()),
        lat: v.optional(v.number()),
        lng: v.optional(v.number()),
      })
    ),
    visibility: v.optional(v.string()), // 'public', 'followers', 'private'

    // Deleted flag (soft delete)
    deleted: v.optional(v.boolean()),
  })
    .index("by_postId", ["postId"])
    .index("by_author", ["authorId", "timestamp"])
    .index("by_timestamp", ["timestamp"]),

  // =====================================================
  // NOTIFICATIONS (Real-time delivery)
  // =====================================================

  // Active notifications (synced from Neon)
  notifications: defineTable({
    // Notification ID from Neon
    notificationId: v.string(),

    // Recipient
    userId: v.string(), // Clerk user ID

    // Notification details
    type: v.string(), // 'like', 'comment', 'follow', 'mention', 'booking', 'message', 'system'
    title: v.optional(v.string()),
    body: v.optional(v.string()),

    // Actor (who triggered it)
    actorId: v.optional(v.string()),
    actorName: v.optional(v.string()),
    actorPhoto: v.optional(v.string()),

    // Target (what it's about)
    targetType: v.optional(v.string()), // 'post', 'comment', 'booking', etc.
    targetId: v.optional(v.string()),

    // Action link
    actionUrl: v.optional(v.string()),

    // Status
    read: v.boolean(),

    // Timestamp
    timestamp: v.number(),

    // Deleted flag
    deleted: v.optional(v.boolean()),
  })
    .index("by_user", ["userId", "timestamp"])
    .index("by_notificationId", ["notificationId"])
    .index("by_unread", ["userId", "read", "timestamp"]),

  // =====================================================
  // CHAT (Existing - keep as is)
  // =====================================================

  messages: defineTable({
    chatId: v.string(),
    senderId: v.string(),
    senderName: v.string(),
    senderPhoto: v.optional(v.string()),
    content: v.optional(v.string()),
    media: v.optional(
      v.object({
        type: v.string(),
        url: v.string(),
        thumbnail: v.optional(v.string()),
        name: v.optional(v.string()),
        gif: v.optional(v.boolean()),
      })
    ),
    timestamp: v.number(),
    edited: v.optional(v.boolean()),
    editedAt: v.optional(v.number()),
    deleted: v.optional(v.boolean()),
    deletedForAll: v.optional(v.boolean()),
    replyTo: v.optional(
      v.object({
        messageId: v.string(),
        text: v.string(),
        sender: v.string(),
      })
    ),
    reactions: v.optional(v.any()), // emoji -> [userIds]
  })
    .index("by_chat", ["chatId", "timestamp"])
    .index("by_sender", ["senderId"]),

  conversations: defineTable({
    userId: v.string(),
    chatId: v.string(),
    lastMessage: v.optional(v.string()),
    lastMessageTime: v.optional(v.number()),
    unreadCount: v.number(),
    lastSenderId: v.optional(v.string()),
    chatName: v.optional(v.string()),
    chatPhoto: v.optional(v.string()),
    chatType: v.union(v.literal("direct"), v.literal("group")),
    otherUserId: v.optional(v.string()),
  })
    .index("by_user", ["userId", "lastMessageTime"])
    .index("by_chat", ["chatId"]),

  // =====================================================
  // PRESENCE (User online status)
  // =====================================================

  presence: defineTable({
    userId: v.string(),
    online: v.boolean(),
    lastSeen: v.number(),
    // Optional: Current page/feature
    currentFeature: v.optional(v.string()), // 'feed', 'chat', 'studio', 'marketplace'
  }).index("by_user", ["userId"]),

  // =====================================================
  // TYPING INDICATORS (Chat & Comments)
  // =====================================================

  // Chat typing indicators (existing)
  chatTypingIndicators: defineTable({
    chatId: v.string(),
    userId: v.string(),
    userName: v.string(),
    isTyping: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_chat", ["chatId"])
    .index("by_chat_user", ["chatId", "userId"]),

  // Comment typing indicators (new - for real-time comment drafts)
  commentTypingIndicators: defineTable({
    postId: v.string(),
    userId: v.string(),
    userName: v.string(),
    isTyping: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_post_user", ["postId", "userId"]),

  // =====================================================
  // READ RECEIPTS
  // =====================================================

  readReceipts: defineTable({
    chatId: v.string(),
    messageId: v.id("messages"),
    userId: v.string(),
    readAt: v.number(),
  })
    .index("by_chat_user", ["chatId", "userId"])
    .index("by_message", ["messageId"]),

  // Post view receipts (new - track who viewed posts)
  postViewReceipts: defineTable({
    postId: v.string(),
    userId: v.string(),
    viewedAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_post_user", ["postId", "userId"]),

  // =====================================================
  // CHAT MEMBERS
  // =====================================================

  chatMembers: defineTable({
    chatId: v.string(),
    userId: v.string(),
    role: v.union(v.literal("member"), v.literal("admin")),
    joinedAt: v.number(),
  })
    .index("by_chat", ["chatId"])
    .index("by_user", ["userId"]),
});

/**
 * Usage Notes:
 *
 * 1. Data Synchronization:
 *    - Neon is the source of truth (permanent storage)
 *    - Convex keeps recent data in memory for real-time features
 *    - Webhooks or background jobs sync Neon → Convex
 *
 * 2. Real-time Features:
 *    - Posts: Sync new/updated posts to Convex posts table
 *    - Notifications: Sync unread notifications for instant delivery
 *    - Presence: Track online status across the app
 *    - Typing: Show typing indicators in chat and comments
 *
 * 3. Data Retention:
 *    - Keep posts in Convex for 7-30 days (configurable)
 *    - Archive old posts to Neon-only storage
 *    - Keep notifications until read + 24 hours
 *    - Presence data is ephemeral (updates every 30s)
 *
 * 4. Example Sync Flow:
 *    a) User creates a post → Saved to Neon
 *    b) Webhook triggers → Insert post into Convex
 *    c) All subscribed clients see new post instantly via useQuery
 *    d) After 30 days, remove from Convex (still in Neon)
 *
 * 5. Frontend Usage:
 *    ```tsx
 *    import { useQuery } from 'convex/react';
 *
 *    // Get recent posts (real-time)
 *    const posts = useQuery(api.posts.listRecent);
 *
 *    // Get notifications (real-time)
 *    const notifications = useQuery(api.notifications.listUnread);
 *
 *    // Get presence (real-time)
 *    const presence = useQuery(api.presence.get);
 *    ```
 */
