import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get messages for a given chat
 */
export const getMessages = query({
  args: {
    chatId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .take(limit);

    return msgs;
  },
});

/**
 * Send a new chat message
 */
export const sendMessage = mutation({
  args: {
    chatId: v.string(),
    senderId: v.string(),
    senderName: v.string(),
    senderPhoto: v.optional(v.string()),
    content: v.optional(v.string()),
    media: v.optional(v.any()),
    replyTo: v.optional(
      v.object({
        messageId: v.string(),
        text: v.string(),
        sender: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      senderId: args.senderId,
      senderName: args.senderName,
      senderPhoto: args.senderPhoto,
      content: args.content,
      media: args.media,
      replyTo: args.replyTo,
      timestamp: now,
      edited: false,
      deleted: false,
      deletedForAll: false,
      reactions: {},
    });

    // Automatically sync conversations records and notifications for participants
    try {
      const previewText = args.content
        ? (args.content.length > 60 ? args.content.substring(0, 60) + '...' : args.content)
        : 'Sent an attachment';

      // 1. Resolve sender user
      const senderUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.senderId))
        .first();

      // 2. Find or determine participants
      const existingConvs = await ctx.db
        .query("conversations")
        .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
        .collect();

      const recipientUsers: any[] = [];

      for (const conv of existingConvs) {
        const convUser = await ctx.db.get(conv.userId);
        if (convUser && convUser.clerkId !== args.senderId) {
          if (!recipientUsers.some((u) => u._id === convUser._id)) {
            recipientUsers.push(convUser);
          }
        }
      }

      // If no existing conversation records found and chatId contains Clerk IDs (e.g. user_xxx_user_yyy)
      if (recipientUsers.length === 0 && args.chatId.includes('_')) {
        const parts = args.chatId.split('_');
        for (let i = 0; i < parts.length; i++) {
          if (parts[i] === 'user' && parts[i + 1]) {
            const candidateClerkId = `user_${parts[i + 1]}`;
            if (candidateClerkId !== args.senderId) {
              const user = await ctx.db
                .query("users")
                .withIndex("by_clerk_id", (q) => q.eq("clerkId", candidateClerkId))
                .first();
              if (user && !recipientUsers.some((u) => u._id === user._id)) {
                recipientUsers.push(user);
              }
            }
          }
        }
      }

      // 3. Update or Insert Sender's Conversation record
      if (senderUser) {
        const senderConv = existingConvs.find((c) => c.userId === senderUser._id);
        const recipientUser = recipientUsers[0];
        const chatName = recipientUser
          ? recipientUser.displayName || recipientUser.username || `${recipientUser.firstName || ''} ${recipientUser.lastName || ''}`.trim() || 'User'
          : args.chatId.startsWith('group_') ? 'Group Chat' : 'Chat';
        const chatPhoto = recipientUser?.avatarUrl;

        if (senderConv) {
          await ctx.db.patch(senderConv._id, {
            lastMessage: previewText,
            lastMessageTime: now,
            lastSenderId: senderUser._id,
            unreadCount: 0,
          });
        } else {
          await ctx.db.insert("conversations", {
            userId: senderUser._id,
            chatId: args.chatId,
            lastMessage: previewText,
            lastMessageTime: now,
            unreadCount: 0,
            lastSenderId: senderUser._id,
            chatName,
            chatPhoto,
            chatType: args.chatId.startsWith('group_') ? 'group' : 'direct',
            otherUserId: recipientUser ? recipientUser._id : undefined,
          });
        }
      }

      // 4. Update or Insert Recipient(s) Conversation records & Notifications
      for (const recUser of recipientUsers) {
        const recConv = existingConvs.find((c) => c.userId === recUser._id);
        const currentUnread = recConv ? recConv.unreadCount || 0 : 0;

        if (recConv) {
          await ctx.db.patch(recConv._id, {
            lastMessage: previewText,
            lastMessageTime: now,
            lastSenderId: senderUser ? senderUser._id : undefined,
            unreadCount: currentUnread + 1,
          });
        } else {
          await ctx.db.insert("conversations", {
            userId: recUser._id,
            chatId: args.chatId,
            lastMessage: previewText,
            lastMessageTime: now,
            unreadCount: 1,
            lastSenderId: senderUser ? senderUser._id : undefined,
            chatName: args.senderName,
            chatPhoto: args.senderPhoto,
            chatType: args.chatId.startsWith('group_') ? 'group' : 'direct',
            otherUserId: senderUser ? senderUser._id : undefined,
          });
        }

        // Send push/in-app notification to recipient
        await ctx.db.insert("notifications", {
          userId: recUser._id,
          type: "message",
          title: `Message from ${args.senderName}`,
          message: previewText,
          read: false,
          createdAt: now,
          metadata: {
            chatId: args.chatId,
            senderId: args.senderId,
            senderName: args.senderName,
            senderPhoto: args.senderPhoto,
            messageId: messageId,
          },
        });
      }
    } catch (err) {
      console.error("Error updating conversations/notifications on sendMessage:", err);
    }

    return messageId;
  },
});

/**
 * Edit an existing chat message
 */
export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    senderId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg) throw new Error("Message not found");
    if (msg.senderId !== args.senderId) throw new Error("Unauthorized to edit this message");

    await ctx.db.patch(args.messageId, {
      content: args.content,
      edited: true,
      editedAt: Date.now(),
    });
  },
});

/**
 * Delete a message (for self or everyone)
 */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    senderId: v.string(),
    forEveryone: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg) return;

    if (args.forEveryone) {
      if (msg.senderId !== args.senderId) throw new Error("Unauthorized to delete for everyone");
      await ctx.db.patch(args.messageId, {
        deletedForAll: true,
        content: "This message was deleted",
        media: undefined,
      });
    } else {
      const deletedFor = msg.deletedFor || {};
      deletedFor[args.senderId] = true;
      await ctx.db.patch(args.messageId, {
        deletedFor,
      });
    }
  },
});

/**
 * Add reaction to a message
 */
export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg) return;

    const reactions = msg.reactions || {};
    const existing = reactions[args.emoji] || [];
    const list = Array.isArray(existing) ? existing : Object.keys(existing);

    if (!list.includes(args.userId)) {
      list.push(args.userId);
      reactions[args.emoji] = list;
      await ctx.db.patch(args.messageId, { reactions });
    }
  },
});

/**
 * Remove reaction from a message
 */
export const removeReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg) return;

    const reactions = msg.reactions || {};
    const existing = reactions[args.emoji] || [];
    const list = Array.isArray(existing) ? existing : Object.keys(existing);

    const filtered = list.filter((id: string) => id !== args.userId);
    if (filtered.length === 0) {
      delete reactions[args.emoji];
    } else {
      reactions[args.emoji] = filtered;
    }

    await ctx.db.patch(args.messageId, { reactions });
  },
});
