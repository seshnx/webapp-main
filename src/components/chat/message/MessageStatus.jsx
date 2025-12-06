import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Message delivery/read status indicators
 * 
 * States:
 * - Sending: Clock icon (not yet sent)
 * - Sent: Single checkmark (delivered to server)
 * - Delivered: Double checkmark (delivered to recipient)
 * - Read: Double checkmark (blue) (read by recipient)
 */
export default function MessageStatus({ 
    status = 'sent', // 'sending' | 'sent' | 'delivered' | 'read'
    size = 12,
    className = ''
}) {
    const statusConfig = {
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
 */
export function MessageStatusCompact({ status, messageTime, isOwn }) {
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

