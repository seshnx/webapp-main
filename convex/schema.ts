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
});

