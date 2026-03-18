# Using Convex Social Functions in React Components

Examples of how to use posts, comments, reactions, and saved posts features.

---

## 1. Social Feed Component

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

function SocialFeed({ userId }: { userId: string }) {
  // Get feed posts
  const feed = useQuery(api.social.getFeed, { limit: 20 });
  const createPost = useMutation(api.social.createPost);
  const toggleReaction = useMutation(api.social.toggleReaction);

  // New post form
  const [newPostContent, setNewPostContent] = useState('');

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    await createPost({
      authorId: userId,
      content: newPostContent,
      visibility: 'public',
    });

    setNewPostContent('');
  };

  return (
    <div className="social-feed">
      {/* Create Post */}
      <div className="create-post">
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="What's on your mind?"
        />
        <button onClick={handleCreatePost}>Post</button>
      </div>

      {/* Feed */}
      <div className="feed">
        {feed?.map((post) => (
          <PostCard key={post._id} post={post} currentUserId={userId} />
        ))}
      </div>
    </div>
  );
}

// Post Card Component
function PostCard({ post, currentUserId }: {
  post: any;
  currentUserId: string;
}) {
  const comments = useQuery(api.social.getCommentsByPost, {
    postId: post._id,
    limit: 5,
  });

  const toggleReaction = useMutation(api.social.toggleReaction);
  const [userReaction, setUserReaction] = useState<string | null>(null);

  const handleLike = async () => {
    const result = await toggleReaction({
      targetId: post._id,
      targetType: 'post',
      emoji: '❤️',
      userId: currentUserId,
    });

    if (result.action === 'added') {
      setUserReaction('❤️');
    } else {
      setUserReaction(null);
    }
  };

  return (
    <div className="post-card">
      {/* Author Info */}
      <div className="post-header">
        <img src={post.authorPhoto || '/avatar.png'} alt={post.authorName} />
        <div>
          <h4>{post.authorName}</h4>
          <span>@{post.authorUsername}</span>
          {post.role && <span className="role">{post.role}</span>}
        </div>
      </div>

      {/* Content */}
      <p>{post.content}</p>

      {/* Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="post-media">
          {post.mediaUrls.map((url, index) => (
            <img key={index} src={url} alt="Post media" />
          ))}
        </div>
      )}

      {/* Tags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="hashtags">
          {post.hashtags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      )}

      {/* Engagement Stats */}
      <div className="engagement">
        <span>{post.engagement?.likesCount || 0} likes</span>
        <span>{post.engagement?.commentsCount || 0} comments</span>
        <span>{post.engagement?.repostsCount || 0} reposts</span>
      </div>

      {/* Actions */}
      <div className="actions">
        <button onClick={handleLike}>
          {userReaction ? '❤️' : '🤍'} Like
        </button>
        <button>💬 Comment</button>
        <button>🔄 Repost</button>
        <BookmarkButton postId={post._id} userId={currentUserId} />
      </div>

      {/* Comments */}
      <div className="comments">
        {comments?.map((comment) => (
          <Comment key={comment._id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
```

---

## 2. Comment System

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

function CommentSection({ postId, userId }: {
  postId: string;
  userId: string;
}) {
  const comments = useQuery(api.social.getCommentsByPost, {
    postId,
    limit: 20,
  });

  const createComment = useMutation(api.social.createComment);
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    await createComment({
      postId,
      authorId: userId,
      content: newComment,
    });

    setNewComment('');
  };

  return (
    <div className="comment-section">
      <h3>Comments ({comments?.length || 0})</h3>

      {/* Comment Form */}
      <div className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
        />
        <button onClick={handleSubmitComment}>Comment</button>
      </div>

      {/* Comments List */}
      <div className="comments-list">
        {comments?.map((comment) => (
          <Comment key={comment._id} comment={comment} />
        ))}
      </div>
    </div>
  );
}

function Comment({ comment }: { comment: any }) {
  return (
    <div className="comment">
      <img src={comment.authorPhoto || '/avatar.png'} alt={comment.authorName} />
      <div className="comment-content">
        <div className="comment-header">
          <strong>{comment.authorName}</strong>
          <span className="timestamp">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>
        <p>{comment.content}</p>
      </div>
    </div>
  );
}
```

---

## 3. Reaction System (Likes & Emojis)

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function ReactionBar({ post, userId }: {
  post: any;
  userId: string;
}) {
  const reactions = useQuery(api.social.getReactions, {
    targetId: post._id,
    targetType: 'post',
  });

  const summary = useQuery(api.social.getReactionSummary, {
    targetId: post._id,
    targetType: 'post',
  });

  const userReaction = useQuery(api.social.getUserReaction, {
    targetId: post._id,
    targetType: 'post',
    userId,
  });

  const toggleReaction = useMutation(api.social.toggleReaction);

  const emojis = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

  const handleReaction = async (emoji: string) => {
    await toggleReaction({
      targetId: post._id,
      targetType: 'post',
      emoji,
      userId,
    });
  };

  return (
    <div className="reaction-bar">
      {/* Emoji Picker */}
      <div className="emoji-picker">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className={userReaction?.emoji === emoji ? 'active' : ''}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Reaction Summary */}
      {summary && Object.keys(summary).length > 0 && (
        <div className="reaction-summary">
          {Object.entries(summary).map(([emoji, data]) => (
            <span key={emoji}>
              {emoji} {data.count}
            </span>
          ))}
        </div>
      )}

      {/* Total Count */}
      <span className="total-reactions">
        {reactions?.length || 0} reactions
      </span>
    </div>
  );
}
```

---

## 4. Save/Bookmark Posts

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function BookmarkButton({ postId, userId }: {
  postId: string;
  userId: string;
}) {
  const isSaved = useQuery(api.social.isPostSaved, {
    userId,
    postId,
  });

  const savePost = useMutation(api.social.savePost);
  const unsavePost = useMutation(api.social.unsavePost);

  const handleToggleSave = async () => {
    if (isSaved) {
      await unsavePost({ userId, postId });
    } else {
      await savePost({ userId, postId });
    }
  };

  return (
    <button
      onClick={handleToggleSave}
      className={isSaved ? 'saved' : ''}
      title={isSaved ? 'Remove from saved' : 'Save post'}
    >
      {isSaved ? '🔖' : '📑'}
      {isSaved ? 'Saved' : 'Save'}
    </button>
  );
}

// Saved Posts Page
function SavedPostsPage({ userId }: { userId: string }) {
  const savedPosts = useQuery(api.social.getSavedPosts, {
    userId,
    limit: 50,
  });

  return (
    <div className="saved-posts">
      <h1>Saved Posts</h1>

      <div className="posts-grid">
        {savedPosts?.map((post) => (
          <PostCard key={post._id} post={post} currentUserId={userId} />
        ))}
      </div>

      {savedPosts?.length === 0 && (
        <p>No saved posts yet</p>
      )}
    </div>
  );
}
```

---

## 5. Create Post with Media

```typescript
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

function CreatePostForm({ userId }: { userId: string }) {
  const createPost = useMutation(api.social.createPost);

  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [visibility, setVisibility] = useState('public');

  const handleMediaUpload = async (files: FileList) => {
    // Upload files to Vercel Blob or similar
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      // Your upload logic here
      // const url = await uploadToBlob(file);
      // uploadedUrls.push(url);
    }

    setMediaUrls([...mediaUrls, ...uploadedUrls]);
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaUrls.length === 0) return;

    await createPost({
      authorId: userId,
      content: content || undefined,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      category: category || undefined,
      visibility: visibility as any,
    });

    // Reset form
    setContent('');
    setMediaUrls([]);
    setCategory('');
    setVisibility('public');
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening?"
        rows={3}
      />

      {/* Media Upload */}
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => {
          if (e.target.files) {
            handleMediaUpload(e.target.files);
          }
        }}
      />

      {/* Preview uploaded media */}
      {mediaUrls.length > 0 && (
        <div className="media-preview">
          {mediaUrls.map((url, index) => (
            <img key={index} src={url} alt="Upload preview" />
          ))}
        </div>
      )}

      {/* Category */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Select category</option>
        <option value="Music">Music</option>
        <option value="Studio">Studio</option>
        <option value="Gear">Gear</option>
        <option value="Software">Software</option>
      </select>

      {/* Visibility */}
      <select
        value={visibility}
        onChange={(e) => setVisibility(e.target.value)}
      >
        <option value="public">Public</option>
        <option value="followers">Followers Only</option>
        <option value="private">Private</option>
      </select>

      <button type="submit">Post</button>
    </form>
  );
}
```

---

## 6. User Profile with Posts

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

function ProfileWithPosts({ userId }: { userId: string }) {
  // Get user info
  const user = useQuery(api.users.getUserByClerkId, {
    clerkId: userId,
  });

  // Get user's posts
  const posts = useQuery(api.social.getPostsByAuthor, {
    authorId: user?._id,
    limit: 20,
  });

  if (user === undefined) return <div>Loading...</div>;
  if (user === null) return <div>User not found</div>;

  return (
    <div className="profile-with-posts">
      {/* Profile Header */}
      <div className="profile-header">
        <img src={user.avatarUrl || '/avatar.png'} alt={user.displayName} />
        <div>
          <h1>{user.displayName}</h1>
          <p>@{user.username}</p>
          <p>{user.bio}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <span>{user.stats?.postsCount || 0} Posts</span>
        <span>{user.stats?.followersCount || 0} Followers</span>
        <span>{user.stats?.followingCount || 0} Following</span>
      </div>

      {/* Posts Grid */}
      <div className="posts-grid">
        <h2>Posts ({posts?.length || 0})</h2>
        {posts?.map((post) => (
          <PostCard key={post._id} post={post} currentUserId={userId} />
        ))}

        {posts?.length === 0 && (
          <p>No posts yet</p>
        )}
      </div>
    </div>
  );
}
```

---

## 7. Reposting

```typescript
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function RepostButton({ post, userId }: {
  post: any;
  userId: string;
}) {
  const repostPost = useMutation(api.social.repostPost);
  const [hasReposted, setHasReposted] = useState(false);

  const handleRepost = async () => {
    try {
      await repostPost({
        originalPostId: post._id,
        authorId: userId,
        comment: '', // Optional comment
      });
      setHasReposted(true);
    } catch (error) {
      alert('Already reposted');
    }
  };

  return (
    <button
      onClick={handleRepost}
      disabled={hasReposted}
      className={hasReposted ? 'reposted' : ''}
    >
      {hasReposted ? '✅ Reposted' : '🔄 Repost'}
    </button>
  );
}
```

---

## 8. Search Posts

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

function PostSearch() {
  const [searchTerm, setSearchTerm] = useState('');

  const results = useQuery(api.social.searchPosts, {
    searchText: searchTerm,
    limit: 20,
  });

  return (
    <div className="post-search">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search posts..."
      />

      <div className="search-results">
        {results?.map((post) => (
          <PostCard key={post._id} post={post} currentUserId="" />
        ))}

        {searchTerm && results?.length === 0 && (
          <p>No posts found matching "{searchTerm}"</p>
        )}
      </div>
    </div>
  );
}
```

---

## 9. Trending Posts

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

function TrendingFeed() {
  const trending = useQuery(api.social.getTrendingPosts, {
    limit: 10,
  });

  return (
    <div className="trending-feed">
      <h2>🔥 Trending</h2>

      <div className="trending-list">
        {trending?.map((post, index) => (
          <div key={post._id} className="trending-item">
            <span className="rank">#{index + 1}</span>
            <PostCard post={post} currentUserId="" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 10. Home Feed (Personalized)

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

function HomeFeed({ userId }: { userId: string }) {
  // Get personalized feed (user + people they follow)
  const feed = useQuery(api.social.getHomeFeed, {
    userId,
    limit: 20,
  });

  return (
    <div className="home-feed">
      <h2>Home Feed</h2>

      <div className="feed">
        {feed?.map((post) => (
          <PostCard key={post._id} post={post} currentUserId={userId} />
        ))}

        {feed?.length === 0 && (
          <div className="empty-state">
            <p>No posts yet. Follow some people to see their posts here!</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Common Patterns

### Loading States
```typescript
const feed = useQuery(api.social.getFeed, { limit: 20 });

if (feed === undefined) return <div>Loading feed...</div>;
if (feed === null) return <div>No posts available</div>;
```

### Optimistic UI Updates
```typescript
const toggleReaction = useMutation(api.social.toggleReaction);

// Update UI immediately, then sync with server
const handleLike = async () => {
  // Optimistic update
  setLiked(!liked);

  // Server update
  try {
    await toggleReaction({ /* ... */ });
  } catch (error) {
    // Rollback on error
    setLiked(liked);
  }
};
```

### Error Handling
```typescript
const createPost = useMutation(api.social.createPost);

const handleSubmit = async () => {
  try {
    await createPost({ /* ... */ });
    alert('Posted!');
  } catch (error) {
    console.error('Failed to post:', error);
    alert('Failed to create post. Please try again.');
  }
};
```

---

## Next Steps

1. ✅ Social functions created
2. ⏳ Use in your components
3. ⏳ Add media upload functionality
4. ⏳ Add real-time updates
5. ⏳ Test with multiple users

All your social features are ready to go! 🎉
