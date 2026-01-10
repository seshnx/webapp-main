# Phase 3: Social Core Migration Plan

## Objective
Migrate social feed features from Supabase to Neon (queries) + Convex (real-time), and replace Supabase Storage with Vercel Blob.

## Components to Migrate

### 1. SocialFeed.jsx (531 lines) ⚠️ HIGH PRIORITY
**Current Implementation:**
- Queries: `supabase.from('posts').select('*')`
- Real-time: `supabase.channel().on('postgres_changes', ...)`
- Inserts: `supabase.from('posts').insert(...)`
- Filters by `followingIds` from useFollowSystem hook

**Migration Required:**
- Replace post queries with Neon queries (`getPosts()`)
- Replace real-time subscription with Convex `useQuery(api.posts.listRecent)`
- Replace post insert with Neon (`createPost()`)
- Keep useFollowSystem hook (needs separate migration)

**Code Changes:**
```javascript
// BEFORE
const { data: posts } = await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(20);

const channel = supabase
  .channel('posts-feed')
  .on('postgres_changes', { event: 'INSERT', table: 'posts' }, callback)
  .subscribe();

// AFTER
import { getPosts, createPost } from '../../config/neonQueries';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Initial fetch
const posts = await getPosts({ limit: 20 });

// Real-time updates via Convex
const realtimePosts = useQuery(api.posts.listRecent, { count: 20 });
```

---

### 2. PostCard.jsx (564 lines) ⚠️ HIGH PRIORITY
**Current Implementation:**
- Queries: None (receives post data as props)
- Real-time: Listens for reaction/comment updates
- Updates: `supabase.from('post_reactions').insert()`
- Updates: `supabase.from('post_saves').insert()`

**Migration Required:**
- Replace reaction inserts with Neon (`createPostReaction()`)
- Replace save inserts with Neon (`savePost()`)
- Replace comment queries with Neon (delegates to CommentSection)
- Real-time updates for reactions via Convex

**Code Changes:**
```javascript
// BEFORE
const { error } = await supabase
  .from('post_reactions')
  .insert({ post_id: postId, user_id: userId, type: reactionType });

// AFTER
import { createPostReaction, removePostReaction, savePost } from '../../config/neonQueries';
await createPostReaction(postId, userId, reactionType);
```

---

### 3. CreatePostWidget.jsx (232 lines) ⚠️ HIGH PRIORITY
**Current Implementation:**
- File Uploads: `useMediaUpload()` hook (Supabase Storage)
- Post Creation: Delegates to parent (SocialFeed)
- Media Types: Images, videos, audio

**Migration Required:**
- Replace `useMediaUpload()` with `useVercelUpload()`
- Update file paths to use Vercel Blob URLs
- Keep post creation logic (handled by SocialFeed)

**Code Changes:**
```javascript
// BEFORE
import { useMediaUpload } from '../../hooks/useMediaUpload';
const { uploadMedia, uploading } = useMediaUpload();
const url = await uploadMedia(file, 'post-media');

// AFTER
import { useVercelUpload } from '../../hooks/useVercelUpload';
const { uploadMedia, uploading } = useVercelUpload('post-media');
const url = await uploadMedia(file);
```

---

### 4. CommentSection.jsx
**Current Implementation:**
- Queries: `supabase.from('comments').select('*')`
- Real-time: `supabase.channel().on('postgres_changes', ...)`
- Inserts: `supabase.from('comments').insert()`
- Updates: `supabase.from('comments').update()`

**Migration Required:**
- Replace comment queries with Neon (`getCommentsByPostId()`)
- Replace real-time with Convex (`useQuery(api.comments.listByPost)`)
- Replace inserts with Neon (`createComment()`)
- Replace updates with Neon (`updateComment()`)
- Replace deletes with Neon (`deleteComment()`)

---

### 5. FollowButton.jsx
**Current Implementation:**
- Queries: Delegates to `useFollowSystem` hook
- State: Managed by `useFollowSystem` hook
- Updates: `supabase.from('following').insert()` / `.delete()`

**Migration Required:**
- **Migrate `useFollowSystem` hook** (separate task)
- Update hook to use Neon queries
- Replace `following` table queries

**Note**: FollowButton itself doesn't need changes, but the `useFollowSystem` hook does.

---

### 6. FollowersListModal.jsx
**Current Implementation:**
- Queries: `supabase.from('following').select('*')`
- Queries: `supabase.from('followers').select('*')`
- Real-time: Listens for follow changes

**Migration Required:**
- Replace queries with Neon (`getFollowing()`, `getFollowers()`)
- Replace real-time with Convex or polling
- Update profile fetching to use Neon

---

### 7. NotificationsPanel.jsx
**Current Implementation:**
- Queries: `supabase.from('notifications').select('*')`
- Real-time: `supabase.channel().on('postgres_changes', ...)`
- Updates: Mark as read: `supabase.from('notifications').update()`

**Migration Required:**
- Replace queries with Neon (`getNotificationsByUserId()`)
- Replace real-time with Convex (`useQuery(api.notifications.listUnread)`)
- Replace updates with Neon (`markNotificationAsRead()`)
- Replace mark all as read with Neon (`markAllNotificationsAsRead()`)

---

## Hooks to Migrate

### useFollowSystem.js
**Current Implementation:**
- Queries: `supabase.from('following').select('*')`
- State: Manages following/followers lists
- Actions: Follow/Unfollow users

