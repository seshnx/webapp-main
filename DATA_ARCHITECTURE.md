# SeshNx Data Architecture

## Overview: Dual Database Strategy

SeshNx uses a dual database architecture to optimize for data characteristics:

- **Neon (PostgreSQL)**: Structured, relational, infrequently-changing data
- **MongoDB**: Flexible, frequently-changing data, all SocialNx features

---

## 🗄️ NEON (PostgreSQL) - Stable Data

### What Goes in Neon:

#### User Identity & Core Data
```sql
clerk_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  username TEXT UNIQUE,

  -- Account Types (relational, rarely changes)
  account_types TEXT[],
  active_role TEXT,
  preferred_role TEXT,

  -- Subscription & Tier (infrequent updates)
  current_tier TEXT,
  subscription_status TEXT,
  subscription_expires_at TIMESTAMP,

  -- Financial (structured, requires ACID)
  wallet_balance DECIMAL(10,2),
  earnings_balance DECIMAL(10,2),
  escrow_balance DECIMAL(10,2),

  -- Profile Photos (can be large blobs)
  profile_photo_url TEXT,
  banner_url TEXT,

  -- Legal Identity (changes rarely)
  legal_name_verified BOOLEAN,
  verification_status TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

#### Bookings (Structured, Relational)
```sql
bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id TEXT REFERENCES clerk_users(id),
  target_id TEXT REFERENCES clerk_users(id),

  -- Structured booking data
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  venue_id TEXT,
  room_id TEXT,

  -- Status workflow (structured state machine)
  status TEXT NOT NULL, -- Pending, Confirmed, Completed, Cancelled, Declined
  payment_status TEXT,

  -- Pricing (requires precision)
  offer_amount DECIMAL(10,2),
  actual_amount DECIMAL(10,2),
  commission_amount DECIMAL(10,2),

  -- Relationships
  session_id TEXT,
  template_id TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled', 'Declined'))
)
```

#### Payments (Financial, ACID Required)
```sql
payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  user_id TEXT REFERENCES clerk_users(id),

  -- Financial data (requires precision)
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,

  -- Stripe integration
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,

  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)
```

#### Studio Resources (Relational)
```sql
studio_rooms (
  id UUID PRIMARY KEY,
  studio_id TEXT REFERENCES clerk_users(id),
  name TEXT NOT NULL,
  capacity INTEGER,
  hourly_rate DECIMAL(10,2),

  -- Structured attributes
  amenities TEXT[],
  equipment_ids TEXT[],

  -- Availability (structured time slots)
  availability_json JSONB,

  created_at TIMESTAMP DEFAULT NOW()
)

