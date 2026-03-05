# MongoDB Social Media Migration Guide

## Overview

This document describes the migration of all social media features from Neon (PostgreSQL) to MongoDB. This migration provides unlimited flexibility for social features without requiring SQL schema migrations.

## What Changed

### Before (Neon + Convex)
- **Neon (PostgreSQL)**: Posts, comments, reactions, follows, saved posts, social notifications
- **Convex**: Real-time sync from Neon
- Schema changes required SQL migrations

### After (MongoDB + Convex)
- **MongoDB**: ALL social media features (posts, comments, reactions, follows, saved posts, notifications)
- **Neon**: Only legal/financial data (users, addresses, payments, bookings, audit trail)
- **Convex**: Real-time sync from MongoDB (for presence, typing, sessions)

## New Files Created

### 1. MongoDB Social Types
**File**: `src/types/mongoSocial.ts`
- TypeScript types for all MongoDB social collections
- Posts, comments, reactions, follows, saved posts, notifications
- User blocks, content reports, post metrics

### 2. MongoDB Social Queries
**File**: `src/config/mongoSocial.ts`
- All CRUD operations for social features
- Replaces Neon social queries
- Functions: `getPosts`, `createPost`, `toggleReaction`, `followUser`, etc.

### 3. Migration Scripts
**Files**:
- `scripts/migrate-social-to-mongodb.js` - Migrates data from Neon to MongoDB
- `scripts/verify-mongo-migration.js` - Verifies migration by comparing counts

### 4. Updated MongoDB Configuration
**File**: `src/config/mongodb.ts`
- Added social collection names (POSTS, COMMENTS, REACTIONS, etc.)
- Added indexes for all social collections
- Updated documentation

### 5. Updated Hooks
**Files**:
- `src/hooks/useFollowSystem.ts` - Now uses MongoDB instead of Neon
- `src/hooks/useSavedPosts.ts` - Now uses MongoDB instead of Neon

### 6. Updated Convex Files
**Files**:
- `convex/comments.ts` - Updated comments to reference MongoDB as source
- `convex/reactions.ts` - Updated reactions to reference MongoDB as source

## MongoDB Collections

### Social Collections
```javascript
{
  POSTS: 'posts',                    // Social media posts
  COMMENTS: 'comments',              // Post comments
  REACTIONS: 'reactions',            // Likes and emoji reactions
  FOLLOWS: 'follows',                // Social relationships
  SAVED_POSTS: 'saved_posts',        // User bookmarks
  SOCIAL_NOTIFICATIONS: 'social_notifications', // Social alerts
  USER_BLOCKS: 'user_blocks',        // Blocking/muting
  CONTENT_REPORTS: 'content_reports', // Moderation
  POST_METRICS: 'post_metrics',      // Analytics
}
```

### Collection Schemas

#### Posts
```typescript
{
  id: string;                        // UUID
  author_id: string;
  content: string;
  media_urls: string[];
  hashtags: string[];
  mentions: string[];
  category: string;
  visibility: 'public' | 'followers' | 'private';
  parent_id: string | null;          // For replies/reposts
  repost_of: string | null;
  engagement: {
    likes_count: number;
    comments_count: number;
    reposts_count: number;
    saves_count: number;
  };
  metadata: {
    equipment?: any[];
    software?: any[];
    custom_fields?: Record<string, any>;
  };
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
```

#### Comments
```typescript
{
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;          // For nested replies
  reactions: { emoji: string; user_ids: string[] }[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
```

#### Reactions
```typescript
{
  target_id: string;                 // post or comment ID
  target_type: 'post' | 'comment';
  emoji: string;
  user_id: string;
  created_at: Date;
}
```

#### Follows
```typescript
{
  follower_id: string;
  following_id: string;
  created_at: Date;
}
```

## Migration Steps

### 1. Prepare MongoDB
```bash
# Ensure MongoDB is configured
# Check .env for VITE_MONGODB_CONNECTION_STRING
```

### 2. Run Migration
```bash
# Run the migration script
npm run migrate-social-to-mongodb

# Or directly with node
node scripts/migrate-social-to-mongodb.js
```

### 3. Verify Migration
```bash
# Verify data integrity
npm run verify-mongo-migration

# Or directly with node
node scripts/verify-mongo-migration.js
```

