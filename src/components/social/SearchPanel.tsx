import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Hash, Users, FileText, X, TrendingUp } from 'lucide-react';
import {
  useSearchPosts,
  useUserSearch,
  useTrendingHashtags,
  usePostsByHashtag
} from '../../services/socialApi';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../shared/UserAvatar';
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
  initialQuery?: string;
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
  currentUserData,
  initialQuery = ''
}) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'posts' | 'users' | 'hashtags'>('posts');
  const trendingHashtags = useTrendingHashtags(10) || [];

  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setSearchQuery(initialQuery);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialQuery]);
  
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
            className="bg-white dark:bg-[#2c2e36] border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts, creators, hashtags..."
                className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400 text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2c2e36]">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'posts'
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <FileText size={16} />
                <span>Posts</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'users'
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Users size={16} />
                <span>Users</span>
              </button>
              <button
                onClick={() => setActiveTab('hashtags')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'hashtags'
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
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
                    <TrendingUp className="w-5 h-5 text-brand-blue" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Trending Hashtags</h3>
                  </div>
                  {trendingHashtags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {trendingHashtags.map(({ hashtag, count }) => (
                        <button
                          key={hashtag}
                          onClick={() => handleHashtagClick(hashtag)}
                          className="px-3.5 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-200 hover:text-brand-blue rounded-full text-sm transition-colors flex items-center gap-2 border border-gray-200 dark:border-gray-700"
                        >
                          <span className="font-semibold">#{hashtag}</span>
                          <span className="text-xs text-gray-400">{count} posts</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No trending hashtags yet</p>
                  )}
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
                </div>
              ) : (
                // Search results
                <div className="space-y-4">
                  {activeTab === 'posts' && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
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
                        <p className="text-gray-400 text-center py-8">No posts found</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'users' && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                        {searchResults.users.length} {searchResults.users.length === 1 ? 'user' : 'users'} found
                      </h3>
                      {searchResults.users.length > 0 ? (
                        <div className="space-y-2">
                          {searchResults.users.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => handleUserClick(user.id)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-left border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                            >
                              <UserAvatar
                                src={user.profile_photo_url}
                                name={user.username || user.email || 'User'}
                                size="md"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                  {user.first_name && user.last_name
                                    ? `${user.first_name} ${user.last_name}`
                                    : user.username || user.email}
                                </p>
                                {user.bio && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.bio}</p>
                                )}
                              </div>
                              {user.account_types && user.account_types.length > 0 && (
                                <div className="flex gap-1">
                                  {user.account_types.slice(0, 2).map((type: string) => (
                                    <span
                                      key={type}
                                      className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-brand-blue dark:text-blue-400 rounded-full font-medium"
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
                        <p className="text-gray-400 text-center py-8">No users found</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'hashtags' && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                        {searchResults.hashtags.length} {searchResults.hashtags.length === 1 ? 'hashtag' : 'hashtags'} found
                      </h3>
                      {searchResults.hashtags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {searchResults.hashtags.map(({ hashtag, count }) => (
                            <button
                              key={hashtag}
                              onClick={() => handleHashtagClick(hashtag)}
                              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-800 dark:text-gray-100 hover:text-brand-blue rounded-xl transition-colors flex items-center gap-2 border border-gray-200 dark:border-gray-700"
                            >
                              <span className="font-bold text-base">#{hashtag}</span>
                              <span className="text-xs text-gray-400">{count} posts</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-8">No hashtags found</p>
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
