# SeshNx Social Feed System - Complete Documentation

## Overview

The SeshNx Social Feed System is a comprehensive, production-ready social networking platform built on Convex for real-time performance. It includes all major features found in platforms like Instagram, Twitter, and LinkedIn, tailored specifically for music creators and industry professionals.

## Architecture

### Database Schema (Convex)

**Core Tables:**
- `posts` - Social feed posts with engagement tracking
- `comments` - Nested comment system with replies
- `reactions` - Emoji-based reactions (❤️, 👍, 🔥, etc.)
- `follows` - Social graph (follower/following relationships)
- `savedPosts` - Bookmark/save functionality
- `userBlocks` - Blocking and muting users
- `contentReports` - Content moderation and reporting
- `notifications` - Real-time notification system

## Core Features

### 1. Posts System

#### Create Posts
```typescript
// Create a new post with media, hashtags, mentions
const postId = await ctx.runMutation(api.social.createPost, {
  authorId: clerkId,
  content: "Just finished a great session! 🎵 #studio #recording",
  mediaUrls: ["https://example.com/image.jpg"],
  mediaType: "image",
  category: "Music",
  visibility: "public",
  equipment: ["Neumann U87", "Apollo Interface"],
  software: ["Pro Tools", "Waves"],
});
```

#### Post Types
- **Text Posts** - Simple text updates
- **Media Posts** - Images, videos, audio
- **Equipment Posts** - Gear-focused with equipment/software fields
- **Reposts** - Share others' content with optional comment
- **Pinned Posts** - Highlight important posts on profile

#### Post Management
- **Edit Posts** - Update content, media, categories
- **Delete Posts** - Soft delete with `deletedAt` timestamp
- **Pin Posts** - Pin/unpin from profile
- **Analytics** - Track views, likes, comments, shares, saves

### 2. Comments System

#### Comment Features
- **Nested Replies** - Multi-level comment threading
- **Rich Content** - Text with mention support
- **Reactions** - React to comments with emojis
- **Moderation** - Edit/delete own comments

#### Comment Structure
```
Post
├── Comment 1
│   ├── Reply 1.1
│   └── Reply 1.2
└── Comment 2
    └── Reply 2.1
```

### 3. Reactions System

#### Supported Reactions
- ❤️ Love
- 👍 Like
- 🔥 Fire
- 👏 Applaud
- 🎉 Celebrate
- + Custom emojis

#### Reaction Behavior
- Toggle on/off
- Multiple reactions per target (different emojis)
- Real-time sync across all clients
- Engagement tracking

### 4. Follow System

#### Follow Features
- **Follow/Unfollow** - Social graph management
- **Follow Suggestions** - Smart recommendations
- **Follower Lists** - Paginated follower/following queries
- **Activity Feed** - See what followed users are doing

#### Follow Algorithms
```
Suggestion Score =
  (Same Location: +10) +
  (Shared Genres: +3 each) +
  (Shared Account Types: +2 each) +
  (Recent Activity: +1 per post) +
  (Popularity Boost: +5-15 based on followers)
```

### 5. Saved Posts

#### Save Features
- **Bookmark Posts** - Save for later
- **Collections** - Organize saved posts
- **Save Count Tracking** - Engagement metrics
- **Private by Default** - Only user sees their saves

### 6. User Blocking

#### Block Features
- **Block Users** - Hide content and interactions
- **Block List** - View and manage blocked users
- **Auto-Unfollow** - Automatically unfollow when blocking
- **Bidirectional Blocking** - Block prevents most interactions

### 7. Content Reporting

#### Report Types
- **Spam** - Unsolicited promotional content
- **Harassment** - Bullying or threatening behavior
- **Inappropriate** - NSFW or policy violations
- **Violence** - Threats or violent content
- **Scam** - Fraudulent activity
- **Other** - Custom reports with description

#### Report Workflow
1. User submits report
2. Status: Pending → Reviewing → Resolved/Dismissed
3. Admin can view and moderate
4. Notifications for resolution

### 8. Advanced Feed Algorithms

#### For You Feed
Personalized feed using collaborative filtering:
```
Post Score =
  (Category Match: +10) +
  (Genre Match: +3 each) +
  (Engagement Weight: 0.1x) +
  (Recency Boost: +1-5) +
  (Follow Boost: +15)
```

