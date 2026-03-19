# Convex Data Migration Guide
## Step-by-Step Migration from Neon + MongoDB to Convex

This guide provides detailed instructions for migrating all data from Neon PostgreSQL and MongoDB to Convex.

---

## Prerequisites

1. **Set up Convex Development Environment**
   ```bash
   npx convex dev
   ```

2. **Backup Existing Databases**
   - Export Neon PostgreSQL data
   - Export MongoDB collections
   - Store backups securely

3. **Install Required Tools**
   ```bash
   # For Neon
   npm install @neondatabase/serverless

   # For MongoDB
   npm install mongodb

   # For Convex
   npm install convex
   ```

---

## Phase 1: Users & Profiles Migration

### Step 1.1: Export Users from Neon

```sql
-- Export from Neon
COPY clerk_users TO '/tmp/clerk_users.csv' CSV HEADER;
COPY profiles TO '/tmp/profiles.csv' CSV HEADER;
```

### Step 1.2: Migrate Users to Convex

Create `convex/migrations/users.ts`:

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const migrateUsers = mutation({
  args: {
    users: v.array(v.object({
      clerkId: v.string(),
      email: v.string(),
      username: v.optional(v.string()),
      displayName: v.optional(v.string()),
      bio: v.optional(v.string()),
      avatarUrl: v.optional(v.string()),
      bannerUrl: v.optional(v.string()),
      accountTypes: v.array(v.string()),
      activeRole: v.optional(v.string()),
    }))
  },
  handler: async (ctx, args) => {
    const migratedUsers = [];

    for (const user of args.users) {
      // Check if user already exists
      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", user.clerkId))
        .first();

      if (existing) {
        // Update existing user
        await ctx.db.patch(existing._id, {
          ...user,
          updatedAt: Date.now(),
        });
        migratedUsers.push(existing._id);
      } else {
        // Insert new user
        const userId = await ctx.db.insert("users", {
          ...user,
          emailVerified: true,
          stats: {
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            bookingsCount: 0,
          },
          settings: {
            privacy: "public",
            notificationsEnabled: true,
            showEmail: false,
            showLocation: true,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastActiveAt: Date.now(),
        });
        migratedUsers.push(userId);
      }
    }

    return { migrated: migratedUsers.length };
  },
});
```

### Step 1.3: Run Migration

```bash
# In your migration script
npx convex run migrations:migrateUsers --users @users.json
```

---

## Phase 2: Social Features Migration

### Step 2.1: Export Posts from MongoDB

```javascript
// export-posts.js
const { MongoClient } = require('mongodb');

async function exportPosts() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('sesh-nx');

  const posts = await db.collection('posts')
    .find({ deleted_at: null })
    .toArray();

  console.log(JSON.stringify(posts, null, 2));
  await client.close();
}

exportPosts();
```

### Step 2.2: Migrate Posts to Convex

Create `convex/migrations/posts.ts`:

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const migratePosts = mutation({
  args: {
    posts: v.array(v.object({
      id: v.string(),
      author_id: v.string(),
      content: v.optional(v.string()),
      media_urls: v.optional(v.array(v.string())),
      hashtags: v.optional(v.array(v.string())),
      mentions: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      visibility: v.string(),
      created_at: v.number(),
      updated_at: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    const migratedPosts = [];

    for (const post of args.posts) {
      // Find author by clerk ID
      const author = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", post.author_id))
        .first();

      if (!author) {
        console.warn(`Author not found for post ${post.id}`);
        continue;
      }

      // Insert post
      const postId = await ctx.db.insert("posts", {
        authorId: author._id,
        authorName: author.displayName,
        authorPhoto: author.avatarUrl,
        authorUsername: author.username,
        role: author.activeRole,
        content: post.content,
        mediaUrls: post.media_urls,
        hashtags: post.hashtags,
        mentions: post.mentions,
        category: post.category,
        visibility: post.visibility,
        engagement: {
          likesCount: 0,
          commentsCount: 0,
          repostsCount: 0,
          savesCount: 0,
        },
        createdAt: post.created_at,
        updatedAt: post.updated_at,
      });

      migratedPosts.push(postId);
    }

    return { migrated: migratedPosts.length };
  },
});
```