### 4. Update Application Code
The following files have been updated:
- ✅ `src/types/mongoSocial.ts` - New types
- ✅ `src/config/mongoSocial.ts` - New queries
- ✅ `src/config/mongodb.ts` - Updated collections and indexes
- ✅ `src/hooks/useFollowSystem.ts` - Updated to use MongoDB
- ✅ `src/hooks/useSavedPosts.ts` - Updated to use MongoDB
- ✅ `convex/comments.ts` - Updated comments
- ✅ `convex/reactions.ts` - Updated reactions

### 5. Deploy and Monitor
```bash
# Deploy to production
npm run build:vercel

# Monitor for issues
# Check logs for any MongoDB connection errors
```

## Rollback Plan

If migration fails or issues arise:

1. **Code Rollback**: Revert to previous commit
2. **Data Rollback**: Neon tables still exist (30-day backup)
3. **MongoDB**: Can be cleared if needed

```sql
-- To drop MongoDB collections (if needed)
db.posts.drop()
db.comments.drop()
db.reactions.drop()
db.follows.drop()
db.saved_posts.drop()
db.social_notifications.drop()
```

## Testing Checklist

### Posts
- [ ] Create post
- [ ] View feed
- [ ] Edit post
- [ ] Delete post
- [ ] View post with hashtags
- [ ] View post with mentions

### Comments
- [ ] Add comment
- [ ] Reply to comment
- [ ] Edit comment
- [ ] Delete comment
- [ ] View comment count

### Reactions
- [ ] Like post
- [ ] Unlike post
- [ ] React with emoji
- [ ] View reaction counts
- [ ] Multiple reactions on same post

### Follows
- [ ] Follow user
- [ ] Unfollow user
- [ ] View followers count
- [ ] View following count
- [ ] View followers list
- [ ] View following list

### Saved Posts
- [ ] Save post
- [ ] Unsave post
- [ ] View saved posts
- [ ] Check if post is saved

### Notifications
- [ ] Receive follow notification
- [ ] Receive like notification
- [ ] Receive comment notification
- [ ] Receive mention notification
- [ ] Mark as read
- [ ] Mark all as read

## Performance Considerations

### Indexes
All collections have proper indexes:
- Posts: `id`, `author_id`, `hashtags`, `mentions`, `category`
- Comments: `post_id`, `parent_id`, `author_id`
- Reactions: `target_id`, `target_type`, `user_id`
- Follows: `follower_id`, `following_id`
- Saved posts: `user_id`, `post_id`
- Notifications: `user_id`, `read`, `actor_id`

### Query Optimization
- Use `limit` parameter for pagination
- Filter by `deleted_at: null` to exclude soft-deleted items
- Use aggregation for complex queries

## Troubleshooting

### MongoDB Connection Issues
```typescript
// Check if MongoDB is available
import { isMongoDbAvailable } from './config/mongodb';

if (!isMongoDbAvailable()) {
  console.warn('MongoDB not available - features disabled');
}
```

### Migration Errors
- Check Neon connection string
- Check MongoDB connection string
- Verify database exists
- Check permissions

### Data Inconsistencies
- Run verification script
- Compare counts between Neon and MongoDB
- Check logs for specific errors

## Neon Tables (Deprecated)

The following Neon tables are now deprecated but kept for 30-day backup:

```sql
-- Deprecated tables (DO NOT USE)
posts
comments
reactions
follows
saved_posts
social_notifications

-- These can be dropped after 30-day verification period
```

## Future Enhancements

### Post-Migration
1. Add post metrics/analytics
2. Implement content moderation
3. Add user blocking functionality
4. Create content reporting system
5. Add trending content features

### MongoDB Change Streams
Consider using MongoDB change streams for real-time updates:
```typescript
// Watch for changes in posts collection
const changeStream = mongoDb.collection('posts').watch();

changeStream.on('change', (change) => {
  // Sync to Convex for real-time updates
});
```

## Support

For issues or questions:
1. Check this guide
2. Review migration logs
3. Run verification script
4. Check MongoDB and Neon connection strings
5. Review application logs

## Migration Complete! 🎉

Once migration is complete and verified, all social features will be powered by MongoDB with unlimited flexibility for future enhancements.
