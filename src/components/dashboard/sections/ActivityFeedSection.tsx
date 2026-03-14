/**
 * Activity Feed Section Component
 *
 * Displays unified activity feed combining posts, bookings,
 * notifications, and other user activity.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Bell,
  ChevronRight,
  Filter,
  Clock
} from 'lucide-react';
import type { ActivityItem, ActivityFilter, ActivityType } from '../../../types/dashboard';

interface ActivityFeedSectionProps {
  feed: ActivityItem[];
  onActivityClick?: (activity: ActivityItem) => void;
  className?: string;
}

const ACTIVITY_ICONS: Record<ActivityType, React.ElementType> = {
  post: MessageCircle,
  booking: Calendar,
  notification: Bell,
  payment: TrendingUp,
  alert: AlertTriangle,
  announcement: Bell
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  post: 'bg-blue-500',
  booking: 'bg-green-500',
  notification: 'bg-purple-500',
  payment: 'bg-emerald-500',
  alert: 'bg-red-500',
  announcement: 'bg-amber-500'
};

export function ActivityFeedSection({ feed, onActivityClick, className = '' }: ActivityFeedSectionProps) {
  const [filter, setFilter] = useState<ActivityType[]>([]);
  const [expanded, setExpanded] = useState(false);

  const filteredFeed = feed.filter(item =>
    filter.length === 0 || filter.includes(item.type)
  );

  const displayedFeed = expanded ? filteredFeed : filteredFeed.slice(0, 5);

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const toggleFilter = (type: ActivityType) => {
    setFilter(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg ${className}`}
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Activity Feed
          </h2>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {(['post', 'booking', 'notification', 'payment', 'alert'] as ActivityType[]).map(type => (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                filter.includes(type)
                  ? `${ACTIVITY_COLORS[type]} text-white`
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <AnimatePresence mode="popLayout">
          {displayedFeed.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No activity yet</p>
            </div>
          ) : (
            displayedFeed.map((activity, index) => {
              const Icon = ACTIVITY_ICONS[activity.type];
              const colorClass = ACTIVITY_COLORS[activity.type];

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onActivityClick?.(activity)}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors ${
                    !activity.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${colorClass} text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {activity.content.title}
                          </p>
                          {activity.content.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {activity.content.description}
                            </p>
                          )}
                          {activity.actor && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {activity.actor.displayName}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {filteredFeed.length > 5 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            {expanded ? 'Show Less' : `Show All (${filteredFeed.length})`}
          </button>
        </div>
      )}
    </motion.div>
  );
}