studio_templates (
  id UUID PRIMARY KEY,
  studio_id TEXT REFERENCES clerk_users(id),
  name TEXT NOT NULL,
  duration_hours INTEGER,
  base_price DECIMAL(10,2),

  -- Structured configuration
  room_ids UUID[],
  equipment_included TEXT[],

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
)
```

#### Distribution (Structured Metadata)
```sql
distribution_releases (
  id UUID PRIMARY KEY,
  uploader_id TEXT REFERENCES clerk_users(id),

  -- Release metadata (structured)
  title TEXT NOT NULL,
  primary_artist TEXT NOT NULL,
  type TEXT NOT NULL,
  genre TEXT NOT NULL,
  release_date DATE,
  label_name TEXT,

  -- Track data (structured relational)
  tracks JSONB, -- Array of track objects

  -- Distribution status (structured workflow)
  status TEXT DEFAULT 'Draft',

  -- Store availability (structured)
  stores TEXT[],

  created_at TIMESTAMP DEFAULT NOW()
)
```

---

## 🍃 MONGODB - Flexible & Social Data

### What Goes in MongoDB:

#### User Profiles (Flexible, Frequently-Changing)
```javascript
profiles {
  _id: "clerk_user_id",
  clerkUserId: "clerk_user_id",

  // Display Identity (changes often)
  displayName: "DJ Sesh",
  username: "dj_sesh",
  bio: "Music producer & artist",
  headline: "Creating beats since 2020",

  // Skills (flexible arrays, user-generated)
  skills: ["Beat Making", "Mixing", "Mastering"],
  specialties: ["Hip-Hop", "R&B", "Trap"],
  genres: ["Hip-Hop", "R&B", "Pop"],
  instruments: ["Piano", "Drums", "Bass"],
  software: ["FL Studio", "Pro Tools", "Ableton"],

  // Portfolio URLs (flexible structure)
  portfolioUrls: [
    { title: "SoundCloud", url: "https://soundcloud.com/djsesh", type: "soundcloud" },
    { title: "Spotify", url: "https://open.spotify.com/artist/djsesh", type: "spotify" }
  ],

  // Location (geospatial queries)
  location: {
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    zipCode: "90210",
    coordinates: { type: "Point", coordinates: [-118.2437, 34.0522] }
  },

  // Social Stats (denormalized for performance)
  stats: {
    followersCount: 1234,
    followingCount: 567,
    postsCount: 89,
    likesReceived: 2345,
    commentsReceived: 876
  },

  // Verification & Badges
  badges: ["Verified Producer", "Top Rated"],
  verifiedAt: ISODate("2024-01-15"),
  verificationLevel: "verified",

  createdAt: ISODate("2023-01-01"),
  updatedAt: ISODate("2024-03-10"),
  lastActiveAt: ISODate("2024-03-10T08:30:00Z")
}
```

#### Posts (Social Content)
```javascript
posts {
  _id: "post_id",
  clerkUserId: "user_id",

  // Content (flexible)
  content: "Just dropped a new beat! 🔥",
  media: [
    { type: "image", url: "https://...", thumbnailUrl: "https://..." },
    { type: "video", url: "https://...", duration: 120 }
  ],

  // Metadata
  postedAsRole: "Producer",
  mentions: ["user_123", "user_456"],
  hashtags: ["newbeat", "producer", "hiphop"],

  // Engagement (denormalized)
  stats: {
    likesCount: 45,
    commentsCount: 12,
    sharesCount: 8,
    viewsCount: 1200
  },

  // Visibility
  visibility: "public",

  // Thread support
  repliedToPostId: "parent_post_id",
  quotedPostId: "quoted_post_id",

  // Moderation
  isReported: false,
  reportsCount: 0,
  moderationStatus: "approved",

  // Algorithmic scoring
  score: 89.5, // Computed engagement score

  createdAt: ISODate("2024-03-10T08:00:00Z"),
  updatedAt: ISODate("2024-03-10T08:00:00Z"),
  publishedAt: ISODate("2024-03-10T08:00:00Z")
}
```

#### Comments
```javascript
comments {
  _id: "comment_id",
  postId: "post_id",
  clerkUserId: "user_id",
  parentCommentId: "parent_comment_id",

  content: "Fire beat! 🔥",
  media: [],

  likesCount: 5,
  repliesCount: 2,

  isReported: false,
  isDeleted: false,

  createdAt: ISODate("2024-03-10T09:00:00Z"),
  updatedAt: ISODate("2024-03-10T09:00:00Z")
}
```

#### Reactions (Likes, Emojis)
```javascript
reactions {
  _id: "reaction_id",
  clerkUserId: "user_id",
  targetId: "post_id_or_comment_id",
  targetType: "post", // or "comment"
  emoji: "🔥",

  createdAt: ISODate("2024-03-10T09:00:00Z")
}
```

#### Social Graph (Follows)
```javascript
social_follows {
  _id: "follower_id_followee_id_timestamp",
  followerId: "user_a",
  followeeId: "user_b",

  createdAt: ISODate("2024-03-01T00:00:00Z"),

  // Soft delete support
  unfollowedAt: null, // or ISODate if unfollowed
  isActive: true
}
```

#### Notifications
```javascript
social_notifications {
  _id: "notification_id",
  clerkUserId: "recipient_user_id",

  type: "like", // or "follow", "comment", "mention", "reply", "share"

  // Actor info
  actorId: "actor_user_id",
  actorDisplayName: "DJ Sesh",
  actorAvatarUrl: "https://...",

  // Related content
  targetId: "post_id",
  targetType: "post",
  content: "liked your post",

  // Status
  isRead: false,
  readAt: null,

  // Auto-expiry
  createdAt: ISODate("2024-03-10T09:00:00Z"),
  expiresAt: ISODate("2024-04-10T09:00:00Z")
}
```

#### Social Settings (Privacy)
```javascript
social_settings {
  _id: "clerk_user_id",
  clerkUserId: "user_id",

  // Privacy
  profileVisibility: "public",
  messagePermission: "everyone",
  showOnlineStatus: true,
  showActivityStatus: true,

  // Feed Preferences
  feedAlgorithm: "recommended",
  autoPlayVideos: true,
  showSuggestedAccounts: true,

  // Notifications
  notificationPreferences: {
    follows: true,
    likes: true,
    comments: true,
    mentions: true,
    posts: true,
    shares: false,
    email: true,
    push: false
  },

  // Moderation
  blockList: ["blocked_user_id"],
  muteList: ["muted_user_id"],
  restrictedWords: ["spam", "bot"],

  updatedAt: ISODate("2024-03-10T08:00:00Z")
}
```

---

## 🔄 Unified Data Service Layer

### Unified User Data Service

Components shouldn't need to know whether data comes from Neon or MongoDB. They just call a unified service.

```typescript
// src/services/unifiedUserData.ts