#### Following Feed
Posts from followed users + own posts, chronological

#### Trending Feed
Posts sorted by engagement velocity:
```
Trending Score =
  (Likes × 2) +
  (Comments × 3) +
  (Reposts × 4) +
  (Saves × 5)
```

### 9. Search & Discovery

#### Universal Search
Search across:
- **Posts** - Content, author, hashtags, category
- **Users** - Name, username, bio, location, skills, genres
- **Hashtags** - Tag discovery with usage counts

#### Category Discovery
Filter posts by:
- Music category
- Genres
- Skills
- Location
- Time range (today/week/month/all)

#### Trending Topics
Real-time trending hashtags:
- Frequency-based ranking
- Engagement-weighted scoring
- Time-windowed (day/week/month)

### 10. Notifications System

#### Notification Types
- `follow` - New followers
- `like` - Post reactions
- `comment` - Post comments
- `comment_reply` - Comment replies
- `mention` - @mentions in posts
- `repost` - Post reposts
- `save` - Post saves
- `trending` - Post trending milestones
- `welcome` - New user welcome
- `profile_completion` - Profile completion milestones
- `follower_milestone` - Follower count achievements

#### Notification Features
- Real-time delivery
- Read/unread tracking
- Batch operations (mark all as read)
- Rich metadata for deep linking
- Action buttons for quick responses

## File Structure

```
convex/
├── social.ts                    # Core social feed functionality
├── socialEnhanced.ts           # Advanced features (blocking, reporting, analytics)
├── socialNotifications.ts      # Notification triggers and automation
├── socialSearch.ts             # Search, discovery, and recommendations
├── posts.ts                    # Post sync layer (MongoDB → Convex)
├── comments.ts                 # Comment sync layer
├── reactions.ts                # Reaction sync layer
├── follows.ts                  # Follow sync layer
├── notifications.ts            # Notification queries/mutations
└── users.ts                    # User profile management
```

## API Reference

### Posts API

#### Queries
- `getFeed` - Main feed with pagination
- `getHomeFeed` - Personalized feed (following + own)
- `getForYouFeed` - AI-powered recommendations
- `getTrendingPosts` - Top posts by engagement
- `searchPosts` - Full-text search
- `getPost` - Get single post
- `getPostsByAuthor` - User's posts
- `getPostsByCategory` - Category filtering
- `getPostsByHashtag` - Hashtag feeds

#### Mutations
- `createPost` - Create new post
- `editPost` - Update existing post
- `deletePost` - Soft delete
- `repostPost` - Share with comment
- `pinPost` - Pin/unpin from profile
- `incrementViewCount` - Track views
- `sharePost` - External share tracking

### Comments API

#### Queries
- `getComments` - Comments for a post
- `getReplies` - Nested replies
- `count` - Comment count

#### Mutations
- `createComment` - Add comment
- `deleteComment` - Remove comment

### Reactions API

#### Queries
- `getReactions` - All reactions for target
- `getUserReaction` - Specific user's reaction
- `hasReacted` - Check if reacted
- `getSummary` - Reaction counts by emoji

#### Mutations
- `toggleReaction` - Add/remove reaction
- `syncReaction` - Sync from source DB
- `bulkSyncReactions` - Batch sync

### Follows API

#### Queries
- `getFollowers` - User's followers
- `getFollowing` - Who user follows
- `isFollowing` - Check follow status
- `getFollowerCount` - Follower count
- `getFollowingCount` - Following count

#### Mutations
- `toggleFollow` - Follow/unfollow
- `syncFollow` - Sync from source DB
- `bulkSyncFollows` - Batch sync

### Saved Posts API

#### Queries
- `getSavedPosts` - User's saved posts
- `isSaved` - Check if saved

#### Mutations
- `savePost` - Add to saved
- `unsavePost` - Remove from saved

### Blocking API

#### Mutations
- `blockUser` - Block a user
- `unblockUser` - Unblock
- `muteUser` - Mute posts
- `unmuteUser` - Unmute

#### Queries
- `getBlockedUsers` - Blocked list
- `isBlocked` - Check block status

### Reporting API

#### Mutations
- `reportContent` - Report post/comment/user

#### Queries
- `getReports` - Admin report queue
- `updateReportStatus` - Moderate reports

