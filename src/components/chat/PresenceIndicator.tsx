import React from 'react';
import { Circle } from 'lucide-react';
import { formatLastSeen } from '../../hooks/usePresence';

/**
 * Size options for the indicator
 */
export type PresenceSize = 'xs' | 'sm' | 'md';

/**
 * Props for PresenceIndicator component
 */
export interface PresenceIndicatorProps {
    /** Whether the user is currently online */
    online: boolean;
    /** Last seen timestamp (if offline) */
    lastSeen?: Date | string | null;
    /** Whether to show text status */
    showText?: boolean;
    /** Size of the indicator */
    size?: PresenceSize;
}

/**
 * Props for StatusBadge component
 */
export interface StatusBadgeProps {
    /** Whether the user is currently online */
    online: boolean;
    /** Last seen timestamp (if offline) */
    lastSeen?: Date | string | null;
    /** Whether to show "Last seen X time ago" when offline */
    showLastSeen?: boolean;
}

/**
 * Component to show user online status
 *
 * @example
 * <PresenceIndicator
 *   online={true}
 *   showText={true}
 *   size="sm"
 * />
 */
export default function PresenceIndicator({
    online,
    lastSeen,
    showText = false,
    size = 'sm'
}: PresenceIndicatorProps) {
    const sizeClasses: Record<PresenceSize, string> = {
        xs: 'w-1.5 h-1.5',
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5'
    };

    const textSizes: Record<PresenceSize, string> = {
        xs: 'text-[10px]',
        sm: 'text-xs',
        md: 'text-sm'
    };

    return (
        <div className="flex items-center gap-1.5">
            <div className="relative">
                <Circle
                    className={`${sizeClasses[size]} ${
                        online
                            ? 'fill-green-500 text-green-500'
                            : 'fill-gray-400 text-gray-400'
                    }`}
                />
                {online && (
                    <div className="absolute inset-0 animate-ping">
                        <Circle className={`${sizeClasses[size]} fill-green-500 opacity-75`} />
                    </div>
                )}
            </div>
            {showText && (
                <span className={`${textSizes[size]} ${
                    online ? 'text-green-500' : 'text-gray-400'
                } font-medium`}>
                    {online ? 'Online' : formatLastSeen(lastSeen)}
                </span>
            )}
        </div>
    );
}

/**
 * Compact status badge for chat headers
 *
 * @example
 * <StatusBadge
 *   online={false}
 *   lastSeen={new Date()}
 *   showLastSeen={true}
 * />
 */
export function StatusBadge({ online, lastSeen, showLastSeen = false }: StatusBadgeProps) {
    return (
        <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-xs text-gray-500">
                {online
                    ? 'Online'
                    : showLastSeen
                        ? `Last seen ${formatLastSeen(lastSeen)}`
                        : 'Offline'
                }
            </span>
        </div>
    );
}