import {
  // Neon queries
  getCoreUserProfile,
  updateCoreProfile,
  getBookings,
  getPayments
} from '../config/neonQueries';

import {
  // MongoDB queries
  getProfile,
  upsertProfile,
  getFollowing,
  getFollowers,
  updateLastActive
} from '../config/mongoSocial';

/**
 * Get complete user profile (merges Neon + MongoDB)
 */
export async function getCompleteUser(clerkUserId: string) {
  const [coreProfile, socialProfile] = await Promise.all([
    getCoreUserProfile(clerkUserId), // Neon: identity, roles, wallet
    getProfile(clerkUserId)          // MongoDB: display name, skills, stats
  ]);

  return {
    // From Neon
    id: coreProfile.id,
    email: coreProfile.email,
    firstName: coreProfile.first_name,
    lastName: coreProfile.last_name,
    accountTypes: coreProfile.account_types,
    activeRole: coreProfile.active_role,
    currentTier: coreProfile.current_tier,
    walletBalance: coreProfile.wallet_balance,

    // From MongoDB
    displayName: socialProfile?.displayName,
    username: socialProfile?.username,
    bio: socialProfile?.bio,
    skills: socialProfile?.skills || [],
    specialties: socialProfile?.specialties || [],
    genres: socialProfile?.genres || [],
    avatarUrl: socialProfile?.avatarUrl || coreProfile.profile_photo_url,
    stats: socialProfile?.stats || { followersCount: 0, followingCount: 0, postsCount: 0 },

    // Merged display name
    effectiveDisplayName: socialProfile?.displayName ||
      `${coreProfile.first_name} ${coreProfile.last_name}`.trim()
  };
}

/**
 * Update user profile (routes to correct DB)
 */
export async function updateUserProfile(clerkUserId: string, updates: {
  // Core data → Neon
  firstName?: string;
  lastName?: string;
  email?: string;
  accountTypes?: string[];
  activeRole?: string;

  // Flexible data → MongoDB
  displayName?: string;
  bio?: string;
  skills?: string[];
  specialties?: string[];
  genres?: string[];
  location?: any;
  portfolioUrls?: any[];
}) {
  const coreUpdates = {
    first_name: updates.firstName,
    last_name: updates.lastName,
    email: updates.email,
    account_types: updates.accountTypes,
    active_role: updates.activeRole
  };

  const socialUpdates = {
    displayName: updates.displayName,
    bio: updates.bio,
    skills: updates.skills,
    specialties: updates.specialties,
    genres: updates.genres,
    location: updates.location,
    portfolioUrls: updates.portfolioUrls
  };

  // Parallel updates to both databases
  await Promise.all([
    Object.keys(coreUpdates).length > 0
      ? updateCoreProfile(clerkUserId, coreUpdates)
      : null,
    Object.keys(socialUpdates).length > 0
      ? upsertProfile(clerkUserId, socialUpdates)
      : null
  ]);
}
```

---

## 📋 Data Migration Rules

### When to Use Neon:
- ✅ User identity (email, phone, legal name)
- ✅ Account types/roles (rarely change)
- ✅ Subscription/tier info (changes infrequently)
- ✅ Financial data (requires ACID compliance)
- ✅ Booking data (structured, relational)
- ✅ Payments (financial precision)
- ✅ Studio resources (rooms, equipment)
- ✅ Distribution releases (structured metadata)

### When to Use MongoDB:
- ✅ Display name & bio (user-controlled, changes often)
- ✅ Skills, specialties, genres (flexible arrays)
- ✅ Settings (theme, notifications, privacy)
- ✅ All social features (posts, comments, reactions)
- ✅ Social graph (followers, following)
- ✅ Notifications (high write volume)
- ✅ Portfolio URLs (flexible structure)
- ✅ User-generated content

---

## 🔧 Implementation Checklist

- [x] MongoDB schemas created
- [x] MongoDB social queries implemented
- [ ] Create unified data service layer
- [ ] Update components to use unified service
- [ ] Add sync mechanism for read operations
- [ ] Create migration script for existing data
- [ ] Update API routes to use correct DB
- [ ] Add monitoring & logging
- [ ] Write data migration tests

---

## 📊 Example Data Flow

### Creating a Post:
1. User submits post → **MongoDB** (flexible content)
2. Increment post count → **MongoDB** (user profile stats)
3. Notify followers → **MongoDB** (notifications)

### Creating a Booking:
1. Create booking → **Neon** (structured, relational)
2. Send notifications → **MongoDB** (social notifications)
3. Update user stats → **MongoDB** (if needed)

### User Updates Profile:
1. Change legal name → **Neon** (identity data)
2. Change display name → **MongoDB** (flexible display)
3. Update skills → **MongoDB** (flexible array)
