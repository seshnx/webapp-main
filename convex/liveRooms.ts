import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const INACTIVITY_TIMEOUT_MS = 120_000; // 2 minutes inactivity timeout

/**
 * Get active live audio/video spaces
 * Automatically filters out and expires rooms that have been inactive for > 2 minutes
 */
export const getLiveRooms = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const rooms = await ctx.db
      .query("liveRooms")
      .withIndex("by_live", (q) => q.eq("isLive", true))
      .order("desc")
      .take(50);

    // Filter to only active rooms within the 2-minute inactivity window
    return rooms.filter((r) => {
      const lastActive = r.lastActivityAt || r.createdAt;
      return now - lastActive <= INACTIVITY_TIMEOUT_MS;
    });
  },
});

/**
 * Get room by ID
 */
export const getRoomById = query({
  args: {
    roomId: v.id("liveRooms"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return null;

    // Check if room expired due to 2 minutes of inactivity
    const now = Date.now();
    const lastActive = room.lastActivityAt || room.createdAt;
    if (room.isLive && now - lastActive > INACTIVITY_TIMEOUT_MS) {
      return {
        ...room,
        isLive: false,
      };
    }

    return room;
  },
});

/**
 * Create/start a live audio space
 */
export const createLiveRoom = mutation({
  args: {
    clerkId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    allowHandRaising: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    const now = Date.now();
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const hostName = user.displayName || user.profileName || user.username || user.firstName || "Host";

    const roomId = await ctx.db.insert("liveRooms", {
      hostId: user._id,
      hostName,
      hostPhoto: user.avatarUrl,
      title: args.title.trim(),
      description: args.description?.trim(),
      category: args.category,
      isLive: true,
      roomCode,
      allowHandRaising: args.allowHandRaising ?? true,
      lastActivityAt: now,
      activeSpeakersCount: 1,
      listenersCount: 1,
      createdAt: now,
    });

    // Add host as the initial speaker/host participant
    await ctx.db.insert("liveRoomParticipants", {
      roomId,
      userId: user._id,
      clerkId: args.clerkId,
      name: hostName,
      avatarUrl: user.avatarUrl,
      role: "host",
      isMuted: false,
      handRaised: false,
      joinedAt: now,
      lastHeartbeat: now,
    });

    return { roomId, roomCode };
  },
});

/**
 * Join an active live room
 */
export const joinRoom = mutation({
  args: {
    roomId: v.id("liveRooms"),
    clerkId: v.string(),
    autoMute: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || !room.isLive) {
      throw new Error("Live space is no longer active");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    const now = Date.now();
    const isHost = room.hostId === user._id || room.hostName === (user.displayName || user.firstName);
    const participantName = user.displayName || user.profileName || user.username || user.firstName || "Listener";

    // Check if participant already exists in room
    const existing = await ctx.db
      .query("liveRoomParticipants")
      .withIndex("by_room_and_user", (q) => q.eq("roomId", args.roomId).eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastHeartbeat: now,
      });
    } else {
      const role = isHost ? "host" : "listener";
      await ctx.db.insert("liveRoomParticipants", {
        roomId: args.roomId,
        userId: user._id,
        clerkId: args.clerkId,
        name: participantName,
        avatarUrl: user.avatarUrl,
        role,
        isMuted: isHost ? (args.autoMute ?? false) : true,
        handRaised: false,
        joinedAt: now,
        lastHeartbeat: now,
      });
    }

    // Refresh room lastActivityAt and listener count
    const allParticipants = await ctx.db
      .query("liveRoomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const speakers = allParticipants.filter((p) => p.role === "host" || p.role === "speaker");
    const listeners = allParticipants.length;

    await ctx.db.patch(args.roomId, {
      activeSpeakersCount: speakers.length,
      listenersCount: listeners,
      lastActivityAt: now,
    });

    return { success: true };
  },
});

/**
 * Leave a live room
 */
