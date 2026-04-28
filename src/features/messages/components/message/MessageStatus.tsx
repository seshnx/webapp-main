import React from 'react';
import { Check, CheckCheck, Clock, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Message status types
 */
export type MessageStatusType = 'sending' | 'sent' | 'delivered' | 'read';

/**
 * Props for MessageStatus component
 */
export interface MessageStatusProps {
    /** Delivery/read status of the message */
    status?: MessageStatusType;
    /** Icon size in pixels */
    size?: number;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Props for MessageStatusCompact component
 */
export interface MessageStatusCompactProps {
    /** Delivery/read status of the message */
    status: MessageStatusType;
    /** Message timestamp to display */
    messageTime: string;
    /** Whether the message was sent by the current user */
    isOwn: boolean;
}

/**
 * Message delivery/read status indicators
 *
 * States:
 * - Sending: Clock icon (not yet sent)
 * - Sent: Single checkmark (delivered to server)
 * - Delivered: Double checkmark (delivered to recipient)
 * - Read: Double checkmark (blue) (read by recipient)
 *
 * @example
 * <MessageStatus status="read" size={12} />
 */
export default function MessageStatus({
    status = 'sent',
    size = 12,
    className = ''
}: MessageStatusProps) {
    interface StatusConfig {
        icon: LucideIcon;
        color: string;
        animate: boolean;
    }

    const statusConfig: Record<MessageStatusType, StatusConfig> = {
        sending: {
            icon: Clock,
            color: 'text-gray-400',
            animate: true
        },
        sent: {
            icon: Check,
            color: 'text-gray-400',
            animate: false
        },
        delivered: {
            icon: CheckCheck,
            color: 'text-gray-400',
            animate: false
        },
        read: {
            icon: CheckCheck,
            color: 'text-brand-blue',
            animate: false
        }
    };

    const config = statusConfig[status] || statusConfig.sent;
    const Icon = config.icon;

    return (
        <motion.div
            animate={config.animate ? { rotate: [0, 360] } : {}}
            transition={config.animate ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
            className={`inline-flex items-center ${config.color} ${className}`}
        >
            <Icon size={size} className={status === 'read' ? 'fill-current' : ''} />
        </motion.div>
    );
}

/**
 * Compact status for message bubbles
 *
 * @example
 * <MessageStatusCompact
 *   status="read"
 *   messageTime="2:30 PM"
 *   isOwn={true}
 * />
 */
export function MessageStatusCompact({ status, messageTime, isOwn }: MessageStatusCompactProps) {
    if (!isOwn) return null;

    return (
        <div className="flex items-center gap-1">
            <MessageStatus status={status} size={10} />
            <span className="text-[10px] text-gray-400">
                {messageTime}
            </span>
        </div>
    );
}
