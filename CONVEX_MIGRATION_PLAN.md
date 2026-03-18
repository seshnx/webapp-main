# Convex Migration Plan
## Migrating SeshNx from Neon/PostgreSQL + MongoDB to Convex-only Architecture

### Executive Summary
This document outlines the complete migration of SeshNx from a hybrid database architecture (Neon PostgreSQL + MongoDB + Convex for real-time) to a unified Convex-only architecture. This migration will simplify the stack, reduce costs, improve real-time capabilities, and eliminate data synchronization complexity.

**Current State:**
- **Neon PostgreSQL**: Primary database for users, profiles, bookings, schools, marketplace, labels
- **MongoDB**: Social features (posts, comments, reactions), booking metadata, broadcasts
- **Convex**: Real-time sync only (messages, presence, notifications)

**Target State:**
- **Convex**: Single source of truth for all data and real-time features

---

## Migration Architecture

### Phase 1: Schema Design & Planning
**Goal:** Design complete Convex schema that accommodates all existing data

**Tasks:**
1. Analyze all Neon tables and MongoDB collections
2. Map relationships and foreign keys to Convex references
3. Design normalized vs denormalized data structure
4. Plan indexes for query optimization
5. Define validation rules for each table

**Key Schema Changes:**
- Users: Merge clerk_users + profiles into single table
- Posts: Migrate from MongoDB with engagement tracking
- Bookings: Merge Neon bookings + MongoDB metadata
- Schools: Migrate EDU structure with role-based access

### Phase 2: Core Data Migration
**Goal:** Migrate foundational data to Convex

**Order of Migration:**
1. **Users & Profiles** (highest dependency)
   - Merge clerk_users, profiles, sub_profiles
   - Preserve account types, roles, permissions
   - Migrate profile photos, banners, social links

2. **Social Features** (high usage)
   - Posts, comments, reactions from MongoDB
   - Follows, bookmarks, blocks
   - Social notifications

3. **Bookings** (complex relationships)
   - Merge Neon bookings + MongoDB metadata
   - Booking templates, payments
   - Calendar sync data

4. **EDU/Schools** (isolated domain)
   - Schools, students, staff
   - Classes, internships
   - Assignments, grades

5. **Marketplace & Labels** (lower priority)
   - Market items, transactions
   - Label rosters, contracts
   - Distribution data

### Phase 3: API Migration
**Goal:** Replace all API routes with Convex functions

**Strategy:**
- Convert REST endpoints to Convex queries/mutations
- Maintain backward compatibility during transition
- Update client-side calls incrementally

**API Routes to Migrate:**
```
/api/studio-ops/*      → Convex: studioOperations
/api/social/*          → Convex: socialFeed
/api/labels/*          → Convex: labels
/api/marketplace/*     → Convex: marketplace
/api/schools/*         → Convex: education
/api/user/*            → Convex: users
/api/notifications/*   → Convex: notifications
/api/broadcasts/*      → Convex: broadcasts
```

### Phase 4: Component Updates
**Goal:** Update all React components to use Convex hooks

**Component Categories:**
1. **Auth & Profile**
   - AuthWizard.tsx
   - ProfileManager.tsx
   - SettingsTab.tsx

2. **Social**
   - SocialFeed.tsx
   - Comments, reactions, follows
   - Search panel

3. **Bookings**
   - BookingSystem.tsx
   - StudioBookings.tsx
   - Calendar sync

4. **EDU**
   - EduLogin, dashboards
   - Roster, staff, partners

5. **Marketplace & Labels**
   - Marketplace listings
   - Label manager, rosters

### Phase 5: Cleanup
**Goal:** Remove all legacy database code

**Files to Delete:**
- `src/config/neon.ts`
- `src/config/neonQueries.ts`
- `src/config/mongodb.ts`
- `src/config/mongoSocial.ts`
- `src/config/mongoBroadcasts.ts`
- `src/config/mongoProfiles.ts`
- `api/_config/neon.js`
- All MongoDB API routes
- Supabase adapters (if still present)

**Packages to Remove:**
- `@neondatabase/serverless`
- `mongodb`
- `pg` (if present)
- Any other Postgres/Mongo clients

---

## Convex Schema Design

### Users Table
```typescript
users: defineTable({
  // Clerk integration
  clerkId: v.string(),
  email: v.string(),
  username: v.optional(v.string()),
  emailVerified: v.boolean(),

  // Profile data
  displayName: v.optional(v.string()),
  bio: v.optional(v.string()),
  headline: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  bannerUrl: v.optional(v.string()),
  location: v.optional(v.string()),
  website: v.optional(v.string()),

  // Role & account type
  accountTypes: v.array(v.string()),
  activeRole: v.optional(v.string()),
  skills: v.optional(v.array(v.string())),
  genres: v.optional(v.array(v.string())),
  instruments: v.optional(v.array(v.string())),

  // Stats
  stats: v.optional(v.object({
    followersCount: v.number(),
    followingCount: v.number(),
    postsCount: v.number(),
  })),

  // Settings
  settings: v.optional(v.object({
    privacy: v.string(),
    notificationsEnabled: v.boolean(),
  })),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  lastActiveAt: v.number(),
})
  .index("by_clerk_id", ["clerkId"])
  .index("by_username", ["username"])
  .index("by_email", ["email"])
```

