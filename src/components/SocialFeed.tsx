import React, { useState, useMemo, useCallback } from 'react';
import { Loader2, RefreshCw, Users, Compass, UserPlus, Search, LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfilesByIds, ensureUserInDatabase } from '../config/neonQueries';
import PostCard from './social/PostCard';
import CreatePostWidget from './social/CreatePostWidget';
import ReportModal from './ReportModal';
import Discover from './social/Discover';
import { useFollowSystem } from '../hooks/useFollowSystem';
import FollowButton from './social/FollowButton';
import UserAvatar from './shared/UserAvatar';
import { useLanguage } from '../contexts/LanguageContext';
import { usePosts, useCreatePost } from '../hooks/useSocialQueries';
import type { UserData } from '../types';

// =====================================================
// TYPES & CONSTANTS
// =====================================================

const FEED_MODES = {
  FOR_YOU: 'for_you',
  FOLLOWING: 'following',
  DISCOVER: 'discover'
} as const;

type FeedMode = typeof FEED_MODES[keyof typeof FEED_MODES];

interface SocialFeedProps {
  user: {
    id?: string;
    uid?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    primaryEmailAddress?: { emailAddress: string };
    emailAddresses?: Array<{ emailAddress: string }>;
    imageUrl?: string;
    profileImageUrl?: string;
    publicMetadata?: {
      username?: string;
      account_types?: string[];
      active_role?: string;
    };
    [key: string]: any;
  };
  userData: UserData | null;
  subProfiles?: Record<string, any>;
  openPublicProfile?: (userId: string) => void;
}

interface Post {
  id: string;
  userId: string;
  displayName: string;
  authorPhoto?: string | null;
  username?: string;
  text?: string;
  attachments?: any[];
  timestamp: string;
  commentCount: number;
  reactionCount: number;
  saveCount: number;
  role?: string;
  [key: string]: any;
}

interface SuggestedUser {
  userId: string;
  displayName: string;
  photoURL: string | null;
  role?: string;
}

interface PostPayload {
  text?: string;
  attachments?: Array<{
    type: string;
    url: string;
    thumbnail?: string | null;
    name?: string | null;
    isGif?: boolean;
  }>;
}

// =====================================================
// COMPONENT
// =====================================================