### Search API

#### Queries
- `socialSearch` - Universal search
- `discoverByCategory` - Category exploration
- `getTrendingTopics` - Trending hashtags
- `getSuggestedUsers` - Follow suggestions
- `getUserActivity` - Activity feed
- `getExploreData` - Explore page

### Notifications API

#### Queries
- `getNotifications` - User's notifications
- `getUnreadNotifications` - Unread only
- `getUnreadCount` - Unread count
- `getNotification` - Single notification

#### Mutations
- `createNotification` - Create notification
- `markAsRead` - Mark single read
- `markAllAsRead` - Mark all read
- `deleteNotification` - Delete notification
- `clearAll` - Clear all notifications

## Real-Time Features

### WebSocket Subscriptions
All queries support real-time updates via Convex's WebSocket layer:
```typescript
// Automatic re-render when data changes
const posts = useQuery(api.social.getFeed, { limit: 20 });
```

### Sync Layer
MongoDB/Neon → Convex sync for:
- Posts (posts.ts)
- Comments (comments.ts)
- Reactions (reactions.ts)
- Follows (follows.ts)

## Performance Optimizations

### Indexing Strategy
- `by_created` - Temporal queries
- `by_author` - User posts
- `by_category` - Category filtering
- `by_target` - Reaction/comment lookup
- `by_user_read` - Notification queries
- `by_unread` - Unread notifications
- `by_follower` - Follow relationships
- `by_following` - Inverse follow graph

### Pagination
All list queries support:
- `limit` - Results per page (default: 20)
- `skip` - Offset for pagination

### Caching
- Real-time subscriptions eliminate cache invalidation
- Convex handles automatic updates
- No manual cache management needed

## Security & Privacy

### Access Control
- Post ownership verification for edits/deletes
- Comment ownership checks
- Block/blocked checks for interactions
- Privacy settings (public/followers/private)

### Content Moderation
- User reporting system
- Admin review workflow
- Soft delete for content removal
- Block functionality for harassment prevention

## Best Practices

### Creating Posts
1. Always include category and visibility
2. Extract hashtags/mentions automatically
3. Set engagement counters to 0
4. Include author metadata for performance

### Querying Feeds
1. Use specific indexes when possible
2. Filter out soft-deleted posts
3. Respect privacy settings
4. Paginate for performance

### Notifications
1. Don't notify for own actions
2. Batch similar notifications
3. Include deep link metadata
4. Handle notification preferences

### Error Handling
1. Graceful degradation for missing data
2. User-friendly error messages
3. Retry logic for sync operations
4. Fallback to empty arrays vs. errors

## Integration Examples

### React Component Example
```typescript
function SocialFeed() {
  const posts = useQuery(api.social.getFeed, { limit: 20 });
  const likePost = useMutation(api.reactions.toggleReaction);

  if (!posts) return <Loading />;

  return (
    <div>
      {posts.map(post => (
        <PostCard
          key={post._id}
          post={post}
          onLike={() => likePost({
            targetId: post._id,
            targetType: "post",
            emoji: "❤️",
            userId: user.clerkId
          })}
        />
      ))}
    </div>
  );
}
```

### Notification Integration
```typescript
// Auto-notify on social actions
await ctx.runMutation(api.socialNotifications.notifyPostLike, {
  postId: post._id,
  likerId: user._id,
  emoji: "❤️"
});
```

## Future Enhancements

### Planned Features
- Stories/ephemeral content
- Live streaming integration
- Audio/video post support
- Advanced analytics dashboard
- Creator tools and insights
- Community management features
- Scheduled posts
- Post scheduling and automation
- Advanced moderation tools
- Monetization features

### Performance Improvements
- Full-text search integration
- GraphQL API layer
- Edge caching for static content
- Optimistic UI updates
- Background sync improvements

## Support & Documentation

For questions or issues:
1. Check this documentation
2. Review inline code comments
3. Examine similar existing functions
4. Test with Convex dashboard
5. Check schema definitions

## Changelog

### v1.0.0 (Current)
- Complete social feed system
- Real-time reactions and comments
- Advanced search and discovery
- Notification integration
- Content moderation tools
- Analytics and insights
- User blocking and reporting

---

Built with ❤️ using Convex for real-time social features.