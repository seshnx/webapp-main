# React Query Integration Guide

## What Changed

We've replaced manual API calls and polling with **React Query** (`@tanstack/react-query`). This provides:

- ✅ **Automatic caching** - No more manual state management
- ✅ **Smart refetching** - Data stays fresh automatically
- ✅ **Optimistic updates** - UI feels instant
- ✅ **Loading/error states** - Built-in handling
- ✅ **Better performance** - Deduplication and background updates
- ✅ **Type safety** - Better TypeScript support

## Before vs After

### BEFORE (Manual API calls + polling)
```typescript
const [posts, setPosts] = useState<Post[]>([]);
const [loading, setLoading] = useState<boolean>(true);

useEffect(() => {
  const loadFeed = async () => {
    try {
      const response = await getPosts({ limit: 20 });
      setPosts(response.posts || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  loadFeed();

  // Manual polling every 30 seconds
  const pollInterval = setInterval(() => {
    loadFeed();
  }, 30000);

  return () => clearInterval(pollInterval);
}, []);
```

### AFTER (React Query)
```typescript
const {
  data: posts = [],
  isLoading,
  error,
  refetch
} = usePosts({}, 20);

// Automatic refetching, caching, and error handling!
// No manual polling needed.
```

## How to Use in Your Components

### 1. **Basic Data Fetching**

```typescript
import { usePosts, useComments } from '@/hooks/useSocialQueries';

function MyComponent() {
  // Automatic loading, error handling, and caching
  const { data: posts, isLoading, error } = usePosts();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
```

### 2. **Creating Data with Optimistic Updates**

```typescript
import { useCreatePost } from '@/hooks/useSocialQueries';

function CreatePostForm() {
  const createPost = useCreatePost();

  const handleSubmit = (text: string) => {
    // Optimistic updates - UI updates instantly!
    createPost.mutate({
      author_id: userId,
      text: text,
      media_urls: [],
      visibility: 'public'
    });
  };

  return <button onClick={() => handleSubmit('Hello!')}>Post</button>;
}
```

### 3. **Real-time Updates**

```typescript
// Posts automatically refresh every 30 seconds
const { data: posts } = usePosts({}, 20);

// Or disable auto-refresh and manual control
const { data: posts, refetch } = usePosts({}, 20, false);

<button onClick={() => refetch()}>Refresh</button>
```

### 4. **Infinite Scroll (Better Performance)**

```typescript
import { useInfinitePosts } from '@/hooks/useSocialQueries';

function InfiniteFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfinitePosts({}, 20);

  return (
    <div>
      {data.pages.map((page, i) => (
        <div key={i}>
          {page.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      ))}

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

## Available Hooks

### Posts
- `usePosts(filters?, limit?, enabled?)` - Get posts with pagination
- `useInfinitePosts(filters?, limit?)` - Infinite scroll for posts
- `useCreatePost()` - Create new post with optimistic updates
- `useUpdatePost()` - Update existing post
- `useDeletePost()` - Delete post with optimistic updates

### Comments
- `useComments(postId, enabled?)` - Get comments for a post
- `useCreateComment()` - Create comment
- `useDeleteComment()` - Delete comment
- `useUpdateComment()` - Update comment

### Reactions
- `useReactions(targetId, targetType)` - Get reactions
- `useToggleReaction()` - Toggle like/emoji

### Follows
- `useFollowers(userId)` - Get followers
- `useFollowing(userId)` - Get following
- `useFollowUser()` - Follow user
- `useUnfollowUser()` - Unfollow user

### Saved Posts
- `useSavedPosts(userId)` - Get saved posts
- `useIsPostSaved(userId, postId)` - Check if post is saved
- `useSavePost()` - Save post
- `useUnsavePost()` - Unsave post

## Migration Tips

### Replace Manual State
```typescript
// BEFORE
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

// AFTER
const { data = [], isLoading } = useQuery();
```

### Replace Manual Polling
```typescript
// BEFORE
useEffect(() => {
  const interval = setInterval(() => fetchData(), 30000);
  return () => clearInterval(interval);
}, []);

// AFTER (automatic with React Query)
const { data } = useQuery(); // Auto-refreshes every 30s
```

### Replace Error Handling
```typescript
// BEFORE
try {
  const result = await apiCall();
} catch (error) {
  console.error(error);
  setError(error.message);
}

// AFTER (built-in error handling)
const { data, error } = useQuery();
if (error) {
  return <div>Error: {error.message}</div>;
}
```

## Performance Benefits

1. **Automatic Caching**: Same data isn't fetched multiple times
2. **Smart Refetching**: Only refetches when data is stale
3. **Optimistic Updates**: UI updates instantly without waiting for server
4. **Background Updates**: Data refreshes in background without blocking UI
5. **Deduplication**: Multiple components requesting same data only fetch once

## Example Component

See `src/components/SocialFeed.tsx` for a complete example of React Query in action.

## Next Steps

1. Replace other manual API calls with React Query hooks
2. Add more social hooks to `useSocialQueries.ts`
3. Replace follow system polling with React Query
4. Add React Query DevTools for debugging

```bash
npm install @tanstack/react-query-devtools
```

Then add to `App.tsx`:
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  {/* ... your app ... */}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```