export default function SocialFeed({
  user,
  userData,
  subProfiles = {},
  openPublicProfile
}: SocialFeedProps): JSX.Element {
  const [reportTarget, setReportTarget] = useState<Post | null>(null);
  const [feedMode, setFeedMode] = useState<FeedMode>(FEED_MODES.FOR_YOU);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);

  // Get feed algorithm from settings
  const { t } = useLanguage();
  const feedAlgorithm = userData?.settings?.social?.feedAlgorithm || 'recommended';
  const autoPlayVideos = userData?.settings?.social?.autoPlayVideos !== false;
  const showSuggestedAccounts = userData?.settings?.social?.showSuggestedAccounts !== false;

  // Use the follow system hook
  const userId = user?.id || user?.uid;
  const {
    following,
    stats,
    loading: followLoading,
    isFollowing,
    toggleFollow,
    getFollowingIds
  } = useFollowSystem(userId, userData);

  // Memoize following IDs for feed filtering
  const followingIds = useMemo(() => getFollowingIds(), [following]);

  // Determine query filters based on feed mode
  const queryFilters = useMemo(() => {
    if (feedMode === FEED_MODES.FOLLOWING && followingIds.length > 0) {
      return { user_id: followingIds[0] }; // Will filter client-side for all following
    }
    return {};
  }, [feedMode, followingIds]);

  // React Query for posts - replaces manual polling and useState
  const {
    data: fetchedPosts = [],
    isLoading: postsLoading,
    error: postsError,
    refetch: refetchPosts,
    isRefetching
  } = usePosts(queryFilters, 20, feedMode !== FEED_MODES.DISCOVER);

  // React Query mutation for creating posts - replaces manual API call
  const createPostMutation = useCreatePost();

  // Process and filter posts
  const posts = useMemo(() => {
    let processedPosts = fetchedPosts.map((post: any) => ({
      id: post.id,
      ...post,
      userId: post.user_id,
      displayName: post.display_name ||
                     post.username ||
                     (post.first_name && post.last_name ? `${post.first_name} ${post.last_name}` : null) ||
                     post.first_name ||
                     post.last_name ||
                     'Unknown User',
      authorPhoto: post.photo_url || post.profile_photo_url,
      username: post.username,
      text: post.content,
      attachments: post.media,
      timestamp: post.created_at,
      commentCount: post.comment_count || 0,
      reactionCount: post.reaction_count || 0,
      saveCount: post.save_count || 0
    }));

    // Apply feed algorithm based on settings (only for "For You" feed)
    if (feedMode === FEED_MODES.FOR_YOU) {
      if (feedAlgorithm === 'following') {
        if (followingIds.length > 0) {
          processedPosts = processedPosts.filter((p: Post) => followingIds.includes(p.userId));
        } else {
          processedPosts = [];
        }
      } else if (feedAlgorithm === 'chronological') {
        // Already sorted by created_at desc, no changes needed
      } else {
        // Recommended algorithm (default) - prioritize posts with more engagement
        processedPosts.sort((a: Post, b: Post) => {
          const aScore = (a.reactionCount || 0) * 2 + (a.commentCount || 0) * 3 + (a.saveCount || 0);
          const bScore = (b.reactionCount || 0) * 2 + (b.commentCount || 0) * 3 + (b.saveCount || 0);
          return bScore - aScore;
        });
      }
    }

    // Client-side filtering for Following feed
    if (feedMode === FEED_MODES.FOLLOWING && followingIds.length > 0) {
      const currentUserId = user?.id || user?.uid;
      processedPosts = processedPosts.filter((post: Post) =>
        followingIds.includes(post.userId) || post.userId === currentUserId
      );
    }

    return processedPosts;
  }, [fetchedPosts, feedMode, feedAlgorithm, followingIds, user?.id, user?.uid]);

  // Combined loading state
  const loading = postsLoading || followLoading;

  // Load suggested users when on Following tab with no follows
  React.useEffect(() => {
    const userId = user?.id || user?.uid;
    if (feedMode === FEED_MODES.FOLLOWING && followingIds.length === 0 && userId) {
      loadSuggestedUsers();
    }
  }, [feedMode, followingIds.length, user?.id, user?.uid]);

  const loadSuggestedUsers = async (): Promise<void> => {
    setLoadingSuggestions(true);
    try {
      if (!user?.id && !user?.uid) return;

      const userId = user.id || user.uid;

      // Get recent posts as suggestions (excluding current user)
      const fetchedPosts = await getPosts({ limit: 20 });

      // Filter out current user's posts
      const otherUsersPosts = fetchedPosts.filter(p => p.user_id !== userId);

      // Extract unique user IDs from posts
      const uniqueUserIds = [...new Set(otherUsersPosts.map(p => p.user_id))];

      // Fetch profiles for these users
      let profilePhotos: Record<string, string | null> = {};
      if (uniqueUserIds.length > 0) {
        const profiles = await getProfilesByIds(uniqueUserIds);
        profiles.forEach(p => {
          profilePhotos[p.user_id] = p.avatar_url || p.photo_url;
        });
      }

      // Build unique users map with fresh photos
      const usersMap = new Map<string, SuggestedUser>();
      otherUsersPosts.forEach(post => {
        if (!usersMap.has(post.user_id)) {
          usersMap.set(post.user_id, {
            userId: post.user_id,
            displayName: post.display_name,
            photoURL: profilePhotos[post.user_id] || null,
            role: post.role
          });
        }
      });

      setSuggestedUsers(Array.from(usersMap.values()).slice(0, 5));
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
    setLoadingSuggestions(false);
  };

  // Skeleton loader for feed
  const renderSkeleton = (): JSX.Element => {
    const skeletonItems = Array.from({ length: 3 });
    return (
      <div className="space-y-4 p-fluid">
        <div className="bg-white dark:bg-[#1f2128] rounded-2xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-48 mb-3"></div>
          <div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl w-full mb-2"></div>
        </div>
        {skeletonItems.map((_, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1f2128] rounded-2xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex-1">
                <div className="h-3.5 w-32 bg-gray-200 dark:bg-gray-700 rounded-full mb-2"></div>
                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
              </div>
            </div>
            <div className="h-3 w-5/6 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
            <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
            <div className="flex gap-3">
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // React Query automatically handles polling with refetchInterval
  // No need for manual polling logic anymore

  const handlePost = async (postPayload: PostPayload): Promise<void> => {
    if (!user) return;
    try {
      const userId = user.id || user.uid;
      const activeRole = userData?.activeProfileRole || userData?.accountTypes?.[0] || 'Fan';

      // Get active profile data from subProfiles
      const activeProfile = subProfiles?.[activeRole] || {};
      const displayName = activeProfile?.display_name || userData?.effectiveDisplayName || `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || null;
      const authorPhoto = activeProfile?.photo_url || userData?.photoURL || user?.imageUrl || null;

      // Ensure user exists in database (fallback for webhook sync)
      const username = user.username ||
                     user.publicMetadata?.username ||
                     `${user.firstName || ''}${user.lastName ? ' ' + user.lastName : ''}`.trim() ||
                     user.email?.split('@')[0] ||
                     null;

      await ensureUserInDatabase(userId, {
        id: userId,
        email: user.primaryEmailAddress?.emailAddress || user.email || user.emailAddresses?.[0]?.emailAddress,
        first_name: user.firstName || null,
        last_name: user.lastName || null,
        username: username,
        profile_photo_url: user.imageUrl || user.profileImageUrl || null,
        account_types: user.publicMetadata?.account_types || ['Fan'],
        active_role: user.publicMetadata?.active_role || 'Fan'
      });

      // Process attachments from postPayload
      const attachments = postPayload.attachments || [];

      // Convert attachments to media format
      const media = attachments.map(a => ({
        type: a.type,
        url: a.url,
        thumbnail: a.thumbnail || null,
        name: a.name || null,
        isGif: a.isGif || false
      }));

      // Extract mentions and hashtags from text
      const mentions = (postPayload.text?.match(/@(\w+)/g) || []).map(m => m.substring(1));
      const hashtags = (postPayload.text?.match(/#(\w+)/g) || []).map(h => h.substring(1));

      // Use React Query mutation for optimistic updates
      createPostMutation.mutate({
        author_id: userId,
        text: postPayload.text || '',
        media_urls: media,
        mentions: mentions,
        hashtags: hashtags,
        visibility: 'public',
        display_name: displayName,
        author_photo: authorPhoto,
        posted_as_role: activeRole
      });
    } catch (e) {
      console.error("Failed to post:", e);
      alert("Could not post update. Please try again.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  // Suggested user card component
  const SuggestedUserCard = ({ suggestedUser }: { suggestedUser: SuggestedUser }): JSX.Element => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 bg-white dark:bg-dark-card rounded-xl border dark:border-gray-700 hover:border-brand-blue/30 transition-all"
    >
      <div
        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
        onClick={() => openPublicProfile?.(suggestedUser.userId)}
      >
        <UserAvatar
          src={suggestedUser.photoURL}
          name={suggestedUser.displayName}
          size="md"
        />
        <div className="min-w-0">
          <h4 className="font-bold text-sm dark:text-white truncate hover:text-brand-blue transition">
            {suggestedUser.displayName}
          </h4>
          <p className="text-xs text-gray-500 truncate">{suggestedUser.role}</p>
        </div>
      </div>
      <FollowButton
        isFollowing={isFollowing(suggestedUser.userId)}
        onToggle={() => toggleFollow(suggestedUser.userId, suggestedUser)}
        size="sm"
        variant="default"
      />
    </motion.div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Create Post Widget */}
      <CreatePostWidget
        user={user}
        userData={userData}
        subProfiles={subProfiles}
        onPost={handlePost}
      />

      {/* Feed Mode Toggle */}
      <div className="flex items-center gap-2 mb-4 bg-white dark:bg-dark-card p-1.5 rounded-xl border dark:border-gray-700 shadow-sm">
        <button
          onClick={() => setFeedMode(FEED_MODES.FOR_YOU)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            feedMode === FEED_MODES.FOR_YOU
              ? 'bg-brand-blue text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Compass size={16} />
          <span>{t('forYou')}</span>
        </button>
        <button
          onClick={() => setFeedMode(FEED_MODES.FOLLOWING)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            feedMode === FEED_MODES.FOLLOWING
              ? 'bg-brand-blue text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Users size={16} />
          <span>{t('following')}</span>
          {stats.followingCount > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              feedMode === FEED_MODES.FOLLOWING
                ? 'bg-white/20'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}>
              {stats.followingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setFeedMode(FEED_MODES.DISCOVER)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            feedMode === FEED_MODES.DISCOVER
              ? 'bg-brand-blue text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Search size={16} />
          <span>{t('discover')}</span>
        </button>
      </div>

      {/* Refresh Button - replaces "New Posts" banner */}
      {isRefetching && (
        <div className="mb-4 flex justify-center">
          <Loader2 className="animate-spin text-brand-blue" size={24} />
        </div>
      )}

      {/* Feed Content */}
      {feedMode === FEED_MODES.DISCOVER ? (
        <Discover
          user={user}
          userData={userData}
          openPublicProfile={openPublicProfile}
        />
      ) : loading || followLoading ? (
        renderSkeleton()
      ) : (
        <>
          {/* Following tab empty state with suggestions */}
          {feedMode === FEED_MODES.FOLLOWING && followingIds.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 mb-6 border border-blue-100 dark:border-blue-800/30"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-blue/10 flex items-center justify-center">
                  <UserPlus size={28} className="text-brand-blue" />
                </div>
                <h3 className="text-lg font-bold dark:text-white mb-2">
                  Start following creators
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                  Follow artists, engineers, and studios to see their posts in your Following feed.
                </p>
              </div>

              {/* Suggested users - only show if setting is enabled */}
              {showSuggestedAccounts && (
                <>
                  {loadingSuggestions ? (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Suggested for you
                      </h4>
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-dark-card rounded-xl border dark:border-gray-700 animate-pulse">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                              <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
                            </div>
                          </div>
                          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                        </div>
                      ))}
                    </div>
                  ) : suggestedUsers.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Suggested for you
                      </h4>
                      {suggestedUsers.map(suggestedUser => (
                        <SuggestedUserCard
                          key={suggestedUser.userId}
                          suggestedUser={suggestedUser}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Posts */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <AnimatePresence mode='popLayout'>
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={user}
                  currentUserData={userData}
                  openPublicProfile={openPublicProfile || (() => {})}
                  onReport={() => setReportTarget(post)}
                  onDelete={(postId) => setPosts(prev => prev.filter(p => p.id !== postId))}
                  isFollowingAuthor={isFollowing(post.userId)}
                  onToggleFollow={() => toggleFollow(post.userId, {
                    displayName: post.displayName,
                    photoURL: post.authorPhoto,
                    role: post.role
                  })}
                  autoPlayVideos={autoPlayVideos}
                />
              ))}
            </AnimatePresence>

            {posts.length === 0 && feedMode === FEED_MODES.FOR_YOU && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10 text-gray-500"
              >
                <RefreshCw className="mx-auto mb-2 opacity-50" size={32} />
                <p>{t('noPosts')}. {t('beFirst')}</p>
              </motion.div>
            )}

            {posts.length === 0 && feedMode === FEED_MODES.FOLLOWING && followingIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10 text-gray-500"
              >
                <Users className="mx-auto mb-2 opacity-50" size={32} />
                <p>{t('noPostsFollowing')}.</p>
                <button
                  onClick={() => setFeedMode(FEED_MODES.FOR_YOU)}
                  className="mt-3 text-brand-blue hover:underline text-sm font-medium"
                >
                  {t('browseForYou')}
                </button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}

      {/* Report Modal */}
      {reportTarget && (
        <ReportModal
          user={user}
          target={{
            id: reportTarget.id,
            type: 'Post',
            summary: reportTarget.text ? reportTarget.text.substring(0, 50) : 'Media Post'
          }}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}
