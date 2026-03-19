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

export {
  fetchActivityFeed,
  createActivityItem,
  markActivityAsRead,
  markAllActivitiesAsRead,
  formatActivityTimestamp,
  getActivityFeedStats
} from './activityFeed';