### Step 2.3: Migrate Comments

Similar approach for comments - export from MongoDB, then migrate to Convex.

### Step 2.4: Migrate Reactions

```typescript
import { mutation } from "./_generated/server";

export const migrateReactions = mutation({
  args: {
    reactions: v.array(v.object({
      target_id: v.string(),
      target_type: v.string(),
      emoji: v.string(),
      user_id: v.string(),
      created_at: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    for (const reaction of args.reactions) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", reaction.user_id))
        .first();

      if (!user) continue;

      await ctx.db.insert("reactions", {
        targetId: reaction.target_id,
        targetType: reaction.target_type,
        emoji: reaction.emoji,
        userId: user._id,
        timestamp: reaction.created_at,
      });
    }

    return { migrated: args.reactions.length };
  },
});
```

---

## Phase 3: Bookings Migration

### Step 3.1: Export Bookings from Neon

```sql
-- Export bookings
COPY bookings TO '/tmp/bookings.csv' CSV HEADER;

-- Export booking metadata from MongoDB
-- Use mongodump or custom export script
```

### Step 3.2: Migrate Bookings to Convex

```typescript
import { mutation } from "./_generated/server";

export const migrateBookings = mutation({
  args: {
    bookings: v.array(v.object({
      id: v.string(),
      studio_id: v.string(),
      client_id: v.string(),
      service_type: v.optional(v.string()),
      date: v.optional(v.string()),
      time: v.optional(v.string()),
      duration: v.optional(v.number()),
      status: v.string(),
      offer_amount: v.optional(v.number()),
      message: v.optional(v.string()),
      created_at: v.number(),
      updated_at: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    for (const booking of args.bookings) {
      // Find studio and client
      const studio = await ctx.db
        .query("studios")
        .withIndex("by_owner", (q) => q.eq("ownerId", booking.studio_id))
        .first();

      const client = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", booking.client_id))
        .first();

      if (!studio || !client) {
        console.warn(`Studio or client not found for booking ${booking.id}`);
        continue;
      }

      await ctx.db.insert("bookings", {
        id: booking.id,
        studioId: studio._id,
        clientId: client._id,
        serviceType: booking.service_type,
        date: booking.date,
        time: booking.time,
        duration: booking.duration,
        status: booking.status,
        offerAmount: booking.offer_amount,
        message: booking.message,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at,
      });
    }

    return { migrated: args.bookings.length };
  },
});
```

---

## Phase 4: EDU Features Migration

### Step 4.1: Export Schools from Neon

```sql
COPY schools TO '/tmp/schools.csv' CSV HEADER;
COPY students TO '/tmp/students.csv' CSV HEADER;
COPY staff TO '/tmp/staff.csv' CSV HEADER;
```

### Step 4.2: Migrate Schools to Convex

```typescript
import { mutation } from "./_generated/server";

export const migrateSchools = mutation({
  args: {
    schools: v.array(v.object({
      id: v.string(),
      name: v.string(),
      code: v.string(),
      description: v.optional(v.string()),
      logo_url: v.optional(v.string()),
      location: v.optional(v.string()),
      admin_id: v.string(),
      is_active: v.boolean(),
      created_at: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    for (const school of args.schools) {
      const admin = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", school.admin_id))
        .first();

      if (!admin) continue;

      await ctx.db.insert("schools", {
        name: school.name,
        code: school.code,
        description: school.description,
        logoUrl: school.logo_url,
        location: school.location,
        adminId: admin._id,
        isActive: school.is_active,
        createdAt: school.created_at,
        updatedAt: Date.now(),
      });
    }

    return { migrated: args.schools.length };
  },
});
```

---

## Phase 5: Marketplace & Labels Migration

