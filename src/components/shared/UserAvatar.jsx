import React from 'react';
import { User, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper to generate initials
const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
};

export default function UserAvatar({ 
    src, 
    name, 
    size = 'md', // sizes: xs, sm, md, lg, xl, 2xl, 3xl
    className, 
    onClick,
    status, // 'online', 'offline' (optional)
    isGroup = false,
    square = false 
}) {
    
    const sizeClasses = {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-14 w-14 text-lg",
        '2xl': "h-24 w-24 text-2xl",
        '3xl': "h-32 w-32 text-4xl"
    };

    const containerClass = twMerge(
        clsx(
            "relative overflow-hidden flex items-center justify-center shrink-0 bg-gray-200 dark:bg-gray-700 border border-transparent transition-all select-none",
            square ? "rounded-xl" : "rounded-full",
            sizeClasses[size],
            onClick && "cursor-pointer hover:opacity-90",
            className
        )
    );

    return (
        <div className={containerClass} onClick={onClick}>
            {src ? (
                <img 
                    src={src} 
                    alt={name || "Avatar"} 
                    className="h-full w-full object-cover" 
                    onError={(e) => e.target.style.display = 'none'} 
                />
            ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-brand-blue to-purple-600 text-white font-bold">
                    {isGroup ? <Users className="w-1/2 h-1/2"/> : (name ? getInitials(name) : <User className="w-1/2 h-1/2"/>)}
                </div>
            )}
            
            {/* Online Status Indicator */}
            {status && (
                <span className={clsx(
                    "absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-900",
                    status === 'online' ? "bg-green-500" : "bg-gray-400",
                    size === 'xs' || size === 'sm' ? "h-2 w-2" : "h-3.5 w-3.5"
                )}></span>
            )}
        </div>
    );
}
