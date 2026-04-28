/**
 * Activity Item Widget Component
 *
 * Displays a single activity item in a compact format.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import type { ActivityItem } from '@/types/dashboard';

interface ActivityItemWidgetProps {
  activity: ActivityItem;
  onClick?: (activity: ActivityItem) => void;
  compact?: boolean;
  className?: string;
}

const ACTIVITY_COLORS: Record<ActivityItem['type'], string> = {
  post: 'bg-blue-500',
  booking: 'bg-green-500',
  notification: 'bg-purple-500',
  payment: 'bg-emerald-500',
  alert: 'bg-red-500',
  announcement: 'bg-amber-500'
};

export function ActivityItemWidget({
  activity,
  onClick,
  compact = false,
  className = ''
}: ActivityItemWidgetProps) {
  const colorClass = ACTIVITY_COLORS[activity.type];
  const Icon = activity.icon;

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onClick?.(activity)}
      className={`
        flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750
        cursor-pointer transition-all ${!activity.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${className}
      `}
    >
      {Icon && (
        <div className={`p-2 rounded-lg ${colorClass} text-white flex-shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
          {activity.content.title}
        </p>
        {!compact && activity.content.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
            {activity.content.description}
          </p>
        )}
        {activity.actor && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
            {activity.actor.displayName}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Clock className="w-3 h-3 text-gray-400" />
        <span className="text-xs text-gray-500 dark:text-gray-500">
          {formatTimestamp(activity.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}