Similar approach for marketplace items, labels, rosters, and releases.

---

## Phase 6: Broadcasts Migration

```typescript
import { mutation } from "./_generated/server";

export const migrateBroadcasts = mutation({
  args: {
    broadcasts: v.array(v.object({
      _id: v.string(),
      senderId: v.string(),
      senderName: v.string(),
      targetId: v.optional(v.string()),
      targetName: v.optional(v.string()),
      serviceType: v.string(),
      offerAmount: v.optional(v.number()),
      date: v.optional(v.string()),
      requirements: v.optional(v.array(v.string())),
      location: v.optional(v.object({
        lat: v.number(),
        lng: v.number(),
      })),
      locationName: v.optional(v.string()),
      status: v.string(),
      createdAt: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    for (const broadcast of args.broadcasts) {
      const sender = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", broadcast.senderId))
        .first();

      if (!sender) continue;

      await ctx.db.insert("broadcasts", {
        senderId: sender._id,
        senderName: broadcast.senderName,
        senderPhoto: sender.avatarUrl,
        serviceType: broadcast.serviceType,
        offerAmount: broadcast.offerAmount,
        date: broadcast.date,
        requirements: broadcast.requirements,
        location: broadcast.location,
        locationName: broadcast.locationName,
        status: broadcast.status,
        type: "Broadcast",
        timestamp: broadcast.createdAt,
        createdAt: broadcast.createdAt,
        updatedAt: Date.now(),
      });
    }

    return { migrated: args.broadcasts.length };
  },
});
```

---

## Running Migrations

### Development Migration

```bash
# 1. Export data from Neon and MongoDB
node scripts/export-data.js

# 2. Run migration scripts
npx convex run migrations:migrateUsers --users @data/users.json
npx convex run migrations:migratePosts --posts @data/posts.json
npx convex run migrations:migrateReactions --reactions @data/reactions.json
npx convex run migrations:migrateBookings --bookings @data/bookings.json
npx convex run migrations:migrateSchools --schools @data/schools.json
npx convex run migrations:migrateBroadcasts --broadcasts @data/broadcasts.json
```

### Production Migration

1. **Create a production Convex deployment**
   ```bash
   npx convex deploy
   ```

2. **Run migrations in order**
   - Users first (everything references them)
   - Schools, Studios, Labels (entities)
   - Posts, Bookings, MarketItems (content)
   - Comments, Reactions, Follows (relationships)
   - Notifications (derived data)

3. **Verify migration**
   ```bash
   # Check counts
   npx convex run --query countUsers
   npx convex run --query countPosts
   ```

4. **Switch application to Convex**
   - Update environment variables
   - Deploy application
   - Monitor for errors

---

## Validation

After each migration, validate:

```typescript
import { query } from "./_generated/server";

export const validateMigration = query({
  args: {},
  handler: async (ctx) => {
    const userCount = await ctx.db.query("users").collect().then(u => u.length);
    const postCount = await ctx.db.query("posts").collect().then(p => p.length);
    const bookingCount = await ctx.db.query("bookings").collect().then(b => b.length);

    return {
      users: userCount,
      posts: postCount,
      bookings: bookingCount,
    };
  },
});
```

---

## Rollback Plan

If migration fails:

1. **Keep old databases running**
2. **Use feature flags to switch back**
3. **Fix the migration issue**
4. **Retry migration**

---

## Cleanup

After successful migration:

1. **Remove old database connections**
   - Delete Neon connection string
   - Delete MongoDB connection string
   - Remove unused config files

2. **Remove migration scripts**
   - Keep for 30 days in case of rollback
   - Archive to separate repository

3. **Update documentation**
   - Remove Neon/MongoDB references
   - Update CLAUDE.md
   - Update API documentation

---

## Next Steps

After completing all migrations:

1. ✅ Monitor performance
2. ✅ Optimize indexes
3. ✅ Set up backups
4. ✅ Document new architecture
5. ✅ Train team on Convex