### Posts Table
```typescript
posts: defineTable({
  // Author
  authorId: v.string(),
  authorName: v.optional(v.string()),
  authorPhoto: v.optional(v.string()),
  authorUsername: v.optional(v.string()),

  // Content
  content: v.optional(v.string()),
  mediaUrls: v.optional(v.array(v.string())),
  mediaType: v.optional(v.string()), // image, video, audio

  // Social metadata
  hashtags: v.optional(v.array(v.string())),
  mentions: v.optional(v.array(v.string())),
  category: v.optional(v.string()),
  visibility: v.string(), // public, followers, private

  // Engagement
  engagement: v.object({
    likesCount: v.number(),
    commentsCount: v.number(),
    repostsCount: v.number(),
    savesCount: v.number(),
  }),

  // Repost support
  repostOf: v.optional(v.id("posts")),

  // Soft delete
  deletedAt: v.optional(v.number()),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_author", ["authorId", "createdAt"])
  .index("by_created", ["createdAt"])
  .index("by_hashtag", ["hashtags"])
```

### Bookings Table
```typescript
bookings: defineTable({
  // Core data
  id: v.string(), // Keep old ID for compatibility
  studioId: v.string(),
  clientId: v.string(),

  // Booking details
  serviceType: v.optional(v.string()),
  date: v.optional(v.string()),
  time: v.optional(v.string()),
  duration: v.optional(v.number()),
  roomId: v.optional(v.string()),

  // Pricing
  offerAmount: v.optional(v.number()),
  status: v.string(), // Pending, Confirmed, Completed, Cancelled

  // EDU mode
  isClassBooking: v.optional(v.boolean()),
  className: v.optional(v.string()),
  professorName: v.optional(v.string()),

  // Flexible metadata (from MongoDB)
  metadata: v.optional(v.any()),

  // Messages
  message: v.optional(v.string()),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_studio", ["studioId", "date"])
  .index("by_client", ["clientId"])
  .index("by_status", ["status"])
```

### Schools Table
```typescript
schools: defineTable({
  // Basic info
  name: v.string(),
  code: v.string(), // Unique school code
  description: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
  location: v.optional(v.string()),

  // Administration
  adminId: v.string(),
  staffIds: v.array(v.id("users")),

  // Settings
  isActive: v.boolean(),
  settings: v.optional(v.any()),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_code", ["code"])
  .index("by_admin", ["adminId"])
```

---

## Migration Timeline

### Week 1: Planning & Schema Design
- Day 1-2: Analyze existing schemas, map relationships
- Day 3-4: Design Convex schema, create validation rules
- Day 5: Set up development environment, test schema

### Week 2: Core Data Migration
- Day 1-2: Migrate users and profiles
- Day 3-4: Migrate social features
- Day 5: Test social features end-to-end

### Week 3: Business Logic Migration
- Day 1-2: Migrate booking system
- Day 3-4: Migrate EDU features
- Day 5: Test business logic

### Week 4: API & Component Updates
- Day 1-2: Update API routes to Convex
- Day 3-4: Update React components
- Day 5: Integration testing

### Week 5: Cleanup & Deployment
- Day 1-2: Remove legacy code
- Day 3-4: Production data migration
- Day 5: Deploy to production

---

## Rollback Strategy

If issues arise during migration:
1. **Keep Neon/MongoDB running** during transition period
2. **Feature flags** to switch between databases
3. **Gradual rollout** by user segments
4. **Monitoring** for errors and performance
5. **Rollback script** to revert to old architecture

---

## Testing Strategy

### Unit Tests
- Convex function tests for all queries/mutations
- Validation tests for schema rules
- Migration script tests

### Integration Tests
- End-to-end user flows (auth, post, book)
- Cross-table relationship tests
- Real-time subscription tests

### Performance Tests
- Query performance benchmarks
- Index optimization
- Real-time update latency

---

## Risks & Mitigations

### Risk 1: Data Loss During Migration
**Mitigation:**
- Backup all databases before migration
- Test migration scripts on staging first
- Verify data counts before/after migration
- Keep read-only access to old databases for 30 days

### Risk 2: Downtime During Migration
**Mitigation:**
- Migrate data in phases
- Use dual-write during transition
- Schedule migration during low-traffic hours
- Have rollback plan ready

### Risk 3: Performance Degradation
**Mitigation:**
- Optimize indexes before migration
- Monitor query performance
- Use pagination for large datasets
- Cache frequently accessed data

### Risk 4: Real-time Features Breaking
**Mitigation:**
- Thoroughly test Convex subscriptions
- Monitor WebSocket connections
- Test presence indicators
- Verify message delivery

---

## Success Metrics

- [ ] All data migrated without loss
- [ ] All features working with Convex
- [ ] Zero Neon/MongoDB dependencies
- [ ] Performance benchmarks met
- [ ] Real-time features working
- [ ] No regression bugs reported
- [ ] Deployment successful

---

## Next Steps

1. Review and approve this migration plan
2. Set up development Convex project
3. Begin Phase 1: Schema Design
4. Create migration scripts
5. Start with users/profiles migration

**Contact:** For questions or blockers during migration, reach out to the development team.
