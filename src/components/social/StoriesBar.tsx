import React, { useState } from 'react';
import { Plus, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import UserAvatar from '../shared/UserAvatar';
import StoryViewerModal from './StoryViewerModal';
import CreateStoryModal from './CreateStoryModal';
import { useActiveStories } from '../../hooks/useConvex';

export interface StoryItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  userRole?: string;
  hasUnseen: boolean;
  stories: Array<{
    id: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption?: string;
    createdAt: number | string;
    duration?: number;
    linkUrl?: string;
  }>;
}

interface StoriesBarProps {
  user: any;
  userData: any;
  subProfiles?: Record<string, any>;
  onOpenProfile?: (userId: string) => void;
}

export default function StoriesBar({ user, userData, subProfiles = {}, onOpenProfile }: StoriesBarProps) {
  const [activeStoryGroup, setActiveStoryGroup] = useState<StoryItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const currentUserId = user?.id || user?.uid;
  const currentUserName = userData?.displayName || user?.firstName || 'You';
  const currentUserPhoto = userData?.photoURL || user?.imageUrl;

  const rawDbStories = useActiveStories() || [];

  // Group DB stories by author
  const storyGroups: StoryItem[] = React.useMemo(() => {
    if (!rawDbStories || rawDbStories.length === 0) return [];

    const groupsMap = new Map<string, StoryItem>();

    rawDbStories.forEach((s: any) => {
      const authorId = s.authorId || 'unknown';
      if (!groupsMap.has(authorId)) {
        groupsMap.set(authorId, {
          id: `group-${authorId}`,
          userId: authorId,
          userName: s.authorName || 'Creator',
          userAvatar: s.authorPhoto || null,
          hasUnseen: true,
          stories: [],
        });
      }

      groupsMap.get(authorId)?.stories.push({
        id: s._id,
        mediaUrl: s.mediaUrl,
        mediaType: s.mediaType as 'image' | 'video',
        caption: s.caption,
        createdAt: s.createdAt,
      });
    });

    return Array.from(groupsMap.values());
  }, [rawDbStories]);

  const [localStoryGroups, setLocalStoryGroups] = useState<StoryItem[]>([]);

  const handleAddStory = (newStory: { mediaUrl: string; mediaType: 'image' | 'video'; caption?: string }) => {
    const storyObj = {
      id: `s-${Date.now()}`,
      mediaUrl: newStory.mediaUrl,
      mediaType: newStory.mediaType,
      caption: newStory.caption,
      createdAt: Date.now()
    };

    const ownGroup: StoryItem = {
      id: `own-group-${Date.now()}`,
      userId: currentUserId || 'me',
      userName: currentUserName,
      userAvatar: currentUserPhoto,
      userRole: userData?.accountTypes?.[0] || 'Creator',
      hasUnseen: false,
      stories: [storyObj]
    };
    setLocalStoryGroups([ownGroup, ...localStoryGroups]);
  };

  const displayStoryGroups = [...storyGroups, ...localStoryGroups];

  const markGroupAsSeen = (groupId: string) => {
    setLocalStoryGroups(prev => prev.map(g => g.id === groupId ? { ...g, hasUnseen: false } : g));
  };

  return (
    <div className="mb-6 bg-white dark:bg-dark-card rounded-2xl border dark:border-gray-700 p-3 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 px-1">
        {/* Create Story Button */}
        <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group" onClick={() => setIsCreateOpen(true)}>
          <div className="relative w-16 h-16 rounded-full p-0.5 border-2 border-dashed border-brand-blue/60 group-hover:border-brand-blue transition-colors flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
            <UserAvatar src={currentUserPhoto} name={currentUserName} size="md" />
            <div className="absolute bottom-0 right-0 bg-brand-blue text-white p-1 rounded-full shadow-md transform translate-x-1 translate-y-1">
              <Plus size={14} className="stroke-[3]" />
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1.5 truncate w-16 text-center">
            Your Story
          </span>
        </div>

        {/* Stories List */}
        {displayStoryGroups.map(group => (
          <motion.div
            key={group.id}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex flex-col items-center flex-shrink-0 cursor-pointer"
            onClick={() => {
              setActiveStoryGroup(group);
              markGroupAsSeen(group.id);
            }}
          >
            <div
              className={`p-0.5 rounded-full ${
                group.hasUnseen
                  ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 animate-pulse'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div className="p-0.5 bg-white dark:bg-dark-card rounded-full">
                <UserAvatar src={group.userAvatar} name={group.userName} size="md" />
              </div>
            </div>
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-1.5 truncate w-16 text-center">
              {group.userName}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {activeStoryGroup && (
        <StoryViewerModal
          storyGroup={activeStoryGroup as any}
          userSettings={userData?.settings}
          onClose={() => setActiveStoryGroup(null)}
          onOpenProfile={onOpenProfile}
        />
      )}

      {/* Create Story Modal */}
      {isCreateOpen && (
        <CreateStoryModal
          user={user}
          userData={userData}
          onClose={() => setIsCreateOpen(false)}
          onAddStory={handleAddStory}
        />
      )}
    </div>
  );
}