export const leaveRoom = mutation({
  args: {
    roomId: v.id("liveRooms"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("liveRoomParticipants")
      .withIndex("by_room_and_user", (q) => q.eq("roomId", args.roomId).eq("clerkId", args.clerkId))
      .first();

    if (participant) {
      await ctx.db.delete(participant._id);
    }

    const room = await ctx.db.get(args.roomId);
    if (!room) return;

    const remainingParticipants = await ctx.db
      .query("liveRoomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    if (remainingParticipants.length === 0) {
      // If room is empty, end the space
      await ctx.db.patch(args.roomId, {
        isLive: false,
        listenersCount: 0,
        activeSpeakersCount: 0,
        endedAt: Date.now(),
      });
    } else {
      const speakers = remainingParticipants.filter((p) => p.role === "host" || p.role === "speaker");
      await ctx.db.patch(args.roomId, {
        activeSpeakersCount: speakers.length,
        listenersCount: remainingParticipants.length,
        lastActivityAt: Date.now(),
      });
    }
  },
});

/**
 * Heartbeat ping from clients (called every 30s)
 * Keeps participant active and updates room activity timestamp
 */
export const heartbeat = mutation({
  args: {
    roomId: v.id("liveRooms"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const participant = await ctx.db
      .query("liveRoomParticipants")
      .withIndex("by_room_and_user", (q) => q.eq("roomId", args.roomId).eq("clerkId", args.clerkId))
      .first();

    if (participant) {
      await ctx.db.patch(participant._id, {
        lastHeartbeat: now,
      });
    }

    const room = await ctx.db.get(args.roomId);
    if (room && room.isLive) {
      // Clean up stale participants (no heartbeat for > 60s)
      const allParticipants = await ctx.db
        .query("liveRoomParticipants")
        .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
        .collect();

      const stale = allParticipants.filter((p) => now - p.lastHeartbeat > 60_000);
      for (const s of stale) {
        await ctx.db.delete(s._id);
      }

      const active = allParticipants.filter((p) => now - p.lastHeartbeat <= 60_000);
      if (active.length === 0) {
        await ctx.db.patch(args.roomId, {
          isLive: false,
          listenersCount: 0,
          activeSpeakersCount: 0,
          endedAt: now,
        });
      } else {
        const speakers = active.filter((p) => p.role === "host" || p.role === "speaker");
        await ctx.db.patch(args.roomId, {
          activeSpeakersCount: speakers.length,
          listenersCount: active.length,
          lastActivityAt: now,
        });
      }
    }
  },
});

/**
 * End a live space (Host only)
 */
export const endLiveRoom = mutation({
  args: {
    roomId: v.id("liveRooms"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.roomId, {
      isLive: false,
      endedAt: now,
    });

    // Clear all participants from room
    const participants = await ctx.db
      .query("liveRoomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const p of participants) {
      await ctx.db.delete(p._id);
    }
  },
});

/**
 * Get all participants in a live room (Real-time query)
 */
export const getParticipants = query({
  args: {
    roomId: v.id("liveRooms"),
  },
  handler: async (ctx, args) => {
    const participants = await ctx.db
      .query("liveRoomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    return participants;
  },
});

/**
 * Toggle or set microphone mute state
 */
export const toggleMute = mutation({
  args: {
    roomId: v.id("liveRooms"),
    clerkId: v.string(),
    isMuted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("liveRoomParticipants")
      .withIndex("by_room_and_user", (q) => q.eq("roomId", args.roomId).eq("clerkId", args.clerkId))
      .first();

    if (participant) {
      await ctx.db.patch(participant._id, {
        isMuted: args.isMuted,
        lastHeartbeat: Date.now(),
      });
    }

    await ctx.db.patch(args.roomId, {
      lastActivityAt: Date.now(),
    });
  },
});

/**
 * Raise hand to speak
 */
export const raiseHand = mutation({
  args: {
    roomId: v.id("liveRooms"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("liveRoomParticipants")
      .withIndex("by_room_and_user", (q) => q.eq("roomId", args.roomId).eq("clerkId", args.clerkId))
      .first();

    if (participant) {
      await ctx.db.patch(participant._id, {
        handRaised: true,
        handRaisedAt: Date.now(),
        lastHeartbeat: Date.now(),
      });
    }

    await ctx.db.patch(args.roomId, {
      lastActivityAt: Date.now(),
    });
  },
});

/**
 * Lower hand
 */
export const lowerHand = mutation({
  args: {
    roomId: v.id("liveRooms"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("liveRoomParticipants")
      .withIndex("by_room_and_user", (q) => q.eq("roomId", args.roomId).eq("clerkId", args.clerkId))
      .first();

    if (participant) {
      await ctx.db.patch(participant._id, {
        handRaised: false,
        handRaisedAt: undefined,
        lastHeartbeat: Date.now(),
      });
    }

    await ctx.db.patch(args.roomId, {
      lastActivityAt: Date.now(),
    });
  },
});

/**
 * Approve listener to become speaker (Host action)
 */
export const approveSpeaker = mutation({
  args: {
    roomId: v.id("liveRooms"),
    targetClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const target = await ctx.db
      .query("liveRoomParticipants")
      .withIndex("by_room_and_user", (q) => q.eq("roomId", args.roomId).eq("clerkId", args.targetClerkId))
      .first();

    if (target) {
      await ctx.db.patch(target._id, {
        role: "speaker",
        handRaised: false,
        isMuted: false,
        lastHeartbeat: Date.now(),
      });
    }

    const participants = await ctx.db
      .query("liveRoomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const speakers = participants.filter((p) => p.role === "host" || p.role === "speaker");

    await ctx.db.patch(args.roomId, {
      activeSpeakersCount: speakers.length,
      lastActivityAt: Date.now(),
    });
  },
});

/**
 * Demote speaker to listener (Host action)
 */
export const demoteSpeaker = mutation({
  args: {
    roomId: v.id("liveRooms"),
    targetClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const target = await ctx.db
      .query("liveRoomParticipants")
      .withIndex("by_room_and_user", (q) => q.eq("roomId", args.roomId).eq("clerkId", args.targetClerkId))
      .first();

    if (target && target.role !== "host") {
      await ctx.db.patch(target._id, {
        role: "listener",
        isMuted: true,
        handRaised: false,
        lastHeartbeat: Date.now(),
      });
    }

    const participants = await ctx.db
      .query("liveRoomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const speakers = participants.filter((p) => p.role === "host" || p.role === "speaker");

    await ctx.db.patch(args.roomId, {
      activeSpeakersCount: speakers.length,
      lastActivityAt: Date.now(),
    });
  },
});

/**
 * Kick participant from room (Host action)
 */
export const kickParticipant = mutation({
  args: {
    roomId: v.id("liveRooms"),
    targetClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const target = await ctx.db
      .query("liveRoomParticipants")
      .withIndex("by_room_and_user", (q) => q.eq("roomId", args.roomId).eq("clerkId", args.targetClerkId))
      .first();

    if (target && target.role !== "host") {
      await ctx.db.delete(target._id);
    }

    const participants = await ctx.db
      .query("liveRoomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const speakers = participants.filter((p) => p.role === "host" || p.role === "speaker");

    await ctx.db.patch(args.roomId, {
      activeSpeakersCount: speakers.length,
      listenersCount: participants.length,
      lastActivityAt: Date.now(),
    });
  },
});

/**
 * Get real-time audience chat messages for room
 */
export const getMessages = query({
  args: {
    roomId: v.id("liveRooms"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query("liveRoomMessages")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("asc")
      .take(limit);
  },
});

/**
 * Send real-time audience chat message
 */
export const sendMessage = mutation({
  args: {
    roomId: v.id("liveRooms"),
    clerkId: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    const senderName = user.displayName || user.profileName || user.username || user.firstName || "Member";
    const now = Date.now();

    await ctx.db.insert("liveRoomMessages", {
      roomId: args.roomId,
      senderId: user._id,
      senderClerkId: args.clerkId,
      senderName,
      senderAvatar: user.avatarUrl,
      text: args.text.trim(),
      createdAt: now,
    });

    await ctx.db.patch(args.roomId, {
      lastActivityAt: now,
    });
  },
});

/**
 * Send WebRTC signaling message (Offer, Answer, ICE candidate)
 */
export const sendSignal = mutation({
  args: {
    roomId: v.id("liveRooms"),
    senderClerkId: v.string(),
    targetClerkId: v.string(),
    type: v.string(),
    payload: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("liveRoomSignals", {
      roomId: args.roomId,
      senderClerkId: args.senderClerkId,
      targetClerkId: args.targetClerkId,
      type: args.type,
      payload: args.payload,
      createdAt: now,
    });

    await ctx.db.patch(args.roomId, {
      lastActivityAt: now,
    });
  },
});

/**
 * Get WebRTC signals for current user (poll/subscribe)
 */
export const getSignals = query({
  args: {
    roomId: v.id("liveRooms"),
    targetClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Return latest signals directed to this user or "all" from the last 30 seconds
    const cutoff = Date.now() - 30_000;
    const directSignals = await ctx.db
      .query("liveRoomSignals")
      .withIndex("by_room_and_target", (q) =>
        q.eq("roomId", args.roomId).eq("targetClerkId", args.targetClerkId)
      )
      .filter((q) => q.gte(q.field("createdAt"), cutoff))
      .collect();

    const broadcastSignals = await ctx.db
      .query("liveRoomSignals")
      .withIndex("by_room_and_target", (q) =>
        q.eq("roomId", args.roomId).eq("targetClerkId", "all")
      )
      .filter((q) => q.gte(q.field("createdAt"), cutoff))
      .collect();

    return [...directSignals, ...broadcastSignals]
      .filter((s) => s.senderClerkId !== args.targetClerkId)
      .sort((a, b) => a.createdAt - b.createdAt);
  },
});
