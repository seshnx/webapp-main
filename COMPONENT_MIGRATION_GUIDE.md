# Component Migration Guide: From Old APIs to Convex

## Overview

This guide shows how to update React components to use Convex instead of the old Neon/MongoDB/Supabase APIs.

## Quick Reference

### Before (Old API):
```typescript
import { getPosts, createPost } from '@/services/socialApi';

const posts = await getPosts();
await createPost({ content: 'Hello' });
```

### After (Convex):
```typescript
import { useFeed, useCreatePost } from '@/hooks/useConvex';

const posts = useFeed();
const createPost = useCreatePost();
await createPost.mutate({ content: 'Hello' });
```

---

## Migration Patterns

### 1. Posts Feed

#### Before:
```typescript
import { usePosts } from '@/hooks/useSocialQueries';

const { data: posts, isLoading, error } = usePosts();
```

#### After:
```typescript
import { useFeed } from '@/hooks/useConvex';

const posts = useFeed(20); // 20 = limit
// posts is undefined while loading, null if error, or the data array
```

**Loading State Pattern:**
```typescript
if (posts === undefined) return <div>Loading...</div>;
if (posts === null) return <div>Error loading posts</div>;
// Render posts
```

---

### 2. Creating Posts

#### Before:
```typescript
import { useCreatePost } from '@/hooks/useSocialQueries';

const createPost = useCreatePost();
await createPost.mutate({ content: 'Hello' });
```

#### After:
```typescript
import { useCreatePost } from '@/hooks/useConvex';

const createPost = useCreatePost();
await createPost({
  authorId: userId,
  content: 'Hello',
  visibility: 'public',
});
```

---

### 3. User Profiles

#### Before:
```typescript
import { getProfile } from '@/services/userApi';

const profile = await getProfile(userId);
```

#### After:
```typescript
import { useUserByClerkId } from '@/hooks/useConvex';

const profile = useUserByClerkId(clerkId);
```

---

### 4. Follow System

#### Before:
```typescript
import { useFollowUser } from '@/hooks/useFollowSystem';

const { follow, unfollow, isFollowing } = useFollowUser(userId, targetUserId);
```

#### After:
```typescript
import { useIsFollowing, useFollowUser, useUnfollowUser } from '@/hooks/useConvex';

const isFollowing = useIsFollowing(currentUserId, targetUserId);
const follow = useFollowUser();
const unfollow = useUnfollowUser();

// To follow:
await follow.mutate({ followerId: currentUserId, followingId: targetUserId });

// To unfollow:
await unfollow.mutate({ followerId: currentUserId, followingId: targetUserId });
```

---

### 5. Bookings

#### Before:
```typescript
import { getBookings, createBooking } from '@/services/bookingApi';

const bookings = await getBookings(studioId);
await createBooking({ studioId, date, time });
```

#### After:
```typescript
import { useBookingsByStudio, useCreateBooking } from '@/hooks/useConvex';

const bookings = useBookingsByStudio(studioId, 'confirmed');
const create = useCreateBooking();

await create({
  studioId,
  roomId,
  clientId: userId,
  clientName: userName,
  clientEmail: userEmail,
  date: '2024-03-17',
  startTime: '10:00',
  endTime: '12:00',
  totalAmount: 100,
  depositRequired: true,
  depositAmount: 20,
});
```

---

### 6. Comments

#### Before:
```typescript
import { useComments } from '@/hooks/useSocialQueries';

const { data: comments } = useComments(postId);
```

#### After:
```typescript
import { useComments } from '@/hooks/useConvex';

const comments = useComments(postId, 20);
```

---

### 7. Reactions

#### Before:
```typescript
import { useToggleReaction } from '@/hooks/useSocialQueries';

const toggleReaction = useToggleReaction();
await toggleReaction.mutate({ targetId, emoji, userId });
```

#### After:
```typescript
import { useToggleReaction } from '@/hooks/useConvex';

const toggleReaction = useToggleReaction();
await toggleReaction({
  targetId: postId,
  targetType: 'post',
  emoji: '❤️',
  userId: currentUserId,
});
```

---

### 8. Saved Posts

