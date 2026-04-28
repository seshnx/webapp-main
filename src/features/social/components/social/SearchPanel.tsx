import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Hash, Users, FileText, X, TrendingUp } from 'lucide-react';
import {
  useSearchPosts,
  useUserSearch,
  useTrendingHashtags,
  usePostsByHashtag
} from '@/services/socialApi';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '@/components/shared/UserAvatar';
import PostCard from './PostCard';

/**
 * SearchPanel Props
 */
interface SearchPanelProps {
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
  currentUserData?: any;
}

/**
 * SearchPanel Component
 *
 * Comprehensive search interface with tabs for posts, users, and hashtags
 */
const SearchPanel: React.FC<SearchPanelProps> = ({
  userId,
  isOpen,
  onClose,
  currentUser,
  currentUserData
}) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'users' | 'hashtags'>('posts');
  const trendingHashtags = useTrendingHashtags(10) || [];
  
  const searchedPosts = useSearchPosts(activeTab === 'posts' && searchQuery.trim() ? searchQuery : undefined);
  const searchedUsers = useUserSearch(activeTab === 'users' && searchQuery.trim() ? searchQuery : undefined);
  
  const searchResults = useMemo(() => {
    return {
      posts: (searchedPosts || []).map((post: any) => ({
        ...post,
        id: post._id,
        display_name: post.authorName,
        photo_url: post.authorPhoto,
        username: post.authorUsername,
        reaction_count: post.engagement?.likesCount || 0,
        comment_count: post.engagement?.commentsCount || 0,
        save_count: post.engagement?.savesCount || 0,
      })),
      users: (searchedUsers || []).map((user: any) => ({
        id: user.clerkId || user._id,
        username: user.username,
        first_name: user.displayName?.split(' ')[0] || '',
        last_name: user.displayName?.split(' ').slice(1).join(' ') || '',
        profile_photo_url: user.avatarUrl || user.photoURL,
        bio: user.bio,
        account_types: user.talentSubRole ? [user.talentSubRole] : [user.activeRole]
      })),
      hashtags: trendingHashtags.filter((h: any) =>
        h.hashtag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    };
  }, [searchedPosts, searchedUsers, trendingHashtags, searchQuery]);

  const loading = searchQuery.trim() !== '' && (
    (activeTab === 'posts' && !searchedPosts) ||
    (activeTab === 'users' && !searchedUsers)
  );

  const performSearch = () => {
    // Convex hooks handle this automatically via reactive queries
  };

  const handleHashtagClick = async (hashtag: string) => {
    navigate(`/social/hashtag/${hashtag.replace('#', '')}`);
    onClose();
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-20 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="bg-surface border border-border rounded-xl w-full max-w-3xl shadow-2xl max-h-[80vh] flex flex-col"
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Search className="w-5 h-5 text-text-secondary" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts, users, hashtags..."
                className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-secondary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-surface-secondary rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-text-secondary" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-2 border-b border-border">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'posts'
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-surface-secondary'
                }`}
              >
                <FileText size={16} />
                <span>Posts</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'users'
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-surface-secondary'
                }`}
              >
                <Users size={16} />
                <span>Users</span>
              </button>
              <button
                onClick={() => setActiveTab('hashtags')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'hashtags'
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-surface-secondary'
                }`}
              >
                <Hash size={16} />
                <span>Hashtags</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {!searchQuery.trim() ? (
                // Show trending hashtags when no query
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Trending Hashtags</h3>
                  </div>
                  {trendingHashtags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {trendingHashtags.map(({ hashtag, count }) => (
                        <button
                          key={hashtag}
                          onClick={() => handleHashtagClick(hashtag)}
                          className="px-3 py-1.5 bg-surface-secondary hover:bg-primary/10 rounded-full text-sm transition-colors flex items-center gap-2"
                        >
                          <span className="font-medium">#{hashtag}</span>
                          <span className="text-xs text-text-secondary">{count} posts</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-secondary text-sm">No trending hashtags yet</p>
                  )}
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : (
                // Search results
                <div className="space-y-4">
                  {activeTab === 'posts' && (
                    <div>
                      <h3 className="text-sm font-medium text-text-secondary mb-3">
                        {searchResults.posts.length} {searchResults.posts.length === 1 ? 'post' : 'posts'} found
                      </h3>
                      {searchResults.posts.length > 0 ? (
                        <div className="space-y-4">
                          {searchResults.posts.map((post) => (
                            <PostCard
                              key={post.id}
                              post={{
                                ...post,
                                displayName: post.display_name || 'User',
                                text: post.content || post.text,
                                reactions: {},
                                reactionCount: post.reaction_count,
                                commentCount: post.comment_count,
                                saveCount: post.save_count
                              }}
                              currentUser={currentUser}
                              currentUserData={currentUserData}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-text-secondary text-center py-8">No posts found</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'users' && (
                    <div>
                      <h3 className="text-sm font-medium text-text-secondary mb-3">
                        {searchResults.users.length} {searchResults.users.length === 1 ? 'user' : 'users'} found
                      </h3>
                      {searchResults.users.length > 0 ? (
                        <div className="space-y-2">
                          {searchResults.users.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => handleUserClick(user.id)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-surface-secondary rounded-lg transition-colors text-left"
                            >
                              <UserAvatar
                                src={user.profile_photo_url}
                                name={user.username || user.email || 'User'}
                                size="md"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {user.first_name && user.last_name
                                    ? `${user.first_name} ${user.last_name}`
                                    : user.username || user.email}
                                </p>
                                {user.bio && (
                                  <p className="text-sm text-text-secondary truncate">{user.bio}</p>
                                )}
                              </div>
                              {user.account_types && user.account_types.length > 0 && (
                                <div className="flex gap-1">
                                  {user.account_types.slice(0, 2).map((type) => (
                                    <span
                                      key={type}
                                      className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                                    >
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-text-secondary text-center py-8">No users found</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'hashtags' && (
                    <div>
                      <h3 className="text-sm font-medium text-text-secondary mb-3">
                        {searchResults.hashtags.length} {searchResults.hashtags.length === 1 ? 'hashtag' : 'hashtags'} found
                      </h3>
                      {searchResults.hashtags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {searchResults.hashtags.map(({ hashtag, count }) => (
                            <button
                              key={hashtag}
                              onClick={() => handleHashtagClick(hashtag)}
                              className="px-4 py-2 bg-surface-secondary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2"
                            >
                              <span className="font-medium text-lg">#{hashtag}</span>
                              <span className="text-xs text-text-secondary">{count} posts</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-text-secondary text-center py-8">No hashtags found</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchPanel;
