/**
 * Services Index
 *
 * Centralized exports for all services.
 */

// Unified User Data Service
export {
  getCompleteUser,
  updateUserProfile,
  searchUsers,
  getUserStats,
  updateUserActivity,
  getUserFollowing,
  getUserFollowers
} from './unifiedUserData';

// Activity Feed Service
export {
  fetchActivityFeed,
  createActivityItem,
  markActivityAsRead,
  markAllActivitiesAsRead,
  formatActivityTimestamp,
  getActivityFeedStats
} from './activityFeed';

// MongoDB Social (re-exported)
export {
  followUser,
  unfollowUser,
  isFollowing,
  createPost as mongoCreatePost,
  getPosts as mongoGetPosts,
  getPostById as mongoGetPostById,
  toggleReaction,
  savePost,
  unsavePost,
  getSavedPosts,
  markAllNotificationsAsRead,
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  getReactions,
  getReactionSummary,
  getUserReaction,
  clearTargetReactions,
  getFollowingCount,
  getFollowersCount,
  getFollowing,
  getFollowers,
  getSavedPosts as getSavedPostsFromMongo,
  isPostSaved,
  savePost as savePostToMongo,
  unsavePost as unsavePostFromMongo,
  getSocialNotifications,
  getUnreadNotificationCount,
  createSocialNotification,
  markNotificationAsRead,
  blockUser,
  unblockUser,
  hasBlocked,
  getBlockedUsers,
  createContentReport,
  getContentReports,
  hasUserReposted,
  repostPost,
  unrepostPost,
  searchProfiles,
  getProfile,
  upsertProfile,
  updateLastActive
} from '../config/mongoSocial';