#### Before:
```typescript
import { useIsPostSaved, useSavePost, useUnsavePost } from '@/hooks/useSocialQueries';

const isSaved = useIsPostSaved(userId, postId);
const save = useSavePost();
const unsave = useUnsavePost();
```

#### After:
```typescript
import { useIsPostSaved, useSavePost, useUnsavePost } from '@/hooks/useConvex';

const isSaved = useIsPostSaved(userId, postId);
const save = useSavePost();
const unsave = useUnsavePost();

await save.mutate({ userId, postId });
await unsave.mutate({ userId, postId });
```

---

### 9. Marketplace

#### Before:
```typescript
import { searchMarketItems } from '@/services/marketApi';

const items = await searchMarketItems({ category: 'guitars' });
```

#### After:
```typescript
import { useMarketItems } from '@/hooks/useConvex';

const items = useMarketItems({
  category: 'guitars',
  condition: 'good',
  minPrice: 100,
  maxPrice: 1000,
  limit: 50,
});
```

---

### 10. Broadcasts (EDU)

#### Before:
```typescript
import { getAnnouncements } from '@/services/eduApi';

const announcements = await getAnnouncements(schoolId);
```

#### After:
```typescript
import { useBroadcasts, useUnreadBroadcasts } from '@/hooks/useConvex';

const broadcasts = useBroadcasts(schoolId, 'published');
const unread = useUnreadBroadcasts(userId, schoolId, 'student');
```

---

## Key Differences

### 1. Loading States

**Old API (React Query):**
```typescript
const { data, isLoading, error } = useQuery();
if (isLoading) return <Loading />;
if (error) return <Error />;
```

**Convex:**
```typescript
const data = useQuery();
if (data === undefined) return <Loading />;
if (data === null) return <Error />;
```

### 2. Mutations

**Old API:**
```typescript
const mutation = useMutation();
mutation.mutate(args);
```

**Convex:**
```typescript
const mutation = useMutation();
await mutation(args); // Direct await
```

### 3. Data Access

**Old API:**
```typescript
posts.map(post => post.id)
```

**Convex:**
```typescript
posts.map(post => post._id) // Convex uses _id
```

---

## Component Update Checklist

For each component that imports from old APIs:

1. ✅ Replace old API imports with `@/hooks/useConvex`
2. ✅ Update query function names to match Convex
3. ✅ Update mutation calls to use Convex parameter names
4. ✅ Update loading state checks (undefined/null pattern)
5. ✅ Update ID field names (`id` → `_id`)
6. ✅ Test the component
7. ✅ Remove old API imports

---

## Common Import Replacements

### Remove these imports:
```typescript
import { getProfilesByIds } from '@/config/neonQueries';
import { usePosts, useCreatePost } from '@/hooks/useSocialQueries';
import { getPosts, createPost } from '@/services/socialApi';
import { supabase } from '@/config/supabaseClient';
```

### Replace with:
```typescript
import {
  useFeed,
  useCreatePost,
  useUserByClerkId
} from '@/hooks/useConvex';
```

---

## Step-by-Step Migration

1. **Install the new hooks file** (already created at `@/hooks/useConvex`)

2. **Update one component at a time**:
   - Start with simpler components
   - Test each component before moving to the next

3. **Priority components to migrate**:
   - ✅ SocialFeed.tsx
   - ✅ TalentSearch.tsx
   - ✅ ProfileManager.tsx
   - ✅ BookingSystem.tsx
   - ✅ EDU components

4. **Components to verify** (38 files identified):
   - All components importing from `@/config/neonQueries`
   - All components importing from `@/services/*`
   - All components using `supabase` directly

---

## Next Steps

1. Start migrating components systematically
2. Test each migrated component
3. Remove old API files once all components are updated
4. Update API routes if needed
5. Remove old database dependencies from package.json

---

## Getting Help

- Refer to `USING_SOCIAL_FUNCTIONS.md` for Convex API details
- Refer to `USING_USER_FUNCTIONS.md` for user management
- Refer to `USING_BOOKING_FUNCTIONS.md` for booking system
- Refer to `USING_MARKETPLACE_FUNCTIONS.md` for marketplace
- Refer to `USING_EDU_FUNCTIONS.md` for education features
- Refer to `USING_BROADCAST_FUNCTIONS.md` for announcements