**Migration Required:**
```javascript
// BEFORE
const { data } = await supabase
  .from('following')
  .select('*')
  .eq('follower_id', userId);

await supabase.from('following').insert({
  follower_id: userId,
  following_id: targetUserId
});

// AFTER
import { getFollowing, followUser, unfollowUser } from '../config/neonQueries';
const following = await getFollowing(userId);
await followUser(userId, targetUserId);
```

### useNotifications.js
**Current Implementation:**
- Queries: `supabase.from('notifications').select('*')`
- Real-time: Subscribes to notification changes
- Actions: Mark as read, create notifications

**Migration Required:**
- Replace with Neon queries + Convex real-time
- Similar pattern to notifications panel

---

## Database Migration

### Add Tables to Neon
The following tables need to exist in Neon (check if already in schema):

1. **posts**
   - id, user_id, display_name, author_photo, role
   - text/content, media_urls, media_type
   - reactions, reaction_count, comment_count, save_count
   - visibility, created_at, updated_at, deleted_at

2. **post_reactions**
   - id, post_id, user_id, type, created_at

3. **post_saves**
   - id, post_id, user_id, created_at

4. **comments**
   - id, post_id, user_id, parent_id, content
   - created_at, updated_at, deleted_at

5. **following**
   - follower_id, following_id, created_at

6. **notifications**
   - id, user_id, type, title, message
   - reference_type, reference_id, metadata
   - read, read_at, created_at

---

## Convex Integration

### Real-time Features via Convex

**Why Convex?**
- Supabase real-time (`postgres_changes`) is being removed
- Convex provides excellent real-time capabilities
- Already configured in the project

**Convex Functions to Create:**

```javascript
// convex/posts.ts
import { mutation, query } from './_generated/server';

// Query recent posts
export const listRecent = query({
  args: { count: v.number() },
  handler: async (ctx, args) => {
    // Fetch from Neon or use Convex database
    // For now, return empty or integrate via HTTP
    return [];
  }
});

// For true real-time, consider:
// 1. Using Convex for posts storage (full migration)
// 2. Or using Convex webhooks to sync from Neon
// 3. Or polling as fallback
```

**Migration Strategy:**
1. **Phase 3A**: Migrate queries to Neon, remove Supabase real-time (use polling)
2. **Phase 3B**: Add Convex real-time layer (optional but recommended)

---

## File Upload Migration

### Replace Supabase Storage with Vercel Blob

**Current Upload Locations:**
- Post media: `post-media/` folder
- Profile photos: `profile-photos/` (already migrated in Phase 2)
- Comment attachments: `comment-attachments/`

**Migration Pattern:**
```javascript
// BEFORE (useMediaUpload hook)
import { supabase } from '../config/supabase';
const { data } = await supabase.storage
  .from('media')
  .upload(`post-media/${filename}`, file);
const url = `${SUPABASE_URL}/storage/v1/object/public/media/${data.path}`;

// AFTER (useVercelUpload hook)
import { upload } from '@vercel/blob/client';
const blob = await upload(file, { access: 'public' });
const url = blob.url;
```

---

## Testing Checklist

### Social Feed
- [ ] Feed loads without errors
- [ ] Posts display correctly
- [ ] Can create new post
- [ ] Can view post details
- [ ] Media uploads work

### Interactions
- [ ] Can like/unlike posts
- [ ] Can save posts
- [ ] Can comment on posts
- [ ] Can view comments
- [ ] Can delete own comments

### Follow System
- [ ] Can follow/unfollow users
- [ ] Following count updates
- [ ] Follower count updates
- [ ] Follow/following lists load

### Notifications
- [ ] Notifications load
- [ ] New notifications appear
- [ ] Can mark as read
- [ ] Can mark all as read

---

## Estimated Complexity

| Component | Lines | Complexity | Time Estimate |
|-----------|-------|------------|---------------|
| SocialFeed.jsx | 531 | High | 4-6 hours |
| PostCard.jsx | 564 | Medium | 3-4 hours |
| CreatePostWidget.jsx | 232 | Low | 2-3 hours |
| CommentSection.jsx | ~300 | Medium | 3-4 hours |
| useFollowSystem.js | ~200 | Medium | 2-3 hours |
| FollowersListModal.jsx | ~400 | Medium | 3-4 hours |
| NotificationsPanel.jsx | ~300 | Medium | 3-4 hours |
| **Total** | **~2500** | **High** | **20-28 hours** |

---

## Rollback Plan

If issues arise:
1. Revert to backup commits before Phase 3
2. Restore Supabase social functionality
3. Keep Phase 2 (auth/profiles) on Neon/Clerk

**Backup files to create:**
- `src/components/SocialFeed.supabase.backup.jsx`
- `src/components/PostCard.supabase.backup.jsx`
- `src/components/CreatePostWidget.supabase.backup.jsx`
- `src/hooks/useFollowSystem.supabase.backup.js`

---

## Next Steps

1. ✅ Wait for current deployment to succeed
2. ⏳ Create backup files
3. ⏳ Start with CreatePostWidget.jsx (easiest)
4. ⏳ Migrate CommentSection.jsx
5. ⏳ Migrate PostCard.jsx
6. ⏳ Migrate SocialFeed.jsx (largest)
7. ⏳ Migrate useFollowSystem hook
8. ⏳ Migrate FollowersListModal.jsx
9. ⏳ Migrate NotificationsPanel.jsx
10. ⏳ End-to-end testing
