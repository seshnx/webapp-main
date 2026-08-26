/**
 * Notifications Panel Component
 *
 * Displays recent notifications and alerts.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  Check,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationsPanelProps {
  notifications: NotificationItem[];
  onDismiss?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
  className?: string;
}

const NOTIFICATION_STYLES = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40'
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-100 dark:bg-green-900/40'
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: AlertTriangle,
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40'
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: AlertCircle,
    iconColor: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900/40'
  }
};

const NotificationCard = ({
  notification,
  onDismiss,
  onMarkAsRead
}: {
  notification: NotificationItem;
  onDismiss?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const style = NOTIFICATION_STYLES[notification.type as keyof typeof NOTIFICATION_STYLES] || NOTIFICATION_STYLES.info;
  const Icon = style.icon;

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss?.(notification.id), 300);
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className={`
            relative p-4 rounded-lg border-l-4
            ${style.bg} ${style.border}
            ${!notification.read ? 'border-l-8' : ''}
          `}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${style.iconBg} flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${style.iconColor}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!notification.read && (
                    <button
                      onClick={() => onMarkAsRead?.(notification.id)}
                      className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  )}
                  <button
                    onClick={handleDismiss}
                    className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {formatTimestamp(notification.timestamp)}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export function NotificationsPanel({
  notifications,
  onDismiss,
  onMarkAsRead,
  className = ''
}: NotificationsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayedNotifications = expanded ? notifications : notifications.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg ${className}`}
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h2>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          displayedNotifications.map(notification => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onDismiss={onDismiss}
              onMarkAsRead={onMarkAsRead}
            />
          ))
        )}
      </div>

      {notifications.length > 3 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            {expanded ? 'Show Less' : `View All (${notifications.length})`}
          </button>
        </div>
      )}
    </motion.div>
  );
}
