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

    // Profile display
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    headline: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),

    // Professional info
    skills: v.optional(v.array(v.string())),
    genres: v.optional(v.array(v.string())),
    instruments: v.optional(v.array(v.string())),
    software: v.optional(v.array(v.string())),

    // Role & account type
    accountTypes: v.array(v.string()), // [Talent, Engineer, Producer, etc.]
    activeRole: v.optional(v.string()),
    subRoles: v.optional(v.array(v.string())), // [Singer, Rapper, DJ, etc.]

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
    .index("by_last_active", ["lastActiveAt"]),

  // Sub-profiles (for users with multiple roles)
  subProfiles: defineTable({
    userId: v.id("users"),
    role: v.string(), // Talent, Studio, Label, etc.
    displayName: v.string(),
    photoUrl: v.optional(v.string()),
    bio: v.optional(v.string()),

    // Role-specific data
    skills: v.optional(v.array(v.string())),
    genres: v.optional(v.array(v.string())),
    location: v.optional(v.string()),

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
    .index("by_role", ["role"]),

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
    .index("by_author", ["authorId", "createdAt"])
    .index("by_comment_id", ["_id"]), // For MongoDB migration

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
    .index("by_pair", ["followerId", "followingId"], { unique: true }),

  // Saved posts (bookmarks)
  savedPosts: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId", "createdAt"])
    .index("by_post", ["postId"])
    .index("by_user_post", ["userId", "postId"], { unique: true }),

  // User blocks
  userBlocks: defineTable({
    blockerId: v.id("users"),
    blockedId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_blocker", ["blockerId", "createdAt"])
    .index("by_blocked", ["blockedId", "createdAt"])
    .index("by_pair", ["blockerId", "blockedId"], { unique: true }),

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
    .index("by_unread", ["userId", "read", "createdAt"])
    .index("by_notification_id", ["_id"]), // For MongoDB migration

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
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),

    // Media
    photos: v.optional(v.array(v.string())),
    logoUrl: v.optional(v.string()),

    // Details
    hourlyRate: v.optional(v.number()),
    currency: v.optional(v.string()),

    // Settings
    isActive: v.boolean(),
    requiresApproval: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_location", ["location"]),

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

    // Pricing
    offerAmount: v.optional(v.number()),
    finalAmount: v.optional(v.number()),
    currency: v.optional(v.string()),

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

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_studio_status", ["studioId", "status"])
    .index("by_client", ["clientId", "createdAt"])
    .index("by_id", ["id"], { unique: true })
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
  })
    .index("by_booking", ["bookingId"])
    .index("by_status", ["status", "createdAt"]),

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
    .index("by_code", ["code"], { unique: true })
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
    .index("by_class_student", ["classId", "studentId"], { unique: true }),

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
    .index("by_week", ["internshipId", "weekNumber"], { unique: true }),

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
    shippingCost: v.optional(v.number>()),

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
    .index("by_label_artist", ["labelId", "artistId"], { unique: true }),

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

  // System configuration
  systemConfig: defineTable({
    key: v.string(),
    value: v.any(),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"], { unique: true }),

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
