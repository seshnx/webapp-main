import React from 'react';
import { Circle } from 'lucide-react';
import { formatLastSeen } from '../../hooks/usePresence';

/**
 * Component to show user online status
 */
export default function PresenceIndicator({ 
    online, 
    lastSeen, 
    showText = false,
    size = 'sm' // 'xs' | 'sm' | 'md'
}) {
    const sizeClasses = {
        xs: 'w-1.5 h-1.5',
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5'
    };

    const textSizes = {
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
 */
export function StatusBadge({ online, lastSeen, showLastSeen = false }) {
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

