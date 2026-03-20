import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// =====================================================
// CONVEX SCHEMA - UNIFIED DATABASE FOR ALL DATA
// =====================================================
// This schema replaces both Neon PostgreSQL and MongoDB
// All data now lives in Convex for real-time + persistence
// =====================================================

export default defineSchema({
  // =====================================================
  // USERS & AUTHENTICATION
  // =====================================================

  // Users table - merges clerk_users + profiles from Neon
  users: defineTable({
    // Clerk integration
    clerkId: v.string(),
    email: v.string(),
    username: v.optional(v.string()),
    emailVerified: v.boolean(),

    // Name fields
    useRealName: v.optional(v.boolean()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profileName: v.optional(v.string()), // Stage/artist name

    // Profile display
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    headline: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    location: v.optional(v.string()),
    address: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    website: v.optional(v.string()),

    // Portfolio links
    portfolioUrls: v.optional(v.array(v.object({
      title: v.string(),
      url: v.string(),
      type: v.string(), // soundcloud, spotify, youtube, website, other
    }))),

    // Professional info
    skills: v.optional(v.array(v.string())),
    genres: v.optional(v.array(v.string())),
    instruments: v.optional(v.array(v.string())),
    software: v.optional(v.array(v.string())),

    // Role & account type
    accountTypes: v.array(v.string()), // [Talent, Engineer, Producer, etc.]
    activeRole: v.optional(v.string()),
    subRoles: v.optional(v.array(v.string())), // [Singer, Rapper, DJ, etc.]

    // Professional rates
    rates: v.optional(v.number()), // Base booking rate
    sessionRate: v.optional(v.number()), // Per-hour session rate
    dayRate: v.optional(v.number()), // Full day rate
    hourlyRate: v.optional(v.number()), // General hourly rate
    projectRate: v.optional(v.number()), // Per-project rate

    // Availability
    availabilityStatus: v.optional(v.string()), // available, busy, unavailable, touring

    // Talent-specific fields
    talentSubRole: v.optional(v.string()), // Singer, Rapper, DJ, etc.
    vocalRange: v.optional(v.string()), // Soprano, Tenor, etc.
    vocalStyles: v.optional(v.array(v.string())), // Pop, R&B, Rock, etc.
    primaryInstrument: v.optional(v.string()),
    playingExperience: v.optional(v.string()), // Beginner, Intermediate, etc.
    canReadMusic: v.optional(v.string()), // None, Lead Sheets, etc.
    ownGear: v.optional(v.string()), // Yes - Full Rig, etc.
    gearHighlights: v.optional(v.string()), // Key equipment description
    readingSkill: v.optional(v.string()), // Sight reading level
    remoteWork: v.optional(v.string()), // Yes, No
    label: v.optional(v.string()), // Record label
    touring: v.optional(v.string()), // Yes, No
    travelDist: v.optional(v.number()), // Max travel miles

    // DJ-specific
    djStyles: v.optional(v.array(v.string())), // Club, Hip Hop, etc.
    djSetup: v.optional(v.string()), // CDJs, Turntables, etc.
    canProvidePa: v.optional(v.string()), // PA system availability

    // Demo/media links
    demoReelUrl: v.optional(v.string()),
    sampleWorkUrl: v.optional(v.string()),
    reelUrl: v.optional(v.string()), // Composer reel

    // Studio-specific fields
    studioHours: v.optional(v.string()),
    liveRoomDimensions: v.optional(v.string()),
    parking: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())), // Wi-Fi, Kitchen, etc.
    virtualTourUrl: v.optional(v.string()),
    gearList: v.optional(v.string()),

    // Engineer-specific fields
    daw: v.optional(v.array(v.string())), // DAWs
    outboard: v.optional(v.string()), // Favorite outboard gear
    credits: v.optional(v.string()), // Selected credits
    hasStudio: v.optional(v.string()), // Studio ownership status

    // Producer-specific fields
    productionStyles: v.optional(v.array(v.string())), // Hip Hop, Pop, etc.
    beatLeasePrice: v.optional(v.number()),
    exclusivePrice: v.optional(v.number()),
    customBeatPrice: v.optional(v.number()),
    acceptsCollabs: v.optional(v.string()), // Yes, Paid Only, No

    // Composer-specific fields
    compType: v.optional(v.array(v.string())), // Film/TV, Game Audio, etc.
    libraries: v.optional(v.string()), // Key sample libraries
    canOrchestrate: v.optional(v.string()),
    turnaroundTime: v.optional(v.string()), // 24-48 hours, etc.

    // Agent-specific fields
    agencyName: v.optional(v.string()),
    rosterSize: v.optional(v.number()),
    territory: v.optional(v.string()),

    // Label-specific fields
    acceptingDemos: v.optional(v.string()), // Yes, No

    // Fan-specific fields
    lookingFor: v.optional(v.array(v.string())), // Discovering Music, etc.

    // Technician-specific fields
    technicianSkills: v.optional(v.string()), // Skills description (textarea)

    // Stats
    stats: v.optional(v.object({
      followersCount: v.number(),
      followingCount: v.number(),
      postsCount: v.number(),
      bookingsCount: v.number(),
    })),

    // Settings
    settings: v.optional(v.object({
      privacy: v.string(), // public, followers, private
      notificationsEnabled: v.boolean(),
      showEmail: v.boolean(),
      showLocation: v.boolean(),
    })),

    // EDU-specific fields
    schoolId: v.optional(v.id("schools")),
    studentId: v.optional(v.string()),
    staffId: v.optional(v.string()),
    internId: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_username", ["username"])
    .index("by_email", ["email"])
    .index("by_school", ["schoolId"])
    .index("by_last_active", ["lastActiveAt"])
    .index("by_availability", ["availabilityStatus", "lastActiveAt"])
    .index("by_talent_subrole", ["talentSubRole"])
    .index("by_location", ["location", "availabilityStatus"]),

  // Sub-profiles (for users with multiple roles)
  subProfiles: defineTable({
    userId: v.id("users"),
    role: v.string(), // Talent, Studio, Label, etc.
    displayName: v.string(),
    photoUrl: v.optional(v.string()),
    bio: v.optional(v.string()),

    // Location
    location: v.optional(v.string()),
    address: v.optional(v.string()),
    zipCode: v.optional(v.string()),

    // Professional arrays
    skills: v.optional(v.array(v.string())),
    genres: v.optional(v.array(v.string())),
    instruments: v.optional(v.array(v.string())),
    software: v.optional(v.array(v.string())),

    // Portfolio & media
    portfolioUrls: v.optional(v.array(v.object({
      title: v.string(),
      url: v.string(),
      type: v.string(),
    }))),
    demoReelUrl: v.optional(v.string()),
    sampleWorkUrl: v.optional(v.string()),

    // Pricing
    rates: v.optional(v.number()),
    sessionRate: v.optional(v.number()),
    dayRate: v.optional(v.number()),
    hourlyRate: v.optional(v.number()),
    projectRate: v.optional(v.number()),
    availabilityStatus: v.optional(v.string()),

    // Talent-specific (only used when role === "Talent")
    talentSubRole: v.optional(v.string()),
    vocalRange: v.optional(v.string()),
    vocalStyles: v.optional(v.array(v.string())),
    primaryInstrument: v.optional(v.string()),
    playingExperience: v.optional(v.string()),
    gearHighlights: v.optional(v.string()),
    djStyles: v.optional(v.array(v.string())),
    label: v.optional(v.string()),
    touring: v.optional(v.string()),

    // Studio-specific (only used when role === "Studio")
    liveRoomDimensions: v.optional(v.string()),
    parking: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
    virtualTourUrl: v.optional(v.string()),
    gearList: v.optional(v.string()),

    // Engineer-specific (only used when role === "Engineer")
    daw: v.optional(v.array(v.string())),
    outboard: v.optional(v.string()),
    credits: v.optional(v.string()),
    hasStudio: v.optional(v.string()),

    // Producer-specific (only used when role === "Producer")
    productionStyles: v.optional(v.array(v.string())),
    beatLeasePrice: v.optional(v.number()),
    exclusivePrice: v.optional(v.number()),
    customBeatPrice: v.optional(v.number()),
    acceptsCollabs: v.optional(v.string()),

    // Composer-specific (only used when role === "Composer")
    compType: v.optional(v.array(v.string())),
    libraries: v.optional(v.string()),
    canOrchestrate: v.optional(v.string()),
    turnaroundTime: v.optional(v.string()),
    reelUrl: v.optional(v.string()),

    // Agent-specific (only used when role === "Agent")
    agencyName: v.optional(v.string()),
    rosterSize: v.optional(v.number()),
    territory: v.optional(v.string()),

    // Label-specific (only used when role === "Label")
    acceptingDemos: v.optional(v.string()),

    // Stats for this sub-profile
    stats: v.optional(v.object({
      followersCount: v.number(),
      postsCount: v.number(),
    })),

    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_role", ["role"])
    .index("by_user_role", ["userId", "role"]),

  // =====================================================
  // SOCIAL FEED
  // =====================================================

  // Posts table - migrated from MongoDB
  posts: defineTable({
    // Author info (denormalized for performance)
    authorId: v.id("users"),
    authorName: v.optional(v.string()),
    authorPhoto: v.optional(v.string()),
    authorUsername: v.optional(v.string()),
    role: v.optional(v.string()), // Posted as which role

    // Content
    content: v.optional(v.string()),
    mediaUrls: v.optional(v.array(v.string())),
    mediaType: v.optional(v.string()), // image, video, audio, gif

    // Social metadata
    hashtags: v.optional(v.array(v.string())),
    mentions: v.optional(v.array(v.string())),
    category: v.optional(v.string()), // Music, Studio, Gear, etc.
    visibility: v.string(), // public, followers, private

    // Engagement counters
    engagement: v.object({
      likesCount: v.number(),
      commentsCount: v.number(),
      repostsCount: v.number(),
      savesCount: v.number(),
    }),

    // Repost support
    repostOf: v.optional(v.id("posts")),
    parentId: v.optional(v.id("posts")), // For threaded posts

    // Equipment/metadata (for tech posts)
    equipment: v.optional(v.array(v.string())),
    software: v.optional(v.array(v.string())),
    customFields: v.optional(v.any()),

    // Soft delete
    deletedAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_author", ["authorId", "createdAt"])
    .index("by_created", ["createdAt"])
    .index("by_repost_of", ["repostOf"])
    .index("by_parent", ["parentId"])
    .index("by_category", ["category", "createdAt"])
    .index("by_visibility", ["visibility", "createdAt"]),

  // Comments table
  comments: defineTable({
    // Post reference
    postId: v.id("posts"),

    // Author
    authorId: v.id("users"),
    authorName: v.optional(v.string()),
    authorPhoto: v.optional(v.string()),

    // Content
    content: v.string(),

    // Nested replies
    parentId: v.optional(v.id("comments")),

    // Engagement
    reactionCount: v.number(),

    // Soft delete
    deletedAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_post", ["postId", "createdAt"])
    .index("by_parent", ["parentId", "createdAt"])
    .index("by_author", ["authorId", "createdAt"]),
    
  // Reactions table (likes, emojis)
  reactions: defineTable({
    // Target
    targetId: v.string(), // Post ID or Comment ID (string for compatibility)
    targetType: v.union(v.literal("post"), v.literal("comment")),

    // Reaction
    emoji: v.string(), // ❤️, 👍, etc.
    userId: v.id("users"),

    // Timestamp
    timestamp: v.number(),
  })
    .index("by_target", ["targetId", "targetType"])
    .index("by_user_target", ["userId", "targetId", "targetType"])
    .index("by_emoji", ["emoji", "targetId"]),

  // Follows table
  follows: defineTable({
    followerId: v.id("users"), // User who is following
    followingId: v.id("users"), // User being followed
    createdAt: v.number(),
  })
    .index("by_follower", ["followerId", "createdAt"])
    .index("by_following", ["followingId", "createdAt"])
    .index("by_pair", ["followerId", "followingId"]),

  // Saved posts (bookmarks)
  savedPosts: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId", "createdAt"])
    .index("by_post", ["postId"])
    .index("by_user_post", ["userId", "postId"]),

  // User blocks
  userBlocks: defineTable({
    blockerId: v.id("users"),
    blockedId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_blocker", ["blockerId", "createdAt"])
    .index("by_blocked", ["blockedId", "createdAt"])
    .index("by_pair", ["blockerId", "blockedId"]),

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  // Notifications table
  notifications: defineTable({
    // Recipient
    userId: v.id("users"),

    // Notification details
    type: v.string(), // follow, like, comment, mention, booking, etc.
    title: v.string(),
    message: v.string(),

    // Actor (who triggered the notification)
    actorId: v.optional(v.id("users")),
    actorName: v.optional(v.string()),
    actorPhoto: v.optional(v.string()),

    // Target (what the notification is about)
    targetId: v.optional(v.string()), // Post ID, booking ID, etc.
    targetType: v.optional(v.string()), // post, comment, booking, etc.

    // Status
    read: v.boolean(),
    readAt: v.optional(v.number()),

    // Metadata for different notification types
    metadata: v.optional(v.any()),

    // Timestamp
    createdAt: v.number(),
  })
    .index("by_user_read", ["userId", "createdAt"])
    .index("by_unread", ["userId", "read", "createdAt"]),

  // =====================================================
  // MESSAGING & CHAT
  // =====================================================

  // Messages table (already exists, keeping for compatibility)
  messages: defineTable({
    chatId: v.string(),
    senderId: v.id("users"),
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
    reactions: v.optional(v.any()),
  })
    .index("by_chat", ["chatId", "timestamp"])
    .index("by_sender", ["senderId"]),

  // Conversations table
  conversations: defineTable({
    userId: v.id("users"),
    chatId: v.string(),
    lastMessage: v.optional(v.string()),
    lastMessageTime: v.optional(v.number()),
    unreadCount: v.number(),
    lastSenderId: v.optional(v.id("users")),
    chatName: v.optional(v.string()),
    chatPhoto: v.optional(v.string()),
    chatType: v.union(v.literal("direct"), v.literal("group")),
    otherUserId: v.optional(v.id("users")),
  })
    .index("by_user", ["userId", "lastMessageTime"])
    .index("by_chat", ["chatId"]),

  // Presence table
  presence: defineTable({
    userId: v.id("users"),
    online: v.boolean(),
    lastSeen: v.number(),
  }).index("by_user", ["userId"]),

  // Read receipts table
  readReceipts: defineTable({
    chatId: v.string(),
    messageId: v.id("messages"),
    userId: v.id("users"),
    readAt: v.number(),
  })
    .index("by_chat_user", ["chatId", "userId"])
    .index("by_message", ["messageId"]),

  // Chat members (for group chats)
  chatMembers: defineTable({
    chatId: v.string(),
    userId: v.id("users"),
    role: v.union(v.literal("member"), v.literal("admin")),
    joinedAt: v.number(),
  })
    .index("by_chat", ["chatId"])
    .index("by_user", ["userId"]),

  // Typing indicators table
  typingIndicators: defineTable({
    chatId: v.string(),
    userId: v.id("users"),
    userName: v.string(),
    isTyping: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_chat", ["chatId"])
    .index("by_chat_user", ["chatId", "userId"]),

  // =====================================================
  // BOOKINGS & STUDIO OPERATIONS
  // =====================================================

  // Studios table
  studios: defineTable({
    // Basic info
    name: v.string(),
    ownerId: v.id("users"),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),

    // Media
    photos: v.optional(v.array(v.string())),
    logoUrl: v.optional(v.string()),

    // Pricing
    hourlyRate: v.optional(v.number()),
    minHourlyRate: v.optional(v.number()),
    maxHourlyRate: v.optional(v.number()),
    currency: v.optional(v.string()),

    // Settings
    isActive: v.boolean(),
    requiresApproval: v.boolean(),
    deletedAt: v.optional(v.number()), // Soft delete support

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_location", ["location"])
    .index("by_city_state", ["city", "state"]),

  // Rooms table (for multi-room studios)
  rooms: defineTable({
    studioId: v.id("studios"),
    name: v.string(),
    description: v.optional(v.string()),
    capacity: v.optional(v.number()),
    hourlyRate: v.optional(v.number()),
    amenities: v.optional(v.array(v.string())),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_studio", ["studioId"]),

  // Bookings table - merged from Neon + MongoDB
  bookings: defineTable({
    // Core IDs
    id: v.string(), // Keep old ID for compatibility
    studioId: v.id("studios"),
    roomId: v.optional(v.id("rooms")),
    clientId: v.id("users"),

    // Booking details
    serviceType: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    duration: v.optional(v.number()),
    status: v.string(), // Pending, Confirmed, Completed, Cancelled, InProgress

    // Time-based bookings (for recurring/multi-day bookings)
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),

    // Pricing
    offerAmount: v.optional(v.number()),
    finalAmount: v.optional(v.number()),
    totalAmount: v.optional(v.number()),
    depositAmount: v.optional(v.number()),
    depositRequired: v.optional(v.boolean()),
    currency: v.optional(v.string()),

    // Payment tracking
    paymentStatus: v.optional(v.string()), // PendingPayment, DepositPending, PartiallyPaid, FullyPaid, Overpaid, Refunded

    // Cancellation tracking
    cancelledBy: v.optional(v.id("users")),
    cancelledAt: v.optional(v.number()),
    cancellationReason: v.optional(v.string()),

    // EDU mode fields
    isClassBooking: v.optional(v.boolean()),
    className: v.optional(v.string()),
    professorName: v.optional(v.string()),
    lessonPlan: v.optional(v.string()),

    // Flexible metadata (from MongoDB)
    metadata: v.optional(v.any()),

    // Communication
    message: v.optional(v.string()),
    clientNotes: v.optional(v.string()),
    studioNotes: v.optional(v.string()),
    reason: v.optional(v.string()), // For booking requests/rejections

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_studio", ["studioId"])
    .index("by_studio_status", ["studioId", "status"])
    .index("by_client", ["clientId", "createdAt"])
    .index("by_studio_date", ["studioId", "date"])
    .index("by_room_date", ["roomId", "date"]),

  // Booking templates
  bookingTemplates: defineTable({
    studioId: v.id("studios"),
    name: v.string(),
    description: v.optional(v.string()),
    duration: v.number(),
    price: v.number(),
    requirements: v.optional(v.array(v.string())),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_studio", ["studioId"]),

  // Blocked dates for studios
  blockedDates: defineTable({
    studioId: v.id("studios"),
    roomId: v.optional(v.id("rooms")),
    date: v.string(), // ISO date string
    reason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_studio_date", ["studioId", "date"])
    .index("by_room_date", ["roomId", "date"]),

  // Booking payments
  bookingPayments: defineTable({
    bookingId: v.id("bookings"),
    amount: v.number(),
    currency: v.string(),
    status: v.string(), // Pending, Completed, Failed, Refunded
    paymentMethodId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_booking", ["bookingId"])
    .index("by_status", ["status", "createdAt"]),

  // Booking reminders
  bookingReminders: defineTable({
    bookingId: v.id("bookings"),
    userId: v.id("users"), // User to receive the reminder
    reminderType: v.string(), // day_before, hours_before
    reminderHours: v.number(), // Hours before booking to send reminder
    scheduledFor: v.number(), // Timestamp when reminder should be sent
    sent: v.boolean(), // Whether reminder has been sent
    cancelled: v.optional(v.boolean()), // Whether reminder was cancelled
    sentAt: v.optional(v.number()), // When reminder was actually sent
    createdAt: v.number(),
  })
    .index("by_booking", ["bookingId"])
    .index("by_user", ["userId"])
    .index("by_scheduled", ["scheduledFor", "sent"])
    .index("by_pending", ["sent", "scheduledFor"]),

  // =====================================================
  // EDUCATION (EDU)
  // =====================================================

  // Schools table
  schools: defineTable({
    // Basic info
    name: v.string(),
    code: v.string(), // Unique school code
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    location: v.optional(v.string()),

    // Administration
    adminId: v.id("users"),
    staffIds: v.optional(v.array(v.id("users"))),

    // Settings
    isActive: v.boolean(),
    settings: v.optional(v.any()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_admin", ["adminId"])
    .index("by_active", ["isActive"]),

  // Students table
  students: defineTable({
    userId: v.id("users"),
    schoolId: v.id("schools"),
    studentId: v.string(), // School-specific ID
    major: v.optional(v.string()),
    year: v.optional(v.number()), // 1, 2, 3, 4
    gpa: v.optional(v.number()),
    isActive: v.boolean(),
    enrolledAt: v.number(),
    expectedGraduation: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_school", ["schoolId"])
    .index("by_student_id", ["schoolId", "studentId"]),

  // Staff table
  staff: defineTable({
    userId: v.id("users"),
    schoolId: v.id("schools"),
    staffId: v.string(),
    role: v.string(), // EDUAdmin, EDUStaff, Professor
    department: v.optional(v.string()),
    title: v.optional(v.string()), // Professor, Instructor, etc.
    isActive: v.boolean(),
    hiredAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_school", ["schoolId"])
    .index("by_staff_id", ["schoolId", "staffId"]),

  // Classes table
  classes: defineTable({
    schoolId: v.id("schools"),
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    instructorId: v.id("users"),
    schedule: v.optional(v.string()), // "Mon, Wed 10:00-11:30"
    room: v.optional(v.string()),
    credits: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_school", ["schoolId"])
    .index("by_instructor", ["instructorId"])
    .index("by_code", ["schoolId", "code"]),

  // Enrollments table (students in classes)
  enrollments: defineTable({
    classId: v.id("classes"),
    studentId: v.id("users"),
    enrolledAt: v.number(),
    grade: v.optional(v.string()), // A, B, C, etc.
    status: v.string(), // Active, Dropped, Completed
  })
    .index("by_class", ["classId"])
    .index("by_student", ["studentId"])
    .index("by_class_student", ["classId", "studentId"]),

  // Internships table
  internships: defineTable({
    studentId: v.id("users"),
    schoolId: v.id("schools"),
    company: v.string(),
    position: v.string(),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    status: v.string(), // Active, Completed, Terminated
    supervisor: v.optional(v.string()),
    description: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_school", ["schoolId"])
    .index("by_status", ["status", "startDate"]),

  // Internship logs
  internshipLogs: defineTable({
    internshipId: v.id("internships"),
    studentId: v.id("users"),
    weekNumber: v.number(),
    hoursWorked: v.number(),
    activities: v.string(),
    learnings: v.optional(v.string()),
    submittedAt: v.number(),
    status: v.string(), // Pending, Approved, Rejected
    supervisorFeedback: v.optional(v.string()),
  })
    .index("by_internship", ["internshipId"])
    .index("by_student", ["studentId"])
    .index("by_week", ["internshipId", "weekNumber"]),

  // EduAnnouncements table (school announcements/communications)
  eduAnnouncements: defineTable({
    // School
    schoolId: v.id("schools"),

    // Creator
    createdBy: v.string(),
    createdByName: v.string(),
    createdByPhoto: v.optional(v.string()),

    // Announcement details
    title: v.string(),
    content: v.string(),
    targetType: v.string(), // 'all', 'students', 'staff', 'specific'
    targetId: v.optional(v.string()), // User ID for 'specific' targeting
    priority: v.string(), // 'urgent', 'high', 'normal', 'low'
    status: v.string(), // 'draft', 'published', 'scheduled', 'archived'

    // Scheduling
    scheduledFor: v.optional(v.number()), // Timestamp for scheduled announcements
    publishedAt: v.optional(v.number()),
    archivedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()), // Timestamp for expiration

    // Categorization
    category: v.optional(v.string()), // 'announcement', 'emergency', 'event', 'reminder', 'news'

    // Media & links
    attachments: v.optional(v.array(v.string())), // URLs to files/images
    linkUrl: v.optional(v.string()),
    linkLabel: v.optional(v.string()),

    // Delivery settings
    sendPush: v.optional(v.boolean()),
    sendEmail: v.optional(v.boolean()),

    // Engagement
    readCount: v.number(),

    // Soft delete
    deletedAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_school_created", ["schoolId", "createdAt"])
    .index("by_status", ["status", "createdAt"])
    .index("by_priority", ["priority", "createdAt"])
    .index("by_category", ["category", "createdAt"]),

  // EduAnnouncementReads table (read tracking for announcements)
  eduAnnouncementReads: defineTable({
    announcementId: v.id("eduAnnouncements"),
    userId: v.string(),
    readAt: v.number(),
  })
    .index("by_announcement", ["announcementId"])
    .index("by_user", ["userId"])
    .index("by_announcement_user", ["announcementId", "userId"]),

  // =====================================================
  // MARKETPLACE
  // =====================================================

  // Market items table
  marketItems: defineTable({
    sellerId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(), // Gear, Software, Services, etc.
    price: v.number(),
    currency: v.string(),
    condition: v.optional(v.string()), // New, Used, Refurbished
    images: v.optional(v.array(v.string())),
    location: v.optional(v.string()),

    // Status
    status: v.string(), // Active, Sold, Pending, Removed

    // Shipping
    shippingAvailable: v.optional(v.boolean()),
    shippingCost: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_seller", ["sellerId", "createdAt"])
    .index("by_category", ["category", "createdAt"])
    .index("by_status", ["status", "createdAt"])
    .index("by_price", ["price", "createdAt"]),

  // Market transactions
  marketTransactions: defineTable({
    itemId: v.id("marketItems"),
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    amount: v.number(),
    currency: v.string(),
    status: v.string(), // Pending, Completed, Cancelled, Refunded
    stripePaymentIntentId: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_item", ["itemId"])
    .index("by_buyer", ["buyerId", "createdAt"])
    .index("by_seller", ["sellerId", "createdAt"])
    .index("by_status", ["status", "createdAt"]),

  // =====================================================
  // LABELS & DISTRIBUTION
  // =====================================================

  // Labels table
  labels: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),

    // Status
    isActive: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_active", ["isActive"]),

  // Label roster (artists signed to label)
  labelRoster: defineTable({
    labelId: v.id("labels"),
    artistId: v.id("users"),
    role: v.string(), // Artist, Producer, Songwriter
    status: v.string(), // Active, Inactive, Departed
    contractStart: v.number(),
    contractEnd: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_label", ["labelId"])
    .index("by_artist", ["artistId"])
    .index("by_label_artist", ["labelId", "artistId"]),

  // Contracts
  contracts: defineTable({
    labelId: v.id("labels"),
    artistId: v.id("users"),
    type: v.string(), // Recording, Publishing, Management
    terms: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    status: v.string(), // Active, Expired, Terminated
    createdAt: v.number(),
  })
    .index("by_label", ["labelId"])
    .index("by_artist", ["artistId"])
    .index("by_status", ["status", "startDate"]),

  // Releases (music distribution)
  releases: defineTable({
    labelId: v.optional(v.id("labels")),
    artistId: v.id("users"),
    title: v.string(),
    upc: v.optional(v.string()),
    releaseDate: v.optional(v.number()),
    status: v.string(), // Draft, Submitted, Approved, Released
    coverArt: v.optional(v.string()),
    tracks: v.optional(v.array(v.any())), // Track list
    platforms: v.optional(v.array(v.string())), // Spotify, Apple Music, etc.
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_artist", ["artistId", "createdAt"])
    .index("by_label", ["labelId", "createdAt"])
    .index("by_status", ["status", "createdAt"]),

  // =====================================================
  // BROADCASTS
  // =====================================================

  // Broadcasts table
  broadcasts: defineTable({
    // Sender
    senderId: v.id("users"),
    senderName: v.string(),
    senderPhoto: v.optional(v.string()),

    // Target (optional - for direct broadcasts)
    targetId: v.optional(v.id("users")),
    targetName: v.optional(v.string()),

    // Broadcast details
    serviceType: v.string(),
    offerAmount: v.optional(v.number()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    duration: v.optional(v.number()),
    requirements: v.optional(v.array(v.string())),

    // Location
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    locationName: v.optional(v.string()),

    // Status
    status: v.string(), // Broadcasting, Completed, Cancelled
    type: v.literal("Broadcast"),

    // Timestamps
    timestamp: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_sender", ["senderId", "createdAt"])
    .index("by_target", ["targetId", "createdAt"])
    .index("by_status", ["status", "createdAt"])
    .index("by_service_type", ["serviceType", "createdAt"]),

  // =====================================================
  // CONTENT MODERATION
  // =====================================================

  // Content reports
  contentReports: defineTable({
    reporterId: v.id("users"),
    targetId: v.string(), // Post ID, Comment ID, User ID
    targetType: v.string(), // post, comment, user
    reason: v.string(), // Spam, Harassment, Inappropriate, etc.
    description: v.optional(v.string()),
    status: v.string(), // Pending, Reviewing, Resolved, Dismissed
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    resolution: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_target", ["targetId", "targetType"])
    .index("by_status", ["status", "createdAt"])
    .index("by_reporter", ["reporterId", "createdAt"]),

  // =====================================================
  // SYSTEM & CONFIGURATION
  // =====================================================

  // Announcements table
  announcements: defineTable({
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    priority: v.string(), // low, normal, high, urgent
    targetAudience: v.optional(v.array(v.string())), // [all, students, staff, etc.]
    isActive: v.boolean(),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_active", ["isActive", "createdAt"])
    .index("by_priority", ["priority", "createdAt"]),

  // =====================================================
  // SETTINGS & PREFERENCES
  // =====================================================

  // User settings (personal preferences)
  userSettings: defineTable({
    userId: v.id("users"),

    // Display settings
    theme: v.optional(v.string()), // 'light', 'dark', 'system'
    language: v.optional(v.string()), // 'en', 'es', 'fr', etc.
    timezone: v.optional(v.string()), // IANA timezone
    dateFormat: v.optional(v.string()), // 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'
    timeFormat: v.optional(v.string()), // '12h', '24h'
    currency: v.optional(v.string()), // 'USD', 'EUR', 'GBP', etc.
    numberFormat: v.optional(v.string()), // '1,000.00', '1.000,00', '1 000.00'

    // Accessibility
    fontSize: v.optional(v.string()), // 'small', 'medium', 'large', 'xlarge'
    reducedMotion: v.optional(v.boolean()),
    highContrast: v.optional(v.boolean()),
    screenReader: v.optional(v.boolean()),

    // Notifications
    emailNotifications: v.optional(v.boolean()),
    pushNotifications: v.optional(v.boolean()),
    smsNotifications: v.optional(v.boolean()),
    marketingEmails: v.optional(v.boolean()),

    // Privacy
    profileVisibility: v.optional(v.string()), // 'public', 'followers', 'private'
    showEmail: v.optional(v.boolean()),
    showLocation: v.optional(v.boolean()),
    showOnlineStatus: v.optional(v.boolean()),
    allowMessagesFrom: v.optional(v.string()), // 'everyone', 'followers', 'none'
    allowTagging: v.optional(v.boolean()),

    // Content preferences
    matureContentFilter: v.optional(v.boolean()),
    autoPlayVideos: v.optional(v.boolean()),
    showSensitiveContent: v.optional(v.boolean()),

    // Timestamps
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Notification settings (granular control)
  notificationSettings: defineTable({
    userId: v.id("users"),

    // Social notifications
    newFollower: v.optional(v.boolean()),
    newComment: v.optional(v.boolean()),
    newLike: v.optional(v.boolean()),
    newMention: v.optional(v.boolean()),
    newShare: v.optional(v.boolean()),
    newPost: v.optional(v.boolean()),

    // Messenger notifications
    newMessage: v.optional(v.boolean()),
    messageRead: v.optional(v.boolean()),
    typingIndicator: v.optional(v.boolean()),

    // Booking notifications
    bookingRequest: v.optional(v.boolean()),
    bookingConfirmed: v.optional(v.boolean()),
    bookingReminder: v.optional(v.boolean()),
    bookingCancelled: v.optional(v.boolean()),

    // EDU notifications
    classAnnouncement: v.optional(v.boolean()),
    assignmentDue: v.optional(v.boolean()),
    gradePosted: v.optional(v.boolean()),
    schoolEvent: v.optional(v.boolean()),

    // Marketplace notifications
    itemSold: v.optional(v.boolean()),
    bidReceived: v.optional(v.boolean()),
    priceDrop: v.optional(v.boolean()),

    // System notifications
    securityAlert: v.optional(v.boolean()),
    productUpdate: v.optional(v.boolean()),
    featureAnnouncement: v.optional(v.boolean()),

    // Timestamp
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Privacy settings (detailed privacy controls)
  privacySettings: defineTable({
    userId: v.id("users"),

    // Profile visibility
    whoCanViewProfile: v.optional(v.string()), // 'everyone', 'followers', 'mutual', 'none'
    whoCanSendMessage: v.optional(v.string()), // 'everyone', 'followers', 'mutual', 'none'
    whoCanSeeActivity: v.optional(v.string()), // 'everyone', 'followers', 'private'
    whoCanSeeFollowers: v.optional(v.string()), // 'everyone', 'followers', 'private'
    whoCanSeeFollowing: v.optional(v.string()), // 'everyone', 'followers', 'private'

    // Content visibility
    defaultPostVisibility: v.optional(v.string()), // 'public', 'followers', 'private'
    showOnlineStatus: v.optional(v.boolean()),
    showLastSeen: v.optional(v.boolean()),
    showPresence: v.optional(v.boolean()),

    // Data controls
    allowDataCollection: v.optional(v.boolean()),
    allowPersonalizedAds: v.optional(v.boolean()),
    allowSearchEngines: v.optional(v.boolean()),

    // Blocking
    blockedUsers: v.optional(v.array(v.id("users"))),
    mutedUsers: v.optional(v.array(v.id("users"))),
    restrictedWords: v.optional(v.array(v.string())),

    // Two-factor authentication
    twoFactorEnabled: v.optional(v.boolean()),
    twoFactorMethod: v.optional(v.string()), // 'sms', 'email', 'app'

    // Timestamp
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Security settings (account security)
  securitySettings: defineTable({
    userId: v.id("users"),

    // Login security
    twoFactorEnabled: v.optional(v.boolean()),
    twoFactorSecret: v.optional(v.string()),
    backupCodes: v.optional(v.array(v.string())),
    loginNotifications: v.optional(v.boolean()),

    // Session management
    sessionTimeout: v.optional(v.number()), // minutes
    maxSessions: v.optional(v.number()), // max concurrent sessions
    rememberDevice: v.optional(v.boolean()),

    // Password requirements
    lastPasswordChange: v.optional(v.number()),
    passwordExpiresIn: v.optional(v.number()), // days, 0 = never
    requirePasswordChange: v.optional(v.boolean()),

    // Login history
    lastLoginAt: v.optional(v.number()),
    lastLoginIp: v.optional(v.string()),
    lastLoginLocation: v.optional(v.string()),
    failedLoginAttempts: v.optional(v.number()),
    accountLocked: v.optional(v.boolean()),
    accountLockedUntil: v.optional(v.number()),

    // Recovery
    recoveryEmail: v.optional(v.string()),
    recoveryPhone: v.optional(v.string()),
    recoveryEmailVerified: v.optional(v.boolean()),
    recoveryPhoneVerified: v.optional(v.boolean()),

    // Security preferences
    logoutOnNewDevice: v.optional(v.boolean()),
    verifyNewDevice: v.optional(v.boolean()),
    securityQuestions: v.optional(v.array(v.object({
      question: v.string(),
      answerHash: v.string(),
    }))),

    // Timestamp
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Application settings (platform-wide settings)
  appSettings: defineTable({
    key: v.string(),
    value: v.any(),

    // Metadata
    category: v.optional(v.string()), // 'general', 'features', 'limits', 'integrations'
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()), // Whether non-admin users can read

    // Timestamps
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_key", ["key"])
    .index("by_category", ["category"]),

  // System configuration
  systemConfig: defineTable({
    key: v.string(),
    value: v.any(),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"]),

  // Audit log
  auditLog: defineTable({
    userId: v.optional(v.id("users")),
    action: v.string(), // create, update, delete, etc.
    entityType: v.string(), // user, post, booking, etc.
    entityId: v.optional(v.string()),
    changes: v.optional(v.any()), // What changed
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user", ["userId", "timestamp"])
    .index("by_entity", ["entityType", "entityId", "timestamp"])
    .index("by_action", ["action", "timestamp"])
});
