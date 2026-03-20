import { query, mutation } from "./_generated/server";
import { v } from "convex-values";

// =============================================================================
// USER SETTINGS
// =============================================================================

export const getUserSettings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    return settings;
  },
});

export const updateUserSettings = mutation({
  args: {
    userId: v.id("users"),
    theme: v.optional(v.string()),
    language: v.optional(v.string()),
    timezone: v.optional(v.string()),
    dateFormat: v.optional(v.string()),
    timeFormat: v.optional(v.string()),
    currency: v.optional(v.string()),
    numberFormat: v.optional(v.string()),
    fontSize: v.optional(v.string()),
    reducedMotion: v.optional(v.boolean()),
    highContrast: v.optional(v.boolean()),
    screenReader: v.optional(v.boolean()),
    emailNotifications: v.optional(v.boolean()),
    pushNotifications: v.optional(v.boolean()),
    smsNotifications: v.optional(v.boolean()),
    marketingEmails: v.optional(v.boolean()),
    profileVisibility: v.optional(v.string()),
    showEmail: v.optional(v.boolean()),
    showLocation: v.optional(v.boolean()),
    showOnlineStatus: v.optional(v.boolean()),
    allowMessagesFrom: v.optional(v.string()),
    allowTagging: v.optional(v.boolean()),
    matureContentFilter: v.optional(v.boolean()),
    autoPlayVideos: v.optional(v.boolean()),
    showSensitiveContent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId: args.userId,
        ...args,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const updateDisplaySettings = mutation({
  args: {
    userId: v.id("users"),
    theme: v.optional(v.string()),
    language: v.optional(v.string()),
    timezone: v.optional(v.string()),
    dateFormat: v.optional(v.string()),
    timeFormat: v.optional(v.string()),
    currency: v.optional(v.string()),
    numberFormat: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    const updates = { ...args } as any;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...updates,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId: args.userId,
        ...updates,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const updateAccessibilitySettings = mutation({
  args: {
    userId: v.id("users"),
    fontSize: v.optional(v.string()),
    reducedMotion: v.optional(v.boolean()),
    highContrast: v.optional(v.boolean()),
    screenReader: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    const updates = { ...args } as any;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...updates,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId: args.userId,
        ...updates,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// =============================================================================
// NOTIFICATION SETTINGS
// =============================================================================

export const getNotificationSettings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    return settings;
  },
});

export const updateNotificationSettings = mutation({
  args: {
    userId: v.id("users"),
    newFollower: v.optional(v.boolean()),
    newComment: v.optional(v.boolean()),
    newLike: v.optional(v.boolean()),
    newMention: v.optional(v.boolean()),
    newShare: v.optional(v.boolean()),
    newPost: v.optional(v.boolean()),
    newMessage: v.optional(v.boolean()),
    messageRead: v.optional(v.boolean()),
    typingIndicator: v.optional(v.boolean()),
    bookingRequest: v.optional(v.boolean()),
    bookingConfirmed: v.optional(v.boolean()),
    bookingReminder: v.optional(v.boolean()),
    bookingCancelled: v.optional(v.boolean()),
    classAnnouncement: v.optional(v.boolean()),
    assignmentDue: v.optional(v.boolean()),
    gradePosted: v.optional(v.boolean()),
    schoolEvent: v.optional(v.boolean()),
    itemSold: v.optional(v.boolean()),
    bidReceived: v.optional(v.boolean()),
    priceDrop: v.optional(v.boolean()),
    securityAlert: v.optional(v.boolean()),
    productUpdate: v.optional(v.boolean()),
    featureAnnouncement: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("notificationSettings", {
        userId: args.userId,
        ...args,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const updateSocialNotificationSettings = mutation({
  args: {
    userId: v.id("users"),
    newFollower: v.optional(v.boolean()),
    newComment: v.optional(v.boolean()),
    newLike: v.optional(v.boolean()),
    newMention: v.optional(v.boolean()),
    newShare: v.optional(v.boolean()),
    newPost: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    const updates = { ...args } as any;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...updates,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("notificationSettings", {
        userId: args.userId,
        ...updates,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const updateMessengerNotificationSettings = mutation({
  args: {
    userId: v.id("users"),
    newMessage: v.optional(v.boolean()),
    messageRead: v.optional(v.boolean()),
    typingIndicator: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    const updates = { ...args } as any;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...updates,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("notificationSettings", {
        userId: args.userId,
        ...updates,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const updateBookingNotificationSettings = mutation({
  args: {
    userId: v.id("users"),
    bookingRequest: v.optional(v.boolean()),
    bookingConfirmed: v.optional(v.boolean()),
    bookingReminder: v.optional(v.boolean()),
    bookingCancelled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    const updates = { ...args } as any;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...updates,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("notificationSettings", {
        userId: args.userId,
        ...updates,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const updateEDUNotificationSettings = mutation({
  args: {
    userId: v.id("users"),
    classAnnouncement: v.optional(v.boolean()),
    assignmentDue: v.optional(v.boolean()),
    gradePosted: v.optional(v.boolean()),
    schoolEvent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    const updates = { ...args } as any;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...updates,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("notificationSettings", {
        userId: args.userId,
        ...updates,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const enableAllNotifications = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    const allEnabled = {
      newFollower: true,
      newComment: true,
      newLike: true,
      newMention: true,
      newShare: true,
      newPost: true,
      newMessage: true,
      messageRead: true,
      typingIndicator: true,
      bookingRequest: true,
      bookingConfirmed: true,
      bookingReminder: true,
      bookingCancelled: true,
      classAnnouncement: true,
      assignmentDue: true,
      gradePosted: true,
      schoolEvent: true,
      itemSold: true,
      bidReceived: true,
      priceDrop: true,
      securityAlert: true,
      productUpdate: true,
      featureAnnouncement: true,
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...allEnabled,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("notificationSettings", {
        userId: args.userId,
        ...allEnabled,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const disableAllNotifications = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    const allDisabled = {
      newFollower: false,
      newComment: false,
      newLike: false,
      newMention: false,
      newShare: false,
      newPost: false,
      newMessage: false,
      messageRead: false,
      typingIndicator: false,
      bookingRequest: false,
      bookingConfirmed: false,
      bookingReminder: false,
      bookingCancelled: false,
      classAnnouncement: false,
      assignmentDue: false,
      gradePosted: false,
      schoolEvent: false,
      itemSold: false,
      bidReceived: false,
      priceDrop: false,
      securityAlert: true, // Always keep security alerts
      productUpdate: false,
      featureAnnouncement: false,
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...allDisabled,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("notificationSettings", {
        userId: args.userId,
        ...allDisabled,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// =============================================================================
// PRIVACY SETTINGS
// =============================================================================

export const getPrivacySettings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("privacySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    return settings;
  },
});

export const updatePrivacySettings = mutation({
  args: {
    userId: v.id("users"),
    whoCanViewProfile: v.optional(v.string()),
    whoCanSendMessage: v.optional(v.string()),
    whoCanSeeActivity: v.optional(v.string()),
    whoCanSeeFollowers: v.optional(v.string()),
    whoCanSeeFollowing: v.optional(v.string()),
    defaultPostVisibility: v.optional(v.string()),
    showOnlineStatus: v.optional(v.boolean()),
    showLastSeen: v.optional(v.boolean()),
    showPresence: v.optional(v.boolean()),
    allowDataCollection: v.optional(v.boolean()),
    allowPersonalizedAds: v.optional(v.boolean()),
    allowSearchEngines: v.optional(v.boolean()),
    blockedUsers: v.optional(v.array(v.id("users"))),
    mutedUsers: v.optional(v.array(v.id("users"))),
    restrictedWords: v.optional(v.array(v.string())),
    twoFactorEnabled: v.optional(v.boolean()),
    twoFactorMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("privacySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("privacySettings", {
        userId: args.userId,
        ...args,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const updateVisibilitySettings = mutation({
  args: {
    userId: v.id("users"),
    whoCanViewProfile: v.optional(v.string()),
    whoCanSendMessage: v.optional(v.string()),
    whoCanSeeActivity: v.optional(v.string()),
    whoCanSeeFollowers: v.optional(v.string()),
    whoCanSeeFollowing: v.optional(v.string()),
    defaultPostVisibility: v.optional(v.string()),
    showOnlineStatus: v.optional(v.boolean()),
    showLastSeen: v.optional(v.boolean()),
    showPresence: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("privacySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    const updates = { ...args } as any;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...updates,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("privacySettings", {
        userId: args.userId,
        ...updates,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const blockUser = mutation({
  args: {
    userId: v.id("users"),
    blockedUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("privacySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    const currentBlocked = existing?.blockedUsers || [];

    if (currentBlocked.includes(args.blockedUserId)) {
      return { success: true, alreadyBlocked: true };
    }

    const updates = {
      blockedUsers: [...currentBlocked, args.blockedUserId],
    } as any;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...updates,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("privacySettings", {
        userId: args.userId,
        ...updates,
        updatedAt: Date.now(),
      });
    }

    // Also add to userBlocks table for social feed
    await ctx.db.insert("userBlocks", {
      blockerId: args.userId,
      blockedId: args.blockedUserId,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const unblockUser = mutation({
  args: {
    userId: v.id("users"),
    blockedUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("privacySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    if (!existing || !existing.blockedUsers) {
      return { success: true, notBlocked: true };
    }

    const updatedBlocked = existing.blockedUsers.filter(
      (id) => id !== args.blockedUserId
    );

    await ctx.db.patch(existing._id, {
      blockedUsers: updatedBlocked,
      updatedAt: Date.now(),
    });

    // Also remove from userBlocks table
    const blockRelation = await ctx.db
      .query("userBlocks")
      .withIndex("by_pair", ["blockerId", "blockedId"])
      .eq("blockerId", args.userId)
      .eq("blockedId", args.blockedUserId)
      .first();

    if (blockRelation) {
      await ctx.db.delete(blockRelation._id);
    }

    return { success: true };
  },
});

export const muteUser = mutation({
  args: {
    userId: v.id("users"),
    mutedUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("privacySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    const currentMuted = existing?.mutedUsers || [];

    if (currentMuted.includes(args.mutedUserId)) {
      return { success: true, alreadyMuted: true };
    }

    const updates = {
      mutedUsers: [...currentMuted, args.mutedUserId],
    } as any;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...updates,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("privacySettings", {
        userId: args.userId,
        ...updates,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const unmuteUser = mutation({
  args: {
    userId: v.id("users"),
    mutedUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("privacySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    if (!existing || !existing.mutedUsers) {
      return { success: true, notMuted: true };
    }

    const updatedMuted = existing.mutedUsers.filter(
      (id) => id !== args.mutedUserId
    );

    await ctx.db.patch(existing._id, {
      mutedUsers: updatedMuted,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const addRestrictedWord = mutation({
  args: {
    userId: v.id("users"),
    word: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("privacySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    const currentWords = existing?.restrictedWords || [];

    if (currentWords.includes(args.word.toLowerCase())) {
      return { success: true, alreadyExists: true };
    }

    const updates = {
      restrictedWords: [...currentWords, args.word.toLowerCase()],
    } as any;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...updates,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("privacySettings", {
        userId: args.userId,
        ...updates,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const removeRestrictedWord = mutation({
  args: {
    userId: v.id("users"),
    word: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("privacySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    if (!existing || !existing.restrictedWords) {
      return { success: true, notFound: true };
    }

    const updatedWords = existing.restrictedWords.filter(
      (w) => w !== args.word.toLowerCase()
    );

    await ctx.db.patch(existing._id, {
      restrictedWords: updatedWords,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// =============================================================================
// SECURITY SETTINGS
// =============================================================================

export const getSecuritySettings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("securitySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    return settings;
  },
});

export const updateSecuritySettings = mutation({
  args: {
    userId: v.id("users"),
    twoFactorEnabled: v.optional(v.boolean()),
    twoFactorSecret: v.optional(v.string()),
    backupCodes: v.optional(v.array(v.string())),
    loginNotifications: v.optional(v.boolean()),
    sessionTimeout: v.optional(v.number()),
    maxSessions: v.optional(v.number()),
    rememberDevice: v.optional(v.boolean()),
    lastPasswordChange: v.optional(v.number()),
    passwordExpiresIn: v.optional(v.number()),
    requirePasswordChange: v.optional(v.boolean()),
    logoutOnNewDevice: v.optional(v.boolean()),
    verifyNewDevice: v.optional(v.boolean()),
    recoveryEmail: v.optional(v.string()),
    recoveryPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("securitySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("securitySettings", {
        userId: args.userId,
        ...args,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const recordLoginAttempt = mutation({
  args: {
    userId: v.id("users"),
    success: v.boolean(),
    ipAddress: v.optional(v.string()),
    location: v.optional(v.string()),
    device: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("securitySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    if (args.success) {
      // Successful login - reset failed attempts, update last login info
      const updates: any = {
        lastLoginAt: Date.now(),
        lastLoginIp: args.ipAddress,
        lastLoginLocation: args.location,
        failedLoginAttempts: 0,
        accountLocked: false,
        accountLockedUntil: undefined,
      };

      if (existing) {
        await ctx.db.patch(existing._id, {
          ...updates,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("securitySettings", {
          userId: args.userId,
          ...updates,
          updatedAt: Date.now(),
        });
      }
    } else {
      // Failed login - increment failed attempts
      const currentAttempts = existing?.failedLoginAttempts || 0;
      const newAttempts = currentAttempts + 1;
      const maxAttempts = 5;

      const updates: any = {
        failedLoginAttempts: newAttempts,
      };

      // Lock account after max attempts
      if (newAttempts >= maxAttempts) {
        updates.accountLocked = true;
        updates.accountLockedUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
      }

      if (existing) {
        await ctx.db.patch(existing._id, {
          ...updates,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("securitySettings", {
          userId: args.userId,
          ...updates,
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true, attempts: existing?.failedLoginAttempts || 0 };
  },
});

export const lockAccount = mutation({
  args: {
    userId: v.id("users"),
    duration: v.optional(v.number()), // minutes, 0 = indefinite
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("securitySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    const updates: any = {
      accountLocked: true,
    };

    if (args.duration === 0) {
      // Indefinite lock
      updates.accountLockedUntil = undefined;
    } else if (args.duration) {
      updates.accountLockedUntil = Date.now() + args.duration * 60 * 1000;
    } else {
      // Default 30 minutes
      updates.accountLockedUntil = Date.now() + 30 * 60 * 1000;
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...updates,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("securitySettings", {
        userId: args.userId,
        ...updates,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const unlockAccount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("securitySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    if (!existing) {
      return { success: true, alreadyUnlocked: true };
    }

    await ctx.db.patch(existing._id, {
      accountLocked: false,
      accountLockedUntil: undefined,
      failedLoginAttempts: 0,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const isAccountLocked = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("securitySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    if (!settings?.accountLocked) {
      return { locked: false };
    }

    // Check if lock has expired
    if (settings.accountLockedUntil) {
      const now = Date.now();
      if (now > settings.accountLockedUntil) {
        // Auto-unlock
        await ctx.db.patch(settings._id, {
          accountLocked: false,
          accountLockedUntil: undefined,
          updatedAt: now,
        });
        return { locked: false };
      }
    }

    return {
      locked: true,
      lockedUntil: settings.accountLockedUntil,
    };
  },
});

export const setRecoveryEmail = mutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("securitySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    const updates = {
      recoveryEmail: args.email,
      recoveryEmailVerified: false,
    } as any;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...updates,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("securitySettings", {
        userId: args.userId,
        ...updates,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const verifyRecoveryEmail = mutation({
  args: {
    userId: v.id("users"),
    verificationCode: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("securitySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    if (!existing || !existing.recoveryEmail) {
      throw new Error("No recovery email set");
    }

    // In production, verify the code here
    // For now, just mark as verified
    await ctx.db.patch(existing._id, {
      recoveryEmailVerified: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const setRecoveryPhone = mutation({
  args: {
    userId: v.id("users"),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("securitySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    const updates = {
      recoveryPhone: args.phone,
      recoveryPhoneVerified: false,
    } as any;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...updates,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("securitySettings", {
        userId: args.userId,
        ...updates,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const verifyRecoveryPhone = mutation({
  args: {
    userId: v.id("users"),
    verificationCode: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("securitySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    if (!existing || !existing.recoveryPhone) {
      throw new Error("No recovery phone set");
    }

    // In production, verify the code here
    // For now, just mark as verified
    await ctx.db.patch(existing._id, {
      recoveryPhoneVerified: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    oldPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // In production, verify old password here
    // For now, just update the timestamp

    const existing = await ctx.db
      .query("securitySettings")
      .withIndex("by_user")
      .eq("userId", args.userId)
      .first();

    const updates = {
      lastPasswordChange: Date.now(),
    } as any;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...updates,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("securitySettings", {
        userId: args.userId,
        ...updates,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// =============================================================================
// APPLICATION SETTINGS (Platform-wide)
// =============================================================================

export const getAppSetting = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("appSettings")
      .withIndex("by_key")
      .eq("key", args.key)
      .first();

    return setting?.value;
  },
});

export const getAppSettingsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("appSettings")
      .withIndex("by_category")
      .eq("category", args.category)
      .collect();

    // Filter to only public settings if needed
    return settings.filter((s) => s.isPublic !== false);
  },
});

export const getAllAppSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("appSettings")
      .collect();

    // Filter to only public settings
    return settings.filter((s) => s.isPublic !== false);
  },
});

export const setAppSetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    updatedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("appSettings")
      .withIndex("by_key")
      .eq("key", args.key)
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        category: args.category ?? existing.category,
        description: args.description ?? existing.description,
        isPublic: args.isPublic ?? existing.isPublic,
        updatedBy: args.updatedBy ?? existing.updatedBy,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("appSettings", {
        key: args.key,
        value: args.value,
        category: args.category || "general",
        description: args.description,
        isPublic: args.isPublic ?? true,
        updatedBy: args.updatedBy,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const deleteAppSetting = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("appSettings")
      .withIndex("by_key")
      .eq("key", args.key)
      .first();

    if (!existing) {
      throw new Error("Setting not found");
    }

    await ctx.db.delete(existing._id);

    return { success: true };
  },
});

// =============================================================================
// BATCH OPERATIONS
// =============================================================================

export const getAllUserSettings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const [userSettings, notificationSettings, privacySettings, securitySettings] =
      await Promise.all([
        ctx.db.query("userSettings").withIndex("by_user").eq("userId", args.userId).first(),
        ctx.db.query("notificationSettings").withIndex("by_user").eq("userId", args.userId).first(),
        ctx.db.query("privacySettings").withIndex("by_user").eq("userId", args.userId).first(),
        ctx.db.query("securitySettings").withIndex("by_user").eq("userId", args.userId).first(),
      ]);

    return {
      user: userSettings || null,
      notifications: notificationSettings || null,
      privacy: privacySettings || null,
      security: securitySettings || null,
    };
  },
});

export const resetUserSettings = mutation({
  args: {
    userId: v.id("users"),
    resetType: v.string(), // 'all', 'display', 'notifications', 'privacy', 'security'
  },
  handler: async (ctx, args) => {
    const { userId, resetType } = args;

    if (resetType === "all" || resetType === "display") {
      const userSettings = await ctx.db
        .query("userSettings")
        .withIndex("by_user")
        .eq("userId", userId)
        .first();

      if (userSettings) {
        await ctx.db.delete(userSettings._id);
      }
    }

    if (resetType === "all" || resetType === "notifications") {
      const notificationSettings = await ctx.db
        .query("notificationSettings")
        .withIndex("by_user")
        .eq("userId", userId)
        .first();

      if (notificationSettings) {
        await ctx.db.delete(notificationSettings._id);
      }
    }

    if (resetType === "all" || resetType === "privacy") {
      const privacySettings = await ctx.db
        .query("privacySettings")
        .withIndex("by_user")
        .eq("userId", userId)
        .first();

      if (privacySettings) {
        await ctx.db.delete(privacySettings._id);
      }
    }

    if (resetType === "all" || resetType === "security") {
      const securitySettings = await ctx.db
        .query("securitySettings")
        .withIndex("by_user")
        .eq("userId", userId)
        .first();

      if (securitySettings) {
        await ctx.db.delete(securitySettings._id);
      }
    }

    return { success: true };
  },
});

export const exportUserSettings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const settings = await ctx.runQuery(api.settings.getAllUserSettings, {
      userId: args.userId,
    });

    return {
      userId: args.userId,
      exportedAt: Date.now(),
      ...settings,
    };
  },
});
