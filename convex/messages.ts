import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get messages for a chat
export const getMessages = query({
  args: { chatId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    return await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .take(limit)
      .then((messages) => messages.reverse()); // Reverse to get chronological order
  },
});

// Send a message
export const sendMessage = mutation({
  args: {
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
        name: v.optional(v.string()), // Added
        gif: v.optional(v.boolean()),  // Added
      })
    ),
    replyTo: v.optional(
      v.object({
        messageId: v.string(),
        text: v.string(),
        sender: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      senderId: args.senderId,
      senderName: args.senderName,
      senderPhoto: args.senderPhoto,
      content: args.content,
      media: args.media,
      timestamp: Date.now(),
      replyTo: args.replyTo,
      reactions: {},
    });

    // Update conversation for all participants
    // This will be handled by a separate mutation
    return messageId;
  },
});

// Edit a message
export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    senderId: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message || message.senderId !== args.senderId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
      edited: true,
      editedAt: Date.now(),
    });
  },
});

// Delete a message
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    senderId: v.string(),
    forEveryone: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message || message.senderId !== args.senderId) {
      throw new Error("Unauthorized");
    }

    if (args.forEveryone) {
      await ctx.db.patch(args.messageId, {
        deleted: true,
        deletedForAll: true,
      });
    } else {
      // For "delete for me" - we'd need a separate field or table
      await ctx.db.patch(args.messageId, {
        deleted: true,
      });
    }
  },
});

// Add reaction
export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) return;

    const reactions = message.reactions || {};
    if (!reactions[args.emoji]) {
      reactions[args.emoji] = [];
    }
    if (!reactions[args.emoji].includes(args.userId)) {
      reactions[args.emoji].push(args.userId);
    }

    await ctx.db.patch(args.messageId, {
      reactions,
    });
  },
});

// Remove reaction
export const removeReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) return;

    const reactions = message.reactions || {};
    if (reactions[args.emoji]) {
      reactions[args.emoji] = reactions[args.emoji].filter(
        (id) => id !== args.userId
      );
      if (reactions[args.emoji].length === 0) {
        delete reactions[args.emoji];
      }
    }

    await ctx.db.patch(args.messageId, {
      reactions,
    });
  },
});
