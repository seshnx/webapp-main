import React, { useState } from 'react';
import {
    Bell,
    UserPlus,
    Heart,
    MessageCircle,
    AtSign,
    CornerDownRight,
    Bookmark,
    Check,
    CheckCheck,
    Trash2,
    X,
    Calendar,
    DollarSign,
    Clock,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserAvatar from '../shared/UserAvatar';
import toast from 'react-hot-toast';

/**
 * Get the appropriate icon for notification type
 */
const NotificationIcon = ({ type }) => {
    const iconProps = { size: 14 };
    const iconMap = {
        follow: <UserPlus {...iconProps} />,
        like: <Heart {...iconProps} />,
        comment: <MessageCircle {...iconProps} />,
        mention: <AtSign {...iconProps} />,
        reply: <CornerDownRight {...iconProps} />,
        save: <Bookmark {...iconProps} />,
        booking: <Calendar {...iconProps} />,
        booking_accepted: <Check {...iconProps} />,
        booking_declined: <X {...iconProps} />
    };

    const colorMap = {
        follow: 'bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20',
        like: 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400',
        comment: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        mention: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        reply: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
        save: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
        booking: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        booking_accepted: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        booking_declined: 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400'
    };

    return (
        <div className={`p-1.5 rounded-full ${colorMap[type] || 'bg-gray-100 text-gray-500'}`}>
            {iconMap[type] || <Bell size={14} />}
        </div>
    );
};

/**
 * Format timestamp to relative time
 */
const formatTime = (ts) => {
    if (!ts) return '';
    const date = ts.toMillis ? new Date(ts.toMillis()) : new Date(ts);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
};

/**
 * Single notification item
 */
const NotificationItem = ({ 
    notification, 
    onMarkAsRead, 
    onDelete, 
    onUserClick, 
    onPostClick,
    onBookingAction
}) => {
    const [actionLoading, setActionLoading] = useState(null);
    
    const handleClick = () => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }
        
        // Navigate based on notification type
        if (notification.type === 'follow' && onUserClick) {
            onUserClick(notification.fromUserId);
        } else if (notification.postId && onPostClick) {
            onPostClick(notification.postId);
        }
    };
    
    const handleBookingAction = async (e, action) => {
        e.stopPropagation();
        if (!notification.bookingId) return;
        
        setActionLoading(action);
        try {
            await onBookingAction(notification.bookingId, action, notification.id);
            toast.success(action === 'accept' ? 'Booking accepted!' : 'Booking declined');
        } catch (err) {
            toast.error('Failed to update booking');
            console.error(err);
        }
        setActionLoading(null);
    };
    
    const isBookingNotification = notification.type === 'booking' && notification.bookingId && !notification.actionTaken;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className={`
                p-3 cursor-pointer border-b dark:border-gray-700 last:border-0 
                flex gap-3 items-start group transition-colors relative
                ${notification.read 
                    ? 'hover:bg-gray-50 dark:hover:bg-gray-800' 
                    : 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }
            `}
            onClick={handleClick}
        >
            {/* User avatar with type icon overlay */}
            <div className="relative shrink-0">
                <UserAvatar 
                    src={notification.fromUserPhoto}
                    name={notification.fromUserName}
                    size="sm"
                />
                <div className="absolute -bottom-1 -right-1">
                    <NotificationIcon type={notification.type} />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <p className="text-sm dark:text-gray-200 leading-snug">
                        <span className="font-bold hover:text-brand-blue transition-colors">
                            {notification.fromUserName}
                        </span>
                        {' '}
                        <span className="text-gray-600 dark:text-gray-400">
                            {notification.message}
                        </span>
                    </p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                        {formatTime(notification.timestamp)}
                    </span>
                </div>

                {/* Post preview if available */}
                {notification.postPreview && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        "{notification.postPreview}"
                    </p>
                )}
                
                {/* Booking details preview */}
                {isBookingNotification && notification.bookingDetails && (
                    <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg text-xs space-y-1">
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                            {notification.bookingDetails.date && (
                                <span className="flex items-center gap-1">
                                    <Clock size={10} /> {notification.bookingDetails.date}
                                </span>
                            )}
                            {notification.bookingDetails.amount && (
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold">
                                    <DollarSign size={10} /> ${notification.bookingDetails.amount}
                                </span>
                            )}
                        </div>
                        {notification.bookingDetails.serviceType && (
                            <span className="inline-block bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-[10px]">
                                {notification.bookingDetails.serviceType}
                            </span>
                        )}
                    </div>
                )}
                
                {/* Quick Accept/Decline buttons for booking notifications */}
                {isBookingNotification && (
                    <div className="flex gap-2 mt-2" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={(e) => handleBookingAction(e, 'accept')}
                            disabled={actionLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                            {actionLoading === 'accept' ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : (
                                <><Check size={12} /> Accept</>
                            )}
                        </button>
                        <button
                            onClick={(e) => handleBookingAction(e, 'decline')}
                            disabled={actionLoading}
                            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-bold py-1.5 px-3 rounded-lg transition flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                            {actionLoading === 'decline' ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : (
                                <><X size={12} /> Decline</>
                            )}
                        </button>
                    </div>
                )}

                {/* Unread indicator */}
                {!notification.read && (
                    <div className="w-2 h-2 bg-brand-blue rounded-full absolute right-3 top-1/2 -translate-y-1/2" />
                )}
            </div>

            {/* Delete button on hover */}
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all text-gray-400 hover:text-red-500 shrink-0"
            >
                <X size={14} />
            </button>
        </motion.div>
    );
};

/**
 * Full notifications panel/dropdown
 */
export default function NotificationsPanel({
    notifications,
    unreadCount,
    loading,
    onMarkAsRead,
    onMarkAllAsRead,
    onDeleteNotification,
    onClearAll,
    onUserClick,
    onPostClick,
    onBookingAction,
    onClose
}) {
    return (
        <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white dark:bg-[#2c2e36] border dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="p-3 px-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#23262f]">
                <div className="flex items-center gap-2">
                    <h4 className="font-bold dark:text-white text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <span className="text-xs bg-brand-blue text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </div>
                
                {unreadCount > 0 && (
                    <button 
                        onClick={onMarkAllAsRead}
                        className="text-xs text-brand-blue hover:text-blue-700 font-medium flex items-center gap-1 transition"
                    >
                        <CheckCheck size={14} />
                        Mark all read
                    </button>
                )}
            </div>

            {/* Notifications list */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Loading...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                            <Bell size={24} className="opacity-30" />
                        </div>
                        <p className="text-sm font-medium dark:text-gray-400">All caught up!</p>
                        <p className="text-xs text-gray-400 mt-1">No new notifications</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {notifications.map(notification => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={onMarkAsRead}
                                onDelete={onDeleteNotification}
                                onUserClick={onUserClick}
                                onPostClick={onPostClick}
                                onBookingAction={onBookingAction}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-2 bg-gray-50 dark:bg-[#23262f] border-t dark:border-gray-700 flex justify-between items-center">
                    <button 
                        onClick={onClearAll}
                        className="text-xs text-gray-400 hover:text-red-500 font-medium flex items-center gap-1 transition px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <Trash2 size={12} />
                        Clear all
                    </button>
                    <button 
                        onClick={onClose}
                        className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}

/**
 * Notification badge component for navbar
 */
export function NotificationBadge({ count }) {
    if (count === 0) return null;

    return (
        <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center border-2 border-white dark:border-dark-card"
        >
            {count > 99 ? '99+' : count}
        </motion.span>
    );
}

