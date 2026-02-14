import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Messages table
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
        name: v.optional(v.string()), // Added to support file names
        gif: v.optional(v.boolean()),  // Added to support GIF flag
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
    reactions: v.optional(v.any()), // emoji -> [userIds] - using v.any() for flexibility
  })
    .index("by_chat", ["chatId", "timestamp"])
    .index("by_sender", ["senderId"]),

  // Conversations table
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
    otherUserId: v.optional(v.string()), // For direct chats
  })
    .index("by_user", ["userId", "lastMessageTime"])
    .index("by_chat", ["chatId"]),

  // Presence table
  presence: defineTable({
    userId: v.string(),
    online: v.boolean(),
    lastSeen: v.number(),
  }).index("by_user", ["userId"]),

  // Read receipts table
  readReceipts: defineTable({
    chatId: v.string(),
    messageId: v.id("messages"),
    userId: v.string(),
    readAt: v.number(),
  })
    .index("by_chat_user", ["chatId", "userId"])
    .index("by_message", ["messageId"]),

  // Chat members (for group chats)
  chatMembers: defineTable({
    chatId: v.string(),
    userId: v.string(),
    role: v.union(v.literal("member"), v.literal("admin")),
    joinedAt: v.number(),
  })
    .index("by_chat", ["chatId"])
    .index("by_user", ["userId"]),

  // Typing indicators table
  typingIndicators: defineTable({
    chatId: v.string(),
    userId: v.string(),
    userName: v.string(),
    isTyping: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_chat", ["chatId"])
    .index("by_chat_user", ["chatId", "userId"]),

  // Bookings table - for real-time booking updates
  bookings: defineTable({
    id: v.string(), // Booking ID from Neon
    senderId: v.string(),
    senderName: v.optional(v.string()),
    senderPhoto: v.optional(v.string()),
    targetId: v.string(), // Studio owner or service provider
    status: v.string(), // Pending, Confirmed, Completed, Cancelled
    serviceType: v.optional(v.string()),
    date: v.optional(v.string()), // ISO date string
    time: v.optional(v.string()),
    duration: v.optional(v.number()),
    offerAmount: v.optional(v.number()),
    message: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_target_status", ["targetId", "status"])
    .index("by_sender", ["senderId"])
    .index("by_booking_id", ["id"]),

  // Notifications table - for real-time notification updates
  notifications: defineTable({
    id: v.string(), // Notification ID from Neon
    userId: v.string(),
    type: v.string(), // booking, follow, like, comment, etc.
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
    metadata: v.optional(v.any()), // Flexible metadata for different notification types
  })
    .index("by_user_read", ["userId", "createdAt"])
    .index("by_notification_id", ["id"]),

  // User profile updates - for real-time profile changes
  profileUpdates: defineTable({
    userId: v.string(),
    updatedAt: v.number(),
    field: v.optional(v.string()), // Which field was updated
    metadata: v.optional(v.any()), // Additional update info
  })
    .index("by_user", ["userId", "updatedAt"]),

  // Comments table - for real-time comment updates
  comments: defineTable({
    postId: v.string(), // Post ID from Neon
    commentId: v.string(), // Comment ID from Neon (for sync purposes)
    userId: v.string(),
    content: v.string(),
    displayName: v.optional(v.string()),
    authorPhoto: v.optional(v.string()),
    parentId: v.optional(v.string()), // For nested replies
    reactionCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_post", ["postId", "createdAt"])
    .index("by_comment_id", ["commentId"]),

  // Reactions table - for real-time reaction updates
  reactions: defineTable({
    targetId: v.string(), // Post ID or Comment ID from Neon
    targetType: v.union(v.literal("post"), v.literal("comment")),
    userId: v.string(),
    emoji: v.string(),
    timestamp: v.number(),
  })
    .index("by_target", ["targetId", "targetType"])
    .index("by_user_target", ["userId", "targetId", "targetType"]),
});